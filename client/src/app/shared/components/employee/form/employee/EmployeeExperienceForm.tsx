import FormField from "@/app/shared/FormField";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Combobox, ComboboxContent, ComboboxInput, ComboboxItem, ComboboxList } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useValues } from "@/lib/hooks/useValues";
import { employeeExperienceFormSchema, type EmployeeExperienceFormData } from "@/lib/schemas/newEmployeeForm/employeeExperienceSchema";
import { EXPERIENCE_TYPES } from "@/lib/types/constTypes";
import type { EmployeeStepHandle } from "@/lib/types/employeeFormTypes";
import { zodResolver } from "@hookform/resolvers/zod";
import { PencilIcon, Trash2Icon } from "lucide-react";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { Controller, useForm } from "react-hook-form";

type Props = {
    data: EmployeeExperienceFormData[];
};

const emptyEntry: EmployeeExperienceFormData = {
    type: undefined,
    dateFrom: "1900-01-01",
    dateTo: "1900-01-01",
    years: "",
    months: "",
    days: "",
    carrier: "",
    decisionId: "",
    comments: "",
    agonis: undefined,
    mk: 0,
    grade: 0,
    sunt: 0,
    dateCouncil: "1900-01-01",
    auto: 0,
};

const REFERENCE_WIDTH = 1600;
const MIN_SCALE = 0.6;

const EmployeeExperienceForm = forwardRef<EmployeeStepHandle, Props>(
    function EmployeeExperienceForm({ data }, ref) {

    const [scale, setScale] = useState(1);

    const [organizationFieldKey, setOrganizationFieldKey] = useState(0);
    const { foreas } = useValues();
    const organizationOptions = foreas ? [foreas] : [];

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

    const [experiences, setExperiences] = useState<EmployeeExperienceFormData[]>(data ?? []);
    const [activeTab, setActiveTab] = useState<string>(EXPERIENCE_TYPES[0]?.value ?? "1");
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 5;

    const { control, trigger, getValues, reset, formState: { errors } } = useForm<EmployeeExperienceFormData>({
        resolver: zodResolver(employeeExperienceFormSchema),
        defaultValues: emptyEntry,
        mode: "onChange",
    });

    useImperativeHandle(ref, () => ({
        validate: async () => experiences,
        getSnapshot: () => experiences,
    }));

    const handleDelete = (index: number) => {
        setExperiences((prev) => {
            const updated = prev.filter((_, i) => i !== index);
            const newTotal = updated.length;
            const newTotalPages = Math.max(1, Math.ceil(newTotal / PAGE_SIZE));
            if (page > newTotalPages) setPage(newTotalPages);
            return updated;
        });
    };

    const totalPages = Math.max(1, Math.ceil(experiences.length / PAGE_SIZE));
    const startIdx = (page - 1) * PAGE_SIZE;
    const paginatedList = experiences.slice(startIdx, startIdx + PAGE_SIZE);

    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const handleRowClick = (globalIdx: number) => {
        const entry = experiences[globalIdx];
        reset(entry);
        setActiveTab(String(entry.type ?? EXPERIENCE_TYPES[0]?.value ?? "1"));
        setEditingIndex(globalIdx);
        setOrganizationFieldKey((k) => k + 1);
    };

    const handleClear = () => {
        reset(emptyEntry);
        setEditingIndex(null);
        setOrganizationFieldKey((k) => k + 1);
    };

    const handleAdd = async () => {
        const isValid = await trigger();
        if (!isValid) return;
        const values = getValues();
        const entry: EmployeeExperienceFormData = {
            ...values,
            type: Number(activeTab),
        };

        if (editingIndex !== null) {
            // Αντικατάσταση υπάρχουσας εγγραφής
            setExperiences((prev) => prev.map((e, i) => i === editingIndex ? entry : e));
            setEditingIndex(null);
        } else {
            // Νέα εγγραφή
            setExperiences((prev) => [...prev, entry]);
            const newTotal = experiences.length + 1;
            setPage(Math.ceil(newTotal / PAGE_SIZE));
        }
        reset(emptyEntry);
        setOrganizationFieldKey((k) => k + 1);
    };

    return (
        <div className="mt-5 w-full grid grid-cols-1 gap-5 px-6" style={{ zoom: scale }}>
            <Card className="bg-white">
                <CardHeader className="flex flex-row items-center justify-between pb-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                        Πληροφορίες προϋπηρεσίας
                    </CardTitle>
                </CardHeader>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="pl-5">
                    <TabsList style={{ backgroundColor: '#f5f5f5' }}>
                        {EXPERIENCE_TYPES.map((item) => (
                            <TabsTrigger
                                key={item.value}
                                value={item.value}
                                className="text-black/80 hover:text-black/80 data-active:bg-white data-active:text-[#000000] border-b-0"
                            >
                                {item.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
                <CardContent className="grid grid-cols-4 gap-4 mt-4">
                    <FormField label="Φορέας" error={errors.carrier?.message}>
                        <Controller name="carrier" control={control}
                            render={({ field }) => (
                                <Combobox
                                    key={organizationFieldKey}
                                    items={organizationOptions}
                                    value={field.value ?? ""}
                                    onInputValueChange={(value) => field.onChange(value)}
                                    onValueChange={(value) => { if (value) field.onChange(value); }}
                                >
                                    <ComboboxInput
                                        placeholder="Όνομα φορέα"
                                        className={`bg-white ${errors.carrier ? "border-red-400" : "border-gray-200"}`}
                                    />
                                    <ComboboxContent  className="bg-white border-0 outline-0 ring-0">
                                        <ComboboxList>
                                            {(item: string) => (
                                                <ComboboxItem key={item} value={item}>{item}</ComboboxItem>
                                            )}
                                        </ComboboxList>
                                    </ComboboxContent>
                                </Combobox>
                            )}
                        />
                    </FormField>
                    <FormField label="Ημ/νια έναρξης" error={errors.dateFrom?.message}>
                        <Controller name="dateFrom" control={control}
                            render={({ field }) => (
                                <Input value={field.value != "1900-01-01" ? field.value : ""} type="date" onChange={field.onChange} className={`w-full bg-white ${errors.dateFrom ? "border-red-400" : "border-gray-200"}`} />
                            )}
                        />
                    </FormField>
                    <FormField label="Ημ/νια λήξης" error={errors.dateTo?.message}>
                        <Controller name="dateTo" control={control}
                            render={({ field }) => (
                                <Input value={field.value != "1900-01-01" ? field.value : ""} type="date" onChange={field.onChange} className={`w-full bg-white ${errors.dateTo ? "border-red-400" : "border-gray-200"}`} />
                            )}
                        />
                    </FormField>
                    <FormField label="Αρ. απόφασης" error={errors.decisionId?.message}>
                        <Controller name="decisionId" control={control}
                            render={({ field }) => (
                                <Input value={field.value ?? ""} onChange={field.onChange} className={`w-full bg-white ${errors.decisionId ? "border-red-400" : "border-gray-200"}`} />
                            )}
                        />
                    </FormField>
                    <div className="flex items-center space-x-2">
                        <Controller control={control} name="mk" render={({ field: { value, onChange } }) => (
                            <Checkbox checked={value === 1} onCheckedChange={(checked) => onChange(checked ? 1 : 0)} className="w-4 h-4 rounded border-gray-300"/>
                        )}/>
                        <label className="text-sm text-gray-700">Μισθολογικό Κλιμάκιο</label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Controller control={control} name="grade" render={({ field: { value, onChange } }) => (
                            <Checkbox checked={value === 1} onCheckedChange={(checked) => onChange(checked ? 1 : 0)} className="w-4 h-4 rounded border-gray-300"/>
                        )} />
                        <label className="text-sm text-gray-700">Βαθμός</label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Controller control={control} name="sunt" render={({ field: { value, onChange } }) => (
                            <Checkbox checked={value === 1} onCheckedChange={(checked) => onChange(checked ? 1 : 0)} className="w-4 h-4 rounded border-gray-300"/>
                        )} />
                        <label className="text-sm text-gray-700">Συντάξιμα</label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Controller control={control} name="auto" render={({ field: { value, onChange } }) => (
                            <Checkbox checked={value === 1} onCheckedChange={(checked) => onChange(checked ? 1 : 0)} className="w-4 h-4 rounded border-gray-300"/>
                        )} />
                        <label className="text-sm text-gray-700">Μη αυτόματα</label>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                    <Button variant="outline" type="button" onClick={handleClear}>
                        Καθαρισμός
                    </Button>
                    <Button variant="outline" type="button" onClick={handleAdd} 
                        style={{ 
                            borderColor: 'var(--color-primary)', 
                            color: 'var(--color-primary)' 
                        }}
                        onMouseEnter={e => {
                            (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-primary)';
                            (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-primary-foreground)';
                        }}
                        onMouseLeave={e => {
                            (e.currentTarget as HTMLButtonElement).style.backgroundColor = '';
                            (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-primary)';
                        }}
                    >
                        {editingIndex !== null ? "Αποθήκευση αλλαγών" : "Εισαγωγή προϋπηρεσίας"}
                    </Button>
                </CardFooter>
            </Card>

            {experiences.length > 0 && (
                <div data-slot="card" className="bg-card text-card-foreground flex flex-col overflow-hidden">
                    <Table className="w-full bg-white border-b-neutral-200 table-fixed mt-6" style={{ tableLayout: "fixed" }}>
                        <TableHeader className="border-b" style={{ backgroundColor: "#F2F2F2" }}>
                            <TableRow style={{ backgroundColor: "#F2F2F2" }}>
                                <TableCell className="font-bold px-3 py-3 text-left" style={{ width: "23%" }}>Τύπος</TableCell>
                                <TableCell className="font-bold px-3 py-3 text-left" style={{ width: "16%" }}>Φορέας</TableCell>
                                <TableCell className="font-bold px-3 py-3 text-left" style={{ width: "19%" }}>Έναρξη</TableCell>
                                <TableCell className="font-bold px-3 py-3 text-left" style={{ width: "19%" }}>Λήξη</TableCell>
                                <TableCell className="font-bold px-3 py-3 text-left" style={{ width: "18%" }}>Αρ. Απόφασης</TableCell>
                                <TableCell className="font-bold px-3 py-3 text-center" style={{ width: "5%" }}></TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-neutral-200 bg-white">
                            {paginatedList.map((exp, idx) => {
                                const globalIdx = startIdx + idx;
                                const typeLabel = EXPERIENCE_TYPES.find(t => Number(t.value) === exp.type)?.label ?? "-";
                                return (
                                    <TableRow key={globalIdx}
                                        className={`hover:bg-neutral-50 transition-colors cursor-pointer ${
                                            editingIndex === globalIdx ? "bg-blue-50 border-l-2 border-l-blue-400" : ""
                                        }`}
                                    >
                                        <TableCell className="px-3 py-3 text-left" style={{ width: "23%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{typeLabel}</TableCell>
                                        <TableCell className="px-3 py-3 text-left" style={{ width: "16%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{exp.carrier}</TableCell>
                                        <TableCell className="px-3 py-3 text-left" style={{ width: "19%" }}>{exp.dateFrom}</TableCell>
                                        <TableCell className="px-3 py-3 text-left" style={{ width: "19%" }}>{exp.dateTo}</TableCell>
                                        <TableCell className="px-3 py-3 text-left" style={{ width: "18%" }}>{exp.decisionId}</TableCell>
                                        <TableCell className="px-3 py-3 text-center gap-5" style={{ width: "5%" }}>
                                            <div className="flex items-center justify-center gap-3">
                                                <button
                                                    onClick={() => handleRowClick(globalIdx)}
                                                    className="hover:text-blue-500 transition-colors cursor-pointer"
                                                    title="Επεξεργασία"
                                                    type="button"
                                                >
                                                    <PencilIcon size={18} />
                                                </button>
                                                <button
                                                    onClick={(e) => { 
                                                        e.stopPropagation();
                                                        handleDelete(globalIdx); 
                                                    }}
                                                    className="hover:text-red-500 transition-colors"
                                                    title="Διαγραφή"
                                                    type="button"
                                                >
                                                    <Trash2Icon size={18} />
                                                </button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                    <Separator className="bg-neutral-200" />
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center bg-white w-full h-20">
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); if (page > 1) setPage(page - 1); }} aria-disabled={page <= 1} />
                                    </PaginationItem>
                                    {(() => {
                                        const pages: (number | "...")[] = [];
                                        if (totalPages <= 4) {
                                            for (let i = 1; i <= totalPages; i++) pages.push(i);
                                        } else {
                                            const left = Math.max(2, page - 1);
                                            const right = Math.min(totalPages - 1, page + 1);
                                            pages.push(1);
                                            if (left > 2) pages.push("...");
                                            for (let i = left; i <= right; i++) pages.push(i);
                                            if (right < totalPages - 1) pages.push("...");
                                            pages.push(totalPages);
                                        }
                                        return pages.map((p, i) =>
                                            p === "..." ? (
                                                <PaginationItem key={`dots-${i}`}><PaginationEllipsis /></PaginationItem>
                                            ) : (
                                                <PaginationItem key={p}>
                                                    <PaginationLink href="#" isActive={p === page} onClick={(e) => { e.preventDefault(); setPage(p as number); }}>{p}</PaginationLink>
                                                </PaginationItem>
                                            )
                                        );
                                    })()}
                                    <PaginationItem>
                                        <PaginationNext href="#" onClick={(e) => { e.preventDefault(); if (page < totalPages) setPage(page + 1); }} aria-disabled={page >= totalPages} />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
});

export default EmployeeExperienceForm;