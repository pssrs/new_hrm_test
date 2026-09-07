import { useQuery } from "@tanstack/react-query";
import agent from "../api/agent";

type UseDashboardParams = {
    category?: string
};

export const useDashboard = ({ category = 'pe' }: UseDashboardParams) => {
    const isLoggedIn = !!localStorage.getItem("token");

    const { data: rawCountData } = useQuery({
        queryKey: ['countEmp'],
        queryFn: async () => {
            const response = await agent.get('/dashboard/countEmp');
            return response.data;
        },
        enabled: isLoggedIn
    });
    const employeeCount = rawCountData?.totalCount ?? rawCountData?.TotalCount ?? rawCountData?.employeeCount ?? 0;

    const { data: employeesMK = [], isLoading: isLoadingEmployeesMK } = useQuery<employeesMK[]>({
        queryKey: ['employeesMK', category],
        queryFn: async () => {
            const response = await agent.get<employeesMK[]>(`/dashboard/employeesMK?category=${category}`);
            return response.data || [];
        },
        enabled: isLoggedIn,
        staleTime: 5 * 60 * 1000
    });

    const { data: employeesChanges = [], isLoading: isLoadingEmployeesChanges } = useQuery<employeesChanges[]>({
        queryKey: ['employeesChanges'],
        queryFn: async () => {
            const response = await agent.get<employeesChanges[]>('/dashboard/employeesChanges');
            return response.data || [];
        },
        enabled: isLoggedIn,
        staleTime: 5 * 60 * 1000
    });

    const { data: employeesEndOfContract = [], isLoading: isLoadingEmployeesEndOfContract } = useQuery<EmployeesEndOfContract[]>({
        queryKey: ['employeesEndOfContract'],
        queryFn: async () => {
            const response = await agent.get<EmployeesEndOfContract[]>('/dashboard/employeesEndOfContract');
            return response.data || [];
        },
        enabled: isLoggedIn,
        staleTime: 5 * 60 * 1000
    });

    const { data: leaveCount, isLoading: isLoadingCount, isError: isErrorCount } = useQuery<number>({
        queryKey: ['leaveCountPerDay'],
        queryFn: async () => {
            const response = await agent.get('/dashboard/leaveCountPerDay');
            return response.data as number;
        },
        enabled: true,
        staleTime: 1000 * 60 * 5,
    });

    const { data: dashboardCalendar = [], isLoading: isLoadingDashboardCalendar, isError: isErrorDashboardCalendar } = useQuery<dashboardCalendar[]>({
        queryKey: ['dashboardCalendar'],
        queryFn: async () => {
            const response = await agent.get<dashboardCalendar[]>('/dashboard/dashboardCalendar');
            return response.data || [];
        },
        enabled: true,
        staleTime: 1000 * 60 * 5,
    });

    return {
        leaveCount,
        isLoadingCount,
        isErrorCount,
        employeeCount,
        employeesMK,
        isLoadingEmployeesMK,
        employeesChanges,
        isLoadingEmployeesChanges,
        employeesEndOfContract,
        isLoadingEmployeesEndOfContract,
        dashboardCalendar,
        isLoadingDashboardCalendar,
        isErrorDashboardCalendar
    };
};