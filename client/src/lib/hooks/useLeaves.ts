import { useMemo } from 'react';
import { useQuery } from "@tanstack/react-query";
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

export const useLeaves = ({ date }: UseLeavesParams = {}) => {
    const now = new Date();
    const dateToUse = date ?? { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };

    const { data: leaveCount, isLoading: isLoadingCount, isError: isErrorCount } = useQuery<number>({
        queryKey: ['leavecount', dateToUse.year, dateToUse.month],
        queryFn: async () => {
            const response = await agent.get('/leave', {
                params: {
                    date: `${dateToUse.year}-${String(dateToUse.month).padStart(2, '0')}-${String(dateToUse.day).padStart(2, '0')}`
                }
            });
            return response.data as number;
        },
        enabled: true
    });

    // New: call GetMonthlyCounts endpoint and return monthly aggregation (for charts)
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

    return {
        // original single-count
        leaveCount,
        // monthly aggregation
        monthlyRaw: monthlyRaw ?? [],
        monthlyCounts,

        // meta
        year,
        isLoading: isLoadingCount || isLoadingMonthly,
        isError: isErrorCount || isErrorMonthly
    };
};