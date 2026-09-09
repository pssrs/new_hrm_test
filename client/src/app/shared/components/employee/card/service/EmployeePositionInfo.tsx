import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NotepadTextIcon, PencilIcon, X } from "lucide-react";
import { useValues } from "@/lib/hooks/useValues";
import { useEmployee } from "@/lib/hooks/useEmployee";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { positionInfoSectionSchema } from "@/lib/schemas/employeeServiceSchema";
import FormField from "@/app/shared/FormField";

const positionInfoFormSchema = positionInfoSectionSchema.extend({
    appointmentDate: z.coerce.date().optional(),
});
type PositionInfoFormSchema = z.infer<typeof positionInfoFormSchema>;

interface EmployeePositionInfoProps {
    employeeService?: EmployeeService;
}

function formatIsoDateToDDMMYYYY(value?: Date | string | null) {
    if (!value) return "";
    const iso = value instanceof Date ? value.toISOString().slice(0, 10) : value.toString().slice(0, 10);
    const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) return `${m[3]}-${m[2]}-${m[1]}`;
    const d = new Date(value);
    if (!isNaN(d.getTime())) {
        const dd = String(d.getDate()).padStart(2, "0");
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const yyyy = d.getFullYear();
        return `${dd}-${mm}-${yyyy}`;
    }
    return value as string;
}

const employmentTypeOptions = [
    { value: "1", label: "Οργανική" },
    { value: "2", label: "Προσωποπαγής" },
    { value: "3", label: "Σε απόσπαση" },
];

