import { z } from "zod";

export const personalSectionSchema = z.object({
    fatherName: z.string().min(1, "Το όνομα πατέρα είναι υποχρεωτικό"),
    motherName: z.string().min(1, "Το όνομα μητέρας είναι υποχρεωτικό"),
    birthDate: z.string().min(1, "Η ημερομηνία γέννησης είναι υποχρεωτική"),
    birthPlace: z.string().optional(),
    spouseName: z.string().optional(),
    sex: z.string().optional(),
    familyStatus: z.string(),
    doy: z.string().min(1, "Η ΔΟΥ είναι υποχρεωτική"),
});

export const infoSectionSchema = z.object({
    address: z.string().min(1, "Η διεύθυνση είναι υποχρεωτική"),
    area: z.string().optional(),
    city: z.string().min(1, "Η πόλη είναι υποχρεωτική"),
    postCode: z.string().min(1, "Ο ταχυδρομικός κώδικας είναι υποχρεωτικός"),
    phone: z.string().min(10, "Το τηλέφωνο είναι υποχρεωτικό"),
    email: z.string().email("Το email δεν είναι έγκυρο").min(1, "Το email είναι υποχρεωτικό"),
});

export const identitySectionSchema = z.object({
    citizenship: z.string().min(1, "Η υπηκοότητα είναι υποχρεωτική"),
    nationality: z.string(),
    identityCardNumber: z.string().min(1, "Ο αριθμός ταυτότητας/διαβατηρίου είναι υποχρεωτικός"),
    identityCardIssueDate: z.string(),
});

export const numbersSectionSchema = z.object({
    afm: z.string().length(9, "Το ΑΦΜ πρέπει να αποτελείται από 9 ψηφία"),
    amka: z.string().length(11, "Το ΑΜΚΑ πρέπει να αποτελείται από 11 ψηφία"),
    ama: z.string().length(7, "Το ΑΜΑ πρέπει να αποτελείται από 7 ψηφία"),
    personalNumber: z.string().optional().refine(val => !val || val.length === 12, "Ο προσωπικός αριθμός πρέπει να αποτελείται από 7 ψηφία"),
    doy: z.string().min(1, "Η ΔΟΥ είναι υποχρεωτική"),
});

export const communicationSectionSchema = z.object({
    email: z.string().min(1, "Το email είναι υποχρεωτικό"),
    phone: z.string().min(1, "Ο αριθμός τηλεφώνου είναι υποχρεωτικός"),
});

export const bankSectionSchema = z.object({
    iban1: z.string().min(27, "Το IBAN1 είναι υποχρεωτικό και πρέπει να αποτελείται από 27 χαρακτήρες").max(27, "Το IBAN1 πρέπει να αποτελείται από 27 χαρακτήρες"),
    iban2: z.string().min(27, "Το IBAN2 είναι υποχρεωτικό και πρέπει να αποτελείται από 27 χαρακτήρες").max(27, "Το IBAN2 πρέπει να αποτελείται από 27 χαρακτήρες"),
});

// ── EmployeeService sections ──────────────────────────────────────────────────

export const serviceDatesSchema = z.object({
    hireDate: z.string(),
    publicationDate: z.string(),
});

export const servicePositionSchema = z.object({
    workRelation: z.number(),
    category: z.string(),
    branch: z.string(),
    specialty: z.string(),
    position: z.number(),
    salaryCode: z.string(),
});

export const serviceSalarySchema = z.object({
    mk: z.number(),
});

export const serviceRankSchema = z.object({
    rank: z.string(),
    fek: z.string(),
});

export const serviceOrganizationSchema = z.object({
    directorate: z.number(),
    sector: z.number(),
    department: z.number(),
    office: z.number(),
});

export const serviceWorkOrganizationSchema = z.object({
    workDirectorate: z.number(),
    workSector: z.number(),
    workDepartment: z.number(),
    workOffice: z.number(),
});

export type ServiceDatesSchema = z.infer<typeof serviceDatesSchema>;
export type ServicePositionSchema = z.infer<typeof servicePositionSchema>;
export type ServiceSalarySchema = z.infer<typeof serviceSalarySchema>;
export type ServiceRankSchema = z.infer<typeof serviceRankSchema>;
export type ServiceOrganizationSchema = z.infer<typeof serviceOrganizationSchema>;
export type ServiceWorkOrganizationSchema = z.infer<typeof serviceWorkOrganizationSchema>;

export const employeeCardSchema = z.object({
    id: z.number(),
    am: z.number(),
    lastName: z.string().min(1, "Το επώνυμο είναι υποχρεωτικό"),
    firstName: z.string().min(1, "Το όνομα είναι υποχρεωτικό"),
    employmentState: z.string().min(1, "Η εργασιακή κατάσταση είναι υποχρεωτική"),
})
    .merge(personalSectionSchema)
    .merge(infoSectionSchema)
    .merge(identitySectionSchema)
    .merge(numbersSectionSchema)
    .merge(communicationSectionSchema)
    .merge(bankSectionSchema);

export type EmployeeCardSchema = z.infer<typeof employeeCardSchema>;
export type PersonalSectionSchema = z.infer<typeof personalSectionSchema>;
export type InfoSectionSchema = z.infer<typeof infoSectionSchema>;
export type IdentitySectionSchema = z.infer<typeof identitySectionSchema>;
export type NumbersSectionSchema = z.infer<typeof numbersSectionSchema>;
export type CommunicationSectionSchema = z.infer<typeof communicationSectionSchema>;
export type BankSectionSchema = z.infer<typeof bankSectionSchema>;