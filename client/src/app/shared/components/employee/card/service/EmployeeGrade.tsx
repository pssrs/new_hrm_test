import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BringToFrontIcon, PencilIcon, X } from "lucide-react";
import { useValues } from "@/lib/hooks/useValues";
import { useEmployee } from "@/lib/hooks/useEmployee";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { rankSchema, type RankSchema } from "@/lib/schemas/employeeServiceSchema";
import FormField from "@/app/shared/FormField";

interface EmployeeGradeProps {
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

export default function EmployeeGrade({ employeeService }: EmployeeGradeProps) {
    const { grade } = useValues();
    const [sheetOpen, setSheetOpen] = useState(false);
    const { updateEmployeeGrade } = useEmployee({});

    const { control, handleSubmit, reset, trigger, formState: { isValid, errors } } = useForm<RankSchema>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(rankSchema) as any,
        mode: "all",
        defaultValues: {
            rank: employeeService?.rank ?? "",
            gradeFek: employeeService?.gradeFek ?? "",
            rankDate: employeeService?.rankDate ? new Date((employeeService.rankDate as unknown as string).slice(0, 10)) : undefined,
            rankNextDate: employeeService?.rankNextDate ? new Date((employeeService.rankNextDate as unknown as string).slice(0, 10)) : undefined,
        }
    });

    const handleSave = handleSubmit((data) => {
        updateEmployeeGrade({
            am: Number(employeeService?.am),
            rank: data.rank ?? "",
            gradeFek: data.gradeFek ?? "",
            rankDate: data.rankDate instanceof Date ? (data.rankDate.toISOString().slice(0, 10) as unknown as Date) : data.rankDate,
            rankNextDate: data.rankNextDate instanceof Date ? (data.rankNextDate.toISOString().slice(0, 10) as unknown as Date) : data.rankNextDate,
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
                            <BringToFrontIcon className="w-4 h-4" />
                        </div>
                        Βαθμολογικά στοιχεία
                    </CardTitle>
                    <Button variant="outline" className="hover:bg-gray-100" onClick={() => {
                        reset({
                            rank: employeeService?.rank ?? "",
                            gradeFek: employeeService?.gradeFek ?? "",
                            rankDate: employeeService?.rankDate ? new Date((employeeService.rankDate as unknown as string).slice(0, 10)) : undefined,
                            rankNextDate: employeeService?.rankNextDate ? new Date((employeeService.rankNextDate as unknown as string).slice(0, 10)) : undefined,
                        });
                        setSheetOpen(true);
                        trigger();
                    }}>
                        <PencilIcon className="w-2 h-2" />Επεξεργασία
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table className="border-collapse">
                        <TableBody>
                            <TableRow className="border-none">
                                <TableCell className="text-xs font-semibold text-black w-1/5 text-left border-none">Βαθμός:</TableCell>
                                <TableCell className="text-xs font-normal text-neutral-900 text-left border-none">{grade.find(g => g.code.toString() === employeeService?.rank)?.description ?? "-"}</TableCell>
                            </TableRow>
                            <TableRow className="border-none">
                                <TableCell className="text-xs font-semibold text-black text-left border-none">Τρέχον βαθμός:</TableCell>
                                <TableCell className="text-xs font-normal text-neutral-900 text-left border-none">{formatIsoDateToDDMMYYYY(employeeService?.rankDate) == "01-01-1900" ? "-" : formatIsoDateToDDMMYYYY(employeeService?.rankDate)}</TableCell>
                            </TableRow>
                            <TableRow className="border-none">
                                <TableCell className="text-xs font-semibold text-black text-left border-none">Αλλαγή βαθμού:</TableCell>
                                <TableCell className="text-xs font-normal text-neutral-900 text-left border-none">{formatIsoDateToDDMMYYYY(employeeService?.rankNextDate) == "01-01-1900" ? "-" : formatIsoDateToDDMMYYYY(employeeService?.rankNextDate)}</TableCell>
                            </TableRow>
                            <TableRow className="border-none">
                                <TableCell className="text-xs font-semibold text-black text-left border-none">Φ.Ε.Κ.:</TableCell>
                                <TableCell className="text-xs font-normal text-neutral-900 text-left border-none">{employeeService?.gradeFek == "" ? "-" : employeeService?.gradeFek}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Sheet open={sheetOpen} onOpenChange={(open) => { setSheetOpen(open); if (!open) reset(); }}>
                <SheetContent className="w-125 sm:w-150 flex flex-col bg-white" side="right">
                    <SheetHeader>
                        <SheetTitle className="text-lg font-bold p-1">Βαθμολογικά στοιχεία</SheetTitle>
                    </SheetHeader>
                    <Separator className="bg-gray-300 -mt-5" />
                    <div className="flex-1 space-y-4 overflow-y-auto p-6 -mt-4">
                        <FormField label="Βαθμός" error={errors.rank?.message}>
                            <Controller control={control} name="rank" render={({ field }) => (
                                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                                    <SelectTrigger className={`w-full bg-white ${errors.rank ? "border-red-400" : "border-gray-200"}`}><SelectValue placeholder="Επιλέξτε Βαθμό" /></SelectTrigger>
                                    <SelectContent position="popper" className="bg-white border border-neutral-200 outline-0 ring-0">
                                        {grade.filter(g => g.description).map(g => (
                                            <SelectItem className="hover:bg-neutral-100" key={g.code} value={String(g.code)}>{g.description}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )} />
                        </FormField>
                        <FormField label="Φ.Ε.Κ. Βαθμού" error={errors.gradeFek?.message}>
                            <Controller control={control} name="gradeFek" render={({ field }) => (
                                <Input {...field} value={field.value ?? ""} className={`bg-white ${errors.gradeFek ? "border-red-400" : "border-gray-200"}`} placeholder="Φ.Ε.Κ. Βαθμού" />
                            )} />
                        </FormField>
                        <FormField label="Τρέχον βαθμός" error={errors.rankDate?.message as string}>
                            <Controller control={control} name="rankDate" render={({ field }) => (
                                <Input
                                    value={field.value instanceof Date ? field.value.toISOString().slice(0, 10) : ""}
                                    onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                                    onBlur={field.onBlur} name={field.name} ref={field.ref}
                                    type="date" className={`bg-white ${errors.rankDate ? "border-red-400" : "border-gray-200"}`} />
                            )} />
                        </FormField>
                        <FormField label="Αλλαγή βαθμού" error={errors.rankNextDate?.message as string}>
                            <Controller control={control} name="rankNextDate" render={({ field }) => (
                                <Input
                                    value={field.value instanceof Date ? field.value.toISOString().slice(0, 10) : ""}
                                    onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                                    onBlur={field.onBlur} name={field.name} ref={field.ref}
                                    type="date" className={`bg-white ${errors.rankNextDate ? "border-red-400" : "border-gray-200"}`} />
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
                            onClick={handleSave} disabled={!isValid}>Αποθήκευση</Button>
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
}
