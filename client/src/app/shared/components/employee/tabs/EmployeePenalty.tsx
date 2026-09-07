import { Filter, PlusIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { useEmployee } from "@/lib/hooks/useEmployee";
import { useParams } from "react-router";
import { useValues } from "@/lib/hooks/useValues";
import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { employeePenaltySchema } from "@/lib/schemas/employeePenaltySchema";
import { showSuccessToast, showErrorToast } from "@/lib/utils/toastHelpers";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import FormField from "@/app/shared/FormField";

const penaltyDescriptionOptions = [
    { value: "1", label: "Αυτοδίκαιη και δυνητική αργία δημοσίου υπαλλήλου" }
];

const REFERENCE_WIDTH = 1600;
const MIN_SCALE = 0.6;

export default function EmployeePenalty() {
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

    const { id } = useParams<{ id: string }>();
    const { employeePenaltyList, createEmployeePenalty, updateEmployeePenalty, deleteEmployeePenalty } = useEmployee({ id });
    const { penalties } = useValues();
    const [sheetOpen, setSheetOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [filterType, setFilterType] = useState("");
    const [filtersOpen, setFiltersOpen] = useState(false);

    type FormData = z.infer<typeof employeePenaltySchema>;

    const defaultFormValues = {
        id: undefined,
        am: Number(id) || 0,
        type: "",
        lexical: 0,
        description: null,
        decision: null,
        dateFrom: "",
        dateTo: "",
        amount: null,
        flag: 0,
    } satisfies FormData;

    const { control, reset, setValue, getValues, formState: { errors }, trigger } = useForm<FormData>({
        resolver: zodResolver(employeePenaltySchema),
        mode: "onChange",
        defaultValues: defaultFormValues,
    });

    useEffect(() => {
        if (!sheetOpen) {
            const timer = setTimeout(() => {
                reset(defaultFormValues);
            }, 300);  // ίσο με τη διάρκεια του animation
            return () => clearTimeout(timer);
        }
    }, [sheetOpen]);

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

    const handleRowClick = (penalty: Record<string, unknown>) => {
        setIsEditing(true);
        setValue("id", Number(penalty.id));
        setValue("am", Number(penalty.am));
        setValue("type", String(penalty.type));
        setValue("lexical", penalty.lexical ? Number(penalty.lexical) : 0);
        setValue("description", penalty.description ? String(penalty.description) : null);
        setValue("decision", penalty.decision ? String(penalty.decision) : null);
        setValue("dateFrom", typeof penalty.dateFrom === 'string' ? penalty.dateFrom : new Date(penalty.dateFrom as string | Date).toISOString().split('T')[0]);
        setValue("dateTo", typeof penalty.dateTo === 'string' ? penalty.dateTo : new Date(penalty.dateTo as string | Date).toISOString().split('T')[0]);
        setValue("amount", penalty.amount ? String(penalty.amount) : null);
        setValue("flag", Number(penalty.flag));
        setSheetOpen(true);
    };

    const handleSave = async () => {
        const isFormValid = await trigger();
        if (!isFormValid) return;

        const formData = getValues();
        
        try {
            if (isEditing && formData.id) {
                updateEmployeePenalty(
                    {
                        id: formData.id,
                        am: formData.am,
                        type: Number(formData.type),
                        lexical: formData.lexical ? Number(formData.lexical) : null,
                        description: formData.description ?? null,
                        decision: formData.decision ?? null,
                        dateFrom: formData.dateFrom,
                        dateTo: formData.dateTo,
                        amount: formData.amount ?? null,
                        flag: formData.flag ?? 0,
                    },
                    {
                        onSuccess: () => {
                            showSuccessToast("Ποινή ενημερώθηκε με επιτυχία");
                            reset(defaultFormValues);
                            setSheetOpen(false);
                            setIsEditing(false);
                        },
                        onError: (error) => {
                            showErrorToast("Σφάλμα κατά την ενημέρωση της ποινής");
                            console.error(error);
                        }
                    }
                );
            } else {
                createEmployeePenalty(
                    {
                        id: 0,
                        am: formData.am,
                        type: Number(formData.type),
                        lexical: formData.lexical ? Number(formData.lexical) : null,
                        description: formData.description ?? null,
                        decision: formData.decision ?? null,
                        dateFrom: formData.dateFrom,
                        dateTo: formData.dateTo,
                        amount: formData.amount ?? null,
                        flag: formData.flag ?? 0,
                    },
                    {
                        onSuccess: () => {
                            showSuccessToast("Ποινή δημιουργήθηκε με επιτυχία");
                            reset(defaultFormValues);
                            setSheetOpen(false);
                            setIsEditing(false);
                        },
                        onError: () => {
                            showErrorToast("Σφάλμα κατά τη δημιουργία της ποινής");
                        }
                    }
                );
            }
        } catch (error) {
            console.error("Error saving penalty:", error);
        }
    };

    const handleDelete = (e: React.MouseEvent, penaltyId: number) => {
        e.stopPropagation();
        
        deleteEmployeePenalty(penaltyId, {
            onSuccess: () => {
                showSuccessToast("Ποινή διαγράφηκε με επιτυχία");
            },
            onError: (error) => {
                showErrorToast("Σφάλμα κατά τη διαγραφή της ποινής");
                console.error(error);
            }
        });
    };

    const handleAddNew = () => {
        setIsEditing(false);
        reset(defaultFormValues);
        setSheetOpen(true);
    };

    const handleCloseSheet = () => {
        setSheetOpen(false);
        setIsEditing(false);
        reset(defaultFormValues);
    };

    const getPenaltyDescription = (penaltyId: number) => {
        const penaltyDesc = penalties?.find(p => p.id === penaltyId);
        return penaltyDesc?.description || 'Άγνωστη Ποινή';
    };

    const calculatePenaltyDays = (dateFrom: string | Date, dateTo: string | Date): number => {
        const from = typeof dateFrom === 'string' ? new Date(dateFrom) : dateFrom;
        const to = typeof dateTo === 'string' ? new Date(dateTo) : dateTo;
        const timeDiff = to.getTime() - from.getTime();
        return Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1; // +1 για να περιλάβει και τις δύο μέρες
    };

    return (
        <div style={{ zoom: scale }}>
            <div className="flex justify-end mt-10 gap-2">
                <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="default"
                            type="button"
                            className="transition-all duration-200 hover:opacity-80 w-auto border border-neutral-200 bg-white px-4 py-2 rounded-md hover:bg-neutral-100 flex items-center gap-2"
                            style={{
                                display: 'flex',
                                height: 'var(--Height-H-10, 40px)',
                                padding: 'var(--Padding-Y-py-2, 8px) var(--Padding-X-px-4, 16px)',
                                justifyContent: 'center',
                                alignItems: 'center',
                                alignSelf: 'stretch',
                                borderRadius: 'var(--Radius-Rounded-Medium, 6px)'
                            }}
                        >
                            <Filter size={16} />
                            Φίλτρα
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-100 bg-white border-0 outline-0 ring-0">
                        <div className="space-y-4">
                            <h4 className="font-medium">Φίλτρα</h4>
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <Select value={filterType} onValueChange={setFilterType}>
                                        <SelectTrigger className="w-full"> <SelectValue placeholder="Είδος ποινής" /> </SelectTrigger>
                                        <SelectContent position="popper" className="bg-white border border-neutral-200 outline-0 ring-0">
                                            {penalties?.map((pen) => (
                                                <SelectItem className="hover:bg-neutral-100" 
                                                    key={pen.type}
                                                    value={String(pen.type)}
                                                >
                                                    {pen.description}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setFilterType("");
                                        setFiltersOpen(false);
                                    }}
                                >
                                    Καθαρισμός
                                </Button>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
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
                    <PlusIcon fontSize='small' />Εισαγωγή Ποινής
                </Button>
            </div>
            <div data-slot='card' className='bg-card text-card-foreground flex flex-col overflow-hidden'>
                <Table className='w-full bg-white  border-b-neutral-200 table-fixed mt-6' style={{ tableLayout: 'fixed' }}>
                    <TableHeader className='border-b' style={{ backgroundColor: '#F2F2F2F2' }}>
                        <TableRow className='border-b' style={{ backgroundColor: '#F2F2F2F2' }}>
                            <TableCell className='font-bold px-3 py-3 text-left' style={{ width: '23%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title='Τύπος'>Τύπος</TableCell>
                            <TableCell className='font-bold px-3 py-3 text-left' style={{ width: '16%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title='Ποινή'>Ποινή</TableCell>
                            <TableCell className='font-bold px-3 py-3 text-left' style={{ width: '19%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title='Έναρξη'>Έναρξη</TableCell>
                            <TableCell className='font-bold px-3 py-3 text-left' style={{ width: '19%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title='Λήξη'>Λήξη</TableCell>
                            <TableCell className='font-bold px-3 py-3 text-left' style={{ width: '18%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title='Ποσό'>Ποσό</TableCell>
                            <TableCell className='font-bold px-3 py-3 text-center' style={{ width: '5%' }}></TableCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody className='divide-y divide-neutral-200 bg-white'>
                        {employeePenaltyList && employeePenaltyList.map(pen => 
                            <TableRow 
                                key={pen.id}
                                className='hover:bg-neutral-50 transition-colors cursor-pointer'
                                onClick={() => handleRowClick(pen)}
                            >
                                <TableCell className='px-3 py-3 text-left' style={{ width: '23%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} >{getPenaltyDescription(pen.type)}</TableCell>
                                <TableCell className='px-3 py-3 text-left' style={{ width: '16%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} >{calculatePenaltyDays(pen.dateFrom, pen.dateTo)} {calculatePenaltyDays(pen.dateFrom, pen.dateTo) === 1 ? 'ημέρα' : 'ημέρες'}</TableCell>
                                <TableCell className='px-3 py-3 text-left' style={{ width: '19%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} >{formatDate(pen.dateFrom)}</TableCell>
                                <TableCell className='px-3 py-3 text-left' style={{ width: '19%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} >{formatDate(pen.dateTo)}</TableCell>
                                <TableCell className='px-3 py-3 text-left' style={{ width: '18%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} >{pen.amount} €</TableCell>
                                <TableCell className='px-3 py-3 text-center' style={{ width: '5%' }}>
                                    <button
                                        className='hover:text-gray-600 transition-colors'
                                        title='Διαγραφή'
                                        onClick={(e) => handleDelete(e, pen.id)}
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

            {/* Drawer for Add/Edit Penalty */}
            <Sheet open={sheetOpen} onOpenChange={(open) => { setSheetOpen(open); if (!open) handleCloseSheet(); }}>
                <SheetContent className="w-125 sm:w-150 flex flex-col bg-white" side="right">
                    <SheetHeader>
                        <SheetTitle className="text-lg font-bold p-1">Ποινή</SheetTitle>
                    </SheetHeader>
                    <Separator className="bg-gray-300 -mt-5" />
                    <div className="flex-1 space-y-4 overflow-y-auto p-6 -mt-4">
                        <FormField label="Τύπος *" error={errors.type?.message}>
                            <Controller name="type" control={control}
                                render={({ field }) => (
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger className={`w-full bg-white ${errors.type ? "border-red-400" : "border-gray-200"}`}>
                                            <SelectValue placeholder="Επιλέξτε ποινή" />
                                        </SelectTrigger>
                                        <SelectContent position="popper" className="bg-white border border-neutral-200 outline-0 ring-0">
                                            {penaltyDescriptionOptions.map(o => (
                                                <SelectItem className="hover:bg-neutral-100"  key={o.value} value={o.value}>
                                                    {o.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </FormField>
                        <FormField label="Ποινή" error={errors.lexical?.message}>
                            <Controller name="lexical" control={control}
                                render={({ field }) => (
                                    <Select value={field.value ? String(field.value) : ''} onValueChange={(val) => field.onChange(val ? Number(val) : null)}>
                                        <SelectTrigger className={`w-full bg-white ${errors.lexical ? "border-red-400" : "border-gray-200"}`}>
                                            <SelectValue placeholder="Επιλέξτε τύπο ποινής" />
                                        </SelectTrigger>
                                        <SelectContent position="popper" className="bg-white border border-neutral-200 outline-0 ring-0">
                                            {penalties?.map(p => (
                                                <SelectItem className="hover:bg-neutral-100"  key={p.id} value={String(p.id)}>
                                                    {p.description}
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
                        <FormField label="Ποσό" error={errors.amount?.message}>
                            <div className="relative">
                                <Controller
                                    name="amount"
                                    control={control}
                                    render={({ field }) => (
                                        <Input 
                                            placeholder="Ποσό ποινής" 
                                            value={field.value || ''}
                                            onChange={field.onChange}
                                            className={`w-full bg-white pr-8 ${errors.amount ? "border-red-400" : "border-gray-200"}`}
                                        />
                                    )}
                                />
                                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">€</span>
                            </div>
                        </FormField>
                        <FormField label="Στοιχεία Απόφασης" error={errors.decision?.message}>
                            <Controller name="decision" control={control}
                                render={({ field }) => (
                                    <Input 
                                        placeholder="Στοιχεία απόφασης" 
                                        value={field.value || ''}
                                        onChange={(e) => field.onChange(e.target.value || null)}
                                        className={`w-full bg-white ${errors.decision ? "border-red-400" : "border-gray-200"}`}
                                    />
                                )}
                            />
                        </FormField>
                        <FormField label="Περιγραφή" error={errors.description?.message}>
                            <Controller
                                name="description"
                                control={control}
                                render={({ field }) => (
                                    <textarea 
                                        placeholder="Περιγραφή ποινής" 
                                        value={field.value || ''}
                                        onChange={field.onChange}
                                        rows={4}
                                        className={`w-full bg-white p-2 border rounded-md resize-vertical ${errors.description ? "border-red-400" : "border-gray-200"}`}
                                    />
                                )}
                            />
                        </FormField>
                    </div>
                    <Separator className="bg-gray-300" />
                    <div className="flex gap-3 px-6 pb-4">
                        <Button type="button" className="flex-1 transition-all duration-200 hover:opacity-80 w-auto"
                            style={{ 
                                display: "flex", 
                                height: "var(--Height-H-10, 40px)", 
                                padding: "var(--Padding-Y-py-2, 8px) var(--Padding-X-px-4, 16px)", 
                                justifyContent: "center", 
                                alignItems: "center", 
                                alignSelf: "stretch", 
                                borderRadius: "var(--Radius-Rounded-Medium, 6px)", 
                                border: "1px solid var(--color-border)", 
                                background: "var(--color-ghost)", 
                                color: "var(--color-foreground)" 
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f3f4f6"}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "var(--color-ghost)"}
                            onClick={() => setSheetOpen(false)}
                        >
                            Κλείσιμο
                        </Button>
                        <Button className="flex-1 transition-all duration-200 hover:opacity-80 w-auto"
                            style={{ 
                                display: "flex", 
                                height: "var(--Height-H-10, 40px)", 
                                padding: "var(--Padding-Y-py-2, 8px) var(--Padding-X-px-4, 16px)", 
                                justifyContent: "center", 
                                alignItems: "center", 
                                alignSelf: "stretch", 
                                borderRadius: "var(--Radius-Rounded-Medium, 6px)", 
                                background: "var(--color-primary)", 
                                color: "var(--color-primary-foreground)" 
                            }}
                            onClick={handleSave}
                        >
                            {isEditing ? 'Ενημέρωση' : 'Αποθήκευση'}
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}
