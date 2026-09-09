import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PencilIcon, SquareUserIcon, X } from "lucide-react";
import { useEmployee } from "@/lib/hooks/useEmployee";
import { toast } from "sonner";
import { personalSectionSchema, type PersonalSectionSchema } from "@/lib/schemas/employeeCardSchema";
import FormField from "@/app/shared/FormField";
import DatePickerField from "@/app/shared/DatePicker";

interface EmployeePersonalProps {
    employee?: Employee;
}

export default function EmployeePersonal({ employee }: EmployeePersonalProps) {
    const [sheetOpen, setSheetOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const { updateEmployeePersonal } = useEmployee({ id: employee?.id?.toString() });
    const personalForm = useForm<PersonalSectionSchema>({
        mode: 'onChange',
        reValidateMode: 'onChange',
        resolver: zodResolver(personalSectionSchema),
        defaultValues: {
            birthDate: employee?.birthDate?.toString().slice(0, 10) || "",
            familyStatus: employee?.familyStatus ? String(employee.familyStatus) : "",
            fatherName: employee?.fatherName || "",
            motherName: employee?.motherName || "",
            doy: employee?.doy || "",
        },
    });

    const { control, formState: { errors }, handleSubmit, reset } = personalForm;

    useEffect(() => {
        if (employee) {
            reset({
                birthDate: employee.birthDate?.toString().slice(0, 10) || "",
                familyStatus: employee.familyStatus ? String(employee.familyStatus) : "",
                fatherName: employee.fatherName || "",
                motherName: employee.motherName || "",
                doy: employee.doy || "",
            });
        }
    }, [employee, reset]);

    useEffect(() => {
        if (!sheetOpen && employee) {
            reset({
                birthDate: employee.birthDate?.toString().slice(0, 10) == "1900-01-01" ? "" : employee.birthDate?.toString().slice(0, 10),
                familyStatus: employee.familyStatus ? String(employee.familyStatus) : "",
                fatherName: employee.fatherName || "",
                motherName: employee.motherName || "",
                doy: employee.doy || "",
            });
        }
    }, [sheetOpen, employee, reset]);

    const handleSave = handleSubmit((data) => {
        if (!employee || isSaving) return;

        const updatedEmployee: EmployeePersonal = {
            am: employee.am,
            fatherName: data.fatherName,
            motherName: data.motherName,
            birthDate: data.birthDate,
            familyStatus: Number(data.familyStatus),
        };

        setIsSaving(true);
        updateEmployeePersonal(updatedEmployee, {
            onSuccess: () => {
                toast.custom((t) => (
                    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-md flex items-center justify-between gap-3 min-w-80">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm text-gray-800">Τα στοιχεία ενημερώθηκαν επιτυχώς!</span>
                        </div>
                        <button
                            onClick={() => toast.dismiss(t)}
                            className="text-gray-500 hover:text-gray-700 transition-colors"
                        >
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
                            <span className="text-sm text-gray-800">{error?.message || "Σφάλμα κατά την ενημέρωση των στοιχείων"}</span>
                        </div>
                        <button
                            onClick={() => toast.dismiss(t)}
                            className="text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ));
                setIsSaving(false);
            },
        });
    });

    function formatIsoDateToDDMMYYYY(value?: string | null) {
        if (!value) return "";
        const iso = value.toString().slice(0, 10);
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

    function filterFamilyStatus(value?: string | null) {
        switch (value) {
            case "1":
            return "Έγγαμος/η";
            case "2":
            return "Άγαμος/η"
            case "3":
            return "Διαζευγμένος/η"
            case "4":
            return "Χήρος/α";
            default:
            return "-";
        }
    }

    return (
        <>
            <Card className="bg-white">
                <CardHeader className="flex flex-row items-center justify-between pb-1">
                    <CardTitle className="text-lg flex items-center gap-2"> 
                        <div className="bg-gray-100 p-2 rounded-md flex items-center justify-center">
                            <SquareUserIcon className="w-4 h-4" />
                        </div>
                        Οικογενειακά Στοιχεία
                    </CardTitle>
                    <Button variant="outline" className="hover:bg-gray-100" onClick={() => setSheetOpen(true)}><PencilIcon className="w-2 h-2" />Επεξεργασία</Button>
                </CardHeader>
                <CardContent>
                    <Table className="border-collapse">
                        <TableBody>
                            <TableRow className="border-none">
                                <TableCell className="text-xs font-semibold text-black w-1/5 text-left border-none">Ημ. Γέννησης:</TableCell>
                                <TableCell className="text-xs font-normal text-neutral-900 text-left border-none">{formatIsoDateToDDMMYYYY(employee?.birthDate) == "01-01-1900" ? "-" : formatIsoDateToDDMMYYYY(employee?.birthDate)}</TableCell>
                            </TableRow>
                            <TableRow className="border-none">
                                <TableCell className="text-xs font-semibold text-black text-left border-none">Οικογενειακή Κατάσταση:</TableCell>
                                <TableCell className="text-xs font-normal text-neutral-900 text-left border-none">{filterFamilyStatus(employee?.familyStatus)}</TableCell>
                            </TableRow>
                            <TableRow className="border-none">
                                <TableCell className="text-xs font-semibold text-black text-left border-none">Πατρώνυμο:</TableCell>
                                <TableCell className="text-xs font-normal text-neutral-900 text-left border-none">{employee?.fatherName || "-"}</TableCell>
                            </TableRow>
                            <TableRow className="border-none">
                                <TableCell className="text-xs font-semibold text-black text-left border-none">Μητρώνυμο:</TableCell>
                                <TableCell className="text-xs font-normal text-neutral-900 text-left border-none">{employee?.motherName || "-"}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetContent className="w-125 sm:w-150 flex flex-col bg-white" side="right">
                    <SheetHeader>
                        <SheetTitle className="text-lg font-bold p-1">Οικογενειακά Στοιχεία</SheetTitle>
                    </SheetHeader>
                    <Separator className="bg-gray-300 -mt-5" />
                    <div className="flex-1 space-y-4 overflow-y-auto p-6 -mt-4">
                        <FormField label="Ημερομηνία Γέννησης" error={errors.birthDate?.message}>
                            <Controller name="birthDate" control={control}
                                render={({ field }) => (
                                    <DatePickerField
                                        value={field.value}
                                        onChange={field.onChange}
                                        error={!!errors.birthDate}
                                    />
                                )}
                            />
                        </FormField>
                        <FormField label="Οικογενειακή Κατάσταση" error={errors.familyStatus?.message}>
                            <Controller
                                name="familyStatus"
                                control={control}
                                render={({ field }) => (
                                    <Select value={field.value || ""} onValueChange={field.onChange}>
                                        <SelectTrigger className="w-full bg-white border-gray-200">
                                            <SelectValue placeholder="Επιλέξτε κατάσταση" />
                                        </SelectTrigger>
                                        <SelectContent position="popper" className="bg-white border border-neutral-200 outline-0 ring-0">
                                            <SelectItem className="hover:bg-neutral-100" value="1">{"Έγγαμος/η"}</SelectItem>
                                            <SelectItem className="hover:bg-neutral-100" value="2">{"Άγαμος/η"}</SelectItem>
                                            <SelectItem className="hover:bg-neutral-100" value="3">{"Διαζευγμένος/η"}</SelectItem>
                                            <SelectItem className="hover:bg-neutral-100" value="4">{"Χήρος/α"}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </FormField>
                        <FormField label="Πατρώνυμο" error={errors.fatherName?.message}>
                            <Controller name="fatherName" control={control}
                                render={({ field }) => (
                                    <Input value={field.value ?? ""} onChange={field.onChange} className={`w-full bg-white ${ errors.fatherName ? "border-red-400" : "border-gray-200" }`}/>
                                )}
                            />
                        </FormField>
                        <FormField label="Μητρώνυμο" error={errors.motherName?.message}>
                            <Controller name="motherName" control={control}
                                render={({ field }) => (
                                    <Input value={field.value ?? ""} onChange={field.onChange} className={`w-full bg-white ${ errors.motherName ? "border-red-400" : "border-gray-200" }`}/>
                                )}
                            />
                        </FormField>
                    </div>
                    <Separator className="bg-gray-300" />
                    <div className="flex gap-3 px-6 pb-4">
                        <Button type="button" className="flex-1 transition-all duration-200 hover:opacity-80 w-auto"
                            style={{
                                display: 'flex',
                                height: 'var(--Height-H-10, 40px)',
                                padding: 'var(--Padding-Y-py-2, 8px) var(--Padding-X-px-4, 16px)',
                                justifyContent: 'center',
                                alignItems: 'center',
                                alignSelf: 'stretch',
                                borderRadius: 'var(--Radius-Rounded-Medium, 6px)',
                                border: '1px solid var(--color-border)',
                                background: 'var(--color-ghost)',
                                color: 'var(--color-foreground)',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-ghost)'}
                            onClick={() => { setSheetOpen(false); setIsSaving(false); }}>Κλείσιμο</Button>
                        <Button className="flex-1 transition-all duration-200 hover:opacity-80 w-auto"
                            style={{
                                display: 'flex',
                                height: 'var(--Height-H-10, 40px)',
                                padding: 'var(--Padding-Y-py-2, 8px) var(--Padding-X-px-4, 16px)',
                                justifyContent: 'center',
                                alignItems: 'center',
                                alignSelf: 'stretch',
                                borderRadius: 'var(--Radius-Rounded-Medium, 6px)',
                                background: 'var(--color-primary)',
                                color: 'var(--color-primary-foreground)',
                            }}
                            disabled={isSaving}
                            onClick={handleSave}
                        >
                            Αποθήκευση
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
}
