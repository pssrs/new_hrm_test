import { useState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { IdCardIcon, PencilIcon, X } from "lucide-react";
import { useEmployee } from "@/lib/hooks/useEmployee";
import { toast } from "sonner";
import { identitySectionSchema, type IdentitySectionSchema } from "@/lib/schemas/employeeCardSchema";
import FormField from "@/app/shared/FormField";

interface EmployeeIdentityProps {
    employee?: Employee;
}

export default function EmployeeIdentity({ employee }: EmployeeIdentityProps) {
    const [sheetOpen, setSheetOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const { updateEmployeeIdentity } = useEmployee({ id: employee?.id?.toString() });
    const identityForm = useForm<IdentitySectionSchema>({
        mode: 'onChange',
        reValidateMode: 'onChange',
        resolver: zodResolver(identitySectionSchema),
        defaultValues: {
            citizenship: "",
            nationality: "",
            identityCardNumber: "",
            identityCardIssueDate: "",
        },
    });

    const { control, formState: { errors }, handleSubmit, reset } = identityForm;

    useEffect(() => {
        if (employee) {
            reset({
                citizenship: employee.citizenship || "",
                nationality: employee.nationality || "",
                identityCardNumber: employee.identityCardNumber || "",
                identityCardIssueDate: employee.identityCardIssueDate?.toString().slice(0, 10) || "",
            });
        }
    }, [employee, reset]);

    useEffect(() => {
        if (!sheetOpen && employee) {
            reset({
                citizenship: employee.citizenship || "",
                nationality: employee.nationality || "",
                identityCardNumber: employee.identityCardNumber || "",
                identityCardIssueDate: employee.identityCardIssueDate?.toString().slice(0, 10) || "",
            });
        }
    }, [sheetOpen, employee, reset]);

    const handleSave = handleSubmit((data) => {
        if (!employee || isSaving) return;

        const updatedIdentity: EmployeeIdentity = {
            am: employee.am,
            citizenship: data.citizenship,
            nationality: data.nationality,
            identityCardNumber: data.identityCardNumber,
            identityCardIssueDate: data.identityCardIssueDate,
        };

        setIsSaving(true);
        updateEmployeeIdentity(updatedIdentity, {
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
        if(value.toString() == "01-01-1900") return "";
        return value as string;
    }

    return (
        <>
            <Card className="bg-white">
                <CardHeader className="flex flex-row items-center justify-between pb-1">
                    <CardTitle className="text-lg flex items-center gap-2"> 
                        <div className="bg-gray-100 p-2 rounded-md flex items-center justify-center">
                            <IdCardIcon className="w-4 h-4" />
                        </div>
                        Στοιχεία Ταυτότητας
                    </CardTitle>
                    <Button variant="outline" className="hover:bg-gray-100" onClick={() => setSheetOpen(true)}><PencilIcon className="w-2 h-2" />Επεξεργασία</Button>
                </CardHeader>
                <CardContent>
                    <Table className="border-collapse">
                        <TableBody>
                            <TableRow className="border-none">
                                <TableCell className="text-xs font-semibold text-black w-1/5 text-left border-none">ΑΔΤ:</TableCell>
                                <TableCell className="text-xs font-normal text-neutral-900 text-left border-none">{employee?.identityCardNumber == "" ? "-" : employee?.identityCardNumber}</TableCell>
                            </TableRow>
                            <TableRow className="border-none">
                                <TableCell className="text-xs font-semibold text-black text-left border-none">Ημ/νια Έκδοσης:</TableCell>
                                <TableCell className="text-xs font-normal text-neutral-900 text-left border-none">{formatIsoDateToDDMMYYYY(employee?.identityCardIssueDate) == "01-01-1900" ? "-" : formatIsoDateToDDMMYYYY(employee?.identityCardIssueDate)}</TableCell>
                            </TableRow>
                            <TableRow className="border-none">
                                <TableCell className="text-xs font-semibold text-black text-left border-none">Υπηκοότητα:</TableCell>
                                <TableCell className="text-xs font-normal text-neutral-900 text-left border-none">{employee?.citizenship == "" ? "-" : employee?.citizenship}</TableCell>
                            </TableRow>
                            <TableRow className="border-none">
                                <TableCell className="text-xs font-semibold text-black text-left border-none">Εθνικότητα:</TableCell>
                                <TableCell className="text-xs font-normal text-neutral-900 text-left border-none">{employee?.nationality == "" ? "-" : employee?.nationality}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetContent className="w-125 sm:w-150 flex flex-col bg-white" side="right">
                    <SheetHeader>
                        <SheetTitle className="text-lg font-bold p-1">Στοιχείων Ταυτότητας</SheetTitle>
                    </SheetHeader>
                    <Separator className="bg-gray-300 -mt-5" />
                    <div className="flex-1 space-y-4 overflow-y-auto p-6 -mt-4">
                        <FormField label="Αριθμός Δελτίου" error={errors.identityCardNumber?.message}>
                            <Controller name="identityCardNumber" control={control}
                                render={({ field }) => (
                                    <Input value={field.value ?? ""} onChange={field.onChange} className={`w-full bg-white ${ errors.identityCardNumber ? "border-red-400" : "border-gray-200" }`}/>
                                )}
                            />
                        </FormField>
                        <FormField label="Ημερομηνία Έκδοσης" error={errors.identityCardIssueDate?.message}>
                            <Controller name="identityCardIssueDate" control={control}
                                render={({ field }) => (
                                    <Input value={field.value == "01/01/1900" ? field.value : ""} onChange={field.onChange} type="date" className={`w-full bg-white ${ errors.identityCardIssueDate ? "border-red-400" : "border-gray-200" }`}/>
                                )}
                            />
                        </FormField>
                        <FormField label="Υπηκοότητα" error={errors.citizenship?.message}>
                            <Controller name="citizenship" control={control}
                                render={({ field }) => (
                                    <Input value={field.value ?? ""} onChange={field.onChange} type="text" className={`w-full bg-white ${ errors.citizenship ? "border-red-400" : "border-gray-200" }`}/>
                                )}
                            />
                        </FormField>
                        <FormField label="Εθνικότητα" error={errors.nationality?.message}>
                            <Controller name="nationality" control={control}
                                render={({ field }) => (
                                    <Input value={field.value ?? ""} onChange={field.onChange} type="text" className={`w-full bg-white ${ errors.nationality ? "border-red-400" : "border-gray-200" }`}/>
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
    )
}
