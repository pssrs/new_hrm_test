import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GitMergeIcon, PencilIcon, X } from "lucide-react";
import { useValues } from "@/lib/hooks/useValues";
import { useEmployee } from "@/lib/hooks/useEmployee";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { worksSchema, type WorksSchema } from "@/lib/schemas/employeeServiceSchema";

interface EmployeeWorksProps {
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

export default function EmployeeWorks({ employeeService }: EmployeeWorksProps) {
    const { address, sector, department, office } = useValues();
    const [sheetOpen, setSheetOpen] = useState(false);
    const { updateEmployeeWorks } = useEmployee({});

    const { control, handleSubmit, watch, reset, trigger, formState: { isValid, errors } } = useForm<WorksSchema>({
        resolver: zodResolver(worksSchema),
        mode: "all",
        defaultValues: {
            workDirectorate: employeeService?.workDirectorate ?? 0,
            workSector: employeeService?.workSector ?? 0,
            workDepartment: employeeService?.workDepartment ?? 0,
            workOffice: employeeService?.workOffice ?? 0,
        }
    });

    const watchDirectorate = watch("workDirectorate");
    const watchSector = watch("workSector");

    const filteredSectors = sector.filter(s => s.addressId === watchDirectorate);
    const filteredDepartments = department.filter(d => d.addressId === watchDirectorate && d.sectorId === watchSector);

    const handleSave = handleSubmit((data) => {
        updateEmployeeWorks({
            am: Number(employeeService?.am),
            workDirectorate: data.workDirectorate,
            workSector: data.workSector,
            workDepartment: data.workDepartment,
            workOffice: data.workOffice,
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
                            <span className="text-sm text-gray-800">{error?.message || "Σφάλμα κατά την ενημέρωση των στοιχείων"}</span>
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
                            <GitMergeIcon className="w-4 h-4" />
                        </div>
                        Εργάζεται
                    </CardTitle>
                    <Button variant="outline" className="hover:bg-gray-100" onClick={() => { setSheetOpen(true); trigger(); }}>
                        <PencilIcon className="w-2 h-2" />Επεξεργασία
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table className="border-collapse">
                        <TableBody>
                            <TableRow className="border-none">
                                <TableCell className="text-xs font-semibold text-black w-1/5 text-left border-none">Διεύθυνση:</TableCell>
                                <TableCell className="text-xs font-normal text-neutral-900 text-left border-none">{address.find(a => a.id === employeeService?.workDirectorate)?.address_str ?? "-"}</TableCell>
                            </TableRow>
                            <TableRow className="border-none">
                                <TableCell className="text-xs font-semibold text-black text-left border-none">Τομέας:</TableCell>
                                <TableCell className="text-xs font-normal text-neutral-900 text-left border-none">{sector.find(s => s.sectorId === Number(employeeService?.workSector) && s.addressId === Number(employeeService?.workDirectorate))?.sectorName ?? "-"}</TableCell>
                            </TableRow>
                            <TableRow className="border-none">
                                <TableCell className="text-xs font-semibold text-black text-left border-none">Τμήμα:</TableCell>
                                <TableCell className="text-xs font-normal text-neutral-900 text-left border-none">{department.find(d => d.departmentId === employeeService?.workDepartment && d.sectorId === employeeService?.workSector && d.addressId === employeeService?.workDirectorate)?.departmentName ?? "-"}</TableCell>
                            </TableRow>
                            <TableRow className="border-none">
                                <TableCell className="text-xs font-semibold text-black text-left border-none">Ομάδα:</TableCell>
                                <TableCell className="text-xs font-normal text-neutral-900 text-left border-none">{office.find(o => o.departmentId === employeeService?.workOffice)?.officeName ?? "-"}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Sheet open={sheetOpen} onOpenChange={(open) => { setSheetOpen(open); if (!open) reset(); }}>
                <SheetContent className="w-125 sm:w-150 flex flex-col bg-white" side="right">
                    <SheetHeader>
                        <SheetTitle className="text-lg font-bold p-1">Τοποθέτηση Εργασίας</SheetTitle>
                    </SheetHeader>
                    <Separator className="bg-gray-300 -mt-5" />
                    <div className="flex-1 space-y-4 overflow-y-auto p-6 -mt-4">
                        <FormField label="Διεύθυνση" error={errors.workDirectorate?.message}>
                            <Controller control={control} name="workDirectorate" render={({ field }) => (
                                <Select value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
                                    <SelectTrigger className={`w-full bg-white ${errors.workDirectorate ? "border-red-400" : "border-gray-200"}`}><SelectValue placeholder="Επιλέξτε Διεύθυνση" /></SelectTrigger>
                                    <SelectContent position="popper" className="bg-white border border-neutral-200 outline-0 ring-0">
                                        {address.filter(a => a.address_str).map(a => (
                                            <SelectItem className="hover:bg-neutral-100" key={a.id} value={String(a.id)}>{a.address_str}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )} />
                        </FormField>
                        <FormField label="Τομέας" error={errors.workSector?.message}>
                            <Controller control={control} name="workSector" render={({ field }) => (
                                <Select value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
                                    <SelectTrigger className={`w-full bg-white ${errors.workSector ? "border-red-400" : "border-gray-200"}`}><SelectValue placeholder="Επιλέξτε Τομέα" /></SelectTrigger>
                                    <SelectContent position="popper" className="bg-white border border-neutral-200 outline-0 ring-0">
                                        {filteredSectors.filter(s => s.sectorName).map(s => (
                                            <SelectItem className="hover:bg-neutral-100" key={s.sectorId} value={String(s.sectorId)}>{s.sectorName}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )} />
                        </FormField>
                        <FormField label="Τμήμα" error={errors.workDepartment?.message}>
                            <Controller control={control} name="workDepartment" render={({ field }) => (
                                <Select value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
                                    <SelectTrigger className={`w-full bg-white ${errors.workDepartment ? "border-red-400" : "border-gray-200"}`}><SelectValue placeholder="Επιλέξτε Τμήμα" /></SelectTrigger>
                                    <SelectContent position="popper" className="bg-white border border-neutral-200 outline-0 ring-0">
                                        {filteredDepartments.filter(d => d.departmentName).map(d => (
                                            <SelectItem className="hover:bg-neutral-100" key={d.departmentId} value={String(d.departmentId)}>{d.departmentName}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )} />
                        </FormField>
                        <FormField label="Ομάδα" error={errors.workOffice?.message}>
                            <Controller control={control} name="workOffice" render={({ field }) => (
                                <Select value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
                                    <SelectTrigger className={`w-full bg-white ${errors.workOffice ? "border-red-400" : "border-gray-200"}`}><SelectValue placeholder="Επιλέξτε Ομάδα" /></SelectTrigger>
                                    <SelectContent position="popper" className="bg-white border border-neutral-200 outline-0 ring-0">
                                        {office.filter(o => o.officeName).map(o => (
                                            <SelectItem className="hover:bg-neutral-100" key={o.departmentId} value={String(o.departmentId)}>{o.officeName}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )} />
                        </FormField>
                    </div>
                    <Separator className="bg-gray-300" />
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
                                color: "var(--color-foreground)",
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f3f4f6"}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "var(--color-ghost)"}
                            onClick={() => setSheetOpen(false)}>Κλείσιμο</Button>
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
                                color: "var(--color-primary-foreground)",
                            }}
                            onClick={handleSave} disabled={!isValid}>Αποθήκευση</Button>
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
}
