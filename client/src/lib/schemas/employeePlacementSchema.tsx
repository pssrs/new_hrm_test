import { z } from "zod";

export const employeePalcementSchema = z.object({
    id: z.number().optional(),//id: number
    am: z.number(),//    am: number
    type: z.number().min(1,"Ο τύπος μεταβολής είναι υποχρεωτικός"),//    type: number
    oldAddress: z.number().optional(),//   oldAddress: number
    oldSector: z.number().optional(),//    oldSector: number
    oldDepartment: z.number().optional(),//    oldDepartment: number
    oldTeam: z.number().optional(),//    oldTeam: number
    newAddress: z.number().optional(),//    newAddress: number
    newSector: z.number().optional(),//    newSector: number
    newDepartment: z.number().optional(),//    newDepartment: number
    newTeam: z.number().optional(),//    newTeam: number
    comment: z.string().optional(),//    comment: string
    duration: z.string().optional(),//    duration: string
    date: z.string().min(1,"Η ημ/νια τοποθέτησης είναι υποχρεωτική"),//    date: string | Date
    user: z.string().optional(),//    user: string
});
