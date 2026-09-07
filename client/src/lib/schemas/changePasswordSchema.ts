import { z } from "zod";

const passwordRules = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, "Ο τρέχων κωδικός είναι υποχρεωτικός"),
    newPassword: z.string().regex(passwordRules, "Ο νέος κωδικός πρέπει να έχει τουλάχιστον 8 χαρακτήρες και να περιέχει ένα κεφαλαίο, ένα πεζό, έναν αριθμό και ένα σύμβολο"),
    confirmPassword: z.string().min(1, "Η επιβεβαίωση κωδικού είναι υποχρεωτική"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Οι κωδικοί δεν ταιριάζουν",
    path: ["confirmPassword"],
});

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
