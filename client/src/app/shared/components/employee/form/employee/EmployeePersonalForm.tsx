import FormField from "@/app/shared/FormField";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod/dist/zod.js";
import { Controller, useForm } from "react-hook-form";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { employeePersonalFormSchema, type EmployeePersonalFormData } from "@/lib/schemas/newEmployeeForm/employeePersonalFormSchema";
import type { EmployeeStepHandle } from "@/lib/types/employeeFormTypes";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Combobox, ComboboxContent, ComboboxInput, ComboboxItem, ComboboxList } from "@/components/ui/combobox";
import { FAMILY_STATUS } from "@/lib/types/constTypes";
import { useValues } from "@/lib/hooks/useValues";

type Props = {
    data: EmployeePersonalFormData;
};

const REFERENCE_WIDTH = 1600;
const MIN_SCALE = 0.6;

const EmployeePersonalForm = forwardRef<EmployeeStepHandle, Props>(function EmployeePersonalForm({ data }, ref) {

    const [scale, setScale] = useState(1);

    useEffect(() => {
        const updateScale = () => {
            const raw = Math.min(1, Math.max(MIN_SCALE, window.innerWidth / REFERENCE_WIDTH));
            const stepped = Math.round(raw * 20) / 20;
            setScale(stepped);
        };
        updateScale();
        window.addEventListener('resize', updateScale);
        return () => window.removeEventListener('resize', updateScale);
    }, []);

    const { control, trigger, getValues, formState: { errors } } = useForm<EmployeePersonalFormData>({
        resolver: zodResolver(employeePersonalFormSchema),
        defaultValues: data,
        mode: "onChange",
    });
    const { doys } = useValues();

    useImperativeHandle(ref, () => ({
        validate: async () => {
            const isValid = await trigger();
            return isValid ? getValues() : null;
        },
        getSnapshot: () => getValues(),
    }));

    return (
        <div className="mt-5 w-full grid grid-cols-1 gap-5 px-6" style={{ zoom: scale }}>
            <Card className="bg-white">
                <CardHeader className="flex flex-row items-center justify-between pb-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                        Οικογενειακά Στοιχεία
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-4">
                    <FormField label="Όνομα*" error={errors.firstName?.message}>
                        <Controller name="firstName" control={control}
                            render={({ field }) => (
                                <Input value={field.value ?? ""} onChange={field.onChange} className={`w-full bg-white ${errors.firstName ? "border-red-400" : "border-gray-200"}`} />
                            )}
                        />
                    </FormField>
                    <FormField label="Επώνυμο*" error={errors.lastName?.message}>
                        <Controller name="lastName" control={control}
                            render={({ field }) => (
                                <Input value={field.value ?? ""} onChange={field.onChange} className={`w-full bg-white ${ errors.lastName ? "border-red-400" : "border-gray-200" }`}/>
                            )}
                        />
                    </FormField>
                    <FormField label="Ημ/νια γέννησης" error={errors.birthDate?.message}>
                        <Controller name="birthDate" control={control}
                            render={({ field }) => (
                                <Input value={field.value != "1900-01-01" ? field.value : ""} onChange={field.onChange} type="date" className={`w-full bg-white ${ errors.birthDate ? "border-red-400" : "border-gray-200" }`}/>
                            )}
                        />
                    </FormField>
                    <FormField label="Όνομα πατρός"  error={errors.fatherName?.message}>
                        <Controller name="fatherName" control={control}
                            render={({ field }) => (
                                <Input value={field.value ?? ""} onChange={field.onChange} className={`w-full bg-white ${ errors.fatherName ? "border-red-400" : "border-gray-200" }`}/>
                            )}
                        />
                    </FormField>
                    <FormField label="Όνομα μητρός"  error={errors.motherName?.message}>
                        <Controller name="motherName" control={control}
                            render={({ field }) => (
                                <Input value={field.value} onChange={field.onChange} className={`w-full bg-white ${ errors.motherName ? "border-red-400" : "border-gray-200" }`}/>
                            )}
                        />
                    </FormField>
                    <FormField label="Οικογενειακή κατάσταση" error={errors.familyStatus?.message}>
                        <Controller name="familyStatus" control={control}
                            render={({ field }) => (
                                <Select value={field.value || ""} onValueChange={field.onChange}>
                                    <SelectTrigger className="w-full bg-white border-gray-200">
                                        <SelectValue placeholder="Επιλέξτε κατάσταση" />
                                    </SelectTrigger>
                                    <SelectContent position="popper" className="bg-white border border-neutral-200 outline-0 ring-0">
                                        {FAMILY_STATUS.map((status) => (
                                            <SelectItem className="hover:bg-neutral-100" key={status.value} value={status.value}>
                                                {status.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </FormField>
                </CardContent>
            </Card>
            <Card className="bg-white">
                <CardHeader className="flex flex-row items-center justify-between pb-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                        Στοιχεία Επικοινωνίας
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-4">
                    <FormField label="Οδός" error={errors.address?.message}>
                        <Controller name="address" control={control}
                            render={({ field }) => (
                                <Input value={field.value || ""} onChange={field.onChange} className={`w-full bg-white ${ errors.address ? "border-red-400" : "border-gray-200" }`}/>
                            )}
                        />
                    </FormField>
                    <FormField label="Αριθμός" error={errors.addressNumber?.message}>
                        <Controller name="addressNumber" control={control}
                            render={({ field }) => (
                                <Input value={field.value} onChange={field.onChange} className={`w-full bg-white ${ errors.addressNumber ? "border-red-400" : "border-gray-200" }`}/>
                            )}
                        />
                    </FormField>
                    <FormField label="Τ.Κ." error={errors.postCode?.message}>
                        <Controller name="postCode" control={control}
                            render={({ field }) => (
                                <Input value={field.value} onChange={field.onChange} className={`w-full bg-white ${ errors.postCode ? "border-red-400" : "border-gray-200" }`}/>
                            )}
                        />
                    </FormField>
                    <FormField label="Πόλη" error={errors.city?.message}>
                        <Controller name="city" control={control}
                            render={({ field }) => (
                                <Input value={field.value} onChange={field.onChange} className={`w-full bg-white ${ errors.city ? "border-red-400" : "border-gray-200" }`}/>
                            )}
                        />
                    </FormField>
                    <FormField label="Τηλέφωνο*" error={errors.phone?.message}>
                        <Controller name="phone" control={control}
                            render={({ field }) => (
                                <Input value={field.value} onChange={field.onChange} className={`w-full bg-white ${ errors.phone ? "border-red-400" : "border-gray-200" }`}/>
                            )}
                        />
                    </FormField>
                    <FormField label="Email*" error={errors.email?.message}>
                        <Controller name="email" control={control}
                            render={({ field }) => (
                                <Input value={field.value} onChange={field.onChange} className={`w-full bg-white ${ errors.email ? "border-red-400" : "border-gray-200" }`}/>
                            )}
                        />
                    </FormField>
                </CardContent>
            </Card>
            <Card className="bg-white">
                <CardHeader className="flex flex-row items-center justify-between pb-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                        Στοιχεία Ταυτότητας
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-4 gap-4">
                    <FormField label="Αρ. δελτίου ταυτότητας" error={errors.identityCardNumber?.message}>
                        <Controller name="identityCardNumber" control={control}
                            render={({ field }) => (
                                <Input value={field.value} onChange={field.onChange} className={`w-full bg-white ${ errors.identityCardNumber ? "border-red-400" : "border-gray-200" }`}/>
                            )}
                        />
                    </FormField>
                    <FormField label="Ημ/νια έκδοσης" error={errors.identityCardIssueDate?.message}>
                        <Controller name="identityCardIssueDate" control={control}
                            render={({ field }) => (
                                <Input value={field.value != "1900-01-01" ? field.value : ""} onChange={field.onChange} type="date" className={`w-full bg-white ${ errors.identityCardIssueDate ? "border-red-400" : "border-gray-200" }`}/>
                            )}
                        />
                    </FormField>
                    <FormField label="Υπηκοότητα" error={errors.citizenship?.message}>
                        <Controller name="citizenship" control={control}
                            render={({ field }) => (
                                <Input value={field.value} onChange={field.onChange} className={`w-full bg-white ${ errors.citizenship ? "border-red-400" : "border-gray-200" }`}/>
                            )}
                        />
                    </FormField>
                    <FormField label="Εθνικότητα" error={errors.nationality?.message}>
                        <Controller name="nationality" control={control}
                            render={({ field }) => (
                                <Input value={field.value} onChange={field.onChange} className={`w-full bg-white ${ errors.nationality ? "border-red-400" : "border-gray-200" }`}/>
                            )}
                        />
                    </FormField>
                </CardContent>
            </Card>
            <Card className="bg-white">
                <CardHeader className="flex flex-row items-center justify-between pb-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                        Φορολογικοί Αριθμοί
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-5 gap-4">
                    <FormField label="Δ.Ο.Υ." error={errors.doy?.message}>
                        <Controller name="doy" control={control}
                            render={({ field }) => {
                                const doyOptions = doys
                                    .filter((doy) => doy.description && doy.description.trim() !== "")
                                    .map((doy) => ({ value: String(doy.code), label: doy.description }));

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
                    <FormField label="ΑΦΜ*" error={errors.afm?.message}>
                        <Controller name="afm" control={control}
                            render={({ field }) => (
                                <Input value={field.value} onChange={field.onChange} className={`w-full bg-white ${errors.afm ? "border-red-400" : "border-gray-200"}`} />
                            )}
                        />
                    </FormField>
                    <FormField label="ΑΜΚΑ*" error={errors.amka?.message}>
                        <Controller name="amka" control={control}
                            render={({ field }) => (
                                <Input value={field.value} onChange={field.onChange} className={`w-full bg-white ${errors.amka ? "border-red-400" : "border-gray-200"}`} />
                            )}
                        />
                    </FormField>
                    <FormField label="ΑΜΑ*" error={errors.ama?.message}>
                        <Controller name="ama" control={control}
                            render={({ field }) => (
                                <Input value={field.value} onChange={field.onChange} className={`w-full bg-white ${errors.ama ? "border-red-400" : "border-gray-200"}`} />
                            )}
                        />
                    </FormField>
                    <FormField label="Προσωπικός Αριθμός" error={errors.personalNumber?.message}>
                        <Controller name="personalNumber" control={control}
                            render={({ field }) => (
                                <Input value={field.value} onChange={field.onChange} className={`w-full bg-white ${errors.personalNumber ? "border-red-400" : "border-gray-200"}`} />
                            )}
                        />
                    </FormField>
                </CardContent>
            </Card>
            <Card className="bg-white">
                <CardHeader className="flex flex-row items-center justify-between pb-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                        Τραπεζικοί Λογαριασμοί
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                    <FormField label="IBAN 1" error={errors.iban1?.message}>
                        <Controller name="iban1" control={control}
                            render={({ field }) => (
                                <Input value={field.value} onChange={field.onChange} className={`w-full bg-white ${errors.iban1 ? "border-red-400" : "border-gray-200"}`} />
                            )}
                        />
                    </FormField>
                    <FormField label="IBAN 2" error={errors.iban2?.message}>
                        <Controller name="iban2" control={control}
                            render={({ field }) => (
                                <Input value={field.value} onChange={field.onChange} className={`w-full bg-white ${errors.iban2 ? "border-red-400" : "border-gray-200"}`} />
                            )}
                        />
                    </FormField>
                </CardContent>
            </Card>
        </div>
    );
});

export default EmployeePersonalForm;