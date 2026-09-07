import { z } from "zod";

export const employeeMoveSchema = z.object({
    id: z.number().optional(),
    am: z.number(),
    type: z.string().min(1, "Ο τύπος μετακίνησης είναι υποχρεωτικός"),
    destination: z.string().min(1, "Ο τύπος μετακίνησης είναι υποχρεωτικός"),
    foreas: z.string().min(1, "Ο φορέας είναι υποχρεωτικός"),
    dateFrom: z.string().min(1, "Η ημερομηνία έναρξης της μετακίνησης είναι υποχρεωτική"),
    dateTo: z.string().min(1, "Η ημερομηνία λήξης της μετακίνησης είναι υποχρεωτική"),
    decision: z.string().optional(),
    dateDecision: z.string().min(1, "Η ημερομηνία απόφασης της μετακίνησης είναι υποχρεωτική"),
    comment: z.string().optional(),
});