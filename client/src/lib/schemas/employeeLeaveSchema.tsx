import { z } from "zod";

export const employeeLeaveSchema = z.object({
    id: z.number(),//id: number
    am: z.number(),//  am: number
    type: z.number().min(1),//  type: number
    duration: z.number().optional(),//  duration: number
    dateFrom: z.string(),//  dateFrom: string | Date
    dateTo: z.string(),//  dateTo: string | Date
    year: z.number().optional(),//  year: number
    notes: z.string().optional(),//  notes: string
    request: z.string().optional(),//  request: string
    approval: z.string().optional(),//  approval: string
    state: z.number().optional(),//  state: number
});