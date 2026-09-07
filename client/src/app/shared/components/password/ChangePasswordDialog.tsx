import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import FormField from '@/app/shared/FormField';
import { useAccount } from '@/lib/hooks/useAccount';
import { changePasswordSchema } from '@/lib/schemas/changePasswordSchema';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toastHelpers';

interface ChangePasswordDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

type FormData = z.infer<typeof changePasswordSchema>;

const defaultFormValues: FormData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
};

function PasswordInput({ value, onChange, hasError, ...props }: {
    value: string;
    onChange: (v: string) => void;
    hasError?: boolean;
} & Omit<React.ComponentProps<typeof Input>, 'value' | 'onChange' | 'type'>) {
    const [visible, setVisible] = React.useState(false);
    return (
        <div className="relative">
            <Input
                type={visible ? 'text' : 'password'}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`w-full bg-white pr-9 ${hasError ? 'border-red-400' : 'border-gray-200'}`}
                {...props}
            />
            <button
                type="button"
                onClick={() => setVisible((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
            >
                {visible ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
            </button>
        </div>
    );
}

export default function ChangePasswordDialog({ open, onOpenChange }: ChangePasswordDialogProps) {
    const { changePassword, isChangingPassword } = useAccount();

    const { control, reset, getValues, trigger, formState: { errors, isValid } } = useForm<FormData>({
        resolver: zodResolver(changePasswordSchema),
        mode: 'onChange',
        defaultValues: defaultFormValues,
    });

    const handleOpenChange = (isOpen: boolean) => {
        if (!isOpen) reset(defaultFormValues);
        onOpenChange(isOpen);
    };

    const handleSave = async () => {
        const isFormValid = await trigger();
        if (!isFormValid) return;
        const formData = getValues();

        try {
            await changePassword({ currentPassword: formData.currentPassword, newPassword: formData.newPassword });
            showSuccessToast('Ο κωδικός άλλαξε με επιτυχία');
            reset(defaultFormValues);
            handleOpenChange(false);
        } catch (error) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const msg = (error as any)?.response?.data || (error as any)?.message || 'Άγνωστο σφάλμα';
            showErrorToast('Σφάλμα κατά την αλλαγή κωδικού: ' + msg);
            console.error(error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="bg-white border outline-0 ring-0">
                <DialogHeader>
                    <DialogTitle className="text-lg font-bold p-1">Αλλαγή Κωδικού</DialogTitle>
                    <p className="text-xs text-muted-foreground px-1">
                        Ο κωδικός πρέπει να έχει τουλάχιστον 8 χαρακτήρες και να περιέχει ένα κεφαλαίο, ένα πεζό, έναν αριθμό και ένα σύμβολο.
                    </p>
                </DialogHeader>
                <Separator className="bg-gray-300 -mt-2" />

                <div className="flex flex-col gap-4">
                    <FormField label="Τρέχων Κωδικός *" error={errors.currentPassword?.message}>
                        <Controller name="currentPassword" control={control}
                            render={({ field }) => (
                                <PasswordInput value={field.value} onChange={field.onChange} hasError={!!errors.currentPassword} />
                            )}
                        />
                    </FormField>

                    <FormField label="Νέος Κωδικός *" error={errors.newPassword?.message}>
                        <Controller name="newPassword" control={control}
                            render={({ field }) => (
                                <PasswordInput value={field.value} onChange={field.onChange} hasError={!!errors.newPassword} />
                            )}
                        />
                    </FormField>

                    <FormField label="Επιβεβαίωση Νέου Κωδικού *" error={errors.confirmPassword?.message}>
                        <Controller name="confirmPassword" control={control}
                            render={({ field }) => (
                                <PasswordInput value={field.value} onChange={field.onChange} hasError={!!errors.confirmPassword} />
                            )}
                        />
                    </FormField>
                </div>

                <DialogFooter className="flex gap-3">
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
                        onClick={() => handleOpenChange(false)}
                    >
                        Ακύρωση
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
                        disabled={!isValid || isChangingPassword}
                        onClick={handleSave}
                    >
                        {isChangingPassword ? 'Αποθήκευση...' : 'Αποθήκευση'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
