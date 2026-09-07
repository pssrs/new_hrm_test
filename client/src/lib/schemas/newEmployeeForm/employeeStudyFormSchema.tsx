import { z } from "zod";

export const employeeStudiesFormSchema = z.object({
    am: z.number().optional(),
    type: z.number().min(-1, "Ο τύπος σπουδών είναι υποχρεωτικός"),
    description: z.string().min(1, "Ο τίτλος σπουδών είναι υποχρεωτικός"),
    education: z.number().optional(),
    local: z.number().optional(),
    category: z.number().optional(),
    years: z.string().regex(/^\d+$/, "Τα έτη πρέπει να περιέχουν μόνο αριθμούς").optional().or(z.literal("")),
    date: z.string().min(1, "Η ημερομηνία είναι υποχρεωτική"),
    degree: z.string().optional(),
    employee: z.number().optional(),
    relevance: z.number().optional(),
    comment: z.string().optional(),
    dateRequired: z.string().optional(),
    location: z.string().optional(),
});

export type EmployeeStudiesFormData = z.infer<typeof employeeStudiesFormSchema>;