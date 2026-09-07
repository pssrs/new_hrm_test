import { z } from "zod";

export const employeeExperienceFormSchema = z.object({
    type: z.number().optional(),
    dateFrom: z.string().min(1, "Η ημερομηνία έναρξης είναι υποχρεωτική").optional(),
    dateTo: z.string().min(1, "Η ημερομηνία λήξης είναι υποχρεωτική").optional(),
    years: z.string().optional(),
    months: z.string().optional(),
    days: z.string().optional(),
    carrier: z.string().min(1, "O φορέας είναι υποχρεωτικός").optional(),
    decisionId: z.string().optional(),
    comments: z.string().optional(),
    agonis: z.number().optional(),
    mk: z.number().optional(),
    grade: z.number().optional(),
    sunt: z.number().optional(),
    dateCouncil: z.string().optional(),
    auto: z.number().optional(),
}).refine((data) => {
    // Ελέγχουμε ότι η ημερομηνία λήξης είναι μετά την ημερομηνία έναρξης (αν έχει δοθεί)
    if (!data.dateTo || data.dateTo === "1900-01-01") return true;
    const startDate = new Date(data.dateFrom?.toString() ?? "1900-01-01");
    const endDate = new Date(data.dateTo);
        return endDate >= startDate;
}, {
    message: "Η ημερομηνία λήξης πρέπει να είναι ίση ή μετά την ημερομηνία έναρξης",
    path: ["dateTo"],
});

export type EmployeeExperienceFormData = z.infer<typeof employeeExperienceFormSchema>;

export const emptyExperience: EmployeeExperienceFormData = {
    type: undefined,
    dateFrom: "1900-01-01",
    dateTo: "1900-01-01",
    years: "",
    months: "",
    days: "",
    carrier: "",
    decisionId: "",
    comments: "",
    agonis: undefined,
    mk: 0,
    grade: 0,
    sunt: 0,
    dateCouncil: "1900-01-01",
    auto: 0,
};