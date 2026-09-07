import { z } from 'zod';

export const employeePenaltySchema = z.object({
  id: z.number().optional(),
  am: z.number().min(1, 'ID υπαλλήλου είναι υποχρεωτικό'),
  type: z.string().min(1, 'Τύπος ποινής είναι υποχρεωτικό'),
  lexical: z.number().min(-1, 'Τύπος ποινής είναι υποχρεωτικό'),
  description: z.union([z.string(), z.null()]).optional(),
  decision: z.union([z.string(), z.null()]).optional(),
  dateFrom: z.string().min(1, 'Ημερομηνία έναρξης είναι υποχρεωτική').refine(
    (date) => /^\d{4}-\d{2}-\d{2}$/.test(date),
    'Μορφή ημερομηνίας πρέπει να είναι YYYY-MM-DD'
  ),
  dateTo: z.string().min(1, 'Ημερομηνία λήξης είναι υποχρεωτική').refine(
    (date) => /^\d{4}-\d{2}-\d{2}$/.test(date),
    'Μορφή ημερομηνίας πρέπει να είναι YYYY-MM-DD'
  ),
  amount: z.union([z.string(), z.null()]).optional(),
  flag: z.number().optional(),
}).refine(
  (data) => new Date(data.dateTo) >= new Date(data.dateFrom),
  {
    message: 'Ημερομηνία λήξης πρέπει να είναι μεγαλύτερη ή ίση με την ημερομηνία έναρξης',
    path: ['dateTo'],
  }
);
