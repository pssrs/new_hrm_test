import FormField from "@/app/shared/FormField";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { employeeChildrenFormSchema, type EmployeeChildrenFormData } from "@/lib/schemas/newEmployeeForm/employeeChildrenFormSchema";
import { CHILD_LEVEL } from "@/lib/types/constTypes";
import type { EmployeeStepHandle } from "@/lib/types/employeeFormTypes";
import { zodResolver } from "@hookform/resolvers/zod";
import { PencilIcon, Trash2Icon } from "lucide-react";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { Controller, useForm } from "react-hook-form";

type Props = {
    data: EmployeeChildrenFormData[];
};

const emptyEntry: EmployeeChildrenFormData = {
    employeeId: undefined,
    childSurname: "",
    childName: "",
    childFather: "",
    childSex: undefined,
    childBirth: "1900-01-01",
    childDateFrom: "1900-01-01",
    childDateTo: "1900-01-01",
    childDisability: undefined,
    childLevel: "0",
    childSchool: "0",
    childYears: "",
    childMonths: "",
    childFlag: undefined,
    child18: undefined,
};

const REFERENCE_WIDTH = 1600;
const MIN_SCALE = 0.6;

const EmployeeChildrenForm = forwardRef<EmployeeStepHandle, Props>(
    function EmployeeChildrenForm({ data }, ref) {

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

    const [children, setChildren] = useState<EmployeeChildrenFormData[]>(data ?? []);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 5;

    const { control, trigger, getValues, reset, formState: { errors } } = useForm<EmployeeChildrenFormData>({
        resolver: zodResolver(employeeChildrenFormSchema),
        defaultValues: emptyEntry,
        mode: "onChange",
    });

    useImperativeHandle(ref, () => ({
        validate: async () => children,
        getSnapshot: () => children,
    }));

    const handleAdd = async () => {
        const isValid = await trigger();
        if (!isValid) return;
        const entry = getValues();

        if (editingIndex !== null) {
            setChildren((prev) => prev.map((e, i) => i === editingIndex ? entry : e));
            setEditingIndex(null);
        } else {
            setChildren((prev) => [...prev, entry]);
            const newTotal = children.length + 1;
            setPage(Math.ceil(newTotal / PAGE_SIZE));
        }
        reset(emptyEntry);
    };

    const handleDelete = (index: number) => {
        setChildren((prev) => {
            const updated = prev.filter((_, i) => i !== index);
            const newTotalPages = Math.max(1, Math.ceil(updated.length / PAGE_SIZE));
            if (page > newTotalPages) setPage(newTotalPages);
            return updated;
        });
    };

    const handleRowClick = (globalIdx: number) => {
        const entry = children[globalIdx];
        reset(entry);
        setEditingIndex(globalIdx);
    };

    const handleClear = () => {
        reset(emptyEntry);
        setEditingIndex(null);
    };

    const totalPages = Math.max(1, Math.ceil(children.length / PAGE_SIZE));
    const startIdx = (page - 1) * PAGE_SIZE;
    const paginatedList = children.slice(startIdx, startIdx + PAGE_SIZE);

    return (
        <div className="mt-5 w-full grid grid-cols-1 gap-5 px-6" style={{ zoom: scale }}>
            <Card className="bg-white">
                <CardHeader className="flex flex-row items-center justify-between pb-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                        Στοιχεία τέκνου
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-4 gap-4">
                        <FormField label="Όνομα" error={errors.childName?.message}>
                            <Controller name="childName" control={control}
                                render={({ field }) => (
                                    <Input value={field.value ?? ""} onChange={field.onChange} className={`w-full bg-white ${errors.childName ? "border-red-400" : "border-gray-200"}`} />
                                )}
                            />
                        </FormField>
                        <FormField label="Επώνυμο" error={errors.childSurname?.message}>
                            <Controller name="childSurname" control={control}
                                render={({ field }) => (
                                    <Input value={field.value ?? ""} onChange={field.onChange} className={`w-full bg-white ${errors.childSurname ? "border-red-400" : "border-gray-200"}`} />
                                )}
                            />
                        </FormField>
                        <FormField label="Ημ/νια γέννησης" error={errors.childBirth?.message}>
                            <Controller name="childBirth" control={control}
                                render={({ field }) => (
                                    <Input value={field.value != "1900-01-01" ? field.value : ""} type="date" onChange={field.onChange} className={`w-full bg-white ${errors.childBirth ? "border-red-400" : "border-gray-200"}`} />
                                )}
                            />
                        </FormField>
                        <FormField label="Όνομα γονέα" error={errors.childFather?.message}>
                            <Controller name="childFather" control={control}
                                render={({ field }) => (
                                    <Input value={field.value ?? ""} onChange={field.onChange} className={`w-full bg-white ${errors.childFather ? "border-red-400" : "border-gray-200"}`} />
                                )}
                            />
                        </FormField>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4 mb-4">
                        <FormField label="Αναπηρία">
                            <Controller name="childDisability" control={control}
                                render={({ field }) => (
                                    <RadioGroup
                                        value={String(field.value ?? "0")}
                                        onValueChange={(v) => field.onChange(Number(v))}
                                        className="flex gap-6 mt-2"
                                    >
                                        <div className="flex items-center gap-2">
                                            <RadioGroupItem value="1" id="disability-yes" />
                                            <Label htmlFor="disability-yes">Ναι</Label>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <RadioGroupItem value="0" id="disability-no" />
                                            <Label htmlFor="disability-no">Όχι</Label>
                                        </div>
                                    </RadioGroup>
                                )}
                            />
                        </FormField>
                        <FormField label="Επίδομα">
                            <Controller name="childFlag" control={control}
                                render={({ field }) => (
                                    <RadioGroup
                                        value={String(field.value ?? "0")}
                                        onValueChange={(v) => field.onChange(Number(v))}
                                        className="flex gap-6 mt-2"
                                    >
                                        <div className="flex items-center gap-2">
                                            <RadioGroupItem value="1" id="flag-yes" />
                                            <Label htmlFor="flag-yes">Ναι</Label>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <RadioGroupItem value="0" id="flag-no" />
                                            <Label htmlFor="flag-no">Όχι</Label>
                                        </div>
                                    </RadioGroup>
                                )}
                            />
                        </FormField>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                        <FormField label="Σχολή" error={errors.childSchoolDesc?.message}>
                            <Controller name="childSchoolDesc" control={control}
                                render={({ field }) => (
                                    <Input value={field.value ?? ""} onChange={field.onChange} className={`w-full bg-white ${errors.childSchoolDesc ? "border-red-400" : "border-gray-200"}`} />
                                )}
                            />
                        </FormField>
                        <FormField label="Επίπεδο" error={errors.childLevel?.message}>
                            <Controller name="childLevel" control={control}
                                render={({ field }) => (
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger className={`w-full bg-white ${errors.childLevel ? "border-red-400" : "border-gray-200"}`}><SelectValue placeholder="Επιλέξτε κωδικό" /></SelectTrigger>
                                        <SelectContent position="popper" className="bg-white border border-neutral-200 outline-0 ring-0">
                                            {CHILD_LEVEL.filter(c => c.label).map(c => (
                                                <SelectItem className="hover:bg-neutral-100" key={c.value} value={c.value}>{c.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </FormField>
                        <FormField label="Ημ/νια έναρξης" error={errors.childDateFrom?.message}>
                            <Controller name="childDateFrom" control={control}
                                render={({ field }) => (
                                    <Input value={field.value != "1900-01-01" ? field.value : ""} type="date" onChange={field.onChange} className={`w-full bg-white ${errors.childDateFrom ? "border-red-400" : "border-gray-200"}`} />
                                )}
                            />
                        </FormField>
                        <FormField label="Ημ/νια λήξης" error={errors.childDateTo?.message}>
                            <Controller name="childDateTo" control={control}
                                render={({ field }) => (
                                    <Input value={field.value != "1900-01-01" ? field.value : ""} type="date" onChange={field.onChange} className={`w-full bg-white ${errors.childDateTo ? "border-red-400" : "border-gray-200"}`} />
                                )}
                            />
                        </FormField>
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
                        {editingIndex !== null ? "Αποθήκευση αλλαγών" : "Εισαγωγή τέκνου"}
                    </Button>
                </CardFooter>
            </Card>

            {children.length > 0 && (
                <div data-slot="card" className="bg-card text-card-foreground flex flex-col overflow-hidden">
                    <Table className="w-full bg-white border-b-neutral-200 table-fixed mt-6" style={{ tableLayout: "fixed" }}>
                        <TableHeader className="border-b" style={{ backgroundColor: "#F2F2F2" }}>
                            <TableRow style={{ backgroundColor: "#F2F2F2" }}>
                                <TableCell className="font-bold px-3 py-3 text-left" style={{ width: "21%" }}>Όνομα</TableCell>
                                <TableCell className="font-bold px-3 py-3 text-left" style={{ width: "20%" }}>Επώνυμο</TableCell>
                                <TableCell className="font-bold px-3 py-3 text-left" style={{ width: "20%" }}>Ημ/νια γέννησης</TableCell>
                                <TableCell className="font-bold px-3 py-3 text-left" style={{ width: "20%" }}>Γονέας</TableCell>
                                <TableCell className="font-bold px-3 py-3 text-left" style={{ width: "14%" }}>Αναπηρία</TableCell>
                                <TableCell className="font-bold px-3 py-3 text-center" style={{ width: "5%" }}></TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-neutral-200 bg-white">
                            {paginatedList.map((child, idx) => {
                                const globalIdx = startIdx + idx;
                                return (
                                    <TableRow
                                        key={globalIdx}
                                        className={`hover:bg-neutral-50 transition-colors cursor-pointer ${
                                            editingIndex === globalIdx ? "bg-blue-50 border-l-2 border-l-blue-400" : ""
                                        }`}
                                    >
                                        <TableCell className="px-3 py-3 text-left" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{child.childName}</TableCell>
                                        <TableCell className="px-3 py-3 text-left" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{child.childSurname}</TableCell>
                                        <TableCell className="px-3 py-3 text-left">{child.childBirth}</TableCell>
                                        <TableCell className="px-3 py-3 text-left" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{child.childFather}</TableCell>
                                        <TableCell className="px-3 py-3 text-left">{child.childDisability === 1 ? "Ναι" : "Όχι"}</TableCell>
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

export default EmployeeChildrenForm;