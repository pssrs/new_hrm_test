import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import agent from "../api/agent";

type UseEmployeeParams = {
    page?: number;
    pageSize?: number;
    id?: string | undefined;
};

export const useEmployee = ({ page, pageSize, id }: UseEmployeeParams) => {

    const queryClient = useQueryClient();

    // Ensure we pass a date so the API can compute the monthly count for the correct month
    const now = new Date();
    const dateParam = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const { data: rawCountData } = useQuery({
        queryKey: ['employeecount', dateParam],
        queryFn: async () => {
            const response = await agent.get('/employee/countEmp', {
                params: {
                    date: dateParam
                }
            });
            return response.data;
        }
    });

    // Normalize backend DTO names to what the frontend expects
    const employeeCount = rawCountData?.totalCount ?? rawCountData?.TotalCount ?? rawCountData?.employeeCount ?? 0;
    const employeeCountMonthly = rawCountData?.monthlyCount ?? rawCountData?.MonthlyCount ?? rawCountData?.employeeCountMonthly ?? 0;

    const { data: employeeGroup, isLoading, isError } = useQuery<PagedList<EmployeeCard>>({
        queryKey: ['employeelist', page, pageSize],
        queryFn: async () => {
            const response = await agent.get('/employee', {
                params: {
                    page,
                    pageSize
                }
            });
            const data = response.data as PagedList<EmployeeCard>;
            return data;
        },
        placeholderData: (previousData) => previousData
    });

    const {data: employee, isLoading: isLoadingEmployee} = useQuery({
        queryKey: ['employee', id],
        queryFn: async () => {
            const response = await agent.get<EmployeeCard>(`/employee/${id}`);
            
            console.log("response.data: " + response.data)
            return response.data;
        },
        enabled: !!id
    })

    const createEmployee = useMutation({
        mutationFn: async (employee: EmployeeCard) => {
            const response = await agent.post('/employee', employee);
            return response.data;
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['employee']
            })
        }
    });

    const updateEmployee = useMutation({
        mutationFn: async (employee: EmployeeCard) => {
            await agent.put('/employee', employee)
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['employee']
            })
        }
    });

    const deleteEmployee = useMutation({
        mutationFn: async (id: number) => {
            await agent.delete(`/employee/${id}`)
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['employee']
            })
        }
    });

    const {data: employeeService, isLoading: isLoadingEmployeeService} = useQuery({
        queryKey: ['employeeService', id],
        queryFn: async () => {
            const response = await agent.get<EmployeeService>(`/employee/services/${id}`);
            
            console.log("response.data: " + response.data)
            return response.data;
        },
        enabled: !!id
    })

    const updateEmployeeService = useMutation({
        mutationFn: async (employeeService: EmployeeService) => {
            await agent.put('/employee/services', employeeService)
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['employeeService']
            })
        }
    });

    return {
        employeeGroup,
        employeeCount,
        employeeCountMonthly,
        isLoading,
        isError,
        employee,
        isLoadingEmployee,
        createEmployee: createEmployee.mutate,
        isSaving: createEmployee.isPending,
        saveError: createEmployee.error,
        updateEmployee: updateEmployee.mutate,
        deleteEmployee: deleteEmployee.mutate,
        isDeleting: deleteEmployee.isPending,
        employeeService,
        isLoadingEmployeeService,
        updateEmployeeService: updateEmployeeService.mutate,
        isSavingService: updateEmployeeService.isPending,
    }
  }