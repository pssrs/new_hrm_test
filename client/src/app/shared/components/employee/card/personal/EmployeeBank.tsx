import { useState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { PencilIcon, UniversityIcon, X } from "lucide-react";
import { useEmployee } from "@/lib/hooks/useEmployee";
import { toast } from "sonner";
import { bankSectionSchema, type BankSectionSchema } from "@/lib/schemas/employeeCardSchema";
import FormField from "@/app/shared/FormField";

interface EmployeeBankProps {
    employee?: Employee;
}

export default function EmployeeBank({ employee }: EmployeeBankProps) {

    const [sheetOpen, setSheetOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const { updateEmployeeBank } = useEmployee({});
    const bankForm = useForm<BankSectionSchema>({
        mode: 'onChange',
        reValidateMode: 'onChange',
        resolver: zodResolver(bankSectionSchema),
        defaultValues: {
            iban1: "",
            iban2: "",
        },
    });

    const { control, formState: { errors }, handleSubmit, reset } = bankForm;

    useEffect(() => {
        if (employee) {
            reset({
                iban1: employee.iban1 || "",
                iban2: employee.iban2 || "",
            });
        }
    }, [employee, reset]);

    useEffect(() => {
        if (!sheetOpen && employee) {
            reset({
                iban1: employee.iban1 || "",
                iban2: employee.iban2 || "",
            });
        }
    }, [sheetOpen, employee, reset]);

    const handleSave = handleSubmit((data) => {
        if (!employee || isSaving) return;

        const bankData: EmployeeBank = {
            am: employee.am,
            iban1: data.iban1,
            iban2: data.iban2
        };

        setIsSaving(true);
        updateEmployeeBank(bankData, {
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

    return (
        <>
            <Card className="md:col-span-2 bg-white">
                <CardHeader className="flex flex-row items-center justify-between pb-1">
                    <CardTitle className="text-lg flex items-center gap-2"> 
                        <div className="bg-gray-100 p-2 rounded-md flex items-center justify-center">
                            <UniversityIcon className="w-4 h-4" />
                        </div>
                        Τραπεζικοί Λογαριασμοί
                    </CardTitle>
                    <Button variant="outline" className="hover:bg-gray-100" onClick={() => setSheetOpen(true)}><PencilIcon className="w-2 h-2" />Επεξεργασία</Button>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                    <Table className="border-collapse">
                        <TableBody>
                        <TableRow className="border-none">
                            <TableCell className="text-xs font-semibold text-black w-1/5 text-left border-none">ΙΒΑΝ 1:</TableCell>
                            <TableCell className="text-xs font-normal text-neutral-900 text-left  border-none">{employee?.iban1 == "" ? "-" : employee?.iban1}</TableCell>
                        </TableRow>
                        </TableBody>
                    </Table>
                    <Table className="border-collapse">
                        <TableBody>
                        <TableRow className="border-none">
                            <TableCell className="text-xs font-semibold text-black w-1/5 text-left border-none">ΙΒΑΝ 2:</TableCell>
                            <TableCell className="text-xs font-normal text-neutral-900 text-left border-none">{employee?.iban2 == "" ? "-" : employee?.iban2}</TableCell>
                        </TableRow>
                        </TableBody>
                    </Table>
                    </div>
                </CardContent>
            </Card>
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetContent className="w-125 sm:w-150 flex flex-col bg-white" side="right">
                    <SheetHeader>
                        <SheetTitle className="text-lg font-bold p-1">Τραπεζικοί Λογαριασμοί</SheetTitle>
                    </SheetHeader>
                    <Separator className="bg-gray-300 -mt-5" />
                    <div className="flex-1 space-y-4 overflow-y-auto p-6 -mt-4">
                        <FormField label="IBAN 1" error={errors.iban1?.message}>
                            <Controller name="iban1" control={control}
                                render={({ field }) => (
                                    <Input value={field.value ?? ""} onChange={field.onChange} className={`w-full bg-white ${ errors.iban1 ? "border-red-400" : "border-gray-200" }`}/>
                                )}
                            />
                        </FormField>
                        <FormField label="IBAN 2" error={errors.iban2?.message}>
                            <Controller name="iban2" control={control}
                                render={({ field }) => (
                                    <Input value={field.value ?? ""} onChange={field.onChange} className={`w-full bg-white ${ errors.iban2 ? "border-red-400" : "border-gray-200" }`}/>
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
