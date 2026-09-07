import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationEllipsis, PaginationLink, PaginationNext } from "@/components/ui/pagination";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useChanges } from "@/lib/hooks/useChanges";
import { useValues } from "@/lib/hooks/useValues";
import { WORK_RELATION_OPTIONS } from "@/lib/types/constTypes";
import { DownloadIcon, Filter, SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";

const PAGE_SIZE = 8;
const REFERENCE_WIDTH = 1600;
const MIN_SCALE = 0.6;

export default function EmployeeChangesList() {
    const {changeTypes, changeTypeMap} = useValues();
    const now = new Date();

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

    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');

    const [monthValue, setMonthValue] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
    const [wholeYear, setWholeYear] = useState(false);

    const [yearStr, monthStr] = monthValue.split('-');
    const year = Number(yearStr);
    const month = Number(monthStr);

    const [workRelation, setWorkRelation] = useState<number | undefined>(undefined);
    const [changeType, setChangeType] = useState<number | undefined>(undefined);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const { employeeChanges, fetchAllChanges, isLoadingChanges, isErrorChanges} = useChanges({ month: wholeYear ? undefined : month, year, search, workRelation, type: changeType, page, pageSize: PAGE_SIZE });

    const handleClearFilters = () => {
        setWorkRelation(undefined);
        setChangeType(undefined);
        setWholeYear(false);
        setMonthValue(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
        setPage(1);
        setFiltersOpen(false);
    };

    const handleWorkRelationChange = (v: string) => {
        setWorkRelation(v === "all" ? undefined : Number(v));
        setPage(1);
    };

    const handleChangeTypeChange = (v: string) => {
        setChangeType(v === "all" ? undefined : Number(v));
        setPage(1);
    };

    const items = employeeChanges?.items ?? [];
    const rowCount = employeeChanges?.totalCount ?? 0;
    const totalPages = Math.max(1, Math.ceil(rowCount / PAGE_SIZE));

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setPage(1);
    };

    const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMonthValue(e.target.value);
        setPage(1);
    };

    const getInitials = (name?: string) => {
        if (!name) return '??';
        return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    };

    function filterChangeType(changeType?: string | null){
        if (!changeType) return "";
        const change = changeTypes?.find((l) => l.id === Number(changeType));
        return change ? change.description : changeType;
    }

    function filterChangeTypeMap(changeType?: string | null, changeValue?: string | null){
        const change = changeTypeMap?.find((l) => l.type === Number(changeType) && l.value === Number(changeValue));
        return change ? change.description : "-";
    }

    function getChangeBadge(change: EmployeeChangesDto) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (change.flag === 1 && change.flagHRM === 1) {
            return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Εκτελέστηκε</span>;
        }

        const nextDate = change.nextChangeDate ? new Date(change.nextChangeDate) : null;
        if (nextDate) {
            nextDate.setHours(0, 0, 0, 0);
            const diffDays = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays < 0) {
                return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Εκπρόθεσμη</span>;
            } else if (diffDays <= 30) {
                return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">Επικείμενη</span>;
            }
        }
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">Εκκρεμεί</span>;
    }

    // const handleExecute = async (changeId: number) => {
    //     try {
    //         await agent.put(`/empchanges/executeChange/${changeId}`);
    //         await queryClient.invalidateQueries({ queryKey: ['changes'] });
    //         showSuccessToast("Η μεταβολή εκτελέστηκε επιτυχώς!");
    //     } catch {
    //         showErrorToast("Σφάλμα κατά την εκτέλεση της μεταβολής");
    //     }
    // };

    const [exporting, setExporting] = useState(false);

    const handleExport = async () => {
        setExporting(true);
        try {
            const allItems = await fetchAllChanges();

            if (!allItems.length) return;

            const rows = allItems.map((c) => ({
                "Όνομα": c.fullName,
                "ΑΦΜ": c.afm,
                "Είδος μεταβολής": filterChangeType(c.type),
                "Προηγ/νη τιμή": filterChangeTypeMap(c.type, c.prevValue),
                "Επόμενη τιμή": filterChangeTypeMap(c.type, c.nextValue),
                "Ημ/νια αλλαγής": new Date(c.changeDate).toLocaleDateString("el-GR"),
                "Ημ/νια επόμενης": new Date(c.nextChangeDate).toLocaleDateString("el-GR"),
                "Σημειώσεις": c.notes,
            }));

            const worksheet = XLSX.utils.json_to_sheet(rows);

            // προαιρετικό: πλάτη στηλών για ευανάγνωστο αρχείο
            worksheet["!cols"] = [
                { wch: 25 }, // Όνομα
                { wch: 12 }, // ΑΦΜ
                { wch: 20 }, // Είδος μεταβολής
                { wch: 15 }, // Προηγ/νη τιμή
                { wch: 15 }, // Επόμενη τιμή
                { wch: 15 }, // Ημ/νια αλλαγής
                { wch: 15 }, // Ημ/νια επόμενης
                { wch: 30 }, // Σημειώσεις
            ];

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Μεταβολές");

            XLSX.writeFile(workbook, `Μεταβολές_${wholeYear ? yearStr : `${monthStr}-${yearStr}`}.xlsx`);
        } finally {
            setExporting(false);
        }
    };

    return (
        <div style={{ zoom: scale }} className='p-4 sm:p-8'>
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 -mt-8 sm:-mt-8'>
                <h2 className='text-xl font-semibold text-neutral-900'>Μεταβολές</h2>
                <Button
                    variant="default"
                    type="button"
                    onClick={handleExport}
                    disabled={exporting}
                    className="transition-all duration-200 hover:opacity-80 w-full sm:w-auto"
                    style={{
                        display: 'flex', height: '40px', padding: '8px 16px',
                        justifyContent: 'center', alignItems: 'center',
                        borderRadius: '6px',
                        background: 'var(--color-primary)', color: 'var(--color-primary-foreground)',
                    }}
                >
                    <DownloadIcon fontSize='small' />
                    Εξαγωγή σε Excel
                </Button>
            </div>
            <Separator className="my-4 bg-neutral-200" />

            <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between mt-10 gap-4'>
                <div className='relative w-full lg:w-80'>
                    <input
                        className='flex w-full min-w-0 rounded-md px-3 py-1 text-sm outline-none pl-10 bg-white border border-neutral-200 shadow-sm h-10 focus-visible:ring-ring/50 focus-visible:ring-[3px]'
                        value={search}
                        placeholder='Αναζήτηση με όνομα, ΑΦΜ και ΑΜ'
                        onChange={handleSearchChange}
                    />
                    <SearchIcon className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none' />
                </div>

                <div className='flex items-center gap-4'>
                    <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
                        <PopoverTrigger asChild>
                            <Button variant="outline" type="button" className="h-10 border border-neutral-200 bg-white px-4 rounded-md hover:bg-neutral-100 flex items-center gap-2">
                                <Filter size={16} />
                                Φίλτρα
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 bg-white border border-neutral-200 outline-0 ring-0" align="end">
                            <div className="space-y-4">
                                <h4 className="font-medium text-sm">Φίλτρα</h4>
                                <div className="space-y-1.5">
                                    <label className="text-xs text-neutral-600">Είδος μεταβολής</label>
                                    <Select value={changeType ? String(changeType) : "all"} onValueChange={handleChangeTypeChange}>
                                        <SelectTrigger className="w-full bg-white h-10!">
                                            <SelectValue placeholder="Είδος μεταβολής" />
                                        </SelectTrigger>
                                        <SelectContent position="popper" className="bg-white border border-neutral-200 outline-0 ring-0">
                                            <SelectItem className="hover:bg-neutral-100" value="all">Όλες</SelectItem>
                                            {changeTypes?.map(t => (
                                                <SelectItem className="hover:bg-neutral-100" key={t.id} value={String(t.id)}>{t.description}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs text-neutral-600">Εργασιακή σχέση</label>
                                    <Select value={workRelation ? String(workRelation) : "all"} onValueChange={handleWorkRelationChange}>
                                        <SelectTrigger className="w-full bg-white h-10!">
                                            <SelectValue placeholder="Εργασιακή σχέση" />
                                        </SelectTrigger>
                                        <SelectContent position="popper" className="bg-white border border-neutral-200 outline-0 ring-0">
                                            <SelectItem className="hover:bg-neutral-100" value="all">Όλοι</SelectItem>
                                            {WORK_RELATION_OPTIONS.map(o => (
                                                <SelectItem className="hover:bg-neutral-100" key={o.value} value={o.value}>{o.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs text-neutral-600">{wholeYear ? "Έτος" : "Μήνας"}</label>
                                    {wholeYear ? (
                                        <input
                                            type="number"
                                            value={yearStr}
                                            onChange={(e) => { setMonthValue(`${e.target.value}-${monthStr}`); setPage(1); }}
                                            className='w-full rounded-md px-3 py-1 text-sm outline-none bg-white border border-neutral-200 shadow-sm h-10 focus-visible:ring-ring/50 focus-visible:ring-[3px]'
                                        />
                                    ) : (
                                        <input
                                            type="month"
                                            value={monthValue}
                                            onChange={handleMonthChange}
                                            className='w-full rounded-md px-3 py-1 text-sm outline-none bg-white border border-neutral-200 shadow-sm h-10 cursor-pointer focus-visible:ring-ring/50 focus-visible:ring-[3px]'
                                        />
                                    )}
                                </div>
                                <label className='flex items-center gap-2 text-sm text-neutral-700 select-none cursor-pointer'>
                                    <input
                                        type="checkbox"
                                        checked={wholeYear}
                                        onChange={(e) => { setWholeYear(e.target.checked); setPage(1); }}
                                        className='cursor-pointer'
                                    />
                                    Όλο το έτος
                                </label>
                                <div className="flex justify-end pt-2 border-neutral-200">
                                    <Button variant="outline" onClick={handleClearFilters} className="cursor-pointer">
                                        Καθαρισμός
                                    </Button>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
            <div data-slot='card' className='bg-card text-card-foreground flex flex-col mt-6 overflow-hidden'>
                {!isLoadingChanges && items.length != 0 ? (
                    <table className='w-full table-fixed bg-white border-b-neutral-200 caption-bottom text-sm'>
                        <TableHeader className='bg-white border-b'>
                            <TableRow className='bg-white border-b'>
                                <TableHead className='w-[20%] font-bold px-3 py-3 text-left overflow-hidden truncate'>Όνομα</TableHead>
                                <TableHead className='hidden lg:table-cell w-[8%] font-bold px-3 py-3 text-left overflow-hidden truncate'>ΑΦΜ</TableHead>
                                <TableHead className='w-[14%] font-bold px-3 py-3 text-left overflow-hidden truncate'>Είδος μεταβολής</TableHead>
                                <TableHead className='hidden md:table-cell w-[10%] font-bold px-3 py-3 text-left overflow-hidden truncate'>Προηγ/νη τιμή</TableHead>
                                <TableHead className='hidden md:table-cell w-[10%] font-bold px-3 py-3 text-left overflow-hidden truncate'>Επόμενη τιμή</TableHead>
                                <TableHead className='w-[10%] font-bold px-3 py-3 text-left overflow-hidden truncate'>Ημ/νια αλλαγής</TableHead>
                                <TableHead className='hidden lg:table-cell w-[10%] font-bold px-3 py-3 text-left overflow-hidden truncate'>Ημ/νια επόμενης</TableHead>
                                <TableHead className='hidden xl:table-cell w-[12%] font-bold px-3 py-3 text-left overflow-hidden truncate'>Σημειώσεις</TableHead>
                                <TableHead className='w-[8%] font-bold px-3 py-3 text-left overflow-hidden truncate'>Κατάσταση</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className='divide-y divide-neutral-200 bg-white'>
                            {items.map((change, idx) => (
                                <TableRow key={idx} className='hover:bg-neutral-50 transition-colors'>
                                    <TableCell className='w-[20%] px-3 py-3 text-left overflow-hidden'>
                                        <div className='flex items-center gap-3 min-w-0'>
                                            <Avatar className='w-8 h-8 shrink-0 bg-neutral-100 border border-neutral-200'>
                                                <AvatarFallback className='text-xs font-semibold text-black rounded-full'>
                                                    {getInitials(change.fullName)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className='truncate' title={change.fullName ?? ''}>{change.fullName}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className='hidden lg:table-cell w-[8%] px-3 py-3 text-left overflow-hidden truncate'>{change.afm}</TableCell>
                                    <TableCell className='w-[14%] px-3 py-3 text-left overflow-hidden truncate'>{filterChangeType(change.type)}</TableCell>
                                    <TableCell className='hidden md:table-cell w-[10%] px-3 py-3 text-left overflow-hidden truncate'>{filterChangeTypeMap(change.type, change.prevValue)}</TableCell>
                                    <TableCell className='hidden md:table-cell w-[10%] px-3 py-3 text-left overflow-hidden truncate'>{filterChangeTypeMap(change.type, change.nextValue)}</TableCell>
                                    <TableCell className='w-[10%] px-3 py-3 text-left overflow-hidden truncate'>{new Date(change.changeDate).toLocaleDateString('el-GR')}</TableCell>
                                    <TableCell className='hidden lg:table-cell w-[10%] px-3 py-3 text-left overflow-hidden truncate'>{new Date(change.nextChangeDate).toLocaleDateString('el-GR') == '1/1/1900' ? '-' : new Date(change.nextChangeDate).toLocaleDateString('el-GR')}</TableCell>
                                    <TableCell className='hidden xl:table-cell w-[12%] px-3 py-3 text-left overflow-hidden truncate' title={change.notes ?? ''}>{change.notes}</TableCell>
                                    <TableCell className='w-[8%] px-3 py-3 text-left overflow-hidden'>
                                        <div className='truncate'>{getChangeBadge(change)}</div>
                                    </TableCell>
                                    {/* <TableCell className='px-3 py-3 text-center' style={{ width: '3rem' }} title="Εκτέλεση μεταβολής">
                                        {(change.flagHRM !== 1) && change.changeId != null && (
                                            <button
                                                onClick={() => {
                                                    if (window.confirm("Είστε σίγουροι ότι θέλετε να εκτελέσετε αυτή τη μεταβολή και να μεταφερθεί στη μισθοδοσία;")) {
                                                        handleExecute(change.changeId!);
                                                    }
                                                }}
                                                className='hover:text-green-600 transition-colors text-black'
                                                title='Εκτέλεση'
                                            >
                                                <BringToFrontIcon size={18} />
                                            </button>
                                        )}
                                    </TableCell> */}
                                </TableRow>
                            ))}
                        </TableBody>
                    </table>
                ) : isErrorChanges ? (
                    <div className='p-4 text-center text-neutral-500'>Προβλήματα κατά τη φόρτωση της λίστας μεταβολών.</div>
                ) : isLoadingChanges ? (
                    <div className='p-4 text-center text-neutral-500'>Φόρτωση λίστας μεταβολών...</div>
                ) : (
                    <div className='p-4 text-center text-neutral-500'>Δεν βρέθηκαν μεταβολές.</div>
                )}
                {totalPages > 1 && (
                    <>
                        <Separator className="bg-neutral-200" />
                        <div className='flex items-center justify-center bg-white w-full h-20'>
                            <Pagination className='inline-flex items-center gap-2'>
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
                                            const left = Math.max(2, page - 1);
                                            const right = Math.min(totalPages - 1, page + 1);
                                            pages.push(1);
                                            if (left > 2) pages.push('...');
                                            for (let i = left; i <= right; i++) pages.push(i);
                                            if (right < totalPages - 1) pages.push('...');
                                            pages.push(totalPages);
                                        }
                                        return pages.map((pItem, idx) =>
                                            pItem === '...' ? (
                                                <PaginationItem key={`dots-${idx}`}><PaginationEllipsis /></PaginationItem>
                                            ) : (
                                                <PaginationItem key={pItem}>
                                                    <PaginationLink href='#' isActive={pItem === page} onClick={(e) => { e.preventDefault(); setPage(pItem as number); }}>
                                                        {pItem}
                                                    </PaginationLink>
                                                </PaginationItem>
                                            )
                                        );
                                    })()}
                                    <PaginationItem>
                                        <PaginationNext href='#' onClick={(e) => { e.preventDefault(); if (page < totalPages) setPage(page + 1); }} aria-disabled={page >= totalPages} />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
