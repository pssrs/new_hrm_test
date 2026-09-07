import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Controller, useForm } from "react-hook-form";
import FormField from "@/app/shared/FormField";
import type z from "zod";
import { useEmployee } from "@/lib/hooks/useEmployee";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toastHelpers";
import { employeeStudySchema } from "@/lib/schemas/employeeStudySchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STUDY_EDUCATION } from "@/lib/types/constTypes";
import { Checkbox } from "@/components/ui/checkbox";
import { useParams } from "react-router";
import { useValues } from "@/lib/hooks/useValues";

interface EmployeeStudiesFormProps {
    study: Studies | null;
    onClose: () => void;
}

export default function EmployeeStudiesForm({ study, onClose }: EmployeeStudiesFormProps) {
    const { id } = useParams<{ id: string }>();
    const {createEmployeeStudies, updateEmployeeStudies} = useEmployee({id});
    type FormData = z.infer<typeof employeeStudySchema>;
    const isEditing = !!study?.id;
    const {studyTypes} = useValues();
    
    const defaultFormValues = {
        id: 0,
        am: Number(id) || 0,
        type: -1,
        description: "",
        education: 0,
        local: 0,
        category: 0,   
        years: "",
        date: "",
        degree: "",
        employee: 0,
        relevance: 0,
        comment: "",
        dateRequired: "",
        location: ""
    } satisfies FormData;

    const { control, reset, getValues, formState: { errors }, trigger } = useForm<FormData>({
        resolver: zodResolver(employeeStudySchema),
        mode: "onChange",
        defaultValues: defaultFormValues,
    });

    const formDate = (date: string | Date | null | undefined): string => {
        if (!date) return "";
        const formattedDate =
            typeof date === "string"
                ? date.split("T")[0]
                : date.toISOString().split("T")[0];
        return formattedDate === "1900-01-01" ? "" : formattedDate;
    };

    useEffect(() => {
        if (!study) { reset(defaultFormValues); return; }

        reset({
            id: study.id,
            am: study.am,
            type: study.type,
            description: study.description,
            education: study.education,
            local: study.local,
            category: study.category,
            years: study.years,
            date: formDate(study.date),
            degree: study.degree,
            employee: study.employee,
            relevance: study.relevance,
            comment: study.comment,
            dateRequired: formDate(study.dateRequired),
            location: study.location
        });
    }, [study]);

    const handleSave = async () => {
        const isFormValid = await trigger();
        if (!isFormValid) return;

        const formData = getValues();
        
        try {
            if (isEditing && formData.id) {
                updateEmployeeStudies(
                    {
                        id: formData.id,
                        am: formData.am,
                        type: formData.type || -1,
                        description: formData.description || "",
                        education: formData.education || 0,
                        local: formData.local || 0,
                        category: formData.category || 0,
                        years: formData.years || "",
                        date: formData.date || "1900-01-01",
                        degree: formData.degree || "",
                        employee: formData.employee || 0,
                        relevance: formData.relevance || 0,
                        comment: formData.comment || "",
                        dateRequired: formData.dateRequired || "1900-01-01",
                        location: formData.location || ""
                    },
                    {
                        onSuccess: () => {
                            showSuccessToast("Το πτυχίο ενημερώθηκε με επιτυχία");
                            reset(defaultFormValues);
                            onClose();
                        },
                        onError: (error) => {
                            showErrorToast("Σφάλμα κατά την ενημέρωση του πτυχίου");
                            console.error(error);
                        }
                    }
                );
            } else {
                createEmployeeStudies({
                    id: 0,
                    am: Number(formData.am),
                    type: formData.type || -1,
                    description: formData.description || "",
                    education: formData.education || 0,
                    local: formData.local || 0,
                    category: formData.category || 0,
                    years: formData.years || "",
                    date: formData.date || "1900-01-01",
                    degree: formData.degree || "",
                    employee: formData.employee || 0,
                    relevance: formData.relevance || 0,
                    comment: formData.comment || "",
                    dateRequired: formData.dateRequired || "1900-01-01",
                    location: formData.location || ""
                },{
                    onSuccess: () => {
                        showSuccessToast("Το πτυχίο καταχωρήθηκε με επιτυχία");
                        reset(defaultFormValues);
                        onClose();
                    },
                    onError: (error) => {
                        showErrorToast("Σφάλμα κατά τη δημιουργία του πτυχίου");
                        console.error(error);
                    }
                });
            }
        } catch (error) {
            console.error("Error saving penalty:", error);
        }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex-1 space-y-4 overflow-y-auto p-6 -mt-4">
                <FormField label="Τύπος" error={errors.type?.message}>
                    <Controller name="type" control={control}
                        render={({ field }) => (
                            <Select value={field.value ? String(field.value) : ''} onValueChange={(val) => field.onChange(val ? Number(val) : null)}>
                                <SelectTrigger className={`w-full bg-white ${errors.type ? "border-red-400" : "border-gray-200"}`}>
                                    <SelectValue placeholder="Επιλέξτε τύπο" />
                                </SelectTrigger>
                                <SelectContent position="popper" className="bg-white border border-neutral-200 outline-0 ring-0">
                                    {studyTypes?.map(p => (
                                        <SelectItem className="hover:bg-neutral-100" key={p.id} value={String(p.id)}>
                                            {p.description}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    </FormField>
                <FormField label="Τίτλος" error={errors.description?.message}>
                    <Controller name="description" control={control}
                        render={({ field }) => (
                            <Input 
                                value={field.value}
                                onChange={field.onChange}
                                className={`w-full bg-white ${errors.description ? "border-red-400" : "border-gray-200"}`}
                            />
                        )}
                    />
                </FormField>
                <FormField label="Εκπαιδευτικό ίδρυμα *" error={errors.education?.message}>
                    <Controller name="education" control={control}
                        render={({ field }) => (
                            <Select value={field.value ? String(field.value) : ''} onValueChange={(val) => field.onChange(val ? Number(val) : null)}>
                                <SelectTrigger className={`w-full bg-white ${errors.type ? "border-red-400" : "border-gray-200"}`}>
                                    <SelectValue placeholder="Επιλέξτε επίπεδο" />
                                </SelectTrigger>
                                <SelectContent position="popper" className="bg-white border border-neutral-200 outline-0 ring-0">
                                    {STUDY_EDUCATION?.map(p => (
                                        <SelectItem className="hover:bg-neutral-100" key={p.value} value={String(p.value)}>
                                            {p.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                </FormField>
                <FormField label="Τόπος" error={errors.location?.message}>
                    <Controller name="location" control={control}
                        render={({ field }) => (
                            <Input 
                                value={field.value}
                                onChange={field.onChange}
                                className={`w-full bg-white ${errors.location ? "border-red-400" : "border-gray-200"}`}
                            />
                        )}
                    />
                </FormField>
                <div className="grid grid-cols-3 gap-4">
                    <FormField label="Αποφοίτηση" error={errors.date?.message}>
                        <Controller name="date" control={control}
                            render={({ field }) => (
                                <Input 
                                    type="date"
                                    value={field.value}
                                    onChange={field.onChange}
                                    className={`w-full bg-white ${errors.date ? "border-red-400" : "border-gray-200"}`}
                                />
                            )}
                        />
                    </FormField>
                    <FormField label="Έτη σπουδών" error={errors.years?.message}>
                        <Controller name="years" control={control}
                            render={({ field }) => (
                                <Input 
                                    value={field.value}
                                    onChange={field.onChange}
                                    className={`w-full bg-white ${errors.years ? "border-red-400" : "border-gray-200"}`}
                                />
                            )}
                        />
                    </FormField>
                    <FormField label="Βαθμός πτυχίου" error={errors.degree?.message}>
                        <Controller name="degree" control={control}
                            render={({ field }) => (
                                <Input 
                                    value={field.value}
                                    onChange={field.onChange}
                                    className={`w-full bg-white ${errors.years ? "border-red-400" : "border-gray-200"}`}
                                />
                            )}
                        />
                    </FormField>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <Controller
                        name="employee"
                        control={control}
                        render={({ field }) => (
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    checked={field.value === 1}
                                    onCheckedChange={(checked) =>
                                        field.onChange(checked ? 1 : 0)
                                    }
                                />
                                <label>Συναφές με τη θέση</label>
                            </div>
                        )}
                    />
                    <Controller
                        name="relevance"
                        control={control}
                        render={({ field }) => (
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    checked={field.value === 1}
                                    onCheckedChange={(checked) =>
                                        field.onChange(checked ? 1 : 0)
                                    }
                                />
                                <label>Αναγνωρισμένο</label>
                            </div>
                        )}
                    />
                </div>
                <FormField label="Σχόλια" error={errors.comment?.message}>
                    <Controller control={control} name="comment" render={({ field }) => (
                        <textarea {...field} className={`w-full bg-white border rounded-md p-2 resize-none ${errors.comment ? "border-red-400" : "border-gray-200"}`} placeholder="Σχόλια" rows={4} />
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
                    onClick={handleSave}
                >
                    {isEditing ? 'Ενημέρωση' : 'Αποθήκευση'}
                </Button>
            </div>
        </div>
    );
}