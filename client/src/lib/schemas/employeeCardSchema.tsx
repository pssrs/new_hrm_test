import { z } from "zod";

export const employeeCardSchema = z.object({
    id: z.number(),
    am: z.number(),
    lastName: z.string().min(1, "Το επώνυμο είναι υποχρεωτικό"),
    firstName: z.string().min(1, "Το όνομα είναι υποχρεωτικό"),
    fatherName: z.string().min(1, "Το όνομα πατέρα είναι υποχρεωτικό"),
    motherName: z.string().min(1, "Το όνομα μητέρας είναι υποχρεωτικό"),
    spouseName: z.string(),
    birthDate: z.string().min(1, "Η ημερομηνία γέννησης είναι υποχρεωτική"),
    birthPlace: z.string(),
    address: z.string().min(1, "Η διεύθυνση είναι υποχρεωτική"),
    area: z.string().min(1, "Η περιοχή είναι υποχρεωτική"),
    city: z.string().min(1, "Η πόλη είναι υποχρεωτική"),
    postCode: z.string().min(1, "Ο ταχυδρομικός κώδικας είναι υποχρεωτικός"),
    sex: z.string(),
    familyStatus: z.string(),
    nationality: z.string(),
    citizenship: z.string().min(1, "Η εθνικότητα είναι υποχρεωτική"),
    ama: z.string().min(1, "Το ΑΜΑ είναι υποχρεωτικό"),
    phone: z.string().min(1, "Ο αριθμός τηλεφώνου είναι υποχρεωτικός"),
    identityCardNumber: z.string().min(1, "Ο αριθμός ταυτότητας/διαβατηρίου είναι υποχρεωτικός"),
    identityCardIssueDate: z.string(),
    amka: z.string().length(11, "Το ΑΜΚΑ πρέπει να αποτελείται από 11 ψηφία"),
    email: z.string().min(1, "Το email είναι υποχρεωτικό"),
    afm: z.string().length(9, "Το ΑΦΜ πρέπει να αποτελείται από 9 ψηφία"),
    doy: z.string(),
    employmentState: z.string().min(1, "Η εργασιακή κατάσταση είναι υποχρεωτική"),
    iban1: z.string().min(1, "Το IBAN1 είναι υποχρεωτικό"),
    iban2: z.string()
})

export type EmployeeCardSchema = z.infer<typeof employeeCardSchema>;