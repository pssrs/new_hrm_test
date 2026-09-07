import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import agent from "../api/agent";

type UseLeavesParams = {
    date?: DateOnly;
};

type DateOnly = {
    year: number;
    month: number;
    day: number;
};

type LeaveMonthDto = { month: number; count: number };

export type LeavePayload = {
    am: number;
    type: number;
    dateFrom?: string; // ISO yyyy-MM-dd
    dateTo?: string;   // ISO yyyy-MM-dd
    duration?: number;
    year: number;
    state?: number;
    notes?: string;
    request?: string;
    approval?: string;
}

export const useLeaves = ({ date }: UseLeavesParams = {}) => {
    const queryClient = useQueryClient();


    const year = date?.year ?? new Date().getFullYear();
    const { data: monthlyRaw, isLoading: isLoadingMonthly, isError: isErrorMonthly } = useQuery<LeaveMonthDto[]>({
        queryKey: ['leaveMonthly', year],
        queryFn: async () => {
            const response = await agent.get('/leave/monthly', { params: { year } });
            return response.data as LeaveMonthDto[];
        }
    });

    const monthlyCounts = useMemo(() => {
        const arr = Array(12).fill(0);
        (monthlyRaw ?? []).forEach(r => {
            if (r.month >= 1 && r.month <= 12) arr[r.month - 1] = r.count;
        });
        return arr;
    }, [monthlyRaw]);

    const addLeaveAsync = useMutation({
        mutationFn: async () => {
            const response = await agent.post('/leave/createEmployeeLeaves', 1);
            return response.data;
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['employeeLeaves'] });
        }
    });

    return {
        monthlyRaw: monthlyRaw ?? [],
        monthlyCounts,
        year,
        isLoading: isLoadingMonthly,
        isError: isErrorMonthly,
        addLeave: addLeaveAsync,
    };
};