import { z } from "zod";

export const employeeStudySchema = z.object({
    id: z.number().optional(),//id: number
    am: z.number(),//employeeId: number
    type: z.number().min(0,"Το είδος σπουδών είναι υποχρεωτικό"),//type: number
    description: z.string().min(1,"Ο τίτλος σπουδών είναι υποχρεωτικός"),//description: string
    education: z.number().min(-1,"Το εκπαιδευτικό ίδρυμα είναι υποχρεωτικός"),//education: number
    local: z.number().optional(),//local: number
    category: z.number().optional(),//category: number
    years: z.string().optional(),//years: string
    date: z.string().optional(),//date: string
    degree: z.string().optional(),//degree: string
    employee: z.number().optional(),//empl: number
    relevance: z.number().optional(),//relev: number
    comment: z.string().optional(),//comments: string
    dateRequired: z.string().optional(),//dateReq: string
    location: z.string().optional(),//location: string
});
