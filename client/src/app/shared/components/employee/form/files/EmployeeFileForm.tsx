import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Controller, useForm } from "react-hook-form";
import FormField from "@/app/shared/FormField";
import type z from "zod";
import { useEmployee } from "@/lib/hooks/useEmployee";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toastHelpers";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useParams } from "react-router";
import { useValues } from "@/lib/hooks/useValues";
import { employeeFileSchema } from "@/lib/schemas/employeeFileSchema";
import FileUpload from "../../../../FileInput";
import axios from "axios";

interface EmployeeFileFormProps {
    file: Files | null;
    onClose: () => void;
}

export default function EmployeeFileForm({ file, onClose }: EmployeeFileFormProps) {

    const { id } = useParams<{ id: string }>();
    const {createEmployeeFile, updateEmployeeFile} = useEmployee({id});
    const {fileTypes} = useValues();
    type FormData = z.infer<typeof employeeFileSchema>;
    const isEditing = !!file?.id;
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileError, setFileError] = useState<string | undefined>(undefined);
    const [isSaving, setIsSaving] = useState(false);

    const defaultFormValues = {
        id: 0,
        am: Number(id),
        type: -1,
        name: "",
        location: ""
    } satisfies FormData;

    const { control, reset, getValues, formState: { errors, isValid }, trigger } = useForm<FormData>({
        resolver: zodResolver(employeeFileSchema),
        mode: "onChange",
        defaultValues: defaultFormValues,
    });

    useEffect(() => {
        if (!file) { reset(defaultFormValues); return; }

        reset({
            id: file.id,
            am: file.am,
            type: file.type,
            name: file.name,
            location: file.location,
        });
    }, [file]);

    const handleSave = async () => {
        if (isSaving) return;

        const isFormValid = await trigger();
        if (!isFormValid) return;

        if (!isEditing && !selectedFile) {
            setFileError("Το αρχείο είναι υποχρεωτικό");
            return;
        }

        const formData = getValues();

        setIsSaving(true);
        try {
            if (isEditing && formData.id) {
                const form = new FormData();

                form.append("Id", String(file.id));
                form.append("Type", String(formData.type));

                if (selectedFile) {
                    form.append("File", selectedFile);
                }

                updateEmployeeFile(form, {
                    onSuccess: () => {
                        showSuccessToast("Η μεταβολή ενημερώθηκε με επιτυχία");
                        reset(defaultFormValues);
                            setIsSaving(false);
                            onClose();
                        },
                        onError: (error) => {
                            if (axios.isAxiosError<string>(error)) {
                                showErrorToast(
                                    error.response?.data || "Σφάλμα κατά την αποθήκευση."
                                );
                            }
                            setIsSaving(false);
                        }
                    }
                );
            } else {
                const form = new FormData();

                form.append("File", selectedFile!);
                form.append("Am", String(formData.am));
                form.append("Type", String(formData.type));

                createEmployeeFile(form, {
                    onSuccess: () => {
                        showSuccessToast("Το αρχείο καταχωρήθηκε με επιτυχία");
                        reset(defaultFormValues);
                        setIsSaving(false);
                        onClose();
                    },
                    onError: (error) => {
                        if (axios.isAxiosError<string>(error)) {
                            showErrorToast(
                                error.response?.data || "Σφάλμα κατά την αποθήκευση."
                            );
                        }
                        setIsSaving(false);
                    }
                });
            }
        } catch (error) {
            console.error("Error saving penalty:", error);
            setIsSaving(false);
        }
    };

    return (
            <div className="h-full flex flex-col">
                <div className="flex-1 space-y-4 overflow-y-auto p-6 -mt-4">
                    <FormField label="Τύπος *" error={errors.type?.message}>
                        <Controller name="type" control={control}
                            render={({ field }) => (
                                <Select value={field.value ? String(field.value) : ''} onValueChange={(val) => field.onChange(val ? Number(val) : null)}>
                                    <SelectTrigger className={`w-full bg-white ${errors.type ? "border-red-400" : "border-gray-200"}`}>
                                        <SelectValue placeholder="Επιλέξτε επίπεδο" />
                                    </SelectTrigger>
                                    <SelectContent position="popper" className="bg-white border border-neutral-200 outline-0 ring-0"> 
                                        {fileTypes?.map(p => (
                                            <SelectItem className="hover:bg-neutral-100" key={p.type} value={String(p.type)}>
                                                {p.description}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </FormField>
                    <FileUpload
                        label="Αρχείο"
                        required={!isEditing}
                        fileName={file?.name}
                        onChange={(file) => {
                            setSelectedFile(file);
                            if (file) setFileError(undefined);

                            if (file) {
                                reset({
                                    ...getValues(),
                                    name: file.name,
                                });
                            }
                        }}
                        accept=".pdf,application/pdf"
                    />
                    {fileError && <p className="text-sm text-red-500">{fileError}</p>}
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
                        onClick={() => { setIsSaving(false); onClose(); }}
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
                        disabled={!isValid || isSaving}
                        onClick={handleSave}
                    >
                        {isEditing ? 'Ενημέρωση' : 'Αποθήκευση'}
                    </Button>
                </div>
            </div>
        );
}
