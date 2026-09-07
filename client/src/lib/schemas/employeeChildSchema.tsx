import { z } from "zod";

export const employeeChildSchema = z.object({
    id: z.number().optional(),
    employeeId: z.number(),
    childSurname: z.string().min(1, "Η φορέα είναι υποχρεωτική"),
    childName: z.string().min(1, "Η ημερομηνία έναρξης είναι υποχρεωτική"),
    childFather: z.string().min(1, "Η ημερομηνία έναρξης είναι υποχρεωτική"),
    childSex: z.number().optional(),
    childBirth: z.string().min(1, "Η ημερομηνία έναρξης είναι υποχρεωτική"),
    childDateFrom: z.string().optional(),
    childDateTo: z.string().optional(),
    childDisability: z.number().optional(),
    childLevel: z.number().optional(),
    childSchool: z.number().optional(),
    childYears: z.string().optional(),
    childMonths: z.string().optional(),
    childFlag: z.number().optional(),
    child18: z.number().optional(),
    childSchoolDesc: z.string().optional(),
});
