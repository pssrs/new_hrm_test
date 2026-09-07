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

export const positionSectionSchema = z.object({
    workRelation: z.string().min(1, "Η σχέση εργασίας είναι υποχρεωτική"),
    category: z.string().min(1, "Η κατηγορία είναι υποχρεωτική"),
    specialty: z.string().min(1, "Η ειδικότητα είναι υποχρεωτική"),
    branch: z.string().min(1, "Ο κλάδος είναι υποχρεωτικός"),
});

export const positionInfoSectionSchema = z.object({
    fek: z.string().min(1, "Το ΦΕΚ είναι υποχρεωτικό"),
    hireDate: z.coerce.date({ message: "Η ημ/νία πρόσληψης είναι υποχρεωτική" }),
    position: z.string().min(1, "Η θέση είναι υποχρεωτική"),
    employmentType: z.string().min(1, "Ο τύπος απασχόλησης είναι υποχρεωτικός"),
});

export const mkSchema = z.object({
    salaryCode: z.string().min(1, "Ο κωδικός μισθοδοσίας είναι υποχρεωτικός"),
    mk: z.string().min(1, "Το ΜΚ είναι υποχρεωτικό"),
    mkDate: z.coerce.date({ message: "Η ημ/νία ΜΚ είναι υποχρεωτική" }),
    mkNextDate: z.coerce.date({ message: "Η επόμενη ημ/νία ΜΚ είναι υποχρεωτική" }),
});

export const rankSchema = z.object({
    rank: z.string().min(1, "Ο βαθμός είναι υποχρεωτικός"),
    rankDate: z.coerce.date({ message: "Η ημ/νία βαθμού είναι υποχρεωτική" }),
    rankNextDate: z.coerce.date({ message: "Η επόμενη ημ/νία βαθμού είναι υποχρεωτική" }),
    gradeFek: z.string().min(1, "Το ΦΕΚ είναι υποχρεωτικό")
});

export const belongsSchema = z.object({
    directorate: z.number(),
    sector: z.number(),
    department: z.number(),
    office: z.number(),
});

export const worksSchema = z.object({
    workDirectorate: z.number(),
    workSector: z.number(),
    workDepartment: z.number(),
    workOffice: z.number(),
});

export type EmployeeServiceSchema = z.infer<typeof employeeServiceSchema>;
export type PositionSectionSchema = z.infer<typeof positionSectionSchema>;
export type PositionInfoSectionSchema = z.infer<typeof positionInfoSectionSchema>;
export type MkSchema = z.infer<typeof mkSchema>;
export type RankSchema = z.infer<typeof rankSchema>;
export type BelongsSchema = z.infer<typeof belongsSchema>;
export type WorksSchema = z.infer<typeof worksSchema>;
