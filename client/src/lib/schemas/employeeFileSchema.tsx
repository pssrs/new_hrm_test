import { z } from "zod";

export const employeeFileSchema = z.object({
    id: z.number().optional(),//id: number
    am: z.number(),//  am: number
    type: z.number().min(1,"Ο τύπος μεταβολής είναι υποχρεωτικός"),//  type: number
    name: z.string().optional(),//  name: string
    location: z.string().optional(),//  location: string
});
