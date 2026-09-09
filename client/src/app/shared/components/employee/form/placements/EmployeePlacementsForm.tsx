import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
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
import { useAccount } from "@/lib/hooks/useAccount";
import { employeePalcementSchema } from "@/lib/schemas/employeePlacementSchema";
import { PLACEMENT_TYPES } from "@/lib/types/constTypes";
import { formDate } from "@/lib/utils/FormatDate";

interface EmployeePlacementsFormProps {
    placement?: Placement | null;
    onClose: () => void;
}

export default function EmployeePlacementsForm({ placement, onClose }: EmployeePlacementsFormProps) {
    const { id } = useParams<{ id: string }>();
    const {createEmployeePlacement, updateEmployeePlacement} = useEmployee({id});
    const {user} = useAccount();
    const { address, sector, department, office } = useValues();
    type FormData = z.infer<typeof employeePalcementSchema>;
    const isEditing = !!placement?.id;
    const [isSaving, setIsSaving] = useState(false);

    const defaultFormValues = {
        id: 0,
        am: Number(id),
        type: -1,
        oldAddress: -1,
        oldSector: -1,
        oldDepartment: -1,
        oldTeam: -1,
        newAddress: -1,
        newSector: -1,
        newDepartment: -1,
        newTeam: -1,
        comment: "",
        duration: "",
        date: "",
        user: user?.userName || "",
    } satisfies FormData;

    const { control, reset, watch, getValues, formState: { errors }, trigger } = useForm<FormData>({
        resolver: zodResolver(employeePalcementSchema),
        mode: "onChange",
        defaultValues: defaultFormValues,
    });

    useEffect(() => {
        if (!placement) { reset(defaultFormValues); return; }
        reset({
            id: placement.id || 0,
            am: placement.am,
            type: placement.type || 0,
            oldAddress: placement.oldAddress === undefined ? -1 : placement.oldAddress,
            oldSector: placement.oldSector === undefined ? -1 : placement.oldSector,
            oldDepartment: placement.oldDepartment === undefined ? -1 : placement.oldDepartment,
            oldTeam: placement.oldTeam === undefined ? -1 : placement.oldTeam,
            newAddress: placement.newAddress === undefined ? -1 : placement.newAddress,
            newSector: placement.newSector === undefined ? -1 : placement.newSector,
            newDepartment: placement.newDepartment === undefined ? -1 : placement.newDepartment,
            newTeam: placement.newTeam === undefined ? -1 : placement.newTeam,
            comment: placement.comment || "",
            duration: placement.duration || "",
            date: formDate(placement.date),
            user: user?.userName || "",
        });
        setIsSaving(false);
    }, [placement]);

    const handleSave = async () => {
        if (isSaving) return;

        const isFormValid = await trigger();
        if (!isFormValid) return;

        const formData = getValues();

        setIsSaving(true);
        try {
            if (isEditing && formData.id) {
                updateEmployeePlacement(
                    {
                        id: formData.id,
                        am: formData.am,
                        type: formData.type || 0,
                        oldAddress: formData.oldAddress == undefined ? -1 : formData.oldAddress,
                        oldSector: formData.oldSector == undefined ? -1 : formData.oldSector,
                        oldDepartment: formData.oldDepartment == undefined ? -1 : formData.oldDepartment,
                        oldTeam: formData.oldTeam == undefined ? -1 : formData.oldTeam,
                        newAddress: formData.newAddress == undefined ? -1 : formData.newAddress,
                        newSector: formData.newSector == undefined ? -1 : formData.newSector,
                        newDepartment: formData.newDepartment == undefined ? -1 : formData.newDepartment,
                        newTeam: formData.newTeam == undefined ? -1 : formData.newTeam,
                        comment: formData.comment || "",
                        duration: formData.duration || "",
                        date: formDate(formData.date) || "1900-01-01",
                        user: user?.userName || "",
                    },
                    {
                        onSuccess: () => {
                            showSuccessToast("Η τοποθέτηση ενημερώθηκε με επιτυχία");
                            reset(defaultFormValues);
                            setIsSaving(false);
                            onClose();
                        },
                        onError: (error) => {
                            showErrorToast("Σφάλμα κατά την ενημέρωση της τοποθέτησης");
                            console.error(error);
                            setIsSaving(false);
                        }
                    }
                );
            } else {
                createEmployeePlacement({
                    id: 0,
                    am: Number(id),
                    type: formData.type || 0,
                    oldAddress: formData.oldAddress == undefined ? -1 : formData.oldAddress,
                    oldSector: formData.oldSector == undefined ? -1 : formData.oldSector,
                    oldDepartment: formData.oldDepartment == undefined ? -1 : formData.oldDepartment,
                    oldTeam: formData.oldTeam == undefined ? -1 : formData.oldTeam,
                    newAddress: formData.newAddress == undefined ? -1 : formData.newAddress,
                    newSector: formData.newSector == undefined ? -1 : formData.newSector,
                    newDepartment: formData.newDepartment == undefined ? -1 : formData.newDepartment,
                    newTeam: formData.newTeam == undefined ? -1 : formData.newTeam,
                    comment: formData.comment || "",
                    duration: formData.duration || "",
                    date: formDate(formData.date) || "1900-01-01",
                    user: user?.userName || "",
                },{
                    onSuccess: () => {
                        showSuccessToast("Η τοποθέτηση καταχωρήθηκε με επιτυχία");
                        reset(defaultFormValues);
                        setIsSaving(false);
                        onClose();
                    },
                    onError: (error) => {
                        showErrorToast("Σφάλμα κατά τη δημιουργία της τοποθέτησης");
                        console.error(error);
                        setIsSaving(false);
                    }
                });
            }
        } catch (error) {
            setIsSaving(false);
            console.error("Error saving placement:", error);
        }
    };

    const oldAddress = watch("oldAddress");
    const oldSector = watch("oldSector");
    const newAddress = watch("newAddress");
    const newSector = watch("newSector");

    const filteredOldSectors = sector.filter(s => s.addressId === oldAddress);
    const filteredOldDepartments = department.filter(d => d.addressId === oldAddress && d.sectorId === oldSector);
    const filteredNewSectors = sector.filter(s => s.addressId === newAddress);
    const filteredNewDepartments = department.filter(d => d.addressId === newAddress && d.sectorId === newSector);

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
                                    {PLACEMENT_TYPES?.map(p => (
                                        <SelectItem className="hover:bg-neutral-100" key={p.value} value={String(p.value)}>
                                            {p.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                </FormField>
                <div className="grid grid-cols-2 gap-4">
                    <FormField label="Προηγούμενη Διεύθυνση" error={errors.oldAddress?.message}>
                        <Controller name="oldAddress" control={control}
                            render={({ field }) => (
                                <Select value={field.value !== null && field.value !== undefined ? String(field.value) : ''}  onValueChange={(val) => field.onChange(val ? Number(val) : null)}>
                                    <SelectTrigger className={`w-full bg-white ${errors.type ? "border-red-400" : "border-gray-200"}`}>
                                        <SelectValue placeholder="Επιλέξτε επίπεδο" />
                                    </SelectTrigger>
                                    <SelectContent position="popper" className="bg-white border border-neutral-200 outline-0 ring-0">
                                        {address?.map(p => (
                                            <SelectItem className="hover:bg-neutral-100" key={p.id} value={String(p.id)}>
                                                {p.address_str}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </FormField>
                    <FormField label="Προηγούμενος Τομέας" error={errors.oldSector?.message}>
                        <Controller control={control} name="oldSector" render={({ field }) => (
                            <Select value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
                                <SelectTrigger className={`w-full bg-white ${errors.oldSector ? "border-red-400" : "border-gray-200"}`}><SelectValue placeholder="Επιλέξτε Τομέα" /></SelectTrigger>
                                <SelectContent position="popper" className="bg-white border border-neutral-200 outline-0 ring-0">
                                    {filteredOldSectors.filter(s => s.sectorName).map(s => (
                                        <SelectItem className="hover:bg-neutral-100" key={s.sectorId} value={String(s.sectorId)}>{s.sectorName}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )} />
                    </FormField>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <FormField label="Προηγούμενο Τμήμα" error={errors.oldDepartment?.message}>
                        <Controller control={control} name="oldDepartment" render={({ field }) => (
                            <Select value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
                                <SelectTrigger className={`w-full bg-white ${errors.oldDepartment ? "border-red-400" : "border-gray-200"}`}><SelectValue placeholder="Επιλέξτε Τμήμα" /></SelectTrigger>
                                <SelectContent position="popper" className="bg-white border border-neutral-200 outline-0 ring-0">
                                    {filteredOldDepartments.filter(d => d.departmentName).map(d => (
                                        <SelectItem className="hover:bg-neutral-100" key={d.departmentId} value={String(d.departmentId)}>{d.departmentName}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )} />
                    </FormField>
                    <FormField label="Προηγούμενο Γραφείο" error={errors.oldTeam?.message}>
                        <Controller name="oldTeam" control={control}
                            render={({ field }) => (
                                <Select value={field.value !== null && field.value !== undefined ? String(field.value) : ''}  onValueChange={(val) => field.onChange(val ? Number(val) : null)}>
                                    <SelectTrigger className={`w-full bg-white ${errors.type ? "border-red-400" : "border-gray-200"}`}>
                                        <SelectValue placeholder="Επιλέξτε επίπεδο" />
                                    </SelectTrigger>
                                    <SelectContent position="popper" className="bg-white border border-neutral-200 outline-0 ring-0">
                                        {office?.map(p => (
                                            <SelectItem className="hover:bg-neutral-100" key={p.departmentId} value={String(p.departmentId)}>
                                                {p.officeName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </FormField>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <FormField label="Νέα Διεύθυνση" error={errors.newAddress?.message}>
                        <Controller name="newAddress" control={control}
                            render={({ field }) => (
                                <Select value={field.value !== null && field.value !== undefined ? String(field.value) : ''}  onValueChange={(val) => field.onChange(val ? Number(val) : null)}>
                                    <SelectTrigger className={`w-full bg-white ${errors.type ? "border-red-400" : "border-gray-200"}`}>
                                        <SelectValue placeholder="Επιλέξτε επίπεδο" />
                                    </SelectTrigger>
                                    <SelectContent position="popper" className="bg-white border border-neutral-200 outline-0 ring-0">
                                        {address?.map(p => (
                                            <SelectItem className="hover:bg-neutral-100" key={p.id} value={String(p.id)}>
                                                {p.address_str}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </FormField>
                    <FormField label="Νέος Τομέας" error={errors.newSector?.message}>
                        <Controller control={control} name="newSector" render={({ field }) => (
                            <Select value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
                                <SelectTrigger className={`w-full bg-white ${errors.newSector ? "border-red-400" : "border-gray-200"}`}><SelectValue placeholder="Επιλέξτε Τομέα" /></SelectTrigger>
                                <SelectContent position="popper" className="bg-white border border-neutral-200 outline-0 ring-0">
                                    {filteredNewSectors.filter(s => s.sectorName).map(s => (
                                        <SelectItem className="hover:bg-neutral-100" key={s.sectorId} value={String(s.sectorId)}>{s.sectorName}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )} />
                    </FormField>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <FormField label="Νέο Τμήμα" error={errors.newDepartment?.message}>
                        <Controller control={control} name="newDepartment" render={({ field }) => (
                            <Select value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
                                <SelectTrigger className={`w-full bg-white ${errors.newDepartment ? "border-red-400" : "border-gray-200"}`}><SelectValue placeholder="Επιλέξτε Τμήμα" /></SelectTrigger>
                                <SelectContent position="popper" className="bg-white border border-neutral-200 outline-0 ring-0">
                                    {filteredNewDepartments.filter(d => d.departmentName).map(d => (
                                        <SelectItem className="hover:bg-neutral-100" key={d.departmentId} value={String(d.departmentId)}>{d.departmentName}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )} />
                    </FormField>
                    <FormField label="Νέο Γραφείο" error={errors.newTeam?.message}>
                        <Controller name="newTeam" control={control}
                            render={({ field }) => (
                                <Select value={field.value !== null && field.value !== undefined ? String(field.value) : ''}  onValueChange={(val) => field.onChange(val ? Number(val) : null)}>
                                    <SelectTrigger className={`w-full bg-white ${errors.type ? "border-red-400" : "border-gray-200"}`}>
                                        <SelectValue placeholder="Επιλέξτε επίπεδο" />
                                    </SelectTrigger>
                                    <SelectContent position="popper" className="bg-white border border-neutral-200 outline-0 ring-0">
                                        {office?.map(p => (
                                            <SelectItem className="hover:bg-neutral-100" key={p.departmentId} value={String(p.departmentId)}>
                                                {p.officeName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </FormField>
                </div>
                <FormField label="Αριθμός Απόφασης" error={errors.duration?.message}>
                    <Controller name="duration" control={control}
                        render={({ field }) => (
                            <Input 
                                value={field.value}
                                onChange={field.onChange}
                                className={`w-full bg-white ${errors.duration ? "border-red-400" : "border-gray-200"}`}
                            />
                        )}
                    />
                </FormField>
                <FormField label="Ημ/νια τοποθέτησης" error={errors.date?.message}>
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
                    onClick={handleSave}
                    disabled={isSaving}
                >
                    {isEditing ? 'Ενημέρωση' : 'Αποθήκευση'}
                </Button>
            </div>
        </div>
    );
}