import { useQuery, keepPreviousData } from "@tanstack/react-query";
import agent from "../api/agent";

type UseChangesParams = {
    month?: number;
    year?: number;
    search?: string;
    workRelation?: number;
    type?: number;
    page?: number;
    pageSize?: number;
};

export const useChanges = ({ month, year, search, workRelation, type, page = 1, pageSize = 8 }: UseChangesParams = {}) => {
    const { data: employeeChanges, isLoading: isLoadingChanges, isError: isErrorChanges, isFetching } = useQuery<PagedList<EmployeeChangesDto>>({
        queryKey: ['employeeChanges', month, year, search, workRelation, type, page, pageSize],
        queryFn: async () => {
            const response = await agent.get('/changes/changesList', {
                params: { page, pageSize, month, year, search: search || undefined, workRelation: workRelation || undefined, type: type ?? undefined }
            });
            return response.data;
        },
        placeholderData: keepPreviousData,
        refetchInterval: 60000,
        refetchIntervalInBackground: true,
    });

    const fetchAllChanges = async (): Promise<EmployeeChangesDto[]> => {
        const response = await agent.get<PagedList<EmployeeChangesDto>>('/changes/changesList', {
            params: {
                page: 1,
                pageSize: 100000,   // αρκετά μεγάλο ώστε να έρθουν όλα
                month,
                year,
                search: search || undefined,
                workRelation: workRelation || undefined,
                type: type ?? undefined,
            }
        });
        return response.data.items;
    };

    return {
        employeeChanges,
        isLoadingChanges,
        isErrorChanges,
        isFetching,
        fetchAllChanges,
    };
};