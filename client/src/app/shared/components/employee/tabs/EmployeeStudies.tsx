import { PlusIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { useEmployee } from "@/lib/hooks/useEmployee";
import { useParams } from "react-router";
import EmployeeStudiesForm from "../form/studies/EmployeeStudiesForm";
import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { STUDY_EDUCATION } from "@/lib/types/constTypes";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toastHelpers";
import { useValues } from "@/lib/hooks/useValues";


const REFERENCE_WIDTH = 1600;
const MIN_SCALE = 0.6;

export default function EmployeeStudies() {
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

    const { id } = useParams<{ id: string }>();
    const { employeeStudiesList, deleteEmployeeStudies } = useEmployee({id});

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

    const getStudyEducation = (studyTypeId: number) => {
        const studyTypeDesc = STUDY_EDUCATION?.find(c => c.value === String(studyTypeId));
        return studyTypeDesc?.label || 'Άγνωστο Επίπεδο';
    };

    const [selectedStudy, setSelectedStudy] = useState<Studies | null>(null);
    const [openDrawer, setOpenDrawer] = useState(false);

    const handleRowClick = (study: Studies) => {
        setSelectedStudy(study);
        setOpenDrawer(true);
    };

    const handleAddNew = () => {
        setSelectedStudy(null);
        setOpenDrawer(true);
    }

    function handleCloseSheet() {
        setSelectedStudy(null);
        setOpenDrawer(false);
    }

    const handleDelete = (e: React.MouseEvent, childId: number) => {
        e.stopPropagation();

        deleteEmployeeStudies(childId, {
            onSuccess: () => {
                showSuccessToast("Το πτυχίο διαγράφηκε με επιτυχία");
            },
            onError: (error) => {
                showErrorToast("Σφάλμα κατά τη διαγραφή του πτυχίου");
                console.error(error);
            }
        });
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
                    <PlusIcon fontSize='small' />Εισαγωγή Σπουδών
                </Button>
            </div>
            <div data-slot='card' className='bg-card text-card-foreground flex flex-col overflow-hidden'>
                <Table className='w-full bg-white  border-b-neutral-200 table-fixed mt-6' style={{ tableLayout: 'fixed' }}>
                    <TableHeader className='border-b' style={{ backgroundColor: '#F2F2F2F2' }}>
                        <TableRow className='border-b' style={{ backgroundColor: '#F2F2F2F2' }}>
                            <TableCell className='font-bold px-3 py-3 text-left' style={{ width: '20%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title='Είδος'>Τύπος</TableCell>
                            <TableCell className='font-bold px-3 py-3 text-left' style={{ width: '13%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title='Προορισμός'>Τίτλος</TableCell>
                            <TableCell className='font-bold px-3 py-3 text-left' style={{ width: '16%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title='Φορέας'>Εκπαιδευτικό ίδρυμα</TableCell>
                            <TableCell className='font-bold px-3 py-3 text-left' style={{ width: '16%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title='Έναρξη'>Τόπος</TableCell>
                            <TableCell className='font-bold px-3 py-3 text-left' style={{ width: '16%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title='Λήξη'>Αποφοίτηση</TableCell>
                            <TableCell className='font-bold px-3 py-3 text-left' style={{ width: '15%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title='Λήξη'>Έτη Σπουδών</TableCell>
                            <TableCell className='font-bold px-3 py-3 text-center' style={{ width: '4%' }}></TableCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody className='divide-y divide-neutral-200 bg-white'>
                        {employeeStudiesList && employeeStudiesList.map(study => 
                            <TableRow 
                                key={study.id}
                                className='hover:bg-neutral-50 transition-colors cursor-pointer'
                                onClick={() => handleRowClick(study)}
                            >
                                <TableCell className='px-3 py-3 text-left' style={{ width: '20%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} >{studyTypes.find(a => a.id == study?.type)?.description ?? "-"}</TableCell>
                                <TableCell className='px-3 py-3 text-left' style={{ width: '13%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} >{study.description}</TableCell>
                                <TableCell className='px-3 py-3 text-left' style={{ width: '16%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} >{getStudyEducation(study.education)}</TableCell>
                                <TableCell className='px-3 py-3 text-left' style={{ width: '16%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} >{study.location}</TableCell>
                                <TableCell className='px-3 py-3 text-left' style={{ width: '16%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} >{formatDate(study.date) == '01/01/1900' ? '-' : formatDate(study.date)}</TableCell>
                                <TableCell className='px-3 py-3 text-left' style={{ width: '15%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} >{study.years}</TableCell>
                                <TableCell className='px-3 py-3 text-center' style={{ width: '4%' }}>
                                    <button
                                        className='hover:text-gray-600 transition-colors'
                                        title='Διαγραφή'
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if(window.confirm('Είστε σίγουροι ότι θέλετε να διαγράψετε αυτή την εγγραφή;')) {
                                                handleDelete(e, study.id);
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
            <Sheet open={openDrawer} onOpenChange={(open) => {
                setOpenDrawer(open);
                    if (!open) {
                        handleCloseSheet();
                    }
                }}
            >
                <SheetContent className="w-125 sm:w-150 flex flex-col bg-white" side="right">
                    <SheetHeader>
                        <SheetTitle className="text-lg font-bold p-1">{selectedStudy ? "Επεξεργασία Σπουδών" : "Νέα Σπουδή"}</SheetTitle>
                        <SheetDescription className="sr-only">Φόρμα καταχώρησης στοιχείων σπουδών υπαλλήλου</SheetDescription>
                    </SheetHeader>
                    <Separator className="bg-gray-300 -mt-5" />
                    <EmployeeStudiesForm study={selectedStudy} onClose={handleCloseSheet} />
                </SheetContent>
            </Sheet>
        </div>
    )
}
