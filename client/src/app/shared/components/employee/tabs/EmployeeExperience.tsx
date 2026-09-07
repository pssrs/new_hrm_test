import EmployeeExpNow from "../card/experience/EmployeeExpNow";
import EmployeeExpPublic from "../card/experience/EmployeeExpPublic";
import EmployeeExpPrivate from "../card/experience/EmployeeExpPrivate";
import EmployeeExpPrev from "../card/experience/EmployeeExpPrev";
import { Filter, PlusIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { employeeExperienceSchema } from "@/lib/schemas/employeeExperienceSchema";
import { useEmployee } from "@/lib/hooks/useEmployee";
import { useParams } from "react-router";
import { showSuccessToast, showErrorToast, showWarningToast } from "@/lib/utils/toastHelpers";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { EXPERIENCE_TYPES } from "@/lib/types/constTypes";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { useValues } from "@/lib/hooks/useValues";
import { Combobox, ComboboxContent, ComboboxInput, ComboboxItem, ComboboxList } from "@/components/ui/combobox";

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

export default function EmployeeExperience() {
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
    const [sheetOpen, setSheetOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 5;
    const [filterType, setFilterType] = useState("");
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [organizationFieldKey, setOrganizationFieldKey] = useState(0);

    const { employeeExperienceList, isLoadingΕmployeeExperienceList, createEmployeeExperience, updateEmployeeExperience, deleteEmployeeExperience, employee, isLoadingEmployee } = useEmployee({ id });
    
    const { foreas } = useValues();
    const organizationOptions = foreas ? [foreas] : [];
    
    const filteredExperience = employeeExperienceList?.filter((exp) => {
        const matchesType = !filterType || String(exp.type) === filterType;

        return matchesType;
    }) || [];

    const rowCount = employeeExperienceList?.length || 0;
    const totalPages = Math.max(1, Math.ceil(rowCount / PAGE_SIZE));
    const startIdx = (page - 1) * PAGE_SIZE;
    const endIdx = startIdx + PAGE_SIZE;
    const paginatedList = filteredExperience?.slice(startIdx, endIdx) || [];

    
    type FormData = z.infer<typeof employeeExperienceSchema>;

    const defaultFormValues: FormData = {
        id: undefined,
        type: "",
        organization: "",
        startDate: "",
        endDate: "",
        comments: "",
        decisionNumber: "",
        checkbox1: 0,
        checkbox2: 0,
        checkbox3: 0,
        checkbox4: 0,
    };

    const { control, reset, getValues, formState: { errors }, trigger } = useForm<FormData>({
        resolver: zodResolver(employeeExperienceSchema),
        mode: "onChange",
        defaultValues: defaultFormValues,
    });

    const handleRowClick = (exp: Record<string, unknown>) => {
        setIsEditing(true);
        // Συμπληρώνουμε τη φόρμα με τα δεδομένα της εγγραφής (reset καθαρίζει και τυχόν παλιά errors)
        const startDateStr = typeof exp.dateFrom === 'string' ? exp.dateFrom : new Date(exp.dateFrom as string | Date).toISOString().split('T')[0];
        const endDateStr = typeof exp.dateTo === 'string' ? exp.dateTo : new Date(exp.dateTo as string | Date).toISOString().split('T')[0];
        reset({
            id: Number(exp.id),
            type: String(exp.type),
            organization: String(exp.carrier),
            startDate: startDateStr === "1900-01-01" ? "" : startDateStr,
            endDate: endDateStr === "1900-01-01" ? "" : endDateStr,
            comments: String(exp.comments),
            decisionNumber: String(exp.decisionId),
            checkbox1: Number(exp.mk),
            checkbox2: Number(exp.grade),
            checkbox3: Number(exp.sunt),
            checkbox4: Number(exp.auto),
        });
        setOrganizationFieldKey((k) => k + 1);
        setSheetOpen(true);
    };

    const handleDelete = (e: React.MouseEvent, experienceId: number) => {
      e.stopPropagation(); // Σταματάμε τη bubble event για να μην ανοίξει το edit sheet
      
      deleteEmployeeExperience(experienceId, {
        onSuccess: () => {
          showSuccessToast("Η προϋπηρεσία διαγράφηκε επιτυχώς!");
        },
        onError: (error: Error) => {
          showErrorToast(error?.message || "Σφάλμα κατά τη διαγραφή της προϋπηρεσίας");
        }
      });
    };

    const handleSave = async () => {
      const isFormValid = await trigger();
      if (!isFormValid) {
        return;
      }

      const formData = getValues();
      
      // Έλεγχος για επικάλυψη διαστημάτων
      const startDate = new Date(formData.startDate);
      const endDate = formData.endDate ? new Date(formData.endDate) : new Date("9999-12-31");
      const currentId = formData.id;

      // Έλεγχος αν υπάρχει άλλη προϋπηρεσία που επικαλύπτει το διάστημα
      const hasOverlap = employeeExperienceList?.some((exp: Record<string, unknown>) => {
        // Αν ενημερώνουμε, παραλείπουμε τον έλεγχο για την ίδια εγγραφή
        if (currentId && exp.id === currentId) return false;

        const expDateFrom = new Date(exp.dateFrom as string | Date);
        const expDateTo = new Date(exp.dateTo as string | Date);

        // Ελέγχουμε για επικάλυψη
        // Επικαλύπτονται αν: startDate <= expDateTo AND endDate >= expDateFrom
        return startDate <= expDateTo && endDate >= expDateFrom;
      });

      if (hasOverlap) {
        showWarningToast("Προσοχή: Υπάρχει ήδη καταχωριμένη προϋπηρεσία που επικαλύπτει αυτό το διάστημα!");
        return;
      }
      
      // Convert dates to ISO strings for API
      const payload: unknown = {
        id: formData.id || 0,
        am: employee?.am || 0,
        type: Number(formData.type),
        dateFrom: formData.startDate,
        dateTo: formData.endDate ? formData.endDate : "1900-01-01",
        years: "0",
        months: "0",
        days: "0",
        carrier: formData.organization,
        decisionId: formData.decisionNumber,
        comments: formData.comments,
        agonis: 0,
        mk: formData.checkbox1 ? 1 : 0,
        grade: formData.checkbox2 ? 1 : 0,
        sunt: formData.checkbox3 ? 1 : 0,
        auto: formData.checkbox4 ? "1" : "0",
        dateCouncil: new Date().toISOString().split('T')[0],
      };

      try {
        if (isEditing && formData.id) {
          // Update
          updateEmployeeExperience(payload as Experience, {
            onSuccess: () => {
              showSuccessToast("Η προϋπηρεσία ενημερώθηκε επιτυχώς!");
              setSheetOpen(false);
              reset();
              setIsEditing(false);
            },
            onError: (error: Error) => {
              showErrorToast(error?.message || "Σφάλμα κατά την ενημέρωση της προϋπηρεσίας");
            }
          });
        } else {
          // Create
          createEmployeeExperience(payload as Experience, {
            onSuccess: () => {
              showSuccessToast("Η προϋπηρεσία προστέθηκε επιτυχώς!");
              setSheetOpen(false);
              reset();
              setIsEditing(false);
            },
            onError: (error: Error) => {
              showErrorToast(error?.message || "Σφάλμα κατά την προσθήκη της προϋπηρεσίας");
            }
          });
        }
      } catch (error) {
        console.error("Σφάλμα κατά την αποθήκευση:", error);
      }
    };

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

    const typeMap: { [key: number]: string } = { ...EXPERIENCE_TYPES.map(item => ({ [Number(item.value)]: item.label })).reduce((acc, curr) => ({ ...acc, ...curr }), {}) };

    return (
        <div style={{ zoom: scale }}>
            {(isLoadingEmployee || isLoadingΕmployeeExperienceList) && (
              <div className="flex items-center justify-center h-96">
                <p className="text-gray-500">Φόρτωση δεδομένων...</p>
              </div>
            )}
            {!isLoadingEmployee && !isLoadingΕmployeeExperienceList && (
            <>
                <div className="mt-5 w-full grid md:grid-cols-4 gap-4.5">
                    <EmployeeExpNow experienceList={employeeExperienceList} />
                    <EmployeeExpPrev experienceList={employeeExperienceList} />
                    <EmployeeExpPublic experienceList={employeeExperienceList} />
                    <EmployeeExpPrivate experienceList={employeeExperienceList} />
                </div>
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
                                            <SelectTrigger className="w-full"> <SelectValue placeholder="Είδος προϋπηρεσίας" /> </SelectTrigger>
                                            <SelectContent position="popper" className="bg-white border border-neutral-200 outline-0 ring-0">
                                                {EXPERIENCE_TYPES?.map((pen) => (
                                                    <SelectItem className="hover:bg-neutral-100"
                                                        key={pen.value}
                                                        value={String(pen.value)}
                                                    >
                                                        {pen.label}
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
                    <Button variant="default" type="button" onClick={() => { setIsEditing(false); reset(defaultFormValues); setOrganizationFieldKey((k) => k + 1); setSheetOpen(true); }} className="transition-all duration-200 hover:opacity-80 w-auto"
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
                        <PlusIcon fontSize='small' />
                        Εισαγωγή προϋπηρεσίας
                    </Button>
                </div>
                <div data-slot='card' className='bg-card text-card-foreground flex flex-col overflow-hidden'>
                    <Table className='w-full bg-white  border-b-neutral-200 table-fixed mt-6' style={{ tableLayout: 'fixed' }}>
                        <TableHeader className='border-b' style={{ backgroundColor: '#F2F2F2F2' }}>
                            <TableRow className='border-b' style={{ backgroundColor: '#F2F2F2F2' }}>
                                <TableCell className='font-bold px-3 py-3 text-left' style={{ width: '23%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title='Όνομα'>Τύπος</TableCell>
                                <TableCell className='font-bold px-3 py-3 text-left' style={{ width: '16%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title='ΑΦΜ'>Φορέας</TableCell>
                                <TableCell className='font-bold px-3 py-3 text-left' style={{ width: '19%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title='Παράρτημα'>Έναρξη</TableCell>
                                <TableCell className='font-bold px-3 py-3 text-left' style={{ width: '19%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title='Τμήμα'>Λήξη</TableCell>
                                <TableCell className='font-bold px-3 py-3 text-left' style={{ width: '18%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title='Θέση'>Σχόλια</TableCell>
                                <TableCell className='font-bold px-3 py-3 text-center' style={{ width: '5%' }}></TableCell>
                            </TableRow>
                            </TableHeader>
                            <TableBody className='divide-y divide-neutral-200 bg-white'>
                                {paginatedList && paginatedList.map(exp => 
                                    <TableRow key={exp.id} className='hover:bg-neutral-50 transition-colors cursor-pointer' onClick={() => handleRowClick(exp)}>
                                        <TableCell className='px-3 py-3 text-left' style={{ width: '23%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} >{typeMap[exp.type] || exp.type}</TableCell>
                                        <TableCell className='px-3 py-3 text-left' style={{ width: '16%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} >{exp.carrier}</TableCell>
                                        <TableCell className='px-3 py-3 text-left' style={{ width: '19%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} >{formatDate(exp.dateFrom)}</TableCell>
                                        <TableCell className='px-3 py-3 text-left' style={{ width: '19%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} >{formatDate(exp.dateTo) == '01/01/1900' ? 'Σήμερα' : formatDate(exp.dateTo)}</TableCell>
                                        <TableCell className='px-3 py-3 text-left' style={{ width: '18%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} >{exp.comments}</TableCell>
                                        <TableCell className='px-3 py-3 text-center' style={{ width: '5%' }}>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();

                                                    if (window.confirm("Είστε σίγουροι ότι θέλετε να διαγράψετε την προϋπηρεσία;")) {
                                                        handleDelete(e, exp.id as number);
                                                    }
                                                }}
                                                className='hover:text-gray-600 transition-colors'
                                                title='Διαγραφή'
                                            >
                                            <Trash2Icon size={18} />
                                            </button>
                                        </TableCell>
                                    </TableRow>
                                )}
                        </TableBody>
                    </Table>
                    <Separator className="bg-neutral-200" />
                    {totalPages > 1 && (
                    <div className='flex items-center justify-center bg-white w-full h-20'>
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious href='#' onClick={(e) => { e.preventDefault(); if (page > 1) setPage(page - 1); }} aria-disabled={page <= 1} />
                                </PaginationItem>

                                {(() => {
                                    const maxButtons = 4;
                                    const pages: (number | '...')[] = [];

                                    if (totalPages <= maxButtons) {
                                    for (let i = 1; i <= totalPages; i++) pages.push(i);
                                    } else {
                                    const siblingCount = 1;
                                    const left = Math.max(2, page - siblingCount);
                                    const right = Math.min(totalPages - 1, page + siblingCount);

                                    pages.push(1);
                                    if (left > 2) pages.push('...');
                                    for (let i = left; i <= right; i++) pages.push(i);
                                    if (right < totalPages - 1) pages.push('...');
                                    pages.push(totalPages);
                                    }

                                    return pages.map((pItem, idx) => {
                                    if (pItem === '...') {
                                        return (
                                        <PaginationItem key={`dots-${idx}`}>
                                            <PaginationEllipsis />
                                        </PaginationItem>
                                        );
                                    }

                                    const pNum = pItem as number;
                                    const isActive = pNum === page;
                                    return (
                                        <PaginationItem key={pNum}>
                                        <PaginationLink href='#' isActive={isActive} onClick={(e) => { e.preventDefault(); setPage(pNum); }}>
                                            {pNum}
                                        </PaginationLink>
                                        </PaginationItem>
                                    );
                                });
                            })()}

                            <PaginationItem>
                                <PaginationNext href='#' onClick={(e) => { e.preventDefault(); if (page < totalPages) setPage(page + 1); }} aria-disabled={page >= totalPages} />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                    </div>
                    )}
                </div>

                <Sheet 
                    open={sheetOpen} 
                    onOpenChange={(open) => { 
                        setSheetOpen(open); 
                        if (!open) { 
                            reset(defaultFormValues); 
                            setIsEditing(false); 
                        } 
                    }}
                    modal={false}
                >
                    <SheetContent className="w-125 sm:w-150 flex flex-col bg-white" side="right">
                        <SheetHeader>
                            <SheetTitle className="text-lg font-bold p-1">Στοιχεία Προϋπηρεσίας</SheetTitle>
                            <SheetDescription className="sr-only"></SheetDescription>
                        </SheetHeader>
                        <Separator className="bg-gray-300 -mt-5" />
                        <div className="flex-1 space-y-4 overflow-y-auto p-6 -mt-4">
                            <FormField label="Φορέας" error={errors.organization?.message}>
                            <Controller control={control} name="organization" render={({ field }) => (
                                <Combobox
                                    key={organizationFieldKey}
                                    items={organizationOptions}
                                    value={field.value ?? ""}
                                    onInputValueChange={(value) => field.onChange(value)}
                                    onValueChange={(value) => { if (value) field.onChange(value); }}
                                >
                                    <ComboboxInput
                                        placeholder="Όνομα φορέα"
                                        className={`bg-white ${errors.organization ? "border-red-400" : "border-gray-200"}`}
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
                        <FormField label="Τύπος" error={errors.type?.message}>
                            <Controller control={control} name="type" render={({ field }) => (
                                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                                    <SelectTrigger className={`w-full bg-white ${errors.type ? "border-red-400" : "border-gray-200"}`}><SelectValue placeholder="Επιλέξτε τύπο" /></SelectTrigger>
                                    <SelectContent position="popper" className="bg-white border border-neutral-200 outline-0 ring-0">
                                        {EXPERIENCE_TYPES.map((item) => (
                                            <SelectItem className="hover:bg-neutral-100" key={item.value} value={item.value}>{item.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )} />
                        </FormField>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField label="Ημερομηνία Έναρξης" error={errors.startDate?.message}>
                                <Controller control={control} name="startDate" render={({ field }) => (
                                    <Input {...field} type="date" className={`bg-white ${errors.startDate ? "border-red-400" : "border-gray-200"}`} />
                                )} />
                            </FormField>
                            <FormField label="Ημερομηνία Λήξης" error={errors.endDate?.message}>
                                <Controller control={control} name="endDate" render={({ field }) => (
                                    <Input {...field} type="date" className={`bg-white ${errors.endDate ? "border-red-400" : "border-gray-200"}`} />
                                )} />
                            </FormField>
                        </div>
                        <FormField label="Αριθμός απόφασης" error={errors.decisionNumber?.message}>
                            <Controller control={control} name="decisionNumber" render={({ field }) => (
                                <Input {...field} className={`bg-white ${errors.decisionNumber ? "border-red-400" : "border-gray-200"}`} placeholder="Αριθμός απόφασης" />
                            )} />
                        </FormField>
                        <FormField label="Σχόλια" error={errors.comments?.message}>
                            <Controller control={control} name="comments" render={({ field }) => (
                                <textarea {...field} className={`w-full bg-white border rounded-md p-2 resize-none ${errors.comments ? "border-red-400" : "border-gray-200"}`} placeholder="Σχόλια" rows={4} />
                            )} />
                        </FormField>
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center space-x-2">
                                    <Controller control={control} name="checkbox1" render={({ field: { value, onChange } }) => (
                                        <Checkbox checked={value === 1} onCheckedChange={(checked) => onChange(checked ? 1 : 0)} className="w-4 h-4 rounded border-gray-300" />
                                    )} />
                                    <label className="text-sm text-gray-700">Μισθολογικό Κλιμάκιο</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Controller control={control} name="checkbox2" render={({ field: { value, onChange } }) => (
                                        <Checkbox checked={value === 1} onCheckedChange={(checked) => onChange(checked ? 1 : 0)} className="w-4 h-4 rounded border-gray-300" />
                                    )} />
                                    <label className="text-sm text-gray-700">Βαθμός</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Controller control={control} name="checkbox3" render={({ field: { value, onChange } }) => (
                                        <Checkbox checked={value === 1} onCheckedChange={(checked) => onChange(checked ? 1 : 0)} className="w-4 h-4 rounded border-gray-300" />
                                    )} />
                                    <label className="text-sm text-gray-700">Συντάξιμα</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Controller control={control} name="checkbox4" render={({ field: { value, onChange } }) => (
                                        <Checkbox checked={value === 1} onCheckedChange={(checked) => onChange(checked ? 1 : 0)} className="w-4 h-4 rounded border-gray-300" />
                                    )} />
                                    <label className="text-sm text-gray-700">Μη αυτόματα</label>
                                </div>
                            </div>
                        </div>
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
                                onClick={handleSave}>Αποθήκευση</Button>
                        </div>
                  </SheetContent>
              </Sheet>
            </>
            )}
        </div>
    )
}