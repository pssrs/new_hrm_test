import FormField from "@/app/shared/FormField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useEmployee } from "@/lib/hooks/useEmployee";
import { useValues } from "@/lib/hooks/useValues";
import { employeeLeaveSchema } from "@/lib/schemas/employeeLeaveSchema";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toastHelpers";
import { zodResolver } from "@hookform/resolvers/zod";
import { ClipboardPenLineIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useParams } from "react-router";
import type z from "zod";

interface EmployeeLeaveFormProps {
    leave: Leave | null;
    leaveList: Leave[] | undefined;
    leaveTotal: number | undefined;
    onClose: () => void;
}

export default function EmployeeLeaveForm({ leave, onClose, leaveList, leaveTotal }: EmployeeLeaveFormProps) {
    const {id} = useParams<{ id: string }>();
    const {employeeLeavesTypes, createEmployeeLeave, updateEmployeeLeave, overallLeaves, updateOverallLeaves} = useEmployee({id});
    const {leaves: allLeaveTypes, argies} = useValues();

    const holidayDates = useMemo(() => new Set(
        argies.map(a => typeof a.date === 'string' ? a.date.split('T')[0] : new Date(a.date).toISOString().split('T')[0])
    ), [argies]);
    const [selectedLeaveTypeIds, setSelectedLeaveTypeIds] = useState<number[]>([]);
    const [isOverallLeavesOpen, setIsOverallLeavesOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    type FormData = z.infer<typeof employeeLeaveSchema>;
    const isEditing = !!leave?.id;

    const defaultFormValues = {
        id: 0,
        am: 0,
        type: 0,
        duration: 0,
        dateFrom: "",
        dateTo: "",
        year: Number(new Date().getFullYear()),
        notes: "",
        request: "",
        approval: "",
        state: 0
    } satisfies FormData;

    const { control, reset, getValues, watch, formState: { errors, isValid }, trigger } = useForm<FormData>({
        resolver: zodResolver(employeeLeaveSchema),
        mode: "onChange",
        defaultValues: defaultFormValues,
    });

    const selectedType = watch("type");
    const dateFrom = watch("dateFrom");
    const dateTo = watch("dateTo");

    const duration = dateFrom && dateTo ? calculateDuration(dateFrom, dateTo) : 0;

    const normalLeaveTypes = [20, 21, 22, 23, 24, 25];

    const selectedLeaveType = employeeLeavesTypes?.find(l => l.id === Number(selectedType));

    const usedDays = leaveList?.filter(l => l.type === Number(selectedType) && l.id !== leave?.id).reduce((sum, l) => sum + l.duration, 0) ?? 0;

    const remainingDays = (selectedLeaveType?.duration ?? 0) - usedDays;

    const originalDuration = isEditing && leave && leave.type === Number(selectedType) ? leave.duration : 0;

    const availableBalance = normalLeaveTypes.includes(Number(selectedType)) && leaveTotal !== 0 ? (leaveTotal ?? 0) + originalDuration : remainingDays;
    const hasEnoughBalance = duration <= availableBalance;

    const formDate = (date: string | Date | null | undefined): string => {
        if (!date) return "";
        const formattedDate =
            typeof date === "string"
                ? date.split("T")[0]
                : date.toISOString().split("T")[0];
        return formattedDate === "1900-01-01" ? "" : formattedDate;
    };

    function calculateDuration(dateFrom: string, dateTo: string): number {
        const start = new Date(dateFrom);
        const end = new Date(dateTo);

        let duration = 0;

        const current = new Date(start);

        while (current <= end) {
            const day = current.getDay();
            const dateStr = current.toISOString().split('T')[0];

            if (day !== 0 && day !== 6 && !holidayDates.has(dateStr)) duration++;

            current.setDate(current.getDate() + 1);
        }

        return duration;
    }

    function hasOverlappingLeave( dateFrom: string, dateTo: string, leaves: Leave[],currentLeaveId?: number ): boolean {
        const newStart = new Date(dateFrom);
        const newEnd = new Date(dateTo);

        return leaves.some(l => {

            if (currentLeaveId && l.id === currentLeaveId) return false;

            const existingStart = new Date(l.dateFrom);
            const existingEnd = new Date(l.dateTo);

            return newStart <= existingEnd && newEnd >= existingStart;
        });
    }

    function hasAvailableBalance(leaveTypeId: number, requestedDays: number): boolean {
        const normalLeaveTypes = [20, 21, 22, 23, 24, 25];

        if (!normalLeaveTypes.includes(leaveTypeId)) return true;

        const originalDuration = isEditing && leave && leave.type === leaveTypeId ? leave.duration : 0;

        return requestedDays <= (leaveTotal ?? 0) + originalDuration;
    }

    useEffect(() => {
        if (!leave) { reset(defaultFormValues); return; }

        reset({
            id: leave.id,
            am: leave.am,
            type: leave.type,
            duration: leave.duration,
            dateFrom: formDate(leave.dateFrom),
            dateTo: formDate(leave.dateTo),
            year: leave.year,
            notes: leave.notes,
            request: leave.request,
            approval: leave.approval,
            state: leave.state
        });
    }, [leave]);

    const handleSave = async () => {
        if (isSaving) return;

        const isFormValid = await trigger();
        if (!isFormValid) return;
        const formData = getValues();

        if (hasOverlappingLeave( formData.dateFrom, formData.dateTo, leaveList ?? [], isEditing ? formData.id : undefined )) {
            showErrorToast( "Υπάρχει ήδη καταχωρημένη άδεια για το συγκεκριμένο διάστημα." );
            return;
        }

        const duration = calculateDuration( formData.dateFrom, formData.dateTo);
        if (!hasAvailableBalance(formData.type, duration)) {
            showErrorToast("Δεν υπάρχει διαθέσιμο υπόλοιπο άδειας.");
            return;
        }
        const startDate = new Date(formData.dateFrom);
        const endDate = new Date(formData.dateTo);

        if (endDate < startDate) {
            showErrorToast("Η ημερομηνία έως δεν μπορεί να είναι μικρότερη από την ημερομηνία από.");
            return;
        }

        setIsSaving(true);
        try {
            if (isEditing && formData.id) {
                updateEmployeeLeave(
                    {
                        id: formData.id,
                        am: formData.am,
                        type: formData.type,
                        duration: calculateDuration(formData.dateFrom, formData.dateTo),
                        dateFrom: formDate(formData.dateFrom),
                        dateTo: formDate(formData.dateTo),
                        year: Number(new Date().getFullYear()),
                        notes: formData.notes || "",
                        request: formData.request || "",
                        approval: formData.approval || "",
                        state: formData.state || 0
                    },
                    {
                        onSuccess: () => {
                            showSuccessToast("Η άδεια ενημερώθηκε με επιτυχία");
                            reset(defaultFormValues);
                            setIsSaving(false);
                            onClose();
                        },
                        onError: (error) => {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            const msg = (error as any)?.response?.data || error?.message || "Άγνωστο σφάλμα";
                            showErrorToast("Σφάλμα κατά την ενημέρωση της άδειας: " + msg);
                            console.error(error);
                            setIsSaving(false);
                        }
                    }
                );
            } else {
                createEmployeeLeave({
                    id: 0,
                    am: Number(id),
                    type: formData.type,
                    duration: calculateDuration(formData.dateFrom, formData.dateTo),
                    dateFrom: formDate(formData.dateFrom),
                    dateTo: formDate(formData.dateTo),
                    year: Number(new Date().getFullYear()),
                    notes: formData.notes || "",
                    request: formData.request || "",
                    approval: formData.approval || "",
                    state: formData.state || 0
                },{
                    onSuccess: () => {
                        showSuccessToast("Η άδεια καταχωρήθηκε με επιτυχία");
                        reset(defaultFormValues);
                        setIsSaving(false);
                        onClose();
                    },
                    onError: (error) => {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const msg = (error as any)?.response?.data || error?.message || "Άγνωστο σφάλμα";
                        showErrorToast("Σφάλμα κατά τη δημιουργία της άδειας: " + msg);
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
                <div className="flex gap-4">
                    <div className="flex-1">
                        <FormField label="Τύπος*" error={errors.type?.message}>
                            <Controller name="type" control={control}
                                render={({ field }) => (
                                    <Select value={field.value ? String(field.value) : ''} onValueChange={(val) => field.onChange(val ? Number(val) : null)}>
                                        <SelectTrigger className={`w-full bg-white ${errors.type ? "border-red-400" : "border-gray-200"}`}>
                                            <SelectValue placeholder="Επιλέξτε τύπο" />
                                        </SelectTrigger>
                                        <SelectContent position="popper" className='bg-white border border-neutral-200 outline-0 ring-0'>
                                            {employeeLeavesTypes?.map((l: LeaveType) => (
                                                <SelectItem key={l.id} value={String(l.id)}>
                                                    {l.description}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </FormField>
                    </div>
                    <div className="flex flex-col gap-1.5 -mt-1.5">
                        <span className="invisible text-sm">.</span>
                        <Popover
                            open={isOverallLeavesOpen}
                            onOpenChange={(open) => {
                                setIsOverallLeavesOpen(open);
                                if (open) setSelectedLeaveTypeIds((overallLeaves ?? []).filter(ol => ol.flag === 1).map(ol => ol.type));
                            }}
                        >
                            <PopoverTrigger asChild>
                                <button
                                    type="button"
                                    className="w-9 h-9 flex items-center justify-center rounded-md border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
                                >
                                    <ClipboardPenLineIcon className="w-4 h-4" />
                                </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-72 bg-white max-h-[min(70vh,var(--radix-popover-content-available-height))] overflow-y-auto" align="end">
                                <div className="text-sm font-semibold text-neutral-900 mb-2">
                                    Άδειες {new Date().getFullYear()}
                                </div>
                                {(!allLeaveTypes || allLeaveTypes.length === 0) ? (
                                    <p className="text-xs text-neutral-500">Δεν υπάρχουν διαθέσιμοι τύποι άδειας.</p>
                                ) : (
                                    <div
                                        className="space-y-2 overflow-y-auto pr-1"
                                        style={{ maxHeight: '16rem' }}
                                        onWheel={(e) => {
                                            e.stopPropagation();
                                            e.currentTarget.scrollTop += e.deltaY;
                                        }}
                                    >
                                        {[...allLeaveTypes].sort((a, b) => a.description.localeCompare(b.description, 'el')).map((lt: LeaveType) => {
                                            const checked = selectedLeaveTypeIds.includes(lt.id);
                                            return (
                                                <label key={lt.id} className="flex w-full items-center justify-start gap-2 text-xs text-neutral-700 cursor-pointer">
                                                    <Checkbox
                                                        checked={checked}
                                                        onCheckedChange={(value) => {
                                                            setSelectedLeaveTypeIds(prev => {
                                                                if (!value) return prev.filter(t => t !== lt.id);

                                                                const withoutOtherNormalTypes = normalLeaveTypes.includes(lt.id)
                                                                    ? prev.filter(t => !normalLeaveTypes.includes(t))
                                                                    : prev;

                                                                return [...withoutOtherNormalTypes, lt.id];
                                                            });
                                                        }}
                                                    />
                                                    <span className="truncate">{lt.description}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                )}
                                <Separator className="my-3 bg-neutral-200" />
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1 h-8 text-sm"
                                        onClick={() => setIsOverallLeavesOpen(false)}
                                    >
                                        Κλείσιμο
                                    </Button>
                                    <Button
                                        type="button"
                                        className="flex-1 h-8 text-sm"
                                        style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }}
                                        onClick={() => {
                                            updateOverallLeaves(selectedLeaveTypeIds, {
                                                onSuccess: () => {
                                                    showSuccessToast("Οι άδειες ενημερώθηκαν με επιτυχία");
                                                    setIsOverallLeavesOpen(false);
                                                },
                                                onError: (error) => {
                                                    showErrorToast("Σφάλμα κατά την ενημέρωση των αδειών");
                                                    console.error(error);
                                                }
                                            });
                                        }}
                                    >
                                        Αποθήκευση
                                    </Button>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <FormField label="Ημερομηνία από *" error={errors.dateFrom?.message}>
                        <Controller name="dateFrom" control={control}
                            render={({ field }) => (
                                <Input 
                                    type="date"
                                    value={field.value}
                                    onChange={field.onChange}
                                    className={`w-full bg-white ${errors.dateFrom ? "border-red-400" : !hasEnoughBalance ? "border-red-500" : "border-gray-200" }`}
                                />
                            )}
                        />
                    </FormField>
                    <FormField label="Ημερομηνία έως *" error={errors.dateTo?.message}>
                        <Controller name="dateTo" control={control}
                            render={({ field }) => (
                                <Input 
                                    type="date"
                                    value={field.value}
                                    onChange={field.onChange}
                                    className={`w-full bg-white ${errors.dateTo ? "border-red-400" : !hasEnoughBalance ? "border-red-500" : "border-gray-200" }`}
                                />
                            )}
                        />
                    </FormField>
                </div>
                {!hasEnoughBalance && duration > 0 && (
                    <div className="-mt-3">
                        <label className="text-xs text-red-600">
                            Δεν υπάρχει διαθέσιμο υπόλοιπο γι αυτόν τον τύπο άδειας.
                        </label>
                    </div>
                )}
                <div className="grid grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">
                            Σύνολο
                        </label>
                        <span className="h-10 px-3 flex items-center rounded-md border border-gray-200 bg-gray-50">
                            {selectedLeaveType?.duration ?? 0}
                        </span>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">
                            Υπόλοιπο
                        </label>
                        <span className="h-10 px-3 flex items-center rounded-md border border-gray-200 bg-gray-50">
                            {availableBalance}
                        </span>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">
                            Διάρκεια
                        </label>
                        <span className="h-10 px-3 flex items-center rounded-md border border-gray-200 bg-gray-50">
                            {duration}
                        </span>
                    </div>
                </div>
                <FormField label="Στοιχεία αίτησης" error={errors.request?.message}>
                    <Controller name="request" control={control}
                        render={({ field }) => (
                            <Input 
                                value={field.value}
                                onChange={field.onChange}
                                className={`w-full bg-white ${errors.request ? "border-red-400" : "border-gray-200"}`}
                            />
                        )}
                    />
                </FormField>
                <FormField label="Στοιχεία αίτησης" error={errors.approval?.message}>
                    <Controller name="approval" control={control}
                        render={({ field }) => (
                            <Input 
                                value={field.value}
                                onChange={field.onChange}
                                className={`w-full bg-white ${errors.approval ? "border-red-400" : "border-gray-200"}`}
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
                    disabled={!isValid || !hasEnoughBalance || isSaving}
                    onClick={handleSave}
                >
                    {isSaving ? 'Αποθήκευση...' : isEditing ? 'Ενημέρωση' : 'Αποθήκευση'}
                </Button>
            </div>
        </div>
    );
}