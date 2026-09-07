import { useState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { FolderGitIcon, PencilIcon, X } from "lucide-react";
import { useEmployee } from "@/lib/hooks/useEmployee";
import { toast } from "sonner";
import { numbersSectionSchema, type NumbersSectionSchema } from "@/lib/schemas/employeeCardSchema";
import FormField from "@/app/shared/FormField";
import { useValues } from "@/lib/hooks/useValues";
import { Combobox, ComboboxContent, ComboboxInput, ComboboxItem, ComboboxList } from "@/components/ui/combobox";

interface EmployeeNumbersProps {
    employee?: Employee;
}

export default function EmployeeNumbers({ employee }: EmployeeNumbersProps) {
    const { doys } = useValues();
    const [sheetOpen, setSheetOpen] = useState(false);
    const { updateEmployeeNumber } = useEmployee({});
    const numbersForm = useForm<NumbersSectionSchema>({
        mode: 'onChange',
        reValidateMode: 'onChange',
        resolver: zodResolver(numbersSectionSchema),
        defaultValues: {
            afm: "",
            amka: "",
            ama: "",
            personalNumber: "",
            doy: "",
        },
    });

    function filterDoyDescription(doyValue?: string | null) {
        if (!doyValue) return "";
        const doy = doys?.find((d) => d.code === Number(doyValue));
        return doy ? doy.description : "-";
    }

    const { control, formState: { errors }, handleSubmit, reset } = numbersForm;

    useEffect(() => {
        if (employee) {
            reset({
                afm: employee.afm || "",
                amka: employee.amka || "",
                ama: employee.ama || "",
                personalNumber: employee.personalNumber || "",
                doy: employee.doy || "",   // ← προστέθηκε
            });
        }
    }, [employee, reset]);

    useEffect(() => {
        if (!sheetOpen && employee) {
            reset({
                afm: employee.afm || "",
                amka: employee.amka || "",
                ama: employee.ama || "",
                personalNumber: employee.personalNumber || "",
                doy: employee.doy || "",   // ← προστέθηκε
            });
        }
    }, [sheetOpen, employee, reset]);

    const handleSave = handleSubmit((data) => {
        if (!employee) return;

        const updatedNumbers: EmployeeNumber = {
            am: employee.am,
            afm: data.afm,
            amka: data.amka,
            ama: data.ama,
            personalNumber: data.personalNumber || "",
            doy: data.doy || "",
        };

        updateEmployeeNumber(updatedNumbers, {
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
                        <FolderGitIcon className="w-4 h-4" />
                    </div>
                    Φορολογικοί Αριθμοί
                </CardTitle>
                <Button variant="outline" className="hover:bg-gray-100" onClick={() => setSheetOpen(true)} ><PencilIcon className="w-2 h-2" />Επεξεργασία</Button>
            </CardHeader>
            <CardContent>
                <Table className="border-collapse">
                    <TableBody>
                        <TableRow className="border-none">
                            <TableCell className="text-xs font-semibold text-black w-1/5 text-left border-none">ΑΦΜ:</TableCell>
                            <TableCell className="text-xs font-normal text-neutral-900 text-left border-none">{employee?.afm == "" ? "-" : employee?.afm}</TableCell>
                        </TableRow>
                        <TableRow className="border-none">
                            <TableCell className="text-xs font-semibold text-black text-left border-none">ΑΜΚΑ:</TableCell>
                            <TableCell className="text-xs font-normal text-neutral-900 text-left border-none">{employee?.amka == "" ? "-" : employee?.amka}</TableCell>
                        </TableRow>
                        <TableRow className="border-none">
                            <TableCell className="text-xs font-semibold text-black text-left border-none">ΑΜΑ:</TableCell>
                            <TableCell className="text-xs font-normal text-neutral-900 text-left border-none">{employee?.ama == "" ? "-" : employee?.ama}</TableCell>
                        </TableRow>
                        <TableRow className="border-none">
                            <TableCell className="text-xs font-semibold text-black text-left border-none">Προσωπικός Αριθμός:</TableCell>
                            <TableCell className="text-xs font-normal text-neutral-900 text-left border-none">{employee?.personalNumber == "" ? "-" : employee?.personalNumber}</TableCell>
                        </TableRow>
                        <TableRow className="border-none">
                            <TableCell className="text-xs font-semibold text-black text-left border-none">ΔΟΥ:</TableCell>
                            <TableCell className="text-xs font-normal text-neutral-900 text-left border-none">{filterDoyDescription(employee?.doy) == "" ? "-" : filterDoyDescription(employee?.doy)}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </CardContent>
        </Card>

        <Sheet open={sheetOpen} onOpenChange={setSheetOpen} modal={false}>
            <SheetContent className="w-125 sm:w-150 flex flex-col bg-white" side="right" aria-describedby={undefined}>
                <SheetHeader>
                    <SheetTitle className="text-lg font-bold p-1">Προσωπικοί Αριθμοί</SheetTitle>
                </SheetHeader>
                <Separator className="bg-gray-300 -mt-5" />
                <div className="flex-1 space-y-4 overflow-y-auto p-6 -mt-4">
                    <FormField label="ΑΦΜ" error={errors.afm?.message}>
                        <Controller name="afm" control={control}
                            render={({ field }) => (
                                <Input value={field.value ?? ""} onChange={field.onChange} className={`w-full bg-white ${ errors.afm ? "border-red-400" : "border-gray-200" }`}/>
                            )}
                        />
                    </FormField>
                    <FormField label="ΑΜΚΑ" error={errors.amka?.message}>
                        <Controller name="amka" control={control}
                            render={({ field }) => (
                                <Input value={field.value ?? ""} onChange={field.onChange} className={`w-full bg-white ${ errors.amka ? "border-red-400" : "border-gray-200" }`}/>
                            )}
                        />
                    </FormField>
                    <FormField label="ΑΜΑ" error={errors.ama?.message}>
                        <Controller name="ama" control={control}
                            render={({ field }) => (
                                <Input value={field.value ?? ""} onChange={field.onChange} className={`w-full bg-white ${ errors.ama ? "border-red-400" : "border-gray-200" }`}/>
                            )}
                        />
                    </FormField>
                    <FormField label="Προσωπικός Αριθμός" error={errors.personalNumber?.message}>
                        <Controller name="personalNumber" control={control}
                            render={({ field }) => (
                                <Input value={field.value ?? ""} onChange={field.onChange} className={`w-full bg-white ${ errors.personalNumber ? "border-red-400" : "border-gray-200" }`}/>
                            )}
                        />
                    </FormField>
                    <FormField label="ΔΟΥ" error={errors.doy?.message}>
                        <Controller
                            name="doy"
                            control={control}
                            render={({ field }) => {
                                const doyOptions = doys
                                    ?.filter((doy) => doy.description && doy.description.trim() !== "")
                                    .map((doy) => ({ value: String(doy.code), label: doy.description })) ?? [];

                                return (
                                    <Combobox
                                        items={doyOptions}
                                        value={doyOptions.find((o) => o.value === field.value) ?? null}
                                        onValueChange={(item) => field.onChange(item ? item.value : "")}
                                    >
                                        <ComboboxInput
                                            placeholder="Επιλέξτε ΔΟΥ"
                                            className={`bg-white ${errors.doy ? "border-red-400" : "border-gray-200"}`}
                                        />
                                        <ComboboxContent className="bg-white border-0 outline-0 ring-0">
                                            <ComboboxList>
                                                {(item: { value: string; label: string }) => (
                                                    <ComboboxItem key={item.value} value={item}>{item.label}</ComboboxItem>
                                                )}
                                            </ComboboxList>
                                        </ComboboxContent>
                                    </Combobox>
                                );
                            }}
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
                    >
                        Αποθήκευση
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
        </>
    )
}