export default function EmployeePositionInfo({ employeeService }: EmployeePositionInfoProps) {
    const { positions } = useValues();
    const [sheetOpen, setSheetOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const { updateEmployeePositionInfo } = useEmployee({});

    const { control, handleSubmit, reset, trigger, formState: { isValid, errors } } = useForm<PositionInfoFormSchema>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(positionInfoFormSchema) as any,
        mode: "all",
        defaultValues: {
            fek: employeeService?.fek ?? "",
            hireDate: employeeService?.hireDate ? new Date((employeeService.hireDate as unknown as string).slice(0, 10)) : undefined,
            appointmentDate: undefined,
            position: String(employeeService?.position ?? ""),
            employmentType: String(employeeService?.employmentType ?? "0"),
        }
    });

    const handleSave = handleSubmit((data) => {
        if (isSaving) return;
        setIsSaving(true);
        updateEmployeePositionInfo({
            am: Number(employeeService?.am),
            fek: data.fek,
            hireDate: data.hireDate instanceof Date ? data.hireDate.toISOString().slice(0, 10) : null,
            position: Number(data.position),
            employmentType: Number(data.employmentType),
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
                            <NotepadTextIcon className="w-4 h-4" />
                        </div>
                        Στοιχεία Τοποθέτησης
                    </CardTitle>
                    <Button variant="outline" className="hover:bg-gray-100" onClick={() => { setSheetOpen(true); trigger(); }}>
                        <PencilIcon className="w-2 h-2" />Επεξεργασία
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table className="border-collapse">
                        <TableBody>
                            <TableRow className="border-none">
                                <TableCell className="text-xs font-semibold text-black w-1/5 text-left border-none">Φ.Ε.Κ πρόσληψης:</TableCell>
                                <TableCell className="text-xs font-normal text-neutral-900 text-left border-none">{employeeService?.fek || "-"}</TableCell>
                            </TableRow>
                            <TableRow className="border-none">
                                <TableCell className="text-xs font-semibold text-black text-left border-none">Ημερομηνία πρόσληψης:</TableCell>
                                <TableCell className="text-xs font-normal text-neutral-900 text-left border-none">{formatIsoDateToDDMMYYYY(employeeService?.hireDate) == "01-01-1900" ? "-" : formatIsoDateToDDMMYYYY(employeeService?.hireDate)}</TableCell>
                            </TableRow>
                            <TableRow className="border-none">
                                <TableCell className="text-xs font-semibold text-black text-left border-none">Θέση στην Υπηρεσία:</TableCell>
                                <TableCell className="text-xs font-normal text-neutral-900 text-left border-none">{positions.find(p => p.id === employeeService?.position)?.description || "-"}</TableCell>
                            </TableRow>
                            <TableRow className="border-none">
                                <TableCell className="text-xs font-semibold text-black text-left border-none">Θέση:</TableCell>
                                <TableCell className="text-xs font-normal text-neutral-900 text-left border-none">{employmentTypeOptions.find(o => o.value === String(employeeService?.employmentType))?.label ?? "-"}</TableCell>
                            </TableRow>
                            {employeeService?.terminationDate && formatIsoDateToDDMMYYYY(employeeService?.terminationDate) !== "01-01-1900" && (
                                <TableRow className="border-none">
                                    <TableCell className="text-xs font-semibold text-black text-left border-none">Ημερομηνία διακοπής:</TableCell>
                                    <TableCell className="text-xs font-normal text-neutral-900 text-left border-none">{formatIsoDateToDDMMYYYY(employeeService?.terminationDate)}</TableCell>
                                </TableRow>
                            )}
                           
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Sheet open={sheetOpen} onOpenChange={(open) => { setSheetOpen(open); if (!open) reset(); }}>
                <SheetContent className="w-125 sm:w-150 flex flex-col bg-white" side="right">
                    <SheetHeader>
                        <SheetTitle className="text-lg font-bold p-1">Στοιχεία Τοποθέτησης</SheetTitle>
                    </SheetHeader>
                    <Separator className="bg-gray-300 -mt-5" />
                    <div className="flex-1 space-y-4 overflow-y-auto p-6 -mt-4">
                        <FormField label="Φ.Ε.Κ πρόσληψης" error={errors.fek?.message}>
                            <Controller control={control} name="fek" render={({ field }) => (
                                <Input {...field} className={`bg-white ${errors.fek ? "border-red-400" : "border-gray-200"}`} placeholder="Φ.Ε.Κ." />
                            )} />
                        </FormField>
                        <FormField label="Ορκωμοσία" error={errors.hireDate?.message as string}>
                            <Controller control={control} name="hireDate" render={({ field }) => (
                                <Input
                                    value={field.value instanceof Date ? field.value.toISOString().slice(0, 10) : ""}
                                    onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                                    onBlur={field.onBlur} name={field.name} ref={field.ref}
                                    type="date" className={`bg-white ${errors.hireDate ? "border-red-400" : "border-gray-200"}`} />
                            )} />
                        </FormField>
                        <FormField label="Θέση στην Υπηρεσία" error={errors.position?.message}>
                            <Controller control={control} name="position" render={({ field }) => (
                                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                                    <SelectTrigger className={`w-full bg-white ${errors.position ? "border-red-400" : "border-gray-200"}`}><SelectValue placeholder="Επιλέξτε θέση" /></SelectTrigger>
                                    <SelectContent position="popper" className="bg-white border border-neutral-200 outline-0 ring-0">
                                        {positions.filter(p => p.description).map(p => (
                                            <SelectItem className="hover:bg-neutral-100" key={p.id} value={String(p.id)}>{p.description}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )} />
                        </FormField>
                        <FormField label="Θέση" error={errors.employmentType?.message}>
                            <Controller control={control} name="employmentType" render={({ field }) => (
                                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                                    <SelectTrigger className={`w-full bg-white ${errors.employmentType ? "border-red-400" : "border-gray-200"}`}><SelectValue placeholder="Επιλέξτε τύπο θέσης" /></SelectTrigger>
                                    <SelectContent position="popper" className="bg-white border border-neutral-200 outline-0 ring-0">
                                        {employmentTypeOptions.map(o => (
                                            <SelectItem className="hover:bg-neutral-100" key={o.value} value={o.value}>{o.label}</SelectItem>
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
                            onClick={handleSave} disabled={!isValid || isSaving}>Αποθήκευση</Button>
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
}
