import { z } from "zod";

export const employeeExperienceSchema = z.object({
    id: z.number().optional(),
    type: z.string().min(1, "Ο τύπος προϋπηρεσίας είναι υποχρεωτικός"),
    organization: z.string().min(1, "O φορές είναι υποχρεωτικός"),
    startDate: z.string().min(1, "Η ημερομηνία έναρξης είναι υποχρεωτική")
        .refine((date) => {
            // Ελέγχουμε αν η μορφή είναι YYYY-MM-DD
            return /^\d{4}-\d{2}-\d{2}$/.test(date);
        }, "Η ημερομηνία πρέπει να είναι σε μορφή YYYY-MM-DD"),
    endDate: z.string().optional().or(z.literal("")),
    comments: z.string().optional(),
    decisionNumber: z.string().optional(),
    checkbox1: z.number().optional(),
    checkbox2: z.number().optional(),
    checkbox3: z.number().optional(),
    checkbox4: z.number().optional(),
}).refine((data) => {
    // Ελέγχουμε ότι η ημερομηνία λήξης είναι μετά την ημερομηνία έναρξης (αν έχει δοθεί)
    if (!data.endDate || data.endDate === "1900-01-01") return true;
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
        return endDate >= startDate;
}, {
    message: "Η ημερομηνία λήξης πρέπει να είναι ίση ή μετά την ημερομηνία έναρξης",
    path: ["endDate"],
});
