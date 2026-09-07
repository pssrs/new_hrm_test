import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import agent from "../api/agent";
import type { EmployeePersonalFormData } from "@/lib/schemas/newEmployeeForm/employeePersonalFormSchema";
import type { EmployeeServiceFormData } from "@/lib/schemas/newEmployeeForm/employeeServiceFormSchema";
import type { EmployeeExperienceFormData } from "@/lib/schemas/newEmployeeForm/employeeExperienceSchema";
import type { EmployeeChildrenFormData } from "@/lib/schemas/newEmployeeForm/employeeChildrenFormSchema";
import type { EmployeeStudiesFormData } from "@/lib/schemas/newEmployeeForm/employeeStudyFormSchema";

export type AddEmployeePayload = {
    personal: EmployeePersonalFormData;
    service: EmployeeServiceFormData;
    experience: EmployeeExperienceFormData[];
    children: EmployeeChildrenFormData[];
    studies: EmployeeStudiesFormData[];
};

type UseEmployeeParams = {
    page?: number;
    pageSize?: number;
    id?: string | undefined;
    search?: string;
    flag?: number;
    address_Id?: number;
    sector_Id?: number;
    department_Id?: number;
    office_Id?: number;
    specialtyCode?: string;
    branchCode?: string;
    mk?: string;
    workRelation?: number;
    grade?: string;
    leaveType?: number;
    leaveMonth?: number;
    leaveYear?: number;
    tableType?: number;
    leaveDate?: string;
};

