import { PlusIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { useEmployee } from "@/lib/hooks/useEmployee";
import { useParams } from "react-router";
import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toastHelpers";
import { employeeChildSchema } from "@/lib/schemas/employeeChildSchema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CHILD_LEVEL } from "@/lib/types/constTypes";
import { Checkbox } from "@/components/ui/checkbox";

function FormField({ label, error, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {children}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

interface FormFieldProps {
    label: string;
    error?: string;
    children: React.ReactNode;
}

const REFERENCE_WIDTH = 1600;
const MIN_SCALE = 0.6;

export default function EmployeeChildren() {
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
    const { employeeChildrenList, createEmployeeChildren, updateEmployeeChildren, deleteEmployeeChildren } = useEmployee({ id });
    const [sheetOpen, setSheetOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    type FormData = z.infer<typeof employeeChildSchema>;
    
    const defaultFormValues = {
        id: undefined,
        employeeId: Number(id) || 0,
        childSurname: "",
        childName: "",
        childFather: "",
        childSex: 0,
        childBirth: "",
        childDateFrom: "",
        childDateTo: "",
        childDisability: 0,
        childLevel: 0,
        childSchool: 0,
        childYears: "0",
        childMonths: "0",
        childFlag: 0,
        child18: 0,
    } satisfies FormData;

    const handleRowClick = (child: Children) => {
        setIsEditing(true);
        setValue("id", Number(child.id));
        setValue("employeeId", Number(child.employeeId));
        setValue("childSurname", String(child.childSurname));
        setValue("childName", String(child.childName));
        setValue("childFather", String(child.childFather));
        setValue("childSex", Number(child.childSex));
        setValue("childBirth", formDate(child.childBirth));
        setValue("childDateFrom", formDate(child.childDateFrom));
        setValue("childDateTo", formDate(child.childDateTo));
        setValue("childDisability", Number(child.childDisability));
        setValue("childLevel", Number(child.childLevel));
        setValue("childSchool", Number(child.childSchool));
        setValue("childYears", String(child.childYears));
        setValue("childMonths", String(child.childMonths));
        setValue("childFlag", Number(child.childFlag));
        setValue("child18", Number(child.child18));
        setValue("childSchoolDesc", String(child.childSchoolDesc));
        setSheetOpen(true);
    };

    const formDate = (date: string | Date | null | undefined): string => {
        if (!date) return "";
        const formattedDate =
            typeof date === "string"
                ? date.split("T")[0]
                : date.toISOString().split("T")[0];
        return formattedDate === "1900-01-01" ? "" : formattedDate;
    };

    const { control, reset, setValue, getValues, formState: { errors, isValid }, trigger } = useForm<FormData>({
          resolver: zodResolver(employeeChildSchema),
          mode: "onChange",
          defaultValues: defaultFormValues,
    });

    const handleSave = async () => {
        const isFormValid = await trigger();
        if (!isFormValid) return;

        const formData = getValues();
        
        try {
            if (isEditing && formData.id) {
                updateEmployeeChildren(
                    {
                        id: formData.id,
                        employeeId: formData.employeeId,
                        childSurname: formData.childSurname,
                        childName: formData.childName ,
                        childFather: formData.childFather,
                        childSex: formData.childSex ? formData.childSex : 0,
                        childBirth: formData.childBirth,
                        childDateFrom: formData.childDateFrom == undefined || formData.childDateFrom == '' ? "1900-01-01" : formData.childDateFrom,
                        childDateTo: formData.childDateTo == undefined || formData.childDateTo == '' ? "1900-01-01" : formData.childDateTo,
                        childDisability: formData.childDisability ?? 0,
                        childLevel: formData.childLevel || 0,
                        childSchool: formData.childSchool || 0,
                        childYears: formData.childYears == undefined ? "0" : formData.childYears,
                        childMonths: formData.childMonths == undefined ? "0" : formData.childMonths,
                        childFlag: formData.childFlag || 0,
                        child18: formData.child18 || 0,
                        childSchoolDesc: formData.childSchoolDesc || "",
                    },
                    {
                        onSuccess: () => {
                            showSuccessToast("Το τέκνο ενημερώθηκε με επιτυχία");
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
                createEmployeeChildren(
                    {
                        id: 0,
                        employeeId: formData.employeeId,
                        childSurname: formData.childSurname,
                        childName: formData.childName ,
                        childFather: formData.childFather,
                        childSex: formData.childSex ? formData.childSex : 0,
                        childBirth: formData.childBirth,
                        childDateFrom: formData.childDateFrom == undefined || formData.childDateFrom == '' ? "1900-01-01" : formData.childDateFrom,
                        childDateTo: formData.childDateTo == undefined || formData.childDateTo == '' ? "1900-01-01" : formData.childDateTo,
                        childDisability: formData.childDisability ?? 0,
                        childLevel: formData.childLevel || 0,
                        childSchool: formData.childSchool || 0,
                        childYears: formData.childYears == undefined ? "0" : formData.childYears,
                        childMonths: formData.childMonths == undefined ? "0" : formData.childMonths,
                        childFlag: formData.childFlag || 0,
                        child18: formData.child18 || 0,
                        childSchoolDesc: formData.childSchoolDesc || "",
                    },
                    {
                        onSuccess: () => {
                            showSuccessToast("Το τέκνο δημιουργήθηκε με επιτυχία");
                            reset(defaultFormValues);
                            setSheetOpen(false);
                            setIsEditing(false);
                        },
                        onError: (error) => {
                            showErrorToast("Σφάλμα κατά τη δημιουργία του τέκνου");
                            console.error(error);
                        }
                    }
                );
            }
        } catch (error) {
            console.error("Error saving penalty:", error);
        }
    };

    const handleDelete = (e: React.MouseEvent, childId: number) => {
        e.stopPropagation();

        deleteEmployeeChildren(childId, {
            onSuccess: () => {
                showSuccessToast("Το τέκνο διαγράφηκε με επιτυχία");
            },
            onError: (error) => {
                showErrorToast("Σφάλμα κατά τη διαγραφή του τέκνου");
                console.error(error);
            }
        });
    };

    const handleCloseSheet = () => {
        setSheetOpen(false);
        setIsEditing(false);
        reset(defaultFormValues);
    };

    const handleAddNew = () => {
        setIsEditing(false);
        reset(defaultFormValues);
        setSheetOpen(true);
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

    const getChildLevel = (childLevelId: number) => {
        const childLevelDesc = CHILD_LEVEL?.find(c => c.value === String(childLevelId));
        return childLevelDesc?.label || 'Άγνωστο Επίπεδο';
    };
    
    return (
        <div className="relative" style={{ zoom: scale }}>
            <div className="flex justify-end mt-10">
                <Button
                    variant="default"
                    type="button"
                    className="transition-all duration-200 hover:opacity-80 w-auto"
                    onClick={handleAddNew}
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
                    <PlusIcon fontSize='small' />Εισαγωγή τέκνου
                </Button>
            </div>
            <div data-slot='card' className='bg-card text-card-foreground flex flex-col overflow-hidden'>
                <Table className='w-full bg-white  border-b-neutral-200 table-fixed mt-6' style={{ tableLayout: 'fixed' }}>
                    <TableHeader className='border-b' style={{ backgroundColor: '#F2F2F2F2' }}>
                        <TableRow className='border-b' style={{ backgroundColor: '#F2F2F2F2' }}>
                            <TableCell className='font-bold px-3 py-3 text-left' style={{ width: '23%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title='Είδος'>Επώνυμο</TableCell>
                            <TableCell className='font-bold px-3 py-3 text-left' style={{ width: '16%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title='Προορισμός'>Όνομα</TableCell>
                            <TableCell className='font-bold px-3 py-3 text-left' style={{ width: '19%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title='Φορέας'>Ημ/νια γέννησης</TableCell>
                            <TableCell className='font-bold px-3 py-3 text-left' style={{ width: '19%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title='Έναρξη'>Επίπεδο</TableCell>
                            <TableCell className='font-bold px-3 py-3 text-left' style={{ width: '18%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title='Λήξη'>Αναπηρία</TableCell>
                            <TableCell className='font-bold px-3 py-3 text-center' style={{ width: '5%' }}></TableCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody className='divide-y divide-neutral-200 bg-white'>
                        {employeeChildrenList && employeeChildrenList.map(child => 
                            <TableRow 
                                key={child.id}
                                className='hover:bg-neutral-50 transition-colors cursor-pointer'
                                onClick={() => handleRowClick(child)}
                            >
                                <TableCell className='px-3 py-3 text-left' style={{ width: '23%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} >{child.childSurname}</TableCell>
                                <TableCell className='px-3 py-3 text-left' style={{ width: '16%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} >{child.childName}</TableCell>
                                <TableCell className='px-3 py-3 text-left' style={{ width: '19%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} >{formatDate(child.childBirth)}</TableCell>
                                <TableCell className='px-3 py-3 text-left' style={{ width: '19%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} >{getChildLevel(child.childLevel)}</TableCell>
                                <TableCell className='px-3 py-3 text-left' style={{ width: '18%' }} >
                                    <Checkbox
                                        checked={child.childDisability == 1}
                                        disabled
                                        className="w-4 h-4 cursor-not-allowed"
                                    />
                                </TableCell>
                                <TableCell className='px-3 py-3 text-center' style={{ width: '5%' }}>
                                    <button
                                        className='hover:text-gray-600 transition-colors'
                                        title='Διαγραφή'
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if(window.confirm('Είστε σίγουροι ότι θέλετε να διαγράψετε αυτή την εγγραφή;')) {
                                                handleDelete(e, child.id);
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

            <Sheet open={sheetOpen} onOpenChange={(open) => { setSheetOpen(open); if (!open) handleCloseSheet(); }}>
                <SheetContent className="w-125 sm:w-150 flex flex-col bg-white" side="right">
                    <SheetHeader>
                        <SheetTitle className="text-lg font-bold p-1">Τέκνο</SheetTitle>
                    </SheetHeader>
                    <Separator className="bg-gray-300 -mt-5" />
                    <div className="flex-1 space-y-4 overflow-y-auto p-6 -mt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField label="Όνομα *" error={errors.childName?.message}>
                                <Controller name="childName" control={control}
                                    render={({ field }) => (
                                        <Input 
                                            value={field.value}
                                            onChange={field.onChange}
                                            className={`w-full bg-white ${errors.childName ? "border-red-400" : "border-gray-200"}`}
                                        />
                                    )}
                                />
                            </FormField>
                            <FormField label="Επίθετο *" error={errors.childSurname?.message}>
                                <Controller name="childSurname" control={control}
                                    render={({ field }) => (
                                        <Input 
                                            value={field.value}
                                            onChange={field.onChange}
                                            className={`w-full bg-white ${errors.childSurname ? "border-red-400" : "border-gray-200"}`}
                                        />
                                    )}
                                />
                            </FormField>
                        </div>
                        <FormField label="Όνομα Γονέα *" error={errors.childFather?.message}>
                            <Controller name="childFather" control={control}
                                render={({ field }) => (
                                    <Input 
                                        placeholder="Όνομα Γονέα" 
                                        value={field.value || ''}
                                        onChange={(e) => field.onChange(e.target.value || null)}
                                        className={`w-full bg-white ${errors.childFather ? "border-red-400" : "border-gray-200"}`}
                                    />
                                )}
                            />
                        </FormField>
                        <FormField label="Ημερομηνία Γέννησης *" error={errors.childBirth?.message}>
                            <Controller name="childBirth" control={control}
                                render={({ field }) => (
                                    <Input 
                                        type="date"
                                        value={field.value}
                                        onChange={field.onChange}
                                        className={`w-full bg-white ${errors.childBirth ? "border-red-400" : "border-gray-200"}`}
                                    />
                                )}
                            />
                        </FormField>
                        <FormField label="Επίπεδο" error={errors.childLevel?.message}>
                            <Controller name="childLevel" control={control}
                                render={({ field }) => (
                                    <Select value={field.value ? String(field.value) : ''} onValueChange={(val) => field.onChange(val ? Number(val) : null)}>
                                        <SelectTrigger className={`w-full bg-white ${errors.childLevel ? "border-red-400" : "border-gray-200"}`}>
                                            <SelectValue placeholder="Επιλέξτε επίπεδο" />
                                        </SelectTrigger>
                                        <SelectContent position="popper" className="bg-white border border-neutral-200 outline-0 ring-0">
                                            {CHILD_LEVEL?.map(p => (
                                                <SelectItem className="hover:bg-neutral-100" key={p.value} value={String(p.value)}>
                                                    {p.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </FormField>
                        <FormField label="Σχολή" error={errors.childSchoolDesc?.message}>
                            <Controller name="childSchoolDesc" control={control}
                                render={({ field }) => (
                                    <Input 
                                        type="text"
                                        value={field.value}
                                        onChange={field.onChange}
                                        className={`w-full bg-white ${errors.childSchoolDesc ? "border-red-400" : "border-gray-200"}`}
                                    />
                                )}
                            />
                        </FormField>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField label="Ημερομηνία Έναρξης *" error={errors.childDateFrom?.message}>
                                <Controller name="childDateFrom" control={control}
                                    render={({ field }) => (
                                        <Input 
                                            type="date"
                                            value={field.value}
                                            onChange={field.onChange}
                                            className={`w-full bg-white ${errors.childDateFrom ? "border-red-400" : "border-gray-200"}`}
                                        />
                                    )}
                                />
                            </FormField>
                            <FormField label="Ημερομηνία Λήξης *" error={errors.childDateTo?.message}>
                                <Controller name="childDateTo" control={control}
                                    render={({ field }) => (
                                        <Input 
                                            type="date"
                                            value={field.value}
                                            onChange={field.onChange}
                                            className={`w-full bg-white ${errors.childDateTo ? "border-red-400" : "border-gray-200"}`}
                                        />
                                    )}
                                />
                            </FormField>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField label="Αναπηρία" error={errors.childDisability?.message}>
                                <Controller
                                    name="childDisability"
                                    control={control}
                                    render={({ field }) => (
                                        <RadioGroup
                                            value={String(field.value ?? 0)}
                                            onValueChange={(value) => field.onChange(Number(value))}
                                        >
                                            <div className="flex items-center gap-2">
                                                <RadioGroupItem
                                                    value="1"
                                                    id="disability-yes"
                                                    className="border-2 border-black data-[state=checked]:bg-red-500"
                                                />
                                                <Label htmlFor="disability-yes">Ναι</Label>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <RadioGroupItem
                                                    value="0"
                                                    id="disability-no"
                                                    className="border-2 border-black data-[state=checked]:bg-red-500"
                                                />
                                                <Label htmlFor="disability-no">Όχι</Label>
                                            </div>
                                        </RadioGroup>
                                    )}
                                />
                            </FormField>
                            <FormField label="Επίδομα" error={errors.childFlag?.message}>
                                <Controller
                                    name="childFlag"
                                    control={control}
                                    render={({ field }) => (
                                        <RadioGroup
                                            value={String(field.value ?? 0)}
                                            onValueChange={(value) => field.onChange(Number(value))}
                                        >
                                            <div className="flex items-center gap-2">
                                                <RadioGroupItem
                                                    value="1"
                                                    id="gender-male"
                                                    className="border-2 border-black data-[state=checked]:bg-red-500"
                                                />
                                                <Label htmlFor="gender-male">Ναι</Label>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <RadioGroupItem
                                                    value="0"
                                                    id="gender-female"
                                                    className="border-2 border-black data-[state=checked]:bg-red-500"
                                                />
                                                <Label htmlFor="gender-female">Όχι</Label>
                                            </div>
                                        </RadioGroup>
                                    )}
                                />
                            </FormField>
                        </div>
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
                            disabled={!isValid}
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