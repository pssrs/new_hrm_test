import { Button } from "@/components/ui/button";
import { Filter, PlusIcon, Trash2Icon } from "lucide-react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { useEmployee } from "@/lib/hooks/useEmployee";
import { useParams } from "react-router";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toastHelpers";
import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate } from "@/lib/utils/FormatDate";
import EmployeePlacementsForm from "../form/placements/EmployeePlacementsForm";
import { PLACEMENT_TYPES } from "@/lib/types/constTypes";
import { useValues } from "@/lib/hooks/useValues";

const REFERENCE_WIDTH = 1600;
const MIN_SCALE = 0.6;

export default function EmployeePlacements() {
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
    const { employeePlacementList, deleteEmployeePlacement } = useEmployee({ id });
    const { address, sector, department, office } = useValues();
    const [filterType, setFilterType] = useState("");
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [selectedPlacement, setSelectedPlacement] = useState<Placement | null>(null);
    const [openDrawer, setOpenDrawer] = useState(false);
    const [page, setPage] = useState(1);
    

    const filteredPlacements = employeePlacementList?.filter((placement) => {
        const matchesType =
            !filterType || String(placement.type) === filterType;

        return matchesType;
    }) || [];
    
    const PAGE_SIZE = 5;
    const rowCount = filteredPlacements?.length || 0;
    const totalPages = Math.max(1, Math.ceil(rowCount / PAGE_SIZE));
    const startIdx = (page - 1) * PAGE_SIZE;
    const endIdx = startIdx + PAGE_SIZE;
    const paginatedList = filteredPlacements?.slice(startIdx, endIdx) || [];

    const handleRowClick = (placement: Placement) => {
        setSelectedPlacement(placement);
        setOpenDrawer(true);
    };

    const handleAddNew = () => {
        setSelectedPlacement(null);
        setOpenDrawer(true);
    }

    const handleDelete = (e: React.MouseEvent, placementId: number) => {
        e.stopPropagation();
        deleteEmployeePlacement(placementId, {
            onSuccess: () => {showSuccessToast("Η τοποθέτηση διαγράφηκε επιτυχώς!");},
            onError: () => {showErrorToast("Σφάλμα κατά τη διαγραφή της τοποθέτησης");}
        });
    };

    const filterPlacementType = (type: number) => {
        const placementType = PLACEMENT_TYPES.find((placement) => placement.value === type.toString());
        return placementType ? placementType.label : type;
    }

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
                                        <SelectTrigger className="w-full"> <SelectValue placeholder="Είδος τοποθέτησης" /> </SelectTrigger>
                                        <SelectContent position="popper" className="bg-white border border-neutral-200 outline-0 ring-0">
                                            {PLACEMENT_TYPES?.map((placement) => (
                                                <SelectItem className="hover:bg-neutral-100" 
                                                    key={placement.value}
                                                    value={String(placement.value)}
                                                >
                                                    {placement.label}
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
                    Εισαγωγή τοποθέτησης
                </Button>
            </div>
            <div data-slot='card' className='bg-card text-card-foreground flex flex-col overflow-hidden'>
                <Table className='w-full bg-white  border-b-neutral-200 table-fixed mt-6' style={{ tableLayout: 'fixed' }}>
                    <TableHeader className='border-b' style={{ backgroundColor: '#F2F2F2F2' }}>
                        <TableRow className='border-b' style={{ backgroundColor: '#F2F2F2F2' }}>
                            <TableCell className='font-bold px-3 py-3 text-left' style={{ width: '17%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title='Όνομα'>Είδος</TableCell>
                            <TableCell className='font-bold px-3 py-3 text-left' style={{ width: '17%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title='ΑΦΜ'>Διεύθυνση</TableCell>
                            <TableCell className='font-bold px-3 py-3 text-left' style={{ width: '16%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title='Παράρτημα'>Τμήμα</TableCell>
                            <TableCell className='font-bold px-3 py-3 text-left' style={{ width: '16%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title='Τμήμα'>Τομέας</TableCell>
                            <TableCell className='font-bold px-3 py-3 text-left' style={{ width: '16%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title='Θέση'>Θέση</TableCell>
                            <TableCell className='font-bold px-3 py-3 text-left' style={{ width: '9%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title='Ημ/νια Αλλαγής'>Ημ/νια Αλλαγής</TableCell>
                            <TableCell className='font-bold px-3 py-3 text-left' style={{ width: '6%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title='Χρήστης'>Χρήστης</TableCell>
                            <TableCell className='font-bold px-3 py-3 text-center' style={{ width: '3%' }}></TableCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody className='divide-y divide-neutral-200 bg-white'>
                        {paginatedList && paginatedList.map(placement => 
                            <TableRow key={placement.id} className='hover:bg-neutral-50 transition-colors cursor-pointer' onClick={() => handleRowClick(placement)}>
                                <TableCell className='px-3 py-3 text-left' style={{ width: '17%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} >{filterPlacementType(placement.type)}</TableCell>
                                <TableCell className='px-3 py-3 text-left' style={{ width: '17%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} >{address.find(a => a.id === placement?.newAddress)?.address_str ?? placement?.newAddress ?? ""}</TableCell>
                                <TableCell className='px-3 py-3 text-left' style={{ width: '16%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} >{sector.find(s => s.sectorId === Number(placement?.newSector) && s.addressId === Number(placement?.newAddress))?.sectorName ?? (placement?.newSector ?? "")}</TableCell>
                                <TableCell className='px-3 py-3 text-left' style={{ width: '16%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} >{department.find(d => d.departmentId === placement?.newDepartment && d.sectorId === placement?.newSector && d.addressId === placement?.newAddress)?.departmentName ?? "-"}</TableCell>
                                <TableCell className='px-3 py-3 text-left' style={{ width: '16%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} >{office.find(o => o.departmentId === placement?.newTeam)?.officeName ?? "-"}</TableCell>
                                <TableCell className='px-3 py-3 text-left' style={{ width: '9%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} >{formatDate(placement.date)}</TableCell>
                                <TableCell className='px-3 py-3 text-left' style={{ width: '6%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} >{placement.user}</TableCell>
                                <TableCell className='px-3 py-3 text-center' style={{ width: '3%' }}>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();

                                            if (window.confirm("Είστε σίγουροι ότι θέλετε να διαγράψετε αυτή την τοποθέτηση;")) {
                                                handleDelete(e, placement.id as number);
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
                        <SheetTitle className="text-lg font-bold p-1">{selectedPlacement ? "Επεξεργασία Τοποθέτησης" : "Νέα Τοποθέτηση"}</SheetTitle>
                    </SheetHeader>
                    <Separator className="bg-gray-300 -mt-5" />
                    <EmployeePlacementsForm placement={selectedPlacement} onClose={() => setOpenDrawer(false)} />
                </SheetContent>
            </Sheet>
        </div>
    );
}