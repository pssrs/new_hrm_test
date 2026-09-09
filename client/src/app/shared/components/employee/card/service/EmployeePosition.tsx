import { useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BriefcaseBusinessIcon, PencilIcon, X } from "lucide-react";
import { useValues } from "@/lib/hooks/useValues";
import { useEmployee } from "@/lib/hooks/useEmployee";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { positionSectionSchema, type PositionSectionSchema } from "@/lib/schemas/employeeServiceSchema";
import { CATEGORY_OPTIONS, WORK_RELATION_OPTIONS } from "@/lib/types/constTypes";
import FormField from "@/app/shared/FormField";

interface EmployeePositionProps {
    employeeService?: EmployeeService;
}

export default function EmployeePosition({ employeeService }: EmployeePositionProps) {
    const { kladoi, eidikothtes } = useValues();
    const [sheetOpen, setSheetOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const { updateEmployeePosition } = useEmployee({});

    const { control, handleSubmit, reset, trigger, watch, setValue, formState: { errors } } = useForm<PositionSectionSchema>({
        resolver: zodResolver(positionSectionSchema),
        mode: "all",
        defaultValues: {
            workRelation: String(employeeService?.workRelation ?? "0"),
            category: employeeService?.category ?? "",
            branch: employeeService?.branch ?? "",
            specialty: employeeService?.specialty ?? "",
        }
    });

    const selectedCategory = watch("category");
    const selectedBranch = watch("branch");
    const hasMountedRef = useRef(false);
    const categoryLabel = CATEGORY_OPTIONS.find(o => o.value === selectedCategory)?.label ?? "";
    const normalizedCategory = selectedCategory?.toLowerCase() ?? "";
    const normalizedLabel = categoryLabel.toLowerCase();

    const matchesCategory = (code?: string) => {
        if (!normalizedCategory) return true;
        const normalizedCode = (code ?? "").toLowerCase();
        return normalizedCode.startsWith(normalizedCategory) || (normalizedLabel && normalizedCode.startsWith(normalizedLabel));
    };

    const baseKladoi = kladoi.filter(k => k.description).filter(k => matchesCategory(k.code));
    const selectedKlados = selectedBranch ? kladoi.find(k => k.code === selectedBranch) : undefined;
    const filteredKladoi = selectedKlados && !baseKladoi.some(k => k.code === selectedBranch)
        ? [selectedKlados, ...baseKladoi]
        : baseKladoi;

    useEffect(() => {
        if (!hasMountedRef.current) {
            hasMountedRef.current = true;
            return;
        }
        setValue("branch", "");
    }, [selectedCategory, setValue]);

    const handleSave = handleSubmit((data) => {
        if (isSaving) return;
        setIsSaving(true);
        updateEmployeePosition({
            am: Number(employeeService?.am),
            workRelation: Number(data.workRelation),
            category: data.category,
            branch: data.branch,
            specialty: data.specialty,
        }, {
            onSuccess: () => {
                toast.custom((t) => (
                    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-md flex items-center justify-between gap-3 min-w-80">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm text-gray-800">Τα στοιχεία ενημερώθηκαν επιτυχώς!</span>
                        </div>
                        <button onClick={() => toast.dismiss(t)} className="text-gray-500 hover:text-gray-700 transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ));
                setSheetOpen(false);
                setIsSaving(false);
            },
            onError: (error: Error) => {
                toast.custom((t) => (
                    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-md flex items-center justify-between gap-3 min-w-80">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span className="text-sm text-gray-800">{error?.message || "Σφάλμα κατά την ενημέρωση"}</span>
                        </div>
                        <button onClick={() => toast.dismiss(t)} className="text-gray-500 hover:text-gray-700 transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ));
                setIsSaving(false);
            },
        });
    });

    return (
        <>
            <Card className="bg-white">
                <CardHeader className="flex flex-row items-center justify-between pb-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <div className="bg-gray-100 p-2 rounded-md flex items-center justify-center">
                            <BriefcaseBusinessIcon className="w-4 h-4" />
                        </div>
                        Θέση
                    </CardTitle>
                    <Button variant="outline" className="hover:bg-gray-100" onClick={() => {
                        reset({
                            workRelation: String(employeeService?.workRelation ?? "0"),
                            category: employeeService?.category ?? "",
                            branch: employeeService?.branch ?? "",
                            specialty: employeeService?.specialty ?? "",
                        });
                        setSheetOpen(true);
                        setTimeout(() => trigger(), 0);
                    }}>
                        <PencilIcon className="w-2 h-2" />Επεξεργασία
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table className="border-collapse">
                        <TableBody>
                            <TableRow className="border-none">
                                <TableCell className="text-xs font-semibold text-black w-1/5 text-left border-none">Εργασιακή σχέση:</TableCell>
                                <TableCell className="text-xs font-normal text-neutral-900 text-left border-none">{WORK_RELATION_OPTIONS.find(o => o.value === String(employeeService?.workRelation))?.label ?? "-"}</TableCell>
                            </TableRow>
                            <TableRow className="border-none">
                                <TableCell className="text-xs font-semibold text-black text-left border-none">Κατηγορία:</TableCell>
                                <TableCell className="text-xs font-normal text-neutral-900 text-left border-none">{CATEGORY_OPTIONS.find(o => o.value === employeeService?.category)?.label ?? employeeService?.category ?? "-"}</TableCell>
                            </TableRow>
                            <TableRow className="border-none">
                                <TableCell className="text-xs font-semibold text-black text-left border-none">Ειδικότητα:</TableCell>
                                <TableCell className="text-xs font-normal text-neutral-900 text-left border-none">{eidikothtes.find(e => e.code === employeeService?.specialty)?.description || employeeService?.specialty || "-"}</TableCell>
                            </TableRow>
                            <TableRow className="border-none">
                                <TableCell className="text-xs font-semibold text-black text-left border-none">Κλάδος:</TableCell>
                                <TableCell className="text-xs font-normal text-neutral-900 text-left border-none">{kladoi.find(k => k.code === employeeService?.branch)?.description || "-"}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Sheet open={sheetOpen} onOpenChange={(open) => { setSheetOpen(open); if (!open) reset(); }}>
                <SheetContent className="w-125 sm:w-150 flex flex-col bg-white" side="right">
                    <SheetHeader>
                        <SheetTitle className="text-lg font-bold p-1">Θέση</SheetTitle>
                    </SheetHeader>
                    <Separator className="bg-gray-300 -mt-5" />
                    <div className="flex-1 space-y-4 overflow-y-auto p-6 -mt-4">
                        <FormField label="Εργασιακή σχέση" error={errors.workRelation?.message}>
                            <Controller control={control} name="workRelation" render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger className={`w-full bg-white ${errors.workRelation ? "border-red-400" : "border-gray-200"}`}><SelectValue placeholder="Επιλέξτε εργασιακή σχέση" /></SelectTrigger>
                                    <SelectContent position="popper" className="bg-white border border-neutral-200 outline-0 ring-0">
                                        {WORK_RELATION_OPTIONS.map(o => (
                                            <SelectItem className="hover:bg-neutral-100" key={o.value} value={o.value}>{o.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )} />
                        </FormField>
                        <FormField label="Κατηγορία" error={errors.category?.message}>
                            <Controller control={control} name="category" render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger className={`w-full bg-white ${errors.category ? "border-red-400" : "border-gray-200"}`}><SelectValue placeholder="Επιλέξτε κατηγορία" /></SelectTrigger>
                                    <SelectContent position="popper" className="bg-white border border-neutral-200 outline-0 ring-0">
                                        {CATEGORY_OPTIONS.map(o => (
                                            <SelectItem className="hover:bg-neutral-100" key={o.value} value={o.value}>{o.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )} />
                        </FormField>
                        <FormField label="Ειδικότητα" error={errors.specialty?.message}>
                            <Controller control={control} name="specialty" render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger className={`w-full bg-white ${errors.specialty ? "border-red-400" : "border-gray-200"}`}><SelectValue placeholder="Επιλέξτε ειδικότητα" /></SelectTrigger>
                                    <SelectContent position="popper" className="bg-white border border-neutral-200 outline-0 ring-0">
                                        {eidikothtes.filter(e => e.description).map(e => (
                                            <SelectItem className="hover:bg-neutral-100" key={e.code} value={e.code}>{e.description}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )} />
                        </FormField>
                        <FormField label="Κλάδος" error={errors.branch?.message}>
                            <Controller control={control} name="branch" render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger className={`w-full bg-white ${errors.branch ? "border-red-400" : "border-gray-200"}`}><SelectValue placeholder="Επιλέξτε κλάδο" /></SelectTrigger>
                                    <SelectContent position="popper" className="bg-white border border-neutral-200 outline-0 ring-0">
                                        {filteredKladoi.map(k => (
                                            <SelectItem className="hover:bg-neutral-100" key={k.code} value={k.code}>{k.description}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )} />
                        </FormField>
                    </div>
                    <Separator className="bg-gray-300" />
                    <div className="flex gap-3 px-6 pb-4">
                        <Button type="button" className="flex-1 transition-all duration-200 hover:opacity-80 w-auto"
                            style={{ display: "flex", height: "var(--Height-H-10, 40px)", padding: "var(--Padding-Y-py-2, 8px) var(--Padding-X-px-4, 16px)", justifyContent: "center", alignItems: "center", alignSelf: "stretch", borderRadius: "var(--Radius-Rounded-Medium, 6px)", border: "1px solid var(--color-border)", background: "var(--color-ghost)", color: "var(--color-foreground)" }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f3f4f6"}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "var(--color-ghost)"}
                            onClick={() => { setSheetOpen(false); setIsSaving(false); }}>Κλείσιμο</Button>
                        <Button className="flex-1 transition-all duration-200 hover:opacity-80 w-auto"
                            style={{ display: "flex", height: "var(--Height-H-10, 40px)", padding: "var(--Padding-Y-py-2, 8px) var(--Padding-X-px-4, 16px)", justifyContent: "center", alignItems: "center", alignSelf: "stretch", borderRadius: "var(--Radius-Rounded-Medium, 6px)", background: "var(--color-primary)", color: "var(--color-primary-foreground)" }}
                            disabled={isSaving}
                            onClick={handleSave}>Αποθήκευση</Button>
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
}
