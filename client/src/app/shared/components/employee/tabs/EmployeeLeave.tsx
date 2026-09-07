import { Button } from "@/components/ui/button";
import EmployeeLeaveNow from "../card/leaves/EmployeeLeaveNow";
import EmployeeLeavePrev from "../card/leaves/EmployeeLeavePrev";
import EmployeeLeaveSickness from "../card/leaves/EmployeeLeaveSickness";
import EmployeeLeaveSum from "../card/leaves/EmployeeLeaveSum";
import { Filter, PlusIcon, Trash2Icon } from "lucide-react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { useEmployee } from "@/lib/hooks/useEmployee";
import { useParams } from "react-router";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toastHelpers";
import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import EmployeeLeaveForm from "../form/leaves/EmployeeLeaveForm";
import { Separator } from "@/components/ui/separator";
import { useValues } from "@/lib/hooks/useValues";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const REFERENCE_WIDTH = 1600;
const MIN_SCALE = 0.6;

export default function EmployeeLeave() {
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

    const [filterType, setFilterType] = useState("");
    const [filterYear, setFilterYear] = useState("");
    const [filtersOpen, setFiltersOpen] = useState(false);
    const { id } = useParams<{ id: string }>();
    const {employeeLeavesList, leaveNow, leavePrev, leaveSickness, leaveSum, leaveSicknessSum, deleteEmployeeLeave} = useEmployee({id});
    const {leaves} = useValues();
    const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);
    const [openDrawer, setOpenDrawer] = useState(false);

    const filteredLeaves = employeeLeavesList?.filter((leave) => {
        const matchesType =
            !filterType || String(leave.type) === filterType;

        const matchesYear =
            !filterYear || String(leave.year) === filterYear;

        return matchesType && matchesYear;
    }) || [];

    const [page, setPage] = useState(1);
    const PAGE_SIZE = 5;

    const rowCount = employeeLeavesList?.length || 0;
    const totalPages = Math.max(1, Math.ceil(rowCount / PAGE_SIZE));
    const startIdx = (page - 1) * PAGE_SIZE;
    const endIdx = startIdx + PAGE_SIZE;
    const paginatedList = filteredLeaves?.slice(startIdx, endIdx) || [];

    const handleDelete = (e: React.MouseEvent, leaveId: number) => {
        e.stopPropagation();
        deleteEmployeeLeave(leaveId, {
            onSuccess: () => {showSuccessToast("Η άδεια διαγράφηκε επιτυχώς!");},
            onError: (error: Error) => {showErrorToast(error?.message || "Σφάλμα κατά τη διαγραφή της άδειας");}
        });
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

    const handleRowClick = (leave: Leave) => {
        setSelectedLeave(leave);
        setOpenDrawer(true);
    };

    const handleAddNew = () => {
        setSelectedLeave(null);
        setOpenDrawer(true);
    }

    function handleCloseSheet() {
        setSelectedLeave(null);
        setOpenDrawer(false);
    }

    function filterLeaveType(leaveType?: number | null){
        if (!leaveType) return "";
        const leave = leaves?.find((l) => l.id === Number(leaveType));
        return leave ? leave.description : leaveType;
    }

    return (
        <div style={{ zoom: scale }}>
            <div className="mt-5 w-full grid md:grid-cols-4 gap-4.5">
                <EmployeeLeaveNow leaveCount={leaveNow ?? 0}/>
                <EmployeeLeavePrev leaveCount={leavePrev ?? 0}/>
                <EmployeeLeaveSum leaveCount={leaveSum ?? 0}/>
                <EmployeeLeaveSickness leaveCount={leaveSickness ?? 0} leaveCountSick={leaveSicknessSum ?? 0}/>
            </div>
            <div className="flex justify-end mt-10 gap-2">
                <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
                    <PopoverTrigger asChild>
                        <Button variant="default" type="button"
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
                                        <SelectTrigger className="w-full"> <SelectValue placeholder="Είδος άδειας" /> </SelectTrigger>
                                        <SelectContent position="popper" className="bg-white border border-neutral-200 outline-0 ring-0">
                                            {leaves?.map((leave) => (
                                                <SelectItem className="hover:bg-neutral-100"
                                                    key={leave.id}
                                                    value={String(leave.id)}
                                                >
                                                    {leave.description}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex-1">
                                    <Select value={filterYear} onValueChange={setFilterYear} >
                                        <SelectTrigger className="w-full"><SelectValue placeholder="Έτος" /></SelectTrigger>
                                        <SelectContent position="popper" className="bg-white border border-neutral-200 outline-0 ring-0">
                                            <SelectItem className="hover:bg-neutral-100" value="2024">2024</SelectItem>
                                            <SelectItem className="hover:bg-neutral-100" value="2025">2025</SelectItem>
                                            <SelectItem className="hover:bg-neutral-100" value="2026">2026</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setFilterType("");
                                        setFilterYear("");
                                        setPage(1);
                                        setFiltersOpen(false);
                                    }}
                                >
                                    Καθαρισμός
                                </Button>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
                <Button variant="default" type="button" onClick={handleAddNew} className="transition-all duration-200 hover:opacity-80 w-auto"
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
                    Εισαγωγή άδειας
                </Button>
            </div>
            <div data-slot='card' className='bg-card text-card-foreground flex flex-col overflow-hidden'>
                <Table className='w-full bg-white  border-b-neutral-200 table-fixed mt-6' style={{ tableLayout: 'fixed' }}>
                    <TableHeader className='border-b' style={{ backgroundColor: '#F2F2F2F2' }}>
                        <TableRow className='border-b' style={{ backgroundColor: '#F2F2F2F2' }}>
                            <TableCell className='font-bold px-3 py-3 text-left' style={{ width: '23%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title='Όνομα'>Είδος</TableCell>
                            <TableCell className='font-bold px-3 py-3 text-left' style={{ width: '16%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title='ΑΦΜ'>Διάρκεια</TableCell>
                            <TableCell className='font-bold px-3 py-3 text-left' style={{ width: '19%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title='Παράρτημα'>Έναρξη</TableCell>
                            <TableCell className='font-bold px-3 py-3 text-left' style={{ width: '19%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title='Τμήμα'>Λήξη</TableCell>
                            <TableCell className='font-bold px-3 py-3 text-left' style={{ width: '18%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title='Θέση'>Έτος</TableCell>
                            <TableCell className='font-bold px-3 py-3 text-center' style={{ width: '5%' }}></TableCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody className='divide-y divide-neutral-200 bg-white'>
                        {paginatedList && paginatedList.map(leave => 
                            <TableRow key={leave.id} className='hover:bg-neutral-50 transition-colors cursor-pointer' onClick={() => handleRowClick(leave)}>
                                <TableCell className='px-3 py-3 text-left' style={{ width: '23%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} >{filterLeaveType(leave.type).toString().replace(/\s*\(\d+\)\s*$/, "")}</TableCell>
                                <TableCell className='px-3 py-3 text-left' style={{ width: '16%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} >{leave.duration == 1 ? "1 ημέρα" : `${leave.duration} ημέρες`}</TableCell>
                                <TableCell className='px-3 py-3 text-left' style={{ width: '19%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} >{formatDate(leave.dateFrom)}</TableCell>
                                <TableCell className='px-3 py-3 text-left' style={{ width: '19%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} >{formatDate(leave.dateTo)}</TableCell>
                                <TableCell className='px-3 py-3 text-left' style={{ width: '18%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} >{leave.year}</TableCell>
                                <TableCell className='px-3 py-3 text-center' style={{ width: '5%' }}>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();

                                            if (window.confirm("Είστε σίγουροι ότι θέλετε να διαγράψετε αυτή την άδεια;")) {
                                                handleDelete(e, leave.id as number);
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
            </div>
            <div>
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
                open={openDrawer}
                onOpenChange={(open) => {
                    setOpenDrawer(open);
                }}
            >
                <SheetContent className="w-125 sm:w-150 flex flex-col bg-white" side="right">
                    <SheetHeader>
                        <SheetTitle className="text-lg font-bold p-1">{selectedLeave ? "Επεξεργασία Άδειας" : "Νέα Άδεια"}</SheetTitle>
                        <SheetDescription className="sr-only">Φόρμα καταχώρησης/επεξεργασίας άδειας εργαζομένου</SheetDescription>
                    </SheetHeader>
                    <Separator className="bg-gray-300 -mt-5" />
                    <EmployeeLeaveForm leave={selectedLeave} leaveList={employeeLeavesList} leaveTotal={leaveSum} onClose={handleCloseSheet} />
                </SheetContent>
            </Sheet>
        </div>
    )
}
