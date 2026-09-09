import { PlusIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { useEmployee } from "@/lib/hooks/useEmployee";
import { useParams } from "react-router";
import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { showSuccessToast, showErrorToast } from "@/lib/utils/toastHelpers";
import { employeeMoveSchema } from "./employeeMoveSchema";

const moveType = [
    { value: "1", label: "Μετακίνηση" },
    { value: "2", label: "Απόσπαση" },
    { value: "3", label: "Μετάταξη" }
];

const moveDestination = [
    { value: "1", label: "Από φορέα" },
    { value: "2", label: "Προς φορέα" },
    { value: "3", label: "Επιστροφή" }
];

const moveForeas = [
    { value: "1", label: "1η Υ.ΠΕ." },
    { value: "2", label: "2η Υ.ΠΕ." },
    { value: "3", label: "3η Υ.ΠΕ." },
    { value: "4", label: "4η Υ.ΠΕ." },
    { value: "5", label: "5η Υ.ΠΕ." },
    { value: "6", label: "6η Υ.ΠΕ." },
    { value: "7", label: "7η Υ.ΠΕ." },
];

interface FormFieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
}

function FormField({ label, error, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {children}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

const REFERENCE_WIDTH = 1600;
const MIN_SCALE = 0.6;

export default function EmployeeMove() {
    const [scale, setScale] = useState(1);
    const [isSaving, setIsSaving] = useState(false);

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

    const { id } = useParams<{ id: string }>();
    const { employeeMoveList, createEmployeeMove, updateEmployeeMove, deleteEmployeeMove } = useEmployee({ id });
    const [sheetOpen, setSheetOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    type FormData = z.infer<typeof employeeMoveSchema>;

    const defaultFormValues: FormData = {
        id: undefined,
        am: Number(id) || 0,
        type: "",
        destination: "",
        foreas: "",
        dateFrom: "",
        dateTo: "",
        decision: "",
        dateDecision: "",
        comment: "",
    };

    const { control, reset, setValue, getValues, formState: { errors }, trigger } = useForm<FormData>({
      resolver: zodResolver(employeeMoveSchema),
      mode: "onChange",
      defaultValues: defaultFormValues,
    });

    const formatDate = (date: string | Date) => {
        if (typeof date === 'string') {
            const [year, month, day] = date.split('-');
            return `${day}/${month}/${year}`;
        }
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const getMoveType = (moveId: number) => {
        const moveDesc = moveType?.find(m => m.value === String(moveId));
        return moveDesc?.label || 'Άγνωστη Μετακίνηση';
    };

    const getMoveDestination = (destinationId: number) => {
        const destinationDesc = moveDestination?.find(d => d.value === String(destinationId));
        return destinationDesc?.label || 'Άγνωστος Προορισμός';
    };

    const getMoveForeas = (foreasId: number) => {
        const foreasDesc = moveForeas?.find(f => f.value === String(foreasId));
        return foreasDesc?.label || 'Άγνωστος Φορέας';
    };

    const handleRowClick = (move: Record<string, unknown>) => {
        setIsEditing(true);
        setIsSaving(false);
        setValue("id", Number(move.id));
        setValue("am", Number(move.am));
        setValue("type", String(move.type));
        setValue("destination", String(move.destination));
        setValue("foreas", String(move.foreas));
        setValue("dateFrom", typeof move.dateFrom === 'string' ? move.dateFrom : new Date(move.dateFrom as string | Date).toISOString().split('T')[0]);
        setValue("dateTo", typeof move.dateTo === 'string' ? move.dateTo : new Date(move.dateTo as string | Date).toISOString().split('T')[0]);
        setValue("decision", move.decision ? String(move.decision) : "");
        setValue("dateDecision", move.dateDecision ? (typeof move.dateDecision === 'string' ? move.dateDecision : new Date(move.dateDecision as string | Date).toISOString().split('T')[0]) : "");
        setValue("comment", move.comment ? String(move.comment) : "");
        setSheetOpen(true);
    };

    const handleSave = async () => {
        if (isSaving) return;

        const isFormValid = await trigger();
        if (!isFormValid) return;

        const formData = getValues();

        setIsSaving(true);

        try {
            if (isEditing && formData.id) {
                const moveData: Move = {
                    id: formData.id,
                    am: formData.am,
                    type: Number(formData.type),
                    destination: Number(formData.destination),
                    foreas: Number(formData.foreas),
                    dateFrom: formData.dateFrom ?? "1900-01-01",
                    dateTo: formData.dateTo ?? "1900-01-01",
                    decision: formData.decision ?? "",
                    dateDecision: formData.dateDecision ?? "1900-01-01",
                    comment: formData.comment ?? "",
                };
                updateEmployeeMove(
                    moveData,
                    {
                        onSuccess: () => {
                            showSuccessToast("Μετακίνηση ενημερώθηκε με επιτυχία");
                            reset(defaultFormValues);
                            setSheetOpen(false);
                            setIsEditing(false);
                            setIsSaving(false);
                        },
                        onError: (error) => {
                            showErrorToast("Σφάλμα κατά την ενημέρωση της μετακίνησης");
                            console.error(error);
                            setIsSaving(false);
                        }
                    }
                );
            } else {
                const moveData: Move = {
                    id: 0,
                    am: formData.am,
                    type: Number(formData.type),
                    destination: Number(formData.destination),
                    foreas: Number(formData.foreas),
                    dateFrom: formData.dateFrom ?? "1900-01-01",
                    dateTo: formData.dateTo ?? "1900-01-01",
                    decision: formData.decision ?? "",
                    dateDecision: formData.dateDecision ?? "1900-01-01",
                    comment: formData.comment ?? "",
                };
                createEmployeeMove(
                    moveData,
                    {
                        onSuccess: () => {
                            showSuccessToast("Μετακίνηση δημιουργήθηκε με επιτυχία");
                            reset(defaultFormValues);
                            setSheetOpen(false);
                            setIsEditing(false);
                            setIsSaving(false);
                        },
                        onError: (error) => {
                            showErrorToast("Σφάλμα κατά τη δημιουργία της μετακίνησης");
                            console.error(error);
                            setIsSaving(false);
                        }
                    }
                );
            }
        } catch (error) {
            console.error("Error saving move:", error);
            setIsSaving(false);
        }
    };

    const handleDelete = (e: React.MouseEvent, moveId: number) => {
        e.stopPropagation();
        
        deleteEmployeeMove(moveId, {
            onSuccess: () => {
                showSuccessToast("Μετακίνηση διαγράφηκε με επιτυχία");
            },
            onError: (error) => {
                showErrorToast("Σφάλμα κατά τη διαγραφή της μετακίνησης");
                console.error(error);
            }
        });
    };

    const handleAddNew = () => {
        setIsEditing(false);
        reset(defaultFormValues);
        setSheetOpen(true);
        setIsSaving(false);
    };

    const handleCloseSheet = () => {
        setSheetOpen(false);
        setIsEditing(false);
        setIsSaving(false);
        reset(defaultFormValues);
    };

    return (
        <div style={{ zoom: scale }}>
            <div className="flex justify-end mt-10">
                <Button 
                    variant="default" 
                    type="button"
                    onClick={handleAddNew}
                    className="transition-all duration-200 hover:opacity-80 w-auto"
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
                >
                    <PlusIcon fontSize='small' />Εισαγωγή Μετακίνησης
                </Button>
            </div>
            <div data-slot='card' className='bg-card text-card-foreground flex flex-col overflow-hidden'>
                <Table className='w-full bg-white  border-b-neutral-200 table-fixed mt-6' style={{ tableLayout: 'fixed' }}>
                    <TableHeader className='border-b' style={{ backgroundColor: '#F2F2F2F2' }}>
                        <TableRow className='border-b' style={{ backgroundColor: '#F2F2F2F2' }}>
                            <TableCell className='font-bold px-3 py-3 text-left' style={{ width: '23%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title='Είδος'>Είδος</TableCell>
                            <TableCell className='font-bold px-3 py-3 text-left' style={{ width: '16%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title='Προορισμός'>Προορισμός</TableCell>
                            <TableCell className='font-bold px-3 py-3 text-left' style={{ width: '19%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title='Φορέας'>Φορέας</TableCell>
                            <TableCell className='font-bold px-3 py-3 text-left' style={{ width: '19%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title='Έναρξη'>Έναρξη</TableCell>
                            <TableCell className='font-bold px-3 py-3 text-left' style={{ width: '18%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title='Λήξη'>Λήξη</TableCell>
                            <TableCell className='font-bold px-3 py-3 text-center' style={{ width: '5%' }}></TableCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody className='divide-y divide-neutral-200 bg-white'>
                        {employeeMoveList && employeeMoveList.map(move => 
                            <TableRow 
                                key={move.id}
                                className='hover:bg-neutral-50 transition-colors cursor-pointer'
                                onClick={() => handleRowClick(move)}
                            >
                                <TableCell className='px-3 py-3 text-left' style={{ width: '23%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} >{getMoveType(move.type)}</TableCell>
                                <TableCell className='px-3 py-3 text-left' style={{ width: '16%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} >{getMoveDestination(move.destination)}</TableCell>
                                <TableCell className='px-3 py-3 text-left' style={{ width: '19%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} >{getMoveForeas(move.foreas)}</TableCell>
                                <TableCell className='px-3 py-3 text-left' style={{ width: '19%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} >{formatDate(move.dateFrom)}</TableCell>
                                <TableCell className='px-3 py-3 text-left' style={{ width: '18%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} >{formatDate(move.dateTo)}</TableCell>
                                <TableCell className='px-3 py-3 text-center' style={{ width: '5%' }}>
                                    <button
                                        className='hover:text-gray-600 transition-colors'
                                        title='Διαγραφή'
                                        onClick={(e) => {
                                            e.stopPropagation();

                                            if (window.confirm("Είστε σίγουροι ότι θέλετε να διαγράψετε αυτή την μετακίνηση;")) {
                                                handleDelete(e, move.id as number);
                                            }
                                        }}
                                    >
                                    <Trash2Icon size={18} />
                                  </button>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                <Separator className="bg-neutral-200" />
            </div>

            {/* Drawer for Add/Edit Move */}
            <Sheet open={sheetOpen} onOpenChange={(open) => { setSheetOpen(open); if (!open) handleCloseSheet(); }}>
                <SheetContent className="w-125 sm:w-150 flex flex-col bg-white" side="right">
                    <SheetHeader>
                        <SheetTitle className="text-lg font-bold p-1">Μετακίνηση</SheetTitle>
                    </SheetHeader>
                    <Separator className="bg-gray-300 -mt-5" />
                    <div className="flex-1 space-y-4 overflow-y-auto p-6 -mt-4">
                        <FormField label="Είδος *" error={errors.type?.message}>
                            <Controller name="type" control={control}
                                render={({ field }) => (
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger className={`w-full bg-white ${errors.type ? "border-red-400" : "border-gray-200"}`}>
                                            <SelectValue placeholder="Επιλέξτε είδος" />
                                        </SelectTrigger>
                                        <SelectContent position="popper" className="bg-white border border-neutral-200 outline-0 ring-0">
                                            {moveType.map(o => (
                                                <SelectItem className="hover:bg-neutral-100"  key={o.value} value={o.value}>
                                                    {o.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </FormField>
                        <FormField label="Προορισμός *" error={errors.destination?.message}>
                            <Controller name="destination" control={control}
                                render={({ field }) => (
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger className={`w-full bg-white ${errors.destination ? "border-red-400" : "border-gray-200"}`}>
                                            <SelectValue placeholder="Επιλέξτε προορισμό" />
                                        </SelectTrigger>
                                        <SelectContent position="popper" className="bg-white border border-neutral-200 outline-0 ring-0">
                                            {moveDestination.map(o => (
                                                <SelectItem className="hover:bg-neutral-100"  key={o.value} value={o.value}>
                                                    {o.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </FormField>
                        <FormField label="Φορέας *" error={errors.foreas?.message}>
                            <Controller name="foreas" control={control}
                                render={({ field }) => (
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger className={`w-full bg-white ${errors.foreas ? "border-red-400" : "border-gray-200"}`}>
                                            <SelectValue placeholder="Επιλέξτε φορέα" />
                                        </SelectTrigger>
                                        <SelectContent position="popper" className="bg-white border border-neutral-200 outline-0 ring-0">
                                            {moveForeas.map(o => (
                                                <SelectItem className="hover:bg-neutral-100"  key={o.value} value={o.value}>
                                                    {o.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </FormField>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField label="Ημερομηνία Έναρξης *" error={errors.dateFrom?.message}>
                                <Controller name="dateFrom" control={control}
                                    render={({ field }) => (
                                        <Input 
                                            type="date"
                                            value={field.value}
                                            onChange={field.onChange}
                                            className={`w-full bg-white ${errors.dateFrom ? "border-red-400" : "border-gray-200"}`}
                                        />
                                    )}
                                />
                            </FormField>
                            <FormField label="Ημερομηνία Λήξης *" error={errors.dateTo?.message}>
                                <Controller name="dateTo" control={control}
                                    render={({ field }) => (
                                        <Input 
                                            type="date"
                                            value={field.value}
                                            onChange={field.onChange}
                                            className={`w-full bg-white ${errors.dateTo ? "border-red-400" : "border-gray-200"}`}
                                        />
                                    )}
                                />
                            </FormField>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField label="Αριθμός Απόφασης" error={errors.decision?.message}>
                                <Controller name="decision" control={control}
                                    render={({ field }) => (
                                        <Input 
                                            placeholder="Αριθμός απόφασης" 
                                            value={field.value || ''}
                                            onChange={(e) => field.onChange(e.target.value || null)}
                                            className={`w-full bg-white ${errors.decision ? "border-red-400" : "border-gray-200"}`}
                                        />
                                    )}
                                />
                            </FormField>
                            <FormField label="Ημερομηνία Απόφασης" error={errors.dateDecision?.message}>
                                <Controller name="dateDecision" control={control}
                                    render={({ field }) => (
                                        <Input 
                                            type="date"
                                            value={field.value}
                                            onChange={field.onChange}
                                            className={`w-full bg-white ${errors.dateDecision ? "border-red-400" : "border-gray-200"}`}
                                        />
                                    )}
                                />
                            </FormField>
                        </div>
                        <FormField label="Σχόλια" error={errors.comment?.message}>
                            <Controller name="comment" control={control}
                                render={({ field }) => (
                                    <textarea 
                                        placeholder="Σχόλια για τη μετακίνηση" 
                                        value={field.value || ''}
                                        onChange={field.onChange}
                                        className={`w-full bg-white border rounded-md p-2 resize-none ${errors.comment ? "border-red-400" : "border-gray-200"}`}
                                        rows={4}
                                    />
                                )}
                            />
                        </FormField>
                    </div>
                    <Separator className="bg-gray-300" />
                    <div className="flex gap-3 px-6 pb-4">
                        <Button type="button" className="flex-1 transition-all duration-200 hover:opacity-80 w-auto"
                            style={{ display: "flex", height: "var(--Height-H-10, 40px)", padding: "var(--Padding-Y-py-2, 8px) var(--Padding-X-px-4, 16px)", justifyContent: "center", alignItems: "center", alignSelf: "stretch", borderRadius: "var(--Radius-Rounded-Medium, 6px)", border: "1px solid var(--color-border)", background: "var(--color-ghost)", color: "var(--color-foreground)" }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f3f4f6"}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "var(--color-ghost)"}
                            onClick={() => setSheetOpen(false)}>Κλείσιμο</Button>
                        <Button className="flex-1 transition-all duration-200 hover:opacity-80 w-auto"
                            style={{ display: "flex", height: "var(--Height-H-10, 40px)", padding: "var(--Padding-Y-py-2, 8px) var(--Padding-X-px-4, 16px)", justifyContent: "center", alignItems: "center", alignSelf: "stretch", borderRadius: "var(--Radius-Rounded-Medium, 6px)", background: "var(--color-primary)", color: "var(--color-primary-foreground)" }}
                            disabled={isSaving}
                            onClick={handleSave}>Αποθήκευση</Button>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    )
}
