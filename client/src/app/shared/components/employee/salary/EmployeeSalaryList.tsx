import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationEllipsis, PaginationLink, PaginationNext } from "@/components/ui/pagination";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEmployee } from "@/lib/hooks/useEmployee";
import { useValues } from "@/lib/hooks/useValues";
import { CATEGORY_OPTIONS, WORK_RELATION_OPTIONS } from "@/lib/types/constTypes";
import { DownloadIcon, Filter, SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";

const PAGE_SIZE = 8;
const REFERENCE_WIDTH = 1600;
const MIN_SCALE = 0.6;

export default function EmployeeSalaryList() {

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
    const [selectedFlag, setSelectedFlag] = useState<number>(0);
    const [mk, setMk] = useState<string | undefined>("0");
    const [rank, setRank] = useState<string | undefined>(undefined);

    const [workRelation, setWorkRelation] = useState<number | undefined>(undefined);
    const { employeeGroup, isLoading, isError, fetchAllEmployees } = useEmployee({ page, pageSize: PAGE_SIZE, search, flag: selectedFlag > 0 ? selectedFlag : undefined,mk: mk, workRelation: workRelation, grade: rank });
    
    const [filtersOpen, setFiltersOpen] = useState(false);
    const { grade } = useValues();

    const handleWorkRelationChange = (v: string) => {
        setWorkRelation(v === "all" ? undefined : Number(v));
        setPage(1);
    };

    const handleFlagChange = (v: string) => {
        setSelectedFlag(Number(v));
        setPage(1);
    };

    const handleMkChange = (v: string) => {
        setMk(v === "all" ? undefined : v);
        setPage(1);
    };

    const handleRankChange = (v: string) => {
        setRank(v === "all" ? undefined : v);
        setPage(1);
    };

    const rowCount = employeeGroup?.totalCount ?? 0;
    const totalPages = Math.max(1, Math.ceil(rowCount / PAGE_SIZE));

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setPage(1);
    };

    const getInitials = (name?: string) => {
        if (!name) return '??';
        return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    };

    const [exporting, setExporting] = useState(false);

    const handleExport = async () => {
        setExporting(true);
        try {
            const allItems = await fetchAllEmployees();

            if (!allItems.length) return;

            const rows = allItems.map((e) => ({
                "Όνομα": e.name,
                "ΑΦΜ": e.afm,
                "Κατηγορία": CATEGORY_OPTIONS.find(g => g.value.toString() === e?.category)?.label ?? "",
                "Μ.Κ.": e.mk,
                "Προηγ/νη τιμή": new Date(e.mkDate).toLocaleDateString('el-GR') === "1/1/1900" ? "" : new Date(e.mkDate).toLocaleDateString('el-GR'),
                "Επόμενη τιμή": new Date(e.mkNextDate).toLocaleDateString('el-GR') === "1/1/1900" ? "" : new Date(e.mkNextDate).toLocaleDateString('el-GR'),
                "Βαθμός": grade.find(g => g.code.toString() === e?.grade)?.description ?? "",
                "Ημ/νια αλλαγής": new Date(e.grDate).toLocaleDateString('el-GR')  === "1/1/1900" ? "" : new Date(e.grDate).toLocaleDateString('el-GR'),
                "Ημ/νια επόμενης": new Date(e.grNextDate).toLocaleDateString('el-GR')  === "1/1/1900" ? "" : new Date(e.grNextDate).toLocaleDateString('el-GR'),
            }));

            const worksheet = XLSX.utils.json_to_sheet(rows);

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

            XLSX.writeFile(workbook, `Μισθολογικά_Στοιχεία.xlsx`);
        } finally {
            setExporting(false);
        }
    };

    const handleClearFilters = () => {
        setSelectedFlag(0);
        setSearch('');
        setPage(1);
        setFiltersOpen(false);
        setMk(undefined);
        setRank(undefined);
    };

    return (
        <div style={{ zoom: scale }} className='p-8'>
            <div className='flex items-center justify-between -mt-8'>
                <h2 className='text-xl font-semibold text-neutral-900'>Μισθολογικά στοιχεία</h2>
                <Button
                    variant="default"
                    type="button"
                    onClick={handleExport}
                    disabled={exporting}
                    className="transition-all duration-200 hover:opacity-80 w-auto"
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
            <div className='flex items-center justify-between mt-10 gap-4'>
                <div className='relative w-80'>
                    <input
                        className='flex w-80 min-w-0 rounded-md px-3 py-1 text-sm outline-none pl-10 bg-white border border-neutral-200 shadow-sm h-10 focus-visible:ring-ring/50 focus-visible:ring-[3px]'
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
                                    <label className="text-xs text-neutral-600">Εργασιακή κατάσταση</label>
                                    <Select value={String(selectedFlag)} onValueChange={handleFlagChange}>
                                        <SelectTrigger className="w-full bg-white h-10!">
                                            <SelectValue placeholder="Κατάσταση" />
                                        </SelectTrigger>
                                        <SelectContent position="popper" className="bg-white border border-neutral-200 outline-0 ring-0">
                                            <SelectItem className="hover:bg-neutral-100" value="0">Όλοι</SelectItem>
                                            <SelectItem className="hover:bg-neutral-100" value="1">Εν ενεργεία</SelectItem>
                                            <SelectItem className="hover:bg-neutral-100" value="2">Απόσπαση</SelectItem>
                                            <SelectItem className="hover:bg-neutral-100" value="3">Μετακίνηση</SelectItem>
                                            <SelectItem className="hover:bg-neutral-100" value="4">Ανενεργός</SelectItem>
                                            <SelectItem className="hover:bg-neutral-100" value="5">Μετάθεση</SelectItem>
                                            <SelectItem className="hover:bg-neutral-100" value="6">Συνταξιοδότηση</SelectItem>
                                            <SelectItem className="hover:bg-neutral-100" value="7">Εν ενεργεία μόνιμος</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs text-neutral-600">Σχέση εργασίας</label>
                                    <Select value={workRelation ? String(workRelation) : "all"} onValueChange={handleWorkRelationChange}>
                                        <SelectTrigger className="w-full bg-white h-10!">
                                            <SelectValue placeholder="Εργασιακή σχέση" />
                                        </SelectTrigger>
                                        <SelectContent position="popper" className="bg-white border border-neutral-200 outline-0 ring-0">
                                            <SelectItem className="hover:bg-neutral-100" value="all">Όλες οι σχέσεις εργασίας</SelectItem>
                                            {WORK_RELATION_OPTIONS.map(o => (
                                                <SelectItem className="hover:bg-neutral-100" key={o.value} value={o.value}>{o.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs text-neutral-600">Μισθολογικό κλιμάκιο</label>
                                    <Select key={`mk-${mk ?? 'all'}`} value={mk !== undefined ? String(mk) : undefined} onValueChange={handleMkChange}>
                                        <SelectTrigger className="w-full bg-white h-10!">
                                            <SelectValue placeholder="Κλιμάκιο" />
                                        </SelectTrigger>
                                        <SelectContent position="popper" className="bg-white border border-neutral-200 outline-0 ring-0">
                                            <SelectItem className="hover:bg-neutral-100" value="0">Όλα τα κλιμάκια</SelectItem>
                                            {Array.from({ length: 19 }, (_, i) => i + 1).map(n => (
                                                <SelectItem className="hover:bg-neutral-100" key={n} value={String(n)}>
                                                    {n}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs text-neutral-600">Βαθμός</label>
                                    <Select value={rank} onValueChange={handleRankChange}>
                                        <SelectTrigger className="w-full bg-white h-10!">
                                            <SelectValue placeholder="Βαθμός" />
                                        </SelectTrigger>
                                        <SelectContent position="popper" className="bg-white border border-neutral-200 outline-0 ring-0">
                                            <SelectItem className="hover:bg-neutral-100" value="all">Όλοι οι Βαθμοί</SelectItem>
                                            {grade.filter(g => g.description).map(a => (
                                                <SelectItem className="hover:bg-neutral-100" key={a.code} value={String(a.code)}>
                                                    {a.description}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
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
            {isLoading && !isError ? (
                <div className='p-4 text-center text-neutral-500'>Φόρτωση λίστας υπαλλήλων...</div>
            ) : !isLoading && !isError ? (
                <div data-slot='card' className='bg-card text-card-foreground flex flex-col mt-6 overflow-hidden'>
                    <Table className='w-full bg-white border-b-neutral-200 table-fixed' style={{ tableLayout: 'fixed' }}>
                        <TableHeader className='bg-white border-b'>
                            <TableRow className='bg-white border-b'>
                                <TableHead className='font-bold px-3 py-3 text-left overflow-hidden truncate' style={{ width: '20%' }}>Όνομα</TableHead>
                                <TableHead className='font-bold px-3 py-3 text-left overflow-hidden truncate' style={{ width: '8%' }}>ΑΦΜ</TableHead>
                                <TableHead className='font-bold px-3 py-3 text-left overflow-hidden truncate' style={{ width: '8%' }}>Κατηγορία</TableHead>
                                <TableHead className='font-bold px-3 py-3 text-left overflow-hidden truncate' style={{ width: '7%' }}>Μ.Κ.</TableHead>
                                <TableHead className='font-bold px-3 py-3 text-left overflow-hidden truncate' style={{ width: '11%' }}>Ημ/νια αλλαγής</TableHead>
                                <TableHead className='font-bold px-3 py-3 text-left overflow-hidden truncate' style={{ width: '11%' }}>Επόμενη αλλαγή</TableHead>
                                <TableHead className='font-bold px-3 py-3 text-left overflow-hidden truncate' style={{ width: '11%' }}>Βαθμός</TableHead>
                                <TableHead className='font-bold px-3 py-3 text-left overflow-hidden truncate' style={{ width: '12%' }}>Ημ/νια αλλαγής</TableHead>
                                <TableHead className='font-bold px-3 py-3 text-left overflow-hidden truncate' style={{ width: '12%' }}>Επόμενη αλλαγή</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className='divide-y divide-neutral-200 bg-white'>
                            {employeeGroup?.items.map((emp: EmployeeListDto) => (
                                <TableRow key={emp.id} className='hover:bg-neutral-50 transition-colors'>
                                    <TableCell className='px-3 py-3 text-left overflow-hidden' style={{ width: '20%' }} title={emp.name ?? ''}>
                                        <div className='flex items-center gap-3 min-w-0'>
                                            <Avatar className='w-8 h-8 shrink-0 bg-neutral-100 border border-neutral-200'>
                                                <AvatarFallback className='text-xs font-semibold text-black rounded-full'>
                                                    {getInitials(emp.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className='truncate'>{emp.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className='px-3 py-3 text-left overflow-hidden truncate' style={{ width: '8%' }}>{emp.afm}</TableCell>
                                    <TableCell className='px-3 py-3 text-left overflow-hidden truncate' style={{ width: '8%' }}>{CATEGORY_OPTIONS.find(g => g.value.toString() === emp?.category)?.label ?? ""}</TableCell>
                                    <TableCell className='px-3 py-3 text-left overflow-hidden truncate' style={{ width: '7%' }}>{emp.mk}</TableCell>
                                    <TableCell className='px-3 py-3 text-left overflow-hidden truncate' style={{ width: '11%' }}>{new Date(emp.mkDate).toLocaleDateString('el-GR') === "1/1/1900" ? "" : new Date(emp.mkDate).toLocaleDateString('el-GR')}</TableCell>
                                    <TableCell className='px-3 py-3 text-left overflow-hidden truncate' style={{ width: '11%' }}>{new Date(emp.mkNextDate).toLocaleDateString('el-GR') === "1/1/1900" ? "" : new Date(emp.mkNextDate).toLocaleDateString('el-GR')}</TableCell>
                                    <TableCell className='px-3 py-3 text-left overflow-hidden truncate' style={{ width: '11%' }}>{grade.find(g => g.code.toString() === emp?.grade)?.description ?? ""}</TableCell>
                                    <TableCell className='px-3 py-3 text-left overflow-hidden truncate' style={{ width: '12%' }}>{new Date(emp.grDate).toLocaleDateString('el-GR') === "1/1/1900" ? "" : new Date(emp.grDate).toLocaleDateString('el-GR')}</TableCell>
                                    <TableCell className='px-3 py-3 text-left overflow-hidden truncate' style={{ width: '12%' }}>{new Date(emp.grNextDate).toLocaleDateString('el-GR')  === "1/1/1900" ? "" : new Date(emp.grNextDate).toLocaleDateString('el-GR')}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

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
                </div>
            ) : (
                <div className='p-4 text-center text-red-500'>Σφάλμα κατά τη φόρτωση της λίστας υπαλλήλων.</div>
            )}
        </div>
    );
}