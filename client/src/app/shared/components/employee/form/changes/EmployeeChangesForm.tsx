import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Controller, useForm, useWatch } from "react-hook-form";
import FormField from "@/app/shared/FormField";
import type z from "zod";
import { useEmployee } from "@/lib/hooks/useEmployee";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toastHelpers";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useParams } from "react-router";
import { employeeChangesSchema } from "@/lib/schemas/EmployeeChangesSchema";
import { useValues } from "@/lib/hooks/useValues";
import { useAccount } from "@/lib/hooks/useAccount";

interface EmployeeChangesFormProps {
    change: Change | null;
    onClose: () => void;
}

export default function EmployeeChangesForm({ change, onClose }: EmployeeChangesFormProps) {
    const { id } = useParams<{ id: string }>();
    const {createEmployeeChange, updateEmployeeChange} = useEmployee({id});
    const {user} = useAccount();
    const {changeTypeMap, changeTypes} = useValues();
    type FormData = z.infer<typeof employeeChangesSchema>;
    const isEditing = !!change?.id;
    const [isSaving, setIsSaving] = useState(false);

    const defaultFormValues = {
        id: 0,
        am: Number(id),
        type: -1,
        previousState: -1,
        nextState: -1,
        changeDate: "",
        nextDate: "",
        user: user?.userName || "",
        notes: "",
        anadromikaApo: "",
        anadromikaEws: "",
        days: "",
        flag: 0,
        protocol: "",
        protocolDate: ""
    } satisfies FormData;

    const { control, reset, getValues, formState: { errors }, trigger } = useForm<FormData>({
        resolver: zodResolver(employeeChangesSchema),
        mode: "onChange",
        defaultValues: defaultFormValues,
    });

    const selectedType = useWatch({
        control,
        name: "type"
    });

    const previousStateTypes = changeTypeMap?.filter(
        item => item.type === selectedType
    );

    const nextStateTypes = changeTypeMap?.filter(
        item => item.type === selectedType
    );

    const formDate = (date: string | Date | null | undefined): string => {
        if (!date) return "";
        const formattedDate =
            typeof date === "string"
                ? date.split("T")[0]
                : date.toISOString().split("T")[0];
        return formattedDate === "1900-01-01" ? "" : formattedDate;
    };

    useEffect(() => {
        if (!change) { reset(defaultFormValues); return; }

        reset({
            id: change.id,
            am: change.am,
            type: change.type,
            previousState: change.previousState,
            nextState: change.nextState,
            changeDate: formDate(change.changeDate) == "1900-01-01" ? "" : formDate(change.changeDate),
            nextDate: formDate(change.nextDate) == "1900-01-01" ? "" : formDate(change.nextDate),
            user: user?.userName || "",
            notes: change.notes,
            anadromikaApo: formDate(change.anadromikaApo) == "1900-01-01" ? "" : formDate(change.anadromikaApo),
            anadromikaEws: formDate(change.anadromikaEws) == "1900-01-01" ? "" : formDate(change.anadromikaEws),
            days: change.days,
            flag: change.flag,
            protocol: change.protocol,
            protocolDate: formDate(change.protocolDate) == "1900-01-01" ? "" : formDate(change.protocolDate)
        });
    }, [change]);

    const handleSave = async () => {
        if (isSaving) return;

        const isFormValid = await trigger();
        if (!isFormValid) return;

        const formData = getValues();

        setIsSaving(true);
        try {
            if (isEditing && formData.id) {
                updateEmployeeChange(
                    {
                        id: formData.id,
                        am: formData.am,
                        type: formData.type || 0,
                        previousState: formData.previousState == undefined ? -1 : formData.previousState,
                        nextState: formData.nextState == undefined ? -1 : formData.nextState,
                        changeDate: formData.changeDate,
                        nextDate: formData.nextDate || "1900-01-01",
                        user: user?.userName || "",
                        notes: formData.notes || "",
                        anadromikaApo: formData.anadromikaApo || "1900-01-01",
                        anadromikaEws: formData.anadromikaEws || "1900-01-01",
                        days: formData.days || "",
                        flag: formData.flag || 0,
                        flagHRM: change?.flagHRM ?? 0,
                        protocol: formData.protocol || "",
                        protocolDate: formData.protocolDate  || "1900-01-01"
                        },
                    {
                        onSuccess: () => {
                            showSuccessToast("Η μεταβολή ενημερώθηκε με επιτυχία");
                            reset(defaultFormValues);
                            setIsSaving(false);
                            onClose();
                        },
                        onError: (error) => {
                            showErrorToast("Σφάλμα κατά την ενημέρωση της μεταβολής");
                            console.error(error);
                            setIsSaving(false);
                        }
                    }
                );
            } else {
                createEmployeeChange({
                    id: 0,
                    am: Number(id),
                    type: formData.type || 0,
                    previousState: formData.previousState == undefined ? -1 : formData.previousState,
                    nextState: formData.nextState == undefined ? -1 : formData.nextState,
                    changeDate: formData.changeDate,
                    nextDate: formData.nextDate || "1900-01-01",
                    user: user?.userName || "",
                    notes: formData.notes || "",
                    anadromikaApo: formData.anadromikaApo || "1900-01-01",
                    anadromikaEws: formData.anadromikaEws || "1900-01-01",
                    days: formData.days || "",
                    flag: formData.flag || 0,
                    flagHRM: 0,
                    protocol: formData.protocol || "",
                    protocolDate: formData.protocolDate  || "1900-01-01"
                },{
                    onSuccess: () => {
                        showSuccessToast("Η μεταβολή καταχωρήθηκε με επιτυχία");
                        reset(defaultFormValues);
                        setIsSaving(false);
                        onClose();
                    },
                    onError: (error) => {
                        showErrorToast("Σφάλμα κατά τη δημιουργία της μεταβολής");
                        console.error(error);
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
                                        {changeTypes?.map(p => (
                                            <SelectItem className="hover:bg-neutral-100" key={p.id} value={String(p.id)}>
                                                {p.description}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </FormField>
                    <div className="grid grid-cols-2 gap-4">
                        <FormField label="Τωρινή τιμή *" error={errors.previousState?.message}>
                            <Controller name="previousState" control={control}
                                render={({ field }) => (
                                    <Select value={field.value !== null && field.value !== undefined ? String(field.value) : ''}  onValueChange={(val) => field.onChange(val ? Number(val) : null)}>
                                        <SelectTrigger className={`w-full bg-white ${errors.type ? "border-red-400" : "border-gray-200"}`}>
                                            <SelectValue placeholder="Επιλέξτε επίπεδο" />
                                        </SelectTrigger>
                                        <SelectContent position="popper" className="bg-white border border-neutral-200 outline-0 ring-0">
                                            {previousStateTypes?.map(p => (
                                                <SelectItem className="hover:bg-neutral-100" key={p.value} value={String(p.value)}>
                                                    {p.description}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </FormField>
                        <FormField label="Επόμενη τιμή *" error={errors.nextState?.message}>
                            <Controller name="nextState" control={control}
                                render={({ field }) => (
                                    <Select value={field.value !== null && field.value !== undefined ? String(field.value) : ''} onValueChange={(val) => field.onChange(val ? Number(val) : null)}>
                                        <SelectTrigger className={`w-full bg-white ${errors.type ? "border-red-400" : "border-gray-200"}`}>
                                            <SelectValue placeholder="Επιλέξτε επίπεδο" />
                                        </SelectTrigger>
                                        <SelectContent position="popper" className="bg-white border border-neutral-200 outline-0 ring-0">
                                            {nextStateTypes?.map(p => (
                                                <SelectItem className="hover:bg-neutral-100" key={p.value} value={String(p.value)}>
                                                    {p.description}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </FormField>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <FormField label="Ημ/νια αλλαγής" error={errors.changeDate?.message}>
                            <Controller name="changeDate" control={control}
                                render={({ field }) => (
                                    <Input 
                                        type="date"
                                        value={field.value}
                                        onChange={field.onChange}
                                        className={`w-full bg-white ${errors.changeDate ? "border-red-400" : "border-gray-200"}`}
                                    />
                                )}
                            />
                        </FormField>
                        <FormField label="Επόμενη ημ/νια αλλαγής" error={errors.nextDate?.message}>
                            <Controller name="nextDate" control={control}
                                render={({ field }) => (
                                    <Input 
                                        type="date"
                                        value={field.value}
                                        onChange={field.onChange}
                                        className={`w-full bg-white ${errors.nextDate ? "border-red-400" : "border-gray-200"}`}
                                    />
                                )}
                            />
                        </FormField>       
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <FormField label="Αναδρομικά από" error={errors.anadromikaApo?.message}>
                            <Controller name="anadromikaApo" control={control}
                                render={({ field }) => (
                                    <Input 
                                        type="date"
                                        value={field.value}
                                        onChange={field.onChange}
                                        className={`w-full bg-white ${errors.anadromikaApo ? "border-red-400" : "border-gray-200"}`}
                                    />
                                )}
                            />
                        </FormField>
                        <FormField label="Αναδρομικά εώς" error={errors.anadromikaEws?.message}>
                            <Controller name="anadromikaEws" control={control}
                                render={({ field }) => (
                                    <Input 
                                        type="date"
                                        value={field.value}
                                        onChange={field.onChange}
                                        className={`w-full bg-white ${errors.anadromikaEws ? "border-red-400" : "border-gray-200"}`}
                                    />
                                )}
                            />
                        </FormField>       
                    </div>
                    <FormField label="Αριθμός Απόφασης" error={errors.protocol?.message}>
                        <Controller name="protocol" control={control}
                            render={({ field }) => (
                                <Input 
                                    value={field.value}
                                    onChange={field.onChange}
                                    className={`w-full bg-white ${errors.protocol ? "border-red-400" : "border-gray-200"}`}
                                />
                            )}
                        />
                    </FormField>
                    <FormField label="Ημ/νια αριθμού απόφασης" error={errors.protocolDate?.message}>
                        <Controller name="protocolDate" control={control}
                            render={({ field }) => (
                                <Input 
                                    type="date"
                                    value={field.value}
                                    onChange={field.onChange}
                                    className={`w-full bg-white ${errors.protocolDate ? "border-red-400" : "border-gray-200"}`}
                                />
                            )}
                        />
                    </FormField>
                    <FormField label="Σχόλια" error={errors.notes?.message}>
                        <Controller control={control} name="notes" render={({ field }) => (
                            <textarea {...field} className={`w-full bg-white border rounded-md p-2 resize-none ${errors.notes ? "border-red-400" : "border-gray-200"}`} placeholder="Σχόλια" rows={4} />
                        )} />
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
                        disabled={isSaving}
                        onClick={handleSave}
                    >
                        {isEditing ? 'Ενημέρωση' : 'Αποθήκευση'}
                    </Button>
                </div>
            </div>
        );
}
