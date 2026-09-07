import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CoinsIcon, PencilIcon, X } from "lucide-react";
import { useValues } from "@/lib/hooks/useValues";
import { useEmployee } from "@/lib/hooks/useEmployee";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { mkSchema, type MkSchema } from "@/lib/schemas/employeeServiceSchema";

interface EmployeeSalaryProps {
    employeeService?: EmployeeService;
}

function FormField({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
    return (
        <div className="flex flex-col gap-1.5">
            <Label>{label}</Label>
            {children}
            {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
        </div>
    );
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

export default function EmployeeSalary({ employeeService }: EmployeeSalaryProps) {
    const { category } = useValues();
    const [sheetOpen, setSheetOpen] = useState(false);
    const { updateEmployeeSalary } = useEmployee({});

    const { control, handleSubmit, reset, trigger, formState: { errors } } = useForm<MkSchema>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(mkSchema) as any,
        mode: "all",
        defaultValues: {
            salaryCode: employeeService?.salaryCode ?? "",
            mk: String(employeeService?.mk ?? ""),
            mkDate: employeeService?.mkDate ? new Date((employeeService.mkDate as unknown as string).slice(0, 10)) : undefined,
            mkNextDate: employeeService?.mkNextDate ? new Date((employeeService.mkNextDate as unknown as string).slice(0, 10)) : undefined,
        }
    });

    const handleSave = handleSubmit((data) => {
        updateEmployeeSalary({
            am: Number(employeeService?.am),
            salaryCode: data.salaryCode ?? "",
            mk: Number(data.mk ?? "0"),
            mkDate: data.mkDate instanceof Date ? (data.mkDate.toISOString().split('T')[0] as unknown as Date) : data.mkDate,
            mkNextDate: data.mkNextDate instanceof Date ? (data.mkNextDate.toISOString().split('T')[0] as unknown as Date) : data.mkNextDate,
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
            },
        });
    });

    return (
        <>
            <Card className="bg-white">
                <CardHeader className="flex flex-row items-center justify-between pb-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <div className="bg-gray-100 p-2 rounded-md flex items-center justify-center">
                            <CoinsIcon className="w-4 h-4" />
                        </div>
                        Μισθολογικά στοιχεία
                    </CardTitle>
                    <Button variant="outline" className="hover:bg-gray-100" onClick={() => {
                        reset({
                            salaryCode: employeeService?.salaryCode ?? "",
                            mk: String(employeeService?.mk ?? ""),
                            mkDate: employeeService?.mkDate ? new Date((employeeService.mkDate as unknown as string).slice(0, 10)) : undefined,
                            mkNextDate: employeeService?.mkNextDate ? new Date((employeeService.mkNextDate as unknown as string).slice(0, 10)) : undefined,
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
                                <TableCell className="text-xs font-semibold text-black w-1/5 text-left border-none">Κωδικός μισθολογίου:</TableCell>
                                <TableCell className="text-xs font-normal text-neutral-900 text-left border-none">{category.find(c => c.code === employeeService?.salaryCode)?.description ?? "-"}</TableCell>
                            </TableRow>
                            <TableRow className="border-none">
                                <TableCell className="text-xs font-semibold text-black text-left border-none">Μισθολογικό κλιμάκιο:</TableCell>
                                <TableCell className="text-xs font-normal text-neutral-900 text-left border-none">{employeeService?.mk ?? "-"}</TableCell>
                            </TableRow>
                            <TableRow className="border-none">
                                <TableCell className="text-xs font-semibold text-black text-left border-none">Τρέχον Μ.Κ:</TableCell>
                                <TableCell className="text-xs font-normal text-neutral-900 text-left border-none">{formatIsoDateToDDMMYYYY(employeeService?.mkDate) == "01-01-1900" ? "-" : formatIsoDateToDDMMYYYY(employeeService?.mkDate)}</TableCell>
                            </TableRow>
                            <TableRow className="border-none">
                                <TableCell className="text-xs font-semibold text-black text-left border-none">Αλλαγή Μ.Κ:</TableCell>
                                <TableCell className="text-xs font-normal text-neutral-900 text-left border-none">{formatIsoDateToDDMMYYYY(employeeService?.mkNextDate) == "01-01-1900" ? "-" : formatIsoDateToDDMMYYYY(employeeService?.mkNextDate)}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Sheet open={sheetOpen} onOpenChange={(open) => { setSheetOpen(open); if (!open) reset(); }}>
                <SheetContent className="w-125 sm:w-150 flex flex-col bg-white" side="right">
                    <SheetHeader>
                        <SheetTitle className="text-lg font-bold p-1">Μισθολογικά στοιχεία</SheetTitle>
                    </SheetHeader>
                    <Separator className="bg-gray-300 -mt-5" />
                    <div className="flex-1 space-y-4 overflow-y-auto p-6 -mt-4">
                        <FormField label="Κωδικός μισθολογίου" error={errors.salaryCode?.message}>
                            <Controller control={control} name="salaryCode" render={({ field }) => (
                                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                                    <SelectTrigger className={`w-full bg-white ${errors.salaryCode ? "border-red-400" : "border-gray-200"}`}><SelectValue placeholder="Επιλέξτε κωδικό" /></SelectTrigger>
                                    <SelectContent position="popper" className="bg-white border border-neutral-200 outline-0 ring-0">
                                        {category.filter(c => c.description).map(c => (
                                            <SelectItem className="hover:bg-neutral-100" key={c.code} value={c.code}>{c.description}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )} />
                        </FormField>
                        <FormField label="Μισθολογικό κλιμάκιο" error={errors.mk?.message}>
                            <Controller control={control} name="mk" render={({ field }) => (
                                <Input {...field} value={field.value ?? ""} type="number" className={`bg-white ${errors.mk ? "border-red-400" : "border-gray-200"}`} placeholder="Μ.Κ." />
                            )} />
                        </FormField>
                        <FormField label="Τρέχον Μ.Κ" error={errors.mkDate?.message as string}>
                            <Controller control={control} name="mkDate" render={({ field }) => (
                                <Input
                                    value={field.value instanceof Date ? field.value.toISOString().slice(0, 10) : ""}
                                    onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                                    onBlur={field.onBlur} name={field.name} ref={field.ref}
                                    type="date" className={`bg-white ${errors.mkDate ? "border-red-400" : "border-gray-200"}`} />
                            )} />
                        </FormField>
                        <FormField label="Αλλαγή Μ.Κ" error={errors.mkNextDate?.message as string}>
                            <Controller control={control} name="mkNextDate" render={({ field }) => (
                                <Input
                                    value={field.value instanceof Date ? field.value.toISOString().slice(0, 10) : ""}
                                    onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                                    onBlur={field.onBlur} name={field.name} ref={field.ref}
                                    type="date" className={`bg-white ${errors.mkNextDate ? "border-red-400" : "border-gray-200"}`} />
                            )} />
                        </FormField>
                    </div>
                    <Separator className="bg-gray-300" />
                    <div className="flex gap-3 px-6 pb-4">
                        <Button type="button" className="flex-1 transition-all duration-200 hover:opacity-80 w-auto"
                            style={{ display: "flex", height: "var(--Height-H-10, 40px)", padding: "var(--Padding-Y-py-2, 8px) var(--Padding-X-px-4, 16px)", justifyContent: "center", alignItems: "center", alignSelf: "stretch", borderRadius: "var(--Radius-Rounded-Medium, 6px)", border: "1px solid var(--color-border)", background: "var(--color-ghost)", color: "var(--color-foreground)" }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f3f4f6"}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "var(--color-ghost)"}
                            onClick={() => setSheetOpen(false)}>Κλείσιμο</Button>
                        <Button className="flex-1 transition-all duration-200 hover:opacity-80 w-auto"
                            style={{ display: "flex", height: "var(--Height-H-10, 40px)", padding: "var(--Padding-Y-py-2, 8px) var(--Padding-X-px-4, 16px)", justifyContent: "center", alignItems: "center", alignSelf: "stretch", borderRadius: "var(--Radius-Rounded-Medium, 6px)", background: "var(--color-primary)", color: "var(--color-primary-foreground)" }}
                            onClick={handleSave}>Αποθήκευση</Button>
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
}