export const useEmployee = ({ page, pageSize, id, search, flag, address_Id, sector_Id, department_Id, office_Id, specialtyCode, branchCode, mk, workRelation, grade, leaveType, leaveMonth, leaveYear, tableType, leaveDate }: UseEmployeeParams) => {

    const queryClient = useQueryClient();
    const isLoggedIn = !!localStorage.getItem("token");

    const { data: employeeGroup, isLoading, isError } = useQuery<PagedList<EmployeeListDto>>({
        queryKey: ['employeelist', page, pageSize, search, flag, address_Id, sector_Id, department_Id, office_Id, specialtyCode, branchCode, mk, workRelation, grade],
        queryFn: async () => {
            const response = await agent.get('/employee', {
                params: {
                    page,
                    pageSize,
                    search: search || undefined,
                    flag: flag || undefined,
                    address_Id: address_Id || undefined,
                    sector_Id: sector_Id || undefined,
                    department_Id: department_Id || undefined,
                    office_Id: office_Id || undefined,
                    specialtyCode: specialtyCode || undefined,
                    branchCode: branchCode || undefined,
                    mk: mk || undefined,
                    workRelation: workRelation || undefined,
                    grade: grade || undefined
                }
            });
            const data = response.data as PagedList<EmployeeListDto>;
            return data;
        },
        placeholderData: (previousData) => previousData,
        enabled: isLoggedIn && (!!page || !!pageSize || !!search || flag !== undefined)
    });

    const fetchAllEmployees = async (): Promise<EmployeeListDto[]> => {
        const response = await agent.get<PagedList<EmployeeListDto>>('/employee', {
            params: {
                page: 1,
                pageSize: 100000,
                search: search || undefined,
                flag: flag || undefined,
                address_Id: address_Id || undefined,
                sector_Id: sector_Id || undefined,
                department_Id: department_Id || undefined,
                office_Id: office_Id || undefined,
                specialtyCode: specialtyCode || undefined,
                branchCode: branchCode || undefined,
                mk: mk || undefined,
            }
        });
        return response.data.items;
    };

    const {data: employeeCard, isLoading: isLoadingEmployee} = useQuery({
        queryKey: ['employeeCard', id],
        queryFn: async () => {
            const response = await agent.get<EmployeeCard>(`/employee/${id}`);
            return response.data;
        },
        enabled: isLoggedIn && !!id
    })

    const {data: employee} = useQuery({
        queryKey: ['employeePersonal', id],
        queryFn: async () => {
            const response = await agent.get<Employee>(`/employee/${id}`);
            const raw = response.data as Record<string, unknown>;
            const mapped: Employee = {
                id: (raw.id ?? raw.Id) as number,
                am: (raw.am ?? raw.Am) as number,
                lastName: (raw.lastName ?? raw.LastName ?? '') as string,
                firstName: (raw.firstName ?? raw.FirstName ?? '') as string,
                fatherName: (raw.fatherName ?? raw.FatherName ?? '') as string,
                motherName: (raw.motherName ?? raw.MotherName ?? '') as string,
                spouseName: (raw.spouseName ?? raw.SpouseName ?? '') as string,
                birthDate: (raw.birthDate ?? raw.BirthDate ?? '') as string,
                birthPlace: (raw.birthPlace ?? raw.BirthPlace ?? '') as string,
                address: (raw.address ?? raw.Address ?? '') as string,
                area: (raw.area ?? raw.Area ?? '') as string,
                city: (raw.city ?? raw.City ?? '') as string,
                postCode: (raw.postCode ?? raw.PostCode ?? '') as string,
                sex: (raw.sex ?? raw.Sex ?? '') as string,
                familyStatus: (raw.familyStatus ?? raw.FamilyStatus ?? '') as string,
                nationality: (raw.nationality ?? raw.Nationality ?? '') as string,
                citizenship: (raw.citizenship ?? raw.Citizenship ?? '') as string,
                ama: (raw.ama ?? raw.Ama ?? '') as string,
                phone: (raw.phone ?? raw.Phone ?? '') as string,
                identityCardNumber: (raw.identityCardNumber ?? raw.IdentityCardNumber ?? '') as string,
                identityCardIssueDate: (raw.identityCardIssueDate ?? raw.IdentityCardIssueDate ?? '') as string,
                amka: (raw.amka ?? raw.Amka ?? '') as string,
                email: (raw.email ?? raw.Email ?? '') as string,
                afm: (raw.afm ?? raw.Afm ?? '') as string,
                doy: (raw.doy ?? raw.Doy ?? '') as string,
                employmentState: (raw.employmentState ?? raw.EmploymentState ?? '') as string,
                iban1: (raw.iban1 ?? raw.Iban1 ?? '') as string,
                iban2: (raw.iban2 ?? raw.Iban2 ?? '') as string,
                personalNumber: (raw.personalNumber ?? raw.PersonalNumber ?? '') as string,
                leave: (raw.leave ?? raw.Leave ?? 0) as number,
            };
            return mapped;
        },
        enabled: isLoggedIn && !!id
    })

    const createEmployee = useMutation({
        mutationFn: async (employee: EmployeeCard) => {
            const response = await agent.post('/employee', employee);
            return response.data;
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['employeelist'] });
        }
    });

    const updateEmployee = useMutation({
        mutationFn: async (employee: EmployeeCard) => {
            await agent.put('/employee', employee)
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['employeePersonal'] });
            await queryClient.invalidateQueries({ queryKey: ['employeeCard'] });
            await queryClient.invalidateQueries({ queryKey: ['employeelist'] });
        }
    });

    const deleteEmployee = useMutation({
        mutationFn: async (id: number) => {
            await agent.delete(`/employee/${id}`)
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['employeelist'] });
        }
    });

    const {data: employeeService, isLoading: isLoadingEmployeeService} = useQuery({
        queryKey: ['employeeService', id],
        queryFn: async () => {
            const response = await agent.get<EmployeeService>(`/employee/services/${id}`);
            return response.data;
        },
        enabled: isLoggedIn && !!id
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

    const updateEmployeePersonal = useMutation({
        mutationFn: async (employeePersonal: EmployeePersonal) => {
            await agent.put('/employee/personal', employeePersonal)
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['employeePersonal']
            })
        }
    });

    const updateEmployeeInfo = useMutation({
        mutationFn: async (employeeInfo: EmployeeInfo) => {
            await agent.put('/employee/info', employeeInfo)
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['employeePersonal']
            })
        }
    });

    const updateEmployeeIdentity = useMutation({
        mutationFn: async (employeeIdentity: EmployeeIdentity) => {
            await agent.put('/employee/identity', employeeIdentity)
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['employeePersonal']
            })
        }
    });

    const updateEmployeeNumber = useMutation({
        mutationFn: async (employeeNumber: EmployeeNumber) => {
            await agent.put('/employee/number', employeeNumber)
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['employeePersonal']
            })
        }
    });

    const updateEmployeeBank = useMutation({
        mutationFn: async (employeeBank: EmployeeBank) => {
            await agent.put('/employee/bank', employeeBank)
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['employeePersonal']
            })
        }
    });

    //------------------------------------EMPLOYEE SERVICE-------------------------------------

    const updateEmployeePosition = useMutation({
        mutationFn: async (employeePosition: EmployeePosition) => {
            await agent.put('/employee/position', employeePosition)
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['employeeService']
            })
        }
    });

    const updateEmployeePositionInfo = useMutation({
        mutationFn: async (employeePositionInfo: EmployeePositionInfo) => {
            await agent.put('/employee/positionInfo', employeePositionInfo)
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['employeeService']
            })
        }
    });

    const updateEmployeeSalary = useMutation({
        mutationFn: async (employeeSalary: EmployeeSalary) => {
            await agent.put('/employee/salary', employeeSalary)
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['employeeService']
            })
        }
    });

    const updateEmployeeGrade = useMutation({
        mutationFn: async (employeeGrade: EmployeeGrade) => {
            await agent.put('/employee/grade', employeeGrade)
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['employeeService']
            })
        }
    });

    const updateEmployeeBelongs = useMutation({
        mutationFn: async (employeeBelongs: EmployeeBelongs) => {
            await agent.put('/employee/belongs', employeeBelongs)
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['employeeService']
            })
        }
    });

    const updateEmployeeWorks = useMutation({
        mutationFn: async (employeeWorks: EmployeeWorks) => {
            await agent.put('/employee/works', employeeWorks)
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['employeeService']
            })
        }
    });

    //------------------------------------EMPLOYEE EXPERIENCE-------------------------------------

    const {data: employeeExperienceList, isLoading: isLoadingΕmployeeExperienceList, isError: isEmployeeExperiexceError} = useQuery({
        queryKey: ['experienceList', id],
        queryFn: async () => {
            const response = await agent.get<Experience[]>(`/empExperience/experienceList/${id}`);
            return response.data;
        },
        enabled: isLoggedIn && !!id
    });

    const createEmployeeExperience = useMutation({
        mutationFn: async (employeeExperience: Experience) => {
            const response = await agent.post('/empExperience/createExperience', employeeExperience);
            return response.data;
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['experienceList'] });
        }
    });

    const updateEmployeeExperience = useMutation({
        mutationFn: async (employeeExperience: Experience) => {
            await agent.put('/empExperience/editExperience', employeeExperience)
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['experienceList']
            })
        }
    });

    const deleteEmployeeExperience = useMutation({
        mutationFn: async (id: number) => {
            await agent.delete(`/empExperience/deleteExperience/${id}`)
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['experienceList'] });
        }
    });

    //------------------------------------EMPLOYEE PENALTY-------------------------------------

    const {data: employeePenaltyList, isLoading: isLoadingEmployeePenaltyList} = useQuery({
        queryKey: ['penaltyList', id],
        queryFn: async () => {
            const response = await agent.get<Penalty[]>(`/empPenalty/penaltyList/${id}`);
            return response.data;
        },
        enabled: isLoggedIn && !!id
    });

    const createEmployeePenalty = useMutation({
        mutationFn: async (employeePenalty: Penalty) => {
            const response = await agent.post('/empPenalty/createPenalty', employeePenalty);
            return response.data;
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ 
                queryKey: ['penaltyList'],
                exact: false
            });
        }
    });

    const updateEmployeePenalty = useMutation({
        mutationFn: async (employeePenalty: Penalty) => {
            const response = await agent.put('/empPenalty/editPenalty', employeePenalty);
            return response.data;
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['penaltyList'],
                exact: false
            })
        }
    });

    const deleteEmployeePenalty = useMutation({
        mutationFn: async (id: number) => {
            await agent.delete(`/empPenalty/deletePenalty/${id}`)
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ 
                queryKey: ['penaltyList'],
                exact: false
            });
        }
    });

    //------------------------------------EMPLOYEE MOVE-------------------------------------

    const {data: employeeMoveList, isLoading: isLoadingEmployeeMoveList} = useQuery({
        queryKey: ['moveList', id],
        queryFn: async () => {
            const response = await agent.get<Move[]>(`/empMove/moveList/${id}`);
            return response.data;
        },
        enabled: isLoggedIn && !!id
    });

    const createEmployeeMove = useMutation({
        mutationFn: async (employeeMove: Move) => {
            const response = await agent.post('/empMove/createMove', employeeMove);
            return response.data;
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ 
                queryKey: ['moveList'],
                exact: false
            });
        }
    });

    const updateEmployeeMove = useMutation({
        mutationFn: async (employeeMove: Move) => {
            const response = await agent.put('/empMove/editMove', employeeMove);
            return response.data;
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['moveList'],
                exact: false
            })
        }
    });

    const deleteEmployeeMove = useMutation({
        mutationFn: async (id: number) => {
            await agent.delete(`/empMove/deleteMove/${id}`)
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['moveList'],
                exact: false
            });
        }
    });

    //------------------------------------EMPLOYEE CHILDREN-------------------------------------

    const { data: childrenCalendar = [], isLoading: isLoadingChildrenCalendar, isError: isErrorChildrenCalendar } = useQuery<dashboardCalendar[]>({
        queryKey: ['childrenCalendar'],
        queryFn: async () => {
            const response = await agent.get<dashboardCalendar[]>('/empchildren/childrenCalendar');
            return response.data || [];
        },
        enabled: true,
        staleTime: 1000 * 60 * 5,
    });

    const {data: employeeChildrenList, isLoading: isLoadingEmployeeChildrenList} = useQuery({
        queryKey: ['childrenList', id],
        queryFn: async () => {
            const response = await agent.get<Children[]>(`/empChildren/childrenList/${id}`);
            return response.data;
        },
        enabled: isLoggedIn && !!id
    });

    const createEmployeeChildren = useMutation({
        mutationFn: async (employeeChildren: Children) => {
            const response = await agent.post('/empChildren/createChildren', employeeChildren);
            return response.data;
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['childrenList'],
                exact: false
            });
        }
    });

    const updateEmployeeChildren = useMutation({
        mutationFn: async (employeeChildren: Children) => {
            const response = await agent.put('/empChildren/editChildren', employeeChildren);
            return response.data;
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['childrenList'],
                exact: false
            })
        }
    });

    const deleteEmployeeChildren = useMutation({
        mutationFn: async (id: number) => {
            await agent.delete(`/empChildren/deleteChildren/${id}`)
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['childrenList'],
                exact: false
            });
        }
    });

    //------------------------------------EMPLOYEE STUDIES-------------------------------------

    const {data: employeeStudiesList, isLoading: isLoadingEmployeeStudiesList} = useQuery({
        queryKey: ['studiesList', id],
        queryFn: async () => {
            const response = await agent.get<Studies[]>(`/empStudies/studiesList/${id}`);
            return response.data;
        },
        enabled: isLoggedIn && !!id
    });

    const createEmployeeStudies = useMutation({
        mutationFn: async (employeeStudies: Studies) => {
            const response = await agent.post('/empStudies/createStudies', employeeStudies);
            return response.data;
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['studiesList'],
                exact: false
            });
        }
    });

    const updateEmployeeStudies = useMutation({
        mutationFn: async (employeeStudies: Studies) => {
            const response = await agent.put('/empStudies/editStudies', employeeStudies);
            return response.data;
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['studiesList'],
                exact: false
            })
        }
    });

    const deleteEmployeeStudies = useMutation({
        mutationFn: async (id: number) => {
            await agent.delete(`/empStudies/deleteStudies/${id}`)
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['studiesList'],
                exact: false
            });
        }
    });

    //------------------------------------EMPLOYEE LEAVES-------------------------------------

    const {data: employeeLeavesTypes, isLoading: isLoadingEmployeeLeavesTypes} = useQuery({
        queryKey: ['emplLeaveType', id],
        queryFn: async () => {
            const response = await agent.get<LeaveType[]>(`/leave/emplLeaveType/${id}`);
            return response.data;
        },
        enabled: isLoggedIn && !!id
    });

    const {data: employeeLeavesList, isLoading: isLoadingEmployeeLeavesList} = useQuery({
        queryKey: ['leaveList', id],
        queryFn: async () => {
            const response = await agent.get<Leave[]>(`/leave/leaveList/${id}`);
            return response.data;
        },
        enabled: isLoggedIn && !!id
    });

    const createEmployeeLeave = useMutation({
        mutationFn: async (employeeLeave: Leave) => {
            const response = await agent.post('/leave/createLeave', employeeLeave);
            return response.data;
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['leaveList'] });
            await queryClient.invalidateQueries({ queryKey: ['leaveNow'] });
            await queryClient.invalidateQueries({ queryKey: ['leavePrev'] });
            await queryClient.invalidateQueries({ queryKey: ['leaveSum'] });
            await queryClient.invalidateQueries({ queryKey: ['leaveSickness'] });
            await queryClient.invalidateQueries({ queryKey: ['leaveSicknessSum'] });
            await queryClient.invalidateQueries({ queryKey: ['leaveCountPerDay'] });
        }
    });

    const updateEmployeeLeave = useMutation({
        mutationFn: async (employeeLeave: Leave) => {
            const response = await agent.put('/leave/editLeave', employeeLeave);
            return response.data;
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['leaveList'] });
            await queryClient.invalidateQueries({ queryKey: ['leaveNow'] });
            await queryClient.invalidateQueries({ queryKey: ['leavePrev'] });
            await queryClient.invalidateQueries({ queryKey: ['leaveSum'] });
            await queryClient.invalidateQueries({ queryKey: ['leaveSickness'] });
            await queryClient.invalidateQueries({ queryKey: ['leaveSicknessSum'] });
            await queryClient.invalidateQueries({ queryKey: ['leaveCountPerDay'] });
        }
    });

    const deleteEmployeeLeave = useMutation({
        mutationFn: async (id: number) => {
            await agent.delete(`/leave/deleteLeave/${id}`)
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['leaveList'] });
            await queryClient.invalidateQueries({ queryKey: ['leaveNow'] });
            await queryClient.invalidateQueries({ queryKey: ['leavePrev'] });
            await queryClient.invalidateQueries({ queryKey: ['leaveSum'] });
            await queryClient.invalidateQueries({ queryKey: ['leaveSickness'] });
            await queryClient.invalidateQueries({ queryKey: ['leaveSicknessSum'] });
            await queryClient.invalidateQueries({ queryKey: ['leaveCountPerDay'] });
        }
    });
    //------------------------------------LEAVE COUNT ----------------------------------

    const { data: leaveNow, isLoading: isLoadingLeaveNow } = useQuery({
        queryKey: ['leaveNow', id],
        queryFn: async () => {
            const response = await agent.get(`/leave/leaveNow/${id}`);
            return response.data;
        },
        enabled: isLoggedIn && !!id
    });

    const { data: leavePrev, isLoading: isLoadingLeavePrev } = useQuery({
        queryKey: ['leavePrev', id],
        queryFn: async () => {
            const response = await agent.get(`/leave/leavePrev/${id}`);
            return response.data;
        },
        enabled: isLoggedIn && !!id
    });

    const { data: leaveSum, isLoading: isLoadingLeaveSum } = useQuery({
        queryKey: ['leaveSum', id],
        queryFn: async () => {
            const response = await agent.get(`/leave/leaveSum/${id}`);
            return response.data;
        },
        enabled: isLoggedIn && !!id
    });

    const { data: overallLeaves, isLoading: isLoadingOverallLeaves } = useQuery<OverallLeaves[]>({
        queryKey: ['overallLeaves', id],
        queryFn: async () => {
            const response = await agent.get<OverallLeaves[]>(`/leave/overallLeaves/${id}`);
            return response.data || [];
        }, 
        enabled: isLoggedIn && !!id
    });

    const updateOverallLeaves = useMutation({
        mutationFn: async (types: number[]) => {
            const response = await agent.put<OverallLeaves[]>(`/leave/overallLeaves/${id}`, types);
            return response.data;
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['overallLeaves', id] });
            await queryClient.invalidateQueries({ queryKey: ['leavePrev'] });
            await queryClient.invalidateQueries({ queryKey: ['leaveSum'] });
            await queryClient.invalidateQueries({ queryKey: ['employeeLeavesTypes']});
        }
    });

    const { data: leaveSickness, isLoading: isLoadingLeaveSickness } = useQuery({
        queryKey: ['leaveSickness', id],
        queryFn: async () => {
            const response = await agent.get(`/leave/leaveSickness/${id}`);
            return response.data;
        },
        enabled: isLoggedIn && !!id
    });

    const { data: leaveSicknessSum, isLoading: isLoadingLeaveSicknessSum } = useQuery({
        queryKey: ['leaveSicknessSum', id],
        queryFn: async () => {
            const response = await agent.get(`/leave/leaveSicknessSum/${id}`);
            return response.data;
        },
        enabled: isLoggedIn && !!id
    });

    //------------------------------------EMPLOYEE CHANGES-------------------------------------

    const {data: employeeChangesList, isLoading: isLoadingEmployeeChangesList} = useQuery({
        queryKey: ['changeList', id],
        queryFn: async () => {
            const response = await agent.get<Change[]>(`/empchanges/changeList/${id}`);
            return response.data;
        },
        enabled: isLoggedIn && !!id
    });

    const createEmployeeChange = useMutation({
        mutationFn: async (employeeChange: Change) => {
            const response = await agent.post('/empchanges/createChange', employeeChange);
            return response.data;
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['changeList'] });
        }
    });

    const updateEmployeeChange = useMutation({
        mutationFn: async (employeeChange: Change) => {
            const response = await agent.put('/empchanges/editChange', employeeChange);
            return response.data;
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['changeList'] });
        }
    });

    const deleteEmployeeChange = useMutation({
        mutationFn: async (id: number) => {
            await agent.delete(`/empchanges/deleteChange/${id}`)
        },
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['changeList'] }),
            ]);
        }
    });

    const executeEmployeeChange = useMutation({
        mutationFn: async (id: number) => {
            await agent.put(`/empchanges/executeChange/${id}`)
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['changeList'] });
        }
    });

    //------------------------------------EMPLOYEE PLACEMENTS-------------------------------------

    const {data: employeePlacementList, isLoading: isLoadingEmployeePlacementList} = useQuery({
        queryKey: ['placementList', id],
        queryFn: async () => {
            const response = await agent.get<Placement[]>(`/empPlacement/placementList/${id}`);
            return response.data;
        },
        enabled: isLoggedIn && !!id
    });

    const createEmployeePlacement = useMutation({
        mutationFn: async (employeePlacement: Placement) => {
            const response = await agent.post('/empPlacement/createPlacement', employeePlacement);
            return response.data;
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['placementList'] });
        }
    });

    const updateEmployeePlacement = useMutation({
        mutationFn: async (employeePlacement: Placement) => {
            const response = await agent.put('/empPlacement/editPlacement', employeePlacement);
            return response.data;
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['placementList'] });
        }
    });

    const deleteEmployeePlacement = useMutation({
        mutationFn: async (id: number) => {
            await agent.delete(`/empPlacement/deletePlacement/${id}`)
        },
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['placementList'] }),
            ]);
        }
    });

    //------------------------------------EMPLOYEE FILES-------------------------------------

    const {data: employeeFileList, isLoading: isLoadingEmployeeFileList} = useQuery({
        queryKey: ['fileList', id],
        queryFn: async () => {
            const response = await agent.get<Files[]>(`/empFile/fileList/${id}`);
            return response.data;
        },
        enabled: isLoggedIn && !!id
    });

    const createEmployeeFile = useMutation({
        mutationFn: async (formData: FormData) => {
            const response = await agent.post(
                "/empFile/createFile",
                formData
            );

            return response.data;
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["fileList"] });
        }
    });

    const updateEmployeeFile = useMutation({
        mutationFn: async (formData: FormData) => {
            const response = await agent.put(
                "/empFile/editFile",
                formData
            );
            return response.data;
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ["fileList"],
            });
        }
    });

    const deleteEmployeeFile = useMutation({
        mutationFn: async (id: number) => {
            await agent.delete(`/empFile/deleteFile/${id}`)
        },
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['fileList'] }),
            ]);
        }
    });

    const downloadEmployeeFile = async (id: number) => {
        const response = await agent.get(`/empFile/downloadFile/${id}`, {
            responseType: "blob",
        });

        return response.data;
    };

    const addFullEmployee = useMutation({
        mutationFn: async (payload: AddEmployeePayload) => {
            const response = await agent.post('/employee/addFull', payload);
            return response.data;
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['employeelist'] });
            await queryClient.invalidateQueries({ queryKey: ['countEmp'] });
        }
    });

    const {data: employeeAllLeavesList, isLoading: isLoadingEmployeeAllLeavesList, isError: isErrorEmployeeAllLeavesList,} = useQuery<PagedList<LeaveListDto>>({
        queryKey: ['allLeaves', page, pageSize, search, flag, leaveType, leaveMonth, leaveYear, tableType, leaveDate],
        queryFn: async () => {
            const params = {
                page, pageSize,
                search: search || undefined,
                flag: flag || undefined,
                leaveType: leaveType || undefined,
                month: leaveMonth || undefined,
                year: leaveYear || undefined,
                tableType: tableType !== undefined ? tableType : undefined,
                date: leaveDate || undefined,
            };
            const response = await agent.get('/leave/allLeaves', { params });
            return response.data;
        },
        enabled: isLoggedIn && (!!page || !!pageSize),
        placeholderData: keepPreviousData,
    });

    //-------------------------------Employee Reports-------------------------------------

    const downloadWorkReport = async (id: number) => {
        const response = await agent.get(`/EmpReport/GetWorkReport/${id}`, {
            responseType: "blob",
        });

        return response.data as Blob;
    };

    const downloadAtomikoDeltioKataxis = async (id: number) => {
        const response = await agent.get(`/EmpReport/GetAtomikoDeltioKataxis/${id}`, {
            responseType: "blob",
        });

        return response.data as Blob;
    };
    
    const downloadVevaiwshProuphresias = async (id: number) => {
        const response = await agent.get(`/empreport/GetVevaiwshProuphresiass/${id}`, {
            responseType: "blob",
        });

        return response.data as Blob;
    };

    const downloadVevaiwshAnarrotikhs = async (id: number) => {
        const response = await agent.get(`/EmpReport/GetVevaiwshAnarrotikhs/${id}`, {
            responseType: "blob",
        });

        return response.data as Blob;
    };

    const downloadDeltioYpiresiakonMetavolon = async (id: number) => {
        const response = await agent.get(`/EmpReport/GetDeltioYpiresiakonMetavolon/${id}`, {
            responseType: "blob",
        });

        return response.data as Blob;
    };

    return {
        employeeGroup,
        fetchAllEmployees,
        isLoading,
        isError,
        employee,
        employeeCard,
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
        employeeExperienceList,
        isLoadingΕmployeeExperienceList,
        employeePenaltyList,
        isLoadingEmployeePenaltyList,
        employeeMoveList,
        isLoadingEmployeeMoveList,
        employeeChildrenList,
        isLoadingEmployeeChildrenList,
        employeeStudiesList,
        isLoadingEmployeeStudiesList,
        employeeLeavesTypes,
        isLoadingEmployeeLeavesTypes,
        employeeLeavesList,
        isLoadingEmployeeLeavesList,
        leaveNow,
        isLoadingLeaveNow,
        leavePrev,
        isLoadingLeavePrev,
        leaveSum,
        isLoadingLeaveSum,
        overallLeaves,
        isLoadingOverallLeaves,
        updateOverallLeaves: updateOverallLeaves.mutate,
        leaveSickness,
        isLoadingLeaveSickness,
        leaveSicknessSum,
        isLoadingLeaveSicknessSum,
        employeeChangesList,
        isLoadingEmployeeChangesList,
        employeePlacementList,
        isLoadingEmployeePlacementList,
        employeeFileList,
        isLoadingEmployeeFileList,
        employeeAllLeavesList,
        isLoadingEmployeeAllLeavesList,
        isErrorEmployeeAllLeavesList,
        isEmployeeExperiexceError,
        addFullEmployee: addFullEmployee.mutate,

        childrenCalendar,
        isLoadingChildrenCalendar,
        isErrorChildrenCalendar,

        updateEmployeePersonal: updateEmployeePersonal.mutate,
        updateEmployeeInfo: updateEmployeeInfo.mutate,
        updateEmployeeIdentity: updateEmployeeIdentity.mutate,
        updateEmployeeNumber: updateEmployeeNumber.mutate,
        updateEmployeeBank: updateEmployeeBank.mutate,
        updateEmployeePosition: updateEmployeePosition.mutate,
        updateEmployeePositionInfo: updateEmployeePositionInfo.mutate,
        updateEmployeeSalary: updateEmployeeSalary.mutate,
        updateEmployeeGrade: updateEmployeeGrade.mutate,
        updateEmployeeBelongs: updateEmployeeBelongs.mutate,
        updateEmployeeWorks: updateEmployeeWorks.mutate,
        updateEmployeeExperience: updateEmployeeExperience.mutate,
        createEmployeeExperience: createEmployeeExperience.mutate,
        deleteEmployeeExperience: deleteEmployeeExperience.mutate,
        createEmployeePenalty: createEmployeePenalty.mutate,
        updateEmployeePenalty: updateEmployeePenalty.mutate,
        deleteEmployeePenalty: deleteEmployeePenalty.mutate,
        createEmployeeMove: createEmployeeMove.mutate,
        updateEmployeeMove: updateEmployeeMove.mutate,
        deleteEmployeeMove: deleteEmployeeMove.mutate,
        createEmployeeChildren: createEmployeeChildren.mutate,
        updateEmployeeChildren: updateEmployeeChildren.mutate,
        deleteEmployeeChildren: deleteEmployeeChildren.mutate,
        createEmployeeStudies: createEmployeeStudies.mutate,
        updateEmployeeStudies: updateEmployeeStudies.mutate,
        deleteEmployeeStudies: deleteEmployeeStudies.mutate,
        createEmployeeLeave: createEmployeeLeave.mutate,
        updateEmployeeLeave: updateEmployeeLeave.mutate,
        deleteEmployeeLeave: deleteEmployeeLeave.mutate,
        createEmployeeChange: createEmployeeChange.mutate,
        updateEmployeeChange: updateEmployeeChange.mutate,
        deleteEmployeeChange: deleteEmployeeChange.mutate,
        executeEmployeeChange: executeEmployeeChange.mutate,
        createEmployeePlacement: createEmployeePlacement.mutate,
        updateEmployeePlacement: updateEmployeePlacement.mutate,
        deleteEmployeePlacement: deleteEmployeePlacement.mutate,
        createEmployeeFile: createEmployeeFile.mutate,
        updateEmployeeFile: updateEmployeeFile.mutate,
        deleteEmployeeFile: deleteEmployeeFile.mutate,
        downloadEmployeeFile: downloadEmployeeFile,
        downloadWorkReport: downloadWorkReport,
        downloadAtomikoDeltioKataxis: downloadAtomikoDeltioKataxis,
        downloadVevaiwshProuphresias: downloadVevaiwshProuphresias,
        downloadVevaiwshAnarrotikhs: downloadVevaiwshAnarrotikhs,
        downloadDeltioYpiresiakonMetavolon: downloadDeltioYpiresiakonMetavolon
    }
  }