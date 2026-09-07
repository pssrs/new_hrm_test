import FormField from "@/app/shared/FormField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useAccount } from "@/lib/hooks/useAccount";
import { userSchema } from "@/lib/schemas/userSchema";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toastHelpers";
import { zodResolver } from "@hookform/resolvers/zod";
import agent from "@/lib/api/agent";
import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import type z from "zod";

interface UserFormProps {
    user: UserList | null;
    onClose: () => void;
}

export default function UserForm({ user, onClose }: UserFormProps) {
    const { createUser, updateUser } = useAccount();
    type FormData = z.infer<typeof userSchema>;
    const isEditing = !!user?.id;

    const defaultFormValues = useMemo(() => ({
        id: "",
        userName: "",
        fullName: "",
        email: "",
        am: 0
    }), []) as FormData;

    const { control, reset, getValues, setValue, setError, clearErrors, formState: { errors, isValid }, trigger, watch } = useForm<FormData>({
        resolver: zodResolver(userSchema),
        mode: "onChange",
        defaultValues: defaultFormValues,
    });

    const amValue = watch("am");
    const userNameValue = watch("userName");

    useEffect(() => {
        if (!user) {
            reset(defaultFormValues);
            return;
        }

        reset({
            id: user.id?.toString() || "",
            userName: user.userName,
            fullName: user.fullName || "",
            email: user.email || "",
            am: user.am || 0
        });
    }, [user, reset, defaultFormValues]);

    useEffect(() => {
        if (!amValue || amValue === 0) {
            clearErrors("am");
            return;
        }

        const fetchEmployeeData = async () => {
            try {
                const response = await agent.get(`/employee/byam/${amValue}`);
                if (response.data) {
                    setValue("fullName", response.data.fullName || "");
                    setValue("email", response.data.email || "");
                    clearErrors("am");
                }
            } catch {
                setValue("fullName", "");
                setValue("email", "");
                setError("am", {
                    type: "manual",
                    message: `Δεν βρέθηκε υπάλληλος με ΑΜ: ${amValue}`
                });
            }
        };

        fetchEmployeeData();
    }, [amValue, setValue, setError, clearErrors]);

    useEffect(() => {
        if (!userNameValue || userNameValue.trim() === "" || isEditing) {
            clearErrors("userName");
            return;
        }

        const checkUsername = async () => {
            try {
                const response = await agent.get(`/account/users/check-username/${userNameValue}`);
                if (response.data.available) {
                    clearErrors("userName");
                } else {
                    setError("userName", {
                        type: "manual",
                        message: "Το username χρησιμοποιείται ήδη"
                    });
                }
            } catch {
                clearErrors("userName");
            }
        };

        const debounceTimer = setTimeout(checkUsername, 500);
        return () => clearTimeout(debounceTimer);
    }, [userNameValue, isEditing, setError, clearErrors]);

    useEffect(() => {
        if (!amValue || amValue === 0 || isEditing) {
            clearErrors("am");
            return;
        }

        const checkAm = async () => {
            try {
                const response = await agent.get(`/account/users/check-am/${amValue}`);
                if (!response.data.available) {
                    setError("am", {
                        type: "manual",
                        message: "Υπάρχει ήδη χρήστης με αυτό το ΑΜ"
                    });
                }
            } catch {
                clearErrors("am");
            }
        };

        checkAm();
    }, [amValue, isEditing, setError, clearErrors]);

    const handleSave = async () => {
        const isFormValid = await trigger();
        if (!isFormValid) return;
        const formData = getValues();

        try {
            if (isEditing && formData.id) {
                await updateUser({
                    id: formData.id,
                    userData: {
                        userName: formData.userName,
                        fullName: formData.fullName,
                        email: formData.email,
                        am: formData.am
                    }
                });
                showSuccessToast("Ο χρήστης ενημερώθηκε με επιτυχία");
            } else {
                await createUser({
                    userName: formData.userName,
                    fullName: formData.fullName,
                    email: formData.email,
                    am: formData.am
                });
                showSuccessToast("Ο χρήστης δημιουργήθηκε με επιτυχία");
            }
            reset(defaultFormValues);
            onClose();
        } catch (error) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const msg = (error as any)?.response?.data || (error as any)?.message || "Άγνωστο σφάλμα";
            showErrorToast(`Σφάλμα κατά ${isEditing ? "την ενημέρωση" : "τη δημιουργία"} του χρήστη: ` + msg);
            console.error(error);
        }
    };


    return (
        <div className="h-full flex flex-col">
            <div className="flex-1 space-y-4 overflow-y-auto p-6 -mt-4">
                <FormField label="Username *" error={errors.userName?.message}>
                    <Controller name="userName" control={control}
                        render={({ field }) => (
                            <Input
                                type="text"
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="Όνομα χρήστη"
                                className={`w-full bg-white ${errors.userName ? "border-red-400" : "border-gray-200"}`}
                            />
                        )}
                    />
                </FormField>

                <FormField label="ΑΜ *" error={errors.am?.message}>
                    <Controller name="am" control={control}
                        render={({ field }) => (
                            <Input
                                type="number"
                                value={field.value || ""}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    const num = val ? parseInt(val, 10) : 0;
                                    field.onChange(!isNaN(num) ? num : 0);
                                }}
                                placeholder="Αριθμός Μητρώου"
                                className={`w-full bg-white ${errors.am ? "border-red-400" : "border-gray-200"}`}
                            />
                        )}
                    />
                </FormField>

                <FormField label="Πλήρες Όνομα" error={errors.fullName?.message}>
                    <Controller name="fullName" control={control}
                        render={({ field }) => (
                            <Input
                                type="text"
                                value={field.value}
                                disabled
                                placeholder="Συμπληρώνεται αυτόματα"
                                className="w-full bg-gray-100 border-gray-200 text-gray-600 cursor-not-allowed"
                            />
                        )}
                    />
                </FormField>

                <FormField label="Email" error={errors.email?.message}>
                    <Controller name="email" control={control}
                        render={({ field }) => (
                            <Input
                                type="email"
                                value={field.value}
                                disabled
                                placeholder="Συμπληρώνεται αυτόματα"
                                className="w-full bg-gray-100 border-gray-200 text-gray-600 cursor-not-allowed"
                            />
                        )}
                    />
                </FormField>

            </div>

            <Separator className="bg-gray-300 mb-4" />
            <div className="flex gap-3 px-6 pb-4">
                <Button type="button" className="flex-1 transition-all duration-200 hover:opacity-80 w-auto"
                    style={{
                        display: "flex",
                        height: "var(--Height-H-10, 40px)",
                        padding: "var(--Padding-Y-py-2, 8px) var(--Padding-X-px-4, 16px)",
                        justifyContent: "center",
                        alignItems: "center",
                        alignSelf: "stretch",
                        borderRadius: "var(--Radius-Rounded-Medium, 6px)",
                        border: "1px solid var(--color-border)",
                        background: "var(--color-ghost)",
                        color: "var(--color-foreground)"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f3f4f6"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "var(--color-ghost)"}
                    onClick={onClose}
                >
                    Κλείσιμο
                </Button>
                <Button className="flex-1 transition-all duration-200 hover:opacity-80 w-auto"
                    style={{
                        display: "flex",
                        height: "var(--Height-H-10, 40px)",
                        padding: "var(--Padding-Y-py-2, 8px) var(--Padding-X-px-4, 16px)",
                        justifyContent: "center",
                        alignItems: "center",
                        alignSelf: "stretch",
                        borderRadius: "var(--Radius-Rounded-Medium, 6px)",
                        background: "var(--color-primary)",
                        color: "var(--color-primary-foreground)"
                    }}
                    disabled={!isValid}
                    onClick={handleSave}
                >
                    {isEditing ? 'Ενημέρωση' : 'Αποθήκευση'}
                </Button>
            </div>
        </div>
    );
}
