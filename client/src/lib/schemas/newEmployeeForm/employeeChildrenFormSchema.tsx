import { z } from "zod";

export const employeeChildrenFormSchema = z.object({
    employeeId: z.number().optional(),
    childSurname: z.string().min(1, "Το επώνυμο του τέκνου είναι υποχρεωτικό").optional(),
    childName: z.string().min(1, "Το όνομα του τέκνου είναι υποχρεωτικό").optional(),
    childFather: z.string().min(1, "Το όνομα του γονέα είναι υποχρεωτικό").optional(),
    childSex: z.number().optional(),
    childBirth: z.string().min(1, "Η ημερομηνία γέννησης είναι υποχρεωτική").optional(),
    childDateFrom: z.string().optional(),
    childDateTo: z.string().optional(),
    childDisability: z.number().optional(),
    childLevel: z.string().optional(),
    childSchool: z.string().optional(),
    childYears: z.string().optional(),
    childMonths: z.string().optional(),
    childFlag: z.number().optional(),
    child18: z.number().optional(),
    childSchoolDesc: z.string().optional(),
});

export type EmployeeChildrenFormData = z.infer<typeof employeeChildrenFormSchema>;