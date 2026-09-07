import FormField from '@/app/shared/FormField'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useValues } from '@/lib/hooks/useValues';
import { employeeServiceFormSchema, type EmployeeServiceFormData  } from '@/lib/schemas/newEmployeeForm/employeeServiceFormSchema';
import { CATEGORY_OPTIONS, EMPLOYEMENT_TYPE_OPTIONS, WORK_RELATION_OPTIONS } from '@/lib/types/constTypes';
import type { EmployeeStepHandle } from '@/lib/types/employeeFormTypes';
import { zodResolver } from '@hookform/resolvers/zod';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

type Props = {
    data: EmployeeServiceFormData;
};

const CATEGORY_PREFIXES = ["πε", "τε", "δε", "υε"];

const REFERENCE_WIDTH = 1600;
const MIN_SCALE = 0.6;

const EmployeeServiceForm = forwardRef<EmployeeStepHandle, Props>(function EmployeeServiceForm({ data }, ref) {
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

    const { kladoi, eidikothtes, positions, address, sector, department, office, category, grade } = useValues();
    const { control, trigger, getValues, watch, setValue, formState: { errors } } = useForm<EmployeeServiceFormData>({
        resolver: zodResolver(employeeServiceFormSchema),
        defaultValues: data,
        mode: "onChange",
    });

    const selectedCategory = watch("category");
    const selectedBranch = watch("branch");
    const selectedSpecialty = watch("specialty");

    const handleCategoryChange = (v: string, onChange: (v: string) => void) => {
        onChange(v);
        if (v !== selectedCategory) {
            setValue("specialty", "");
        }
    };

    const categoryLabel = CATEGORY_OPTIONS.find(o => o.value === selectedCategory)?.label ?? "";
    const normalizedCategory = selectedCategory?.toLowerCase() ?? "";
    const normalizedLabel = categoryLabel.toLowerCase();

    const matchesCategory = (code?: string) => {
        if (!normalizedCategory) return true;
        const normalizedCode = (code ?? "").toLowerCase();
        return normalizedCode.startsWith(normalizedCategory) || (normalizedLabel && normalizedCode.startsWith(normalizedLabel));
    };

    const baseKladoi = kladoi.filter(k => k.description).filter(k => matchesCategory(k.code));
    const selectedKlados = selectedBranch ? kladoi.find(k => k.code === selectedBranch) : undefined;
    const filteredKladoi = selectedKlados && !baseKladoi.some(k => k.code === selectedBranch)
        ? [selectedKlados, ...baseKladoi]
        : baseKladoi;

    const matchesCategoryByDescription = (text?: string) => {
        if (!normalizedCategory && !normalizedLabel) return true;
        const t = (text ?? "").trim().toLowerCase();
        return (normalizedLabel && t.startsWith(normalizedLabel + " ")) || t.startsWith(normalizedCategory + " ");
    };

    const hasNoCategoryPrefix = (text?: string) => {
        const t = (text ?? "").trim().toLowerCase();
        return !CATEGORY_PREFIXES.some(p => t.startsWith(p + " "));
    };

    const baseEidikothtes = eidikothtes
        .filter(e => e.description)
        .filter(e => matchesCategoryByDescription(e.description) || hasNoCategoryPrefix(e.description));

    const selectedEid = selectedSpecialty ? eidikothtes.find(e => e.code === selectedSpecialty) : undefined;
    const filteredEidikothtes = selectedEid && !baseEidikothtes.some(e => e.code === selectedSpecialty)
        ? [selectedEid, ...baseEidikothtes]
        : baseEidikothtes;

    const watchWorksDirectorate = watch("worksDirectorate");
    const watchWorksSector = watch("worksSector");
    const filteredWorksSectors = sector.filter(s => s.addressId === watchWorksDirectorate);
    const filteredWorksDepartments = department.filter(d => d.addressId === watchWorksDirectorate && d.sectorId === watchWorksSector);
    const watchDirectorate = watch("directorate");
    const watchSector = watch("sector");
    const filteredSectors = sector.filter(s => s.addressId === watchDirectorate);
    const filteredDepartments = department.filter(d => d.addressId === watchDirectorate && d.sectorId === watchSector);

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
                        Πληροφορίες θέσης
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-4">
                    <FormField label="Εργασιακή σχέση*" error={errors.workRelation?.message}>
                        <Controller control={control} name="workRelation" render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger className={`w-full bg-white ${errors.workRelation ? "border-red-400" : "border-gray-200"}`}><SelectValue placeholder="Επιλέξτε εργασιακή σχέση" /></SelectTrigger>
                                <SelectContent position="popper" className="bg-white border border-neutral-200 outline-0 ring-0">
                                    {WORK_RELATION_OPTIONS.map(o => (
                                        <SelectItem className="hover:bg-neutral-100" key={o.value} value={o.value}>{o.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )} />
                    </FormField>
                    <FormField label="Κατηγορία*" error={errors.category?.message}>
                        <Controller name="category" control={control}
                            render={({ field }) => (
                                <Select value={field.value} onValueChange={(v) => handleCategoryChange(v, field.onChange)}>
                                    <SelectTrigger className={`w-full bg-white ${errors.category ? "border-red-400" : "border-gray-200"}`}><SelectValue placeholder="Επιλέξτε κατηγορία" /></SelectTrigger>
                                    <SelectContent position="popper" className="bg-white border border-neutral-200 outline-0 ring-0">
                                        {CATEGORY_OPTIONS.map(o => (
                                            <SelectItem className="hover:bg-neutral-100" key={o.value} value={o.value}>{o.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </FormField>
                    <FormField label="Ειδικότητα*" error={errors.specialty?.message}>
                        <Controller name="specialty" control={control}
                            render={({ field }) => (
                                <Select
                                    key={`specialty-${selectedCategory ?? 'none'}`}
                                    value={field.value || undefined}
                                    onValueChange={field.onChange}
                                >
                                    <SelectTrigger className={`w-full bg-white ${errors.specialty ? "border-red-400" : "border-gray-200"}`}>
                                        <SelectValue placeholder="Επιλέξτε ειδικότητα" />
                                    </SelectTrigger>
                                    <SelectContent position="popper" className="bg-white border border-neutral-200 outline-0 ring-0">
                                        {filteredEidikothtes.map(e => (
                                            <SelectItem className="hover:bg-neutral-100" key={e.code} value={e.code}>{e.description}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </FormField>
                    <FormField label="Κλάδος*" error={errors.branch?.message}>
                        <Controller name="branch" control={control}
                            render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger className={`w-full bg-white ${errors.branch ? "border-red-400" : "border-gray-200"}`}><SelectValue placeholder="Επιλέξτε κλάδο" /></SelectTrigger>
                                    <SelectContent position="popper" className="bg-white border border-neutral-200 outline-0 ring-0"> 
                                        {filteredKladoi.map(o => (
                                            <SelectItem className="hover:bg-neutral-100" key={o.code} value={o.code}>{o.description}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </FormField>
                    <FormField label="Θέση στην υπηρεσία*" error={errors.position?.message}>
                        <Controller name="position" control={control}
                            render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger className={`w-full bg-white ${errors.branch ? "border-red-400" : "border-gray-200"}`}><SelectValue placeholder="Επιλέξτε κλάδο" /></SelectTrigger>
                                    <SelectContent position="popper" className="bg-white border border-neutral-200 outline-0 ring-0">
                                        {positions.map(o => (
                                            <SelectItem className="hover:bg-neutral-100" key={o.id} value={o.id.toString()}>{o.description}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </FormField>
                    <FormField label="Θέση*" error={errors.employmentType?.message}>
                        <Controller name="employmentType" control={control}
                            render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger className={`w-full bg-white ${errors.branch ? "border-red-400" : "border-gray-200"}`}><SelectValue placeholder="Επιλέξτε κλάδο" /></SelectTrigger>
                                    <SelectContent position="popper" className="bg-white border border-neutral-200 outline-0 ring-0">
                                        {EMPLOYEMENT_TYPE_OPTIONS.map(o => (
                                            <SelectItem className="hover:bg-neutral-100" key={o.value} value={o.value}>{o.label}</SelectItem>
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
                        Στοιχεία πρόσληψης
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                    <FormField label="Ημ/νια πρόσληψης*" error={errors.hireDate?.message}>
                        <Controller name="hireDate" control={control}
                            render={({ field }) => (
                                <Input value={field.value != "1900-01-01" ? field.value : ""} type='date' onChange={field.onChange} className={`w-full bg-white ${errors.hireDate ? "border-red-400" : "border-gray-200"}`} />
                            )}
                        />
                    </FormField>
                    <FormField label="Φ.Ε.Κ. πρόσληψης" error={errors.fek?.message}>
                        <Controller name="fek" control={control}
                            render={({ field }) => (
                                <Input value={field.value} onChange={field.onChange} className={`w-full bg-white ${errors.fek ? "border-red-400" : "border-gray-200"}`} />
                            )}
                        />
                    </FormField>
                </CardContent>
            </Card>
            <Card className="bg-white">
                <CardHeader className="flex flex-row items-center justify-between pb-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                        Μισθολογικά στοιχεία
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-4 gap-4">
                    <FormField label="Κωδικός μισθολογίου*" error={errors.salaryCode?.message}>
                        <Controller name="salaryCode" control={control}
                            render={({ field }) => (
                                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                                    <SelectTrigger className={`w-full bg-white ${errors.salaryCode ? "border-red-400" : "border-gray-200"}`}><SelectValue placeholder="Επιλέξτε κωδικό" /></SelectTrigger>
                                    <SelectContent position="popper" className="bg-white border border-neutral-200 outline-0 ring-0">
                                        {category.filter(c => c.description).map(c => (
                                            <SelectItem className="hover:bg-neutral-100" key={c.code} value={c.code}>{c.description}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </FormField>
                    <FormField label="Μισθολογικό κλιμάκιο" error={errors.mk?.message}>
                        <Controller name="mk" control={control}
                            render={({ field }) => (
                                <Input value={field.value} type='number' onChange={field.onChange} className={`w-full bg-white ${errors.mk ? "border-red-400" : "border-gray-200"}`} />
                            )}
                        />
                    </FormField>
                    <FormField label="Ημ/νια τρέχοντος κλιμακίου" error={errors.mkDate?.message}>
                        <Controller name="mkDate" control={control}
                            render={({ field }) => (
                                <Input value={field.value != "1900-01-01" ? field.value : ""} type='date' onChange={field.onChange} className={`w-full bg-white ${errors.mkDate ? "border-red-400" : "border-gray-200"}`} />
                            )}
                        />
                    </FormField>
                    <FormField label="Ημ/νια αλλαγής κλιμακίου" error={errors.mkNextDate?.message}>
                        <Controller name="mkNextDate" control={control}
                            render={({ field }) => (
                                <Input value={field.value != "1900-01-01" ? field.value : ""} type='date' onChange={field.onChange} className={`w-full bg-white ${errors.mkNextDate ? "border-red-400" : "border-gray-200"}`} />
                            )}
                        />
                    </FormField>
                </CardContent>
            </Card>
            <Card className="bg-white">
                <CardHeader className="flex flex-row items-center justify-between pb-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                        Βαθμολογικά στοιχεία
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-4 gap-4">
                    <FormField label="Βαθμός" error={errors.rank?.message}>
                        <Controller name="rank" control={control}
                            render={({ field }) => (
                                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                                    <SelectTrigger className={`w-full bg-white ${errors.rank ? "border-red-400" : "border-gray-200"}`}><SelectValue placeholder="Επιλέξτε Βαθμό" /></SelectTrigger>
                                    <SelectContent position="popper" className="bg-white border border-neutral-200 outline-0 ring-0">
                                        {grade.filter(g => g.description).map(g => (
                                            <SelectItem className="hover:bg-neutral-100" key={g.code} value={String(g.code)}>{g.description}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </FormField>
                    <FormField label="Ημ/νια τρέχοντος βαθμού" error={errors.rankDate?.message}>
                        <Controller name="rankDate" control={control}
                            render={({ field }) => (
                                <Input value={field.value != "1900-01-01" ? field.value : ""} type='date' onChange={field.onChange} className={`w-full bg-white ${errors.rankDate ? "border-red-400" : "border-gray-200"}`} />
                            )}
                        />
                    </FormField>
                    <FormField label="Ημ/νια αλλαγής βαθμού" error={errors.rankNextDate?.message}>
                        <Controller name="rankNextDate" control={control}
                            render={({ field }) => (
                                <Input value={field.value != "1900-01-01" ? field.value : ""} type='date' onChange={field.onChange} className={`w-full bg-white ${errors.rankNextDate ? "border-red-400" : "border-gray-200"}`} />
                            )}
                        />
                    </FormField>
                    <FormField label="Φ.Ε.Κ." error={errors.gradeFek?.message}>
                        <Controller name="gradeFek" control={control}
                            render={({ field }) => (
                                <Input value={field.value} onChange={field.onChange} className={`w-full bg-white ${errors.gradeFek ? "border-red-400" : "border-gray-200"}`} />
                            )}
                        />
                    </FormField>
                </CardContent>
            </Card>
            <Card className="bg-white">
                <CardHeader className="flex flex-row items-center justify-between pb-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                        Ανήκει
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-4 gap-4">
                    <FormField label="Διεύθυνση" error={errors.directorate?.message}>
                        <Controller control={control} name="directorate" render={({ field }) => (
                            <Select value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
                                <SelectTrigger className={`w-full bg-white ${errors.directorate ? "border-red-400" : "border-gray-200"}`}><SelectValue placeholder="Επιλέξτε Διεύθυνση" /></SelectTrigger>
                                <SelectContent position="popper" className="bg-white border border-neutral-200 outline-0 ring-0">
                                    {address.filter(a => a.address_str).map(a => (
                                        <SelectItem className="hover:bg-neutral-100" key={a.id} value={String(a.id)}>{a.address_str}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )} />
                    </FormField>
                    <FormField label="Τομέας" error={errors.sector?.message}>
                        <Controller control={control} name="sector" render={({ field }) => (
                            <Select value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
                                <SelectTrigger className={`w-full bg-white ${errors.sector ? "border-red-400" : "border-gray-200"}`}><SelectValue placeholder="Επιλέξτε Τομέα" /></SelectTrigger>
                                <SelectContent position="popper" className="bg-white border border-neutral-200 outline-0 ring-0">
                                    {filteredSectors.filter(s => s.sectorName).map(s => (
                                        <SelectItem className="hover:bg-neutral-100" key={s.sectorId} value={String(s.sectorId)}>{s.sectorName}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )} />
                    </FormField>
                    <FormField label="Τμήμα" error={errors.department?.message}>
                        <Controller control={control} name="department" render={({ field }) => (
                            <Select value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
                                <SelectTrigger className={`w-full bg-white ${errors.department ? "border-red-400" : "border-gray-200"}`}><SelectValue placeholder="Επιλέξτε Τμήμα" /></SelectTrigger>
                                <SelectContent position="popper" className="bg-white border border-neutral-200 outline-0 ring-0">
                                    {filteredDepartments.filter(d => d.departmentName).map(d => (
                                        <SelectItem className="hover:bg-neutral-100" key={d.departmentId} value={String(d.departmentId)}>{d.departmentName}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )} />
                    </FormField>
                    <FormField label="Ομάδα" error={errors.office?.message}>
                        <Controller control={control} name="office" render={({ field }) => (
                            <Select value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
                                <SelectTrigger className={`w-full bg-white ${errors.office ? "border-red-400" : "border-gray-200"}`}><SelectValue placeholder="Επιλέξτε Ομάδα" /></SelectTrigger>
                                <SelectContent position="popper" className="bg-white border border-neutral-200 outline-0 ring-0">
                                    {office.filter(o => o.officeName).map(o => (
                                        <SelectItem className="hover:bg-neutral-100" key={o.departmentId} value={String(o.departmentId)}>{o.officeName}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )} />
                    </FormField>
                </CardContent>
            </Card>
            <Card className="bg-white">
                <CardHeader className="flex flex-row items-center justify-between pb-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                        Δουλεύει
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-4 gap-4">
                    <FormField label="Διεύθυνση" error={errors.worksDirectorate?.message}>
                        <Controller control={control} name="worksDirectorate" render={({ field }) => (
                            <Select value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
                                <SelectTrigger className={`w-full bg-white ${errors.worksDirectorate ? "border-red-400" : "border-gray-200"}`}><SelectValue placeholder="Επιλέξτε Διεύθυνση" /></SelectTrigger>
                                <SelectContent position="popper" className="bg-white border border-neutral-200 outline-0 ring-0">
                                    {address.filter(a => a.address_str).map(a => (
                                        <SelectItem className="hover:bg-neutral-100" key={a.id} value={String(a.id)}>{a.address_str}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )} />
                    </FormField>
                    <FormField label="Τομέας" error={errors.worksSector?.message}>
                        <Controller control={control} name="worksSector" render={({ field }) => (
                            <Select value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
                                <SelectTrigger className={`w-full bg-white ${errors.worksSector ? "border-red-400" : "border-gray-200"}`}><SelectValue placeholder="Επιλέξτε Τομέα" /></SelectTrigger>
                                <SelectContent position="popper" className="bg-white border border-neutral-200 outline-0 ring-0">
                                    {filteredWorksSectors.filter(s => s.sectorName).map(s => (
                                        <SelectItem className="hover:bg-neutral-100" key={s.sectorId} value={String(s.sectorId)}>{s.sectorName}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )} />
                    </FormField>
                    <FormField label="Τμήμα" error={errors.worksDepartment?.message}>
                        <Controller control={control} name="worksDepartment" render={({ field }) => (
                            <Select value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
                                <SelectTrigger className={`w-full bg-white ${errors.worksDepartment ? "border-red-400" : "border-gray-200"}`}><SelectValue placeholder="Επιλέξτε Τμήμα" /></SelectTrigger>
                                <SelectContent position="popper" className="bg-white border border-neutral-200 outline-0 ring-0">
                                    {filteredWorksDepartments.filter(d => d.departmentName).map(d => (
                                        <SelectItem className="hover:bg-neutral-100" key={d.departmentId} value={String(d.departmentId)}>{d.departmentName}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )} />
                    </FormField>
                    <FormField label="Ομάδα" error={errors.worksOffice?.message}>
                        <Controller control={control} name="worksOffice" render={({ field }) => (
                            <Select value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
                                <SelectTrigger className={`w-full bg-white ${errors.worksOffice ? "border-red-400" : "border-gray-200"}`}><SelectValue placeholder="Επιλέξτε Ομάδα" /></SelectTrigger>
                                <SelectContent position="popper" className="bg-white border border-neutral-200 outline-0 ring-0">
                                    {office.filter(o => o.officeName).map(o => (
                                        <SelectItem className="hover:bg-neutral-100" key={o.departmentId} value={String(o.departmentId)}>{o.officeName}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )} />
                    </FormField>
                </CardContent>
            </Card>
        </div>
    );
});

export default EmployeeServiceForm;