import { useQuery} from "@tanstack/react-query";
import agent from "../api/agent";

export const useValues = () => {
    const isLoggedIn = !!localStorage.getItem("token");

    const { data: kladoi} = useQuery<Kladoi[]>({
        queryKey: ['kladoi'],
        queryFn: async () => {
            const response = await agent.get<Kladoi[]>('/values/kladoi');
            return response.data;
        },
        enabled: isLoggedIn
    });

    const { data: eidikothtes } = useQuery<Eidikothtes[]>({
        queryKey: ['eidikothtes'],
        queryFn: async () => {
            const response = await agent.get<Eidikothtes[]>('/values/eidikothtes');
            return response.data;
        },
        enabled: isLoggedIn
    });

    const { data: positions } = useQuery<Position[]>({
        queryKey: ['position'],
        queryFn: async () => {
            const response = await agent.get<Position[]>('/values/position');
            return response.data;
        },
        enabled: isLoggedIn
    });

    const { data: address } = useQuery<Address[]>({
        queryKey: ['address'],
        queryFn: async () => {
            const response = await agent.get<Address[]>('/values/address');
            return response.data;
        },
        enabled: isLoggedIn
    });

    const { data: sector } = useQuery<Sector[]>({
        queryKey: ['sector'],
        queryFn: async () => {
            const response = await agent.get<Sector[]>('/values/sector');
            return response.data;
        },
        enabled: isLoggedIn
    });

    const { data: department } = useQuery<Department[]>({
        queryKey: ['department'],
        queryFn: async () => {
            const response = await agent.get<Department[]>('/values/department');
            return response.data;
        },
        enabled: isLoggedIn
    });

    const { data: office } = useQuery<Office[]>({
        queryKey: ['office'],
        queryFn: async () => {
            const response = await agent.get<Office[]>('/values/office');
            return response.data;
        },
        enabled: isLoggedIn
    });

    const { data: category } = useQuery<Category[]>({
        queryKey: ['category'],
        queryFn: async () => {
            const response = await agent.get<Category[]>('/values/category');
            return response.data;
        },
        enabled: isLoggedIn
    });

    const { data: grade } = useQuery<Grade[]>({
        queryKey: ['grade'],
        queryFn: async () => {
            const response = await agent.get<Grade[]>('/values/grade');
            return response.data;
        },
        enabled: isLoggedIn
    });

    const { data: doys } = useQuery<Doy[]>({
        queryKey: ['doy'],
        queryFn: async () => {
            const response = await agent.get<Doy[]>('/values/doy');
            return response.data;
        },
        enabled: isLoggedIn
    });

    const { data: penalties } = useQuery<Penalty[]>({
        queryKey: ['penalty'],
        queryFn: async () => {
            const response = await agent.get<Penalty[]>('/values/penalty');
            return response.data;
        },
        enabled: isLoggedIn
    });

    const { data: leaves } = useQuery<LeaveType[]>({
        queryKey: ['leaves'],
        queryFn: async () => {
            const response = await agent.get<LeaveType[]>('/values/leaves');
            return response.data;
        },
        enabled: isLoggedIn
    });

    const { data: changeTypes } = useQuery<ChangeType[]>({
        queryKey: ['changeTypes'],
        queryFn: async () => {
            const response = await agent.get<ChangeType[]>('/values/changeType');
            return response.data;
        },
        enabled: isLoggedIn
    });

    const { data: changeTypeMap } = useQuery<ChangeTypeMap[]>({
        queryKey: ['changeTypeMap'],
        queryFn: async () => {
            const response = await agent.get<ChangeTypeMap[]>('/values/changeTypeMap');
            return response.data;
        },
        enabled: isLoggedIn
    });

    const { data: fileTypes } = useQuery<FileType[]>({
        queryKey: ['fileTypes'],
        queryFn: async () => {
            const response = await agent.get<FileType[]>('/values/fileTypes');
            return response.data;
        },
        enabled: isLoggedIn
    });

    const { data: foreas } = useQuery<string>({
        queryKey: ['foreas'],
        queryFn: async () => {
            const response = await agent.get<string>('/values/foreas');
            return response.data;
        },
        enabled: isLoggedIn
    });

    const { data: positionSum } = useQuery<PositionNumberDTO[]>({
        queryKey: ['positionSum'],
        queryFn: async () => {
            const response = await agent.get<PositionNumberDTO[]>('/values/positionSum');
            return response.data;
        },
        enabled: isLoggedIn
    });

    const { data: studyTypes } = useQuery<StudyTypes[]>({
        queryKey: ['studyTypes'],
        queryFn: async () => {
            const response = await agent.get<StudyTypes[]>('/values/studyTypes');
            return response.data;
        },
        enabled: isLoggedIn
    });

    const { data: argies } = useQuery<Argies[]>({
        queryKey: ['argies'],
        queryFn: async () => {
            const response = await agent.get<Argies[]>('/values/argies');
            return response.data;
        },
        enabled: isLoggedIn
    });

    return {
        kladoi: kladoi ?? [],
        eidikothtes: eidikothtes ?? [],
        positions: positions ?? [],
        address: address ?? [],
        sector: sector ?? [],
        department: department ?? [],
        office: office ?? [],
        category: category ?? [],
        grade: grade ?? [],
        doys: doys ?? [],
        penalties: penalties ?? [],
        leaves: leaves ?? [],
        changeTypes: changeTypes ?? [],
        changeTypeMap: changeTypeMap ?? [],
        fileTypes: fileTypes ?? [],
        foreas: foreas ?? "",
        positionSum: positionSum ?? [],
        studyTypes: studyTypes ?? [],
        argies: argies ?? []
    }
}