import FormField from "@/app/shared/FormField";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { zodResolver } from "@hookform/resolvers/zod";
import { PencilIcon, Trash2Icon } from "lucide-react";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { employeeStudiesFormSchema, type EmployeeStudiesFormData } from "@/lib/schemas/newEmployeeForm/employeeStudyFormSchema";
import type { EmployeeStepHandle } from "@/lib/types/employeeFormTypes";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STUDY_EDUCATION } from "@/lib/types/constTypes";
import { Checkbox } from "@/components/ui/checkbox";
import { useValues } from "@/lib/hooks/useValues";

type Props = {
    data: EmployeeStudiesFormData[];
};

const emptyEntry: EmployeeStudiesFormData = {
    am: undefined,
    type: -1,
    description: "",
    education: undefined,
    local: undefined,
    category: undefined,
    years: "",
    date: "",
    degree: "",
    employee: undefined,
    relevance: undefined,
    comment: "",
    dateRequired: "1900-01-01",
    location: "",
};

const REFERENCE_WIDTH = 1600;
const MIN_SCALE = 0.6;

const EmployeeStudiesForm = forwardRef<EmployeeStepHandle, Props>(
    function EmployeeStudiesForm({ data }, ref) {

    const [scale, setScale] = useState(1);
    const {studyTypes} = useValues();

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

    const [studies, setStudies] = useState<EmployeeStudiesFormData[]>(data ?? []);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 5;

    const { control, trigger, getValues, reset, formState: { errors } } = useForm<EmployeeStudiesFormData>({
        resolver: zodResolver(employeeStudiesFormSchema),
        defaultValues: emptyEntry,
        mode: "onChange",
    });

    useImperativeHandle(ref, () => ({
        validate: async () => studies,
        getSnapshot: () => studies,
    }));

    const handleAdd = async () => {
        const isValid = await trigger();
        if (!isValid) return;
        const entry = getValues();

        if (editingIndex !== null) {
            setStudies((prev) => prev.map((e, i) => i === editingIndex ? entry : e));
            setEditingIndex(null);
        } else {
            setStudies((prev) => [...prev, entry]);
            const newTotal = studies.length + 1;
            setPage(Math.ceil(newTotal / PAGE_SIZE));
        }
        reset(emptyEntry);
    };

    const handleDelete = (index: number) => {
        setStudies((prev) => {
            const updated = prev.filter((_, i) => i !== index);
            const newTotalPages = Math.max(1, Math.ceil(updated.length / PAGE_SIZE));
            if (page > newTotalPages) setPage(newTotalPages);
            return updated;
        });
    };

    const handleRowClick = (globalIdx: number) => {
        reset(studies[globalIdx]);
        setEditingIndex(globalIdx);
    };

    const handleClear = () => {
        reset(emptyEntry);
        setEditingIndex(null);
    };

    const totalPages = Math.max(1, Math.ceil(studies.length / PAGE_SIZE));
    const startIdx = (page - 1) * PAGE_SIZE;
    const paginatedList = studies.slice(startIdx, startIdx + PAGE_SIZE);

    return (
        <div className="mt-5 w-full grid grid-cols-1 gap-5 px-6" style={{ zoom: scale }}>
            <Card className="bg-white">
                <CardHeader className="flex flex-row items-center justify-between pb-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                        Πληροφορίες σπουδών
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-4">
                    <FormField label="Τύπος" error={errors.type?.message}>
                        <Controller name="type" control={control}
                            render={({ field }) => (
                                <Select value={field.value ? String(field.value) : ''} onValueChange={(val) => field.onChange(val ? Number(val) : null)}>
                                    <SelectTrigger className={`w-full bg-white ${errors.type ? "border-red-400" : "border-gray-200"}`}>
                                        <SelectValue placeholder="Επιλέξτε τύπο" />
                                    </SelectTrigger>
                                    <SelectContent position="popper" className="bg-white border border-neutral-200 outline-0 ring-0">
                                        {studyTypes?.map(p => (
                                            <SelectItem className="hover:bg-neutral-100" key={p.id} value={String(p.id)}>
                                                {p.description}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </FormField>
                    <FormField label="Τίτλος" error={errors.description?.message}>
                        <Controller name="description" control={control}
                            render={({ field }) => (
                                <Input value={field.value ?? ""} onChange={field.onChange} className={`w-full bg-white ${errors.description ? "border-red-400" : "border-gray-200"}`} />
                            )}
                        />
                    </FormField>
                    <FormField label="Εκπαιδευτικό ίδρυμα" error={errors.education?.message}>
                        <Controller name="education" control={control}
                            render={({ field }) => (
                                <Select value={field.value ? String(field.value) : ''} onValueChange={(val) => field.onChange(val ? Number(val) : null)}>
                                    <SelectTrigger className={`w-full bg-white ${errors.education ? "border-red-400" : "border-gray-200"}`}>
                                        <SelectValue placeholder="Επιλέξτε επίπεδο" />
                                    </SelectTrigger>
                                    <SelectContent position="popper" className="bg-white border border-neutral-200 outline-0 ring-0">
                                        {STUDY_EDUCATION?.map(p => (
                                            <SelectItem className="hover:bg-neutral-100" key={p.value} value={String(p.value)}>
                                                {p.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </FormField>
                    <FormField label="Τόπος" error={errors.location?.message}>
                        <Controller name="location" control={control}
                            render={({ field }) => (
                                <Input value={field.value ?? ""} onChange={field.onChange} className={`w-full bg-white ${errors.location ? "border-red-400" : "border-gray-200"}`} />
                            )}
                        />
                    </FormField>
                    <FormField label="Αποφοίτηση" error={errors.date?.message}>
                        <Controller name="date" control={control}
                            render={({ field }) => (
                                <Input value={field.value ?? ""} type="date" onChange={field.onChange} className={`w-full bg-white ${errors.date ? "border-red-400" : "border-gray-200"}`} />
                            )}
                        />
                    </FormField>
                    <FormField label="Έτη σπουδών" error={errors.years?.message}>
                        <Controller name="years" control={control}
                            render={({ field }) => (
                                <Input value={field.value ?? ""} onChange={field.onChange} className={`w-full bg-white ${errors.years ? "border-red-400" : "border-gray-200"}`} />
                            )}
                        />
                    </FormField>
                    <div className="flex items-center space-x-2">
                        <Controller control={control} name="employee" render={({ field: { value, onChange } }) => (
                            <Checkbox checked={value === 1} onCheckedChange={(checked) => onChange(checked ? 1 : 0)} className="w-4 h-4 rounded border-gray-300" />
                        )} />
                        <label className="text-sm text-gray-700">Συναφές με τη θέση</label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Controller control={control} name="relevance" render={({ field: { value, onChange } }) => (
                            <Checkbox checked={value === 1} onCheckedChange={(checked) => onChange(checked ? 1 : 0)} className="w-4 h-4 rounded border-gray-300" />
                        )} />
                        <label className="text-sm text-gray-700">Αναγνωρισμένο</label>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                    <Button variant="outline" type="button" onClick={handleClear}>
                        Καθαρισμός
                    </Button>
                    <Button variant="outline" type="button" onClick={handleAdd}
                        style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
                        onMouseEnter={e => {
                            (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-primary)';
                            (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-primary-foreground)';
                        }}
                        onMouseLeave={e => {
                            (e.currentTarget as HTMLButtonElement).style.backgroundColor = '';
                            (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-primary)';
                        }}
                    >
                        {editingIndex !== null ? "Αποθήκευση αλλαγών" : "Εισαγωγή σπουδών"}
                    </Button>
                </CardFooter>
            </Card>

            {studies.length > 0 && (
                <div data-slot="card" className="bg-card text-card-foreground flex flex-col overflow-hidden">
                    <Table className="w-full bg-white border-b-neutral-200 table-fixed mt-6" style={{ tableLayout: "fixed" }}>
                        <TableHeader className="border-b" style={{ backgroundColor: "#F2F2F2" }}>
                            <TableRow style={{ backgroundColor: "#F2F2F2" }}>
                                <TableCell className="font-bold px-3 py-3 text-left" style={{ width: "15%" }}>Τύπος</TableCell>
                                <TableCell className="font-bold px-3 py-3 text-left" style={{ width: "20%" }}>Τίτλος</TableCell>
                                <TableCell className="font-bold px-3 py-3 text-left" style={{ width: "20%" }}>Εκπ. Ίδρυμα</TableCell>
                                <TableCell className="font-bold px-3 py-3 text-left" style={{ width: "14%" }}>Τόπος</TableCell>
                                <TableCell className="font-bold px-3 py-3 text-left" style={{ width: "15%" }}>Αποφοίτηση</TableCell>
                                <TableCell className="font-bold px-3 py-3 text-left" style={{ width: "12%" }}>Έτη</TableCell>
                                <TableCell className="font-bold px-3 py-3 text-center" style={{ width: "4%" }}></TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-neutral-200 bg-white">
                            {paginatedList.map((study, idx) => {
                                const globalIdx = startIdx + idx;
                                const typeLabel = studyTypes.find(t => Number(t.id) === study.type)?.description ?? "-";
                                const educationLabel = STUDY_EDUCATION.find(t => Number(t.value) === study.education)?.label ?? "-";
                                return (
                                    <TableRow
                                        key={globalIdx}
                                        className={`hover:bg-neutral-50 transition-colors cursor-pointer ${
                                            editingIndex === globalIdx ? "bg-blue-50 border-l-2 border-l-blue-400" : ""
                                        }`}
                                    >
                                        <TableCell className="px-3 py-3 text-left" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{typeLabel}</TableCell>
                                        <TableCell className="px-3 py-3 text-left" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{study.description}</TableCell>
                                        <TableCell className="px-3 py-3 text-left" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{educationLabel}</TableCell>
                                        <TableCell className="px-3 py-3 text-left" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{study.location}</TableCell>
                                        <TableCell className="px-3 py-3 text-left">{study.date}</TableCell>
                                        <TableCell className="px-3 py-3 text-left">{study.years}</TableCell>
                                        <TableCell className="px-3 py-3 text-center">
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
                                                    onClick={() => handleDelete(globalIdx)}
                                                    className="hover:text-red-500 transition-colors cursor-pointer"
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

export default EmployeeStudiesForm;