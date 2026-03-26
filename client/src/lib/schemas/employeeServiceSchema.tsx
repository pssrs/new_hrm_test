import { z } from "zod";

export const employeeServiceSchema = z.object({
    id: z.number(),
    am: z.number(),

    // Dates (string | null from backend)
    hireDate: z.string().nullable(),
    publicationDate: z.string().nullable(),
    appointmentDate: z.string().nullable(),
    terminationDate: z.string().nullable(),
    mkDate: z.string().nullable(),
    rankDate: z.string().nullable(),

    // Selects (int)
    workRelation: z.number(),
    position: z.number(),
    employmentType: z.number(),

    // Salary
    mk: z.number(),
    salaryGrade: z.string(),
    salaryCode: z.string(),

    // Career
    category: z.string(),
    branch: z.string(),
    specialty: z.string(),
    rank: z.string(),
    fek: z.string(),

    // Organization
    directorate: z.number(),
    sector: z.number(),
    department: z.number(),
    office: z.number(),
    workDirectorate: z.number(),
    workSector: z.number(),
    workDepartment: z.number(),
    workOffice: z.number(),

    flag: z.number(),
});

export type EmployeeServiceSchema = z.infer<typeof employeeServiceSchema>;
