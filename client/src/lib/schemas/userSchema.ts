import { z } from "zod";

export const userSchema = z.object({
    id: z.string().optional(),
    userName: z.string().min(5, "Το username πρέπει να έχει τουλάχιστον 5 χαρακτήρες"),
    fullName: z.string().min(2, "Το όνομα πρέπει να έχει τουλάχιστον 2 χαρακτήρες"),
    email: z.string().email("Εισάγετε ένα έγκυρο email"),
    am: z.number().min(0, "Το ΑΜ πρέπει να είναι θετικό"),
});

export type UserFormData = z.infer<typeof userSchema>;
