import { z } from "zod";

export const employeeChangesSchema = z.object({
    id: z.number().optional(),//id: number
    am: z.number(),//  am: number
    type: z.number().min(1,"Ο τύπος μεταβολής είναι υποχρεωτικός"),//  type: number
    previousState: z.number().optional(),//  previousState: number
    nextState: z.number().optional(),//  nextState: number
    changeDate: z.string().min(1,"Η ημ/νια αλλαγής είναι υποχρεωτική"),//  changeDate: string | Date
    nextDate: z.string().optional(),//  nextDate: string | Date
    user: z.string().optional(),//  user: string
    notes: z.string().optional(),//  notes: string
    anadromikaApo: z.string().optional(),//  anadromikaApo: string | Date
    anadromikaEws: z.string().optional(),//  anadromikaEws: string | Date
    days: z.string().optional(),//  days: string
    flag: z.number().optional(),//  flag: number
    protocol: z.string().optional(),//  protocol: number
    protocolDate: z.string().optional(),//  protocolDate: string | Date
});