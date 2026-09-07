import { z } from "zod";

export const employeePersonalFormSchema = z.object({
    firstName: z.string().min(1, "Το όνομα είναι υποχρεωτικό"),
    lastName: z.string().min(1, "Το επίθετο είναι υποχρεωτικό"),
    birthDate: z.string().optional(),
    fatherName: z.string().optional(),
    motherName: z.string().optional(),
    familyStatus: z.string().optional(),
    address: z.string().optional(),
    addressNumber: z.string().optional(),
    postCode: z.string().optional(),
    city: z.string().optional(),
    phone: z.string().min(2, "Το τηλέφωνο είναι υποχρεωτικό"),
    email: z.string().min(2, "Το email είναι υποχρεωτικό"),
    identityCardNumber: z.string().optional(),
    identityCardIssueDate: z.string().optional(),
    citizenship: z.string().optional(),
    nationality: z.string().optional(),
    afm: z.string().regex(/^\d+$/, "Το ΑΦΜ πρέπει να περιέχει μόνο αριθμούς").min(9, "Το ΑΦΜ πρέπει να έχει 9 ψηφία").max(9, "Το ΑΦΜ πρέπει να έχει 9 ψηφία"),
    amka: z.string().regex(/^\d+$/, "Το ΑΜΚΑ πρέπει να περιέχει μόνο αριθμούς").min(11, "Το ΑΜΚΑ πρέπει να έχει 11 ψηφία").max(11, "Το ΑΜΚΑ πρέπει να έχει 11 ψηφία"),
    ama: z.string().regex(/^\d+$/, "Το ΑΜΑ πρέπει να περιέχει μόνο αριθμούς").refine(value => value === "" || value.length === 7, "Ο ΑΜΑ πρέπει να έχει 7 χαρακτήρες").optional(),
    personalNumber: z.string().refine(value => value === "" || value.length === 12, "Ο προσωπικός αριθμός πρέπει να έχει 12 χαρακτήρες").optional(),
    doy: z.string().optional(),
    iban1: z.string().refine(value => value === "" || (value.startsWith("GR") && value.length === 27), "Το IBAN1 πρέπει να έχει 27 χαρακτήρες(π.χ. GR1234567890123456789012345)").optional(),
    iban2: z.string().refine(value => value === "" || (value.startsWith("GR") && value.length === 27), "Το IBAN2 πρέπει να έχει 27 χαρακτήρες(π.χ. GR1234567890123456789012345)").optional(),
});

export type EmployeePersonalFormData = z.infer<typeof employeePersonalFormSchema>;