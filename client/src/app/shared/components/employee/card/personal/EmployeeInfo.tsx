import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PencilIcon, PhoneIcon, X } from "lucide-react";
import { useEmployee } from "@/lib/hooks/useEmployee";
import { toast } from "sonner";
import { infoSectionSchema, type InfoSectionSchema } from "@/lib/schemas/employeeCardSchema";

interface EmployeeInfoProps {
    employee?: Employee;
}

function FormField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-1.5">
            <Label className={error ? "text-destructive" : ""}>{label}</Label>
            {children}
            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    );
}

export default function EmployeeInfo({ employee }: EmployeeInfoProps) {
    const [sheetOpen, setSheetOpen] = useState(false);
    const { updateEmployeeInfo } = useEmployee({ id: employee?.id?.toString() });
    const infoForm = useForm<InfoSectionSchema>({
        mode: 'onChange',
        reValidateMode: 'onChange',
        resolver: zodResolver(infoSectionSchema),
        defaultValues: {
            address: "",
            city: "",
            postCode: "",
            phone: "",
            email: "",
        },
    });

    const { register, formState: { errors }, handleSubmit, reset } = infoForm;

    useEffect(() => {
        if (employee) {
            reset({
                address: employee.address || "",
                city: employee.city || "",
                postCode: employee.postCode || "",
                phone: employee.phone || "",
                email: employee.email || "",
            });
        }
    }, [employee, reset]);

    useEffect(() => {
        if (!sheetOpen && employee) {
            reset({
                address: employee.address || "",
                city: employee.city || "",
                postCode: employee.postCode || "",
                phone: employee.phone || "",
                email: employee.email || "",
            });
        }
    }, [sheetOpen, employee, reset]);

    const handleSave = handleSubmit((data) => {
        if (!employee) return;

        const updatedEmployee: EmployeeInfo = {
            am: employee.am,
            address: data.address,
            city: data.city,
            postCode: data.postCode,
            phone: data.phone,
            email: data.email,
        };

        updateEmployeeInfo(updatedEmployee, {
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
            },
        });
    });

    return (
        <>
            <Card className="bg-white">
                <CardHeader className="flex flex-row items-center justify-between pb-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <div className="bg-gray-100 p-2 rounded-md flex items-center justify-center">
                            <PhoneIcon className="w-4 h-4" />
                        </div>
                        Στοιχεία Επικοινωνίας
                    </CardTitle>
                    <Button variant="outline" className="hover:bg-gray-100" onClick={() => setSheetOpen(true)}><PencilIcon className="w-2 h-2" />Επεξεργασία</Button>
                </CardHeader>
                <CardContent>
                    <Table className="border-collapse">
                        <TableBody>
                            <TableRow className="border-none">
                                <TableCell className="text-xs font-semibold text-black w-1/5 text-left border-none">Διεύθυνση:</TableCell>
                                <TableCell className="text-xs font-normal text-neutral-600 text-left border-none">{employee?.address}</TableCell>
                            </TableRow>
                            <TableRow className="border-none">
                                <TableCell className="text-xs font-semibold text-black text-left border-none">Τ.Κ.:</TableCell>
                                <TableCell className="text-xs font-normal text-neutral-600 text-left border-none">{employee?.postCode}</TableCell>
                            </TableRow>
                            <TableRow className="border-none">
                                <TableCell className="text-xs font-semibold text-black text-left border-none">Πόλη:</TableCell>
                                <TableCell className="text-xs font-normal text-neutral-600 text-left border-none">{employee?.city}</TableCell>
                            </TableRow>
                            <TableRow className="border-none">
                                <TableCell className="text-xs font-semibold text-black text-left border-none">Τηλέφωνο:</TableCell>
                                <TableCell className="text-xs font-normal text-neutral-600 text-left border-none">{employee?.phone}</TableCell>
                            </TableRow>
                            <TableRow className="border-none">
                                <TableCell className="text-xs font-semibold text-black text-left border-none">Email:</TableCell>
                                <TableCell className="text-xs font-normal text-neutral-600 text-left border-none">{employee?.email}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetContent className="w-125 sm:w-150 flex flex-col bg-white" side="right">
                    <SheetHeader>
                        <SheetTitle className="text-lg font-bold p-1">Στοιχεία Επικοινωνίας</SheetTitle>
                    </SheetHeader>
                    <Separator className="bg-gray-300 -mt-5" />
                    <div className="flex-1 space-y-4 overflow-y-auto p-6 -mt-4">
                        <FormField label="Διεύθυνση" error={errors.address?.message}>
                            <Input {...register("address")} className={errors.address ? "border-destructive" : ""} />
                        </FormField>
                        <FormField label="Πόλη" error={errors.city?.message}>
                            <Input {...register("city")} className={errors.city ? "border-destructive" : ""} />
                        </FormField>
                        <FormField label="Ταχυδρομικός Κώδικας" error={errors.postCode?.message}>
                            <Input {...register("postCode")} className={errors.postCode ? "border-destructive" : ""} />
                        </FormField>
                        <FormField label="Τηλέφωνο">
                            <Input {...register("phone")} className="bg-gray-100" />
                        </FormField>
                        <FormField label="Email">
                            <Input {...register("email")} className="bg-gray-100" />
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
                            onClick={() => setSheetOpen(false)}>Κλείσιμο</Button>
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
                            onClick={handleSave}
                            disabled={!infoForm.formState.isValid}
                        >
                            Αποθήκευση
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
}
