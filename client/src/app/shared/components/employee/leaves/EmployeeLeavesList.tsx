import * as React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useEmployee } from '../../../../../lib/hooks/useEmployee';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { DownloadIcon, Filter, SearchIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useValues } from '@/lib/hooks/useValues';
import { Separator } from '@/components/ui/separator';
import { useEffect, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import * as XLSX from "xlsx";

const PAGE_SIZE = 8;

const formatDate = (d?: string | Date | null) => d ? new Date(d).toLocaleDateString("el-GR") : "-";

const REFERENCE_WIDTH = 1600;
const MIN_SCALE = 0.6;

export default function EmployeeLeavesList() {
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

    const currentYear = new Date().getFullYear();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [selectedFlag, setSelectedFlag] = useState<number>(0);
    const [leaveType, setLeaveType] = useState<number>(0);
    const [tableType, setTableType] = useState<number>(0);
    const [month, setMonth] = useState<number>(0);
    const [year, setYear] = useState<number>(currentYear);
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

    const handleFlagChange = (v: string) => { setSelectedFlag(Number(v)); setPage(1); };
    const handleTypeOfTableChange = (v: string) => {
        const tableTypeNum = Number(v);
        setTableType(tableTypeNum);
        setSelectedFlag(0);
        setPage(1);
        setLeaveType(0);

        const currentMonth = new Date().getMonth() + 1;

        // Για "Σύνολο αδειών έτους" (tableType === 1)
        if (tableTypeNum === 1) {
            setLeaveType(1);  // Πρώτη επιλογή στη λίστα
            setYear(currentYear);  // Παρόν έτος
            setMonth(0);
        }
        // Για "Αναρρωτικές άδειες" (tableType === 2) ή "Μηνιαίες άδειες" (tableType === 3)
        else if (tableTypeNum === 2 || tableTypeNum === 3) {
            setMonth(currentMonth);  // Τωρινός μήνας
            setYear(currentYear);  // Παρόν έτος
        } else {
            setMonth(0);
            setYear(0);
        }
    };
    const handleTypeChange = (v: string) => { setLeaveType(Number(v)); setPage(1); };
    const handleMonthChange = (v: string) => { setMonth(Number(v)); setPage(1); };
    const handleYearChange = (v: string) => { setYear(Number(v)); setPage(1); };
    const handleDateChange = (v: string) => { setSelectedDate(v); setPage(1); };

    const { leaves } = useValues();
    const { employeeAllLeavesList, isLoadingEmployeeAllLeavesList, isErrorEmployeeAllLeavesList } = useEmployee({ page,
        pageSize: PAGE_SIZE,
        search,
        flag: selectedFlag > 0 ? selectedFlag : undefined,
        leaveType: leaveType > 0 ? leaveType : undefined,
        leaveMonth: month > 0 ? month : undefined,
        leaveYear: year > 0 ? year : undefined,
        tableType: tableType,
        leaveDate: tableType === 0 ? selectedDate : undefined,
    });

    React.useEffect(() => {
        console.log('Table type changed:', tableType);
    }, [tableType]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setPage(1);
    };

    const rowCount = employeeAllLeavesList?.totalCount ?? 0;
    const pageTitle = 'Άδειες';

    const getInitials = (name?: string) => {
        if (!name) return '??';
        return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    };

    const [filtersOpen, setFiltersOpen] = useState(false);

    const handleClearFilters = () => {
        setSelectedFlag(0);
        setSearch('');
        setLeaveType(0);
        setMonth(0);
        setYear(0);
        setSelectedDate(new Date().toISOString().split('T')[0]);
        setPage(1);
        setFiltersOpen(false);
    };

    const [exporting, setExporting] = useState(false);

    const handleExport = async () => {
        setExporting(true);
        try {
            const data = employeeAllLeavesList?.items || [];

            if (data.length === 0) {
                alert('Δεν υπάρχουν δεδομένα για εξαγωγή');
                setExporting(false);
                return;
            }

            const exportData = data.map(leave => {
                const row: Record<string, string | number> = {
                    'Όνομα': leave.employeeName,
                    'ΑΜ': leave.am,
                    'ΑΦΜ': leave.afm,
                };

                if (tableType === 1 && leaveType === 6) {
                    row['Δικαιούμενες'] = leave.entitled ?? 0;
                    row['Χορηγηθήσες'] = leave.used ?? 0;
                    row['Υπόλοιπο'] = leave.carriedOver ?? 0;
                } else if (tableType === 1) {
                    row['Σύνολο Αδειών'] = leave.totalLeaves ?? 0;
                } else {
                    row['Τύπος'] = filterLeaveType(leave.type);
                    row['Διάρκεια'] = leave.duration;
                    row['Έναρξη'] = formatDate(leave.dateFrom);
                    row['Λήξη'] = formatDate(leave.dateTo);
                }

                return row;
            });

            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Άδειες');

            let filename = 'adies';
            if (tableType === 0) filename += '_hmerisia';
            else if (tableType === 1) filename += '_eteisia';
            else if (tableType === 2) filename += '_anarrotikes';
            else if (tableType === 3) filename += '_miniaies';

            XLSX.writeFile(wb, `${filename}.xlsx`);
        } catch (error) {
            console.error('Σφάλμα κατά την εξαγωγή:', error);
            alert('Σφάλμα κατά την εξαγωγή του αρχείου');
        } finally {
            setExporting(false);
        }
    };

    function filterLeaveType(leaveType?: number | null){
        if (!leaveType) return "";
        const leave = leaves?.find((l) => l.id === Number(leaveType));
        return leave ? leave.description : leaveType;
    }

    return (
        <div title={pageTitle} style={{ zoom: scale }} className='p-8'>
            <div className='flex items-center justify-between -mt-8'>
                <h2 className='text-xl font-semibold text-neutral-900'>Άδειες</h2>
                <Button 
                    variant="default"
                    type="submit"
                    className="transition-all duration-200 hover:opacity-80 w-auto"
                    onClick={handleExport} disabled={exporting}
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
                    <DownloadIcon fontSize='small' />
                    Εξαγωγή σε Excel
                </Button>
            </div>
            <Separator className="my-4 bg-neutral-200" />
            <div className='flex items-center justify-between mt-10 gap-4 flex-wrap'>
                <div className='relative w-72'>
                    <input
                        className='flex w-72 min-w-0 rounded-md px-3 py-1 text-sm outline-none pl-10 bg-white border border-neutral-200 shadow-sm h-10'
                        value={search}
                        placeholder='Αναζήτηση με όνομα, ΑΦΜ και ΑΜ'
                        onChange={handleSearchChange}
                    />
                    <SearchIcon className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none' />
                </div>
                <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
                    <PopoverTrigger asChild>
                        <Button variant="outline" type="button" className="h-10 border border-neutral-200 bg-white px-4 rounded-md hover:bg-neutral-100 flex items-center gap-2">
                            <Filter size={16} />Φίλτρα
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 bg-white border border-neutral-200 outline-0 ring-0" align="end">
                        <div className="space-y-1.5">
                            <label className="text-xs text-neutral-600">Τύπος εκτύπωσης</label>
                            <Select value={String(tableType)} onValueChange={handleTypeOfTableChange}>
                                <SelectTrigger className="w-full bg-white h-10!"><SelectValue placeholder="Τύπος εκτύπωσης" /></SelectTrigger>
                                <SelectContent position="popper" className="bg-white border border-neutral-200 outline-0 ring-0">
                                    <SelectItem className="hover:bg-neutral-100" value="0">Ημερήσια κατάσταση</SelectItem>
                                    <SelectItem className="hover:bg-neutral-100" value="1">Σύνολο αδειών έτους</SelectItem>
                                    <SelectItem className="hover:bg-neutral-100" value="2">Αναρρωτικές άδειες</SelectItem>
                                    <SelectItem className="hover:bg-neutral-100" value="3">Μηνιαίες άδειες</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-4">
                            {tableType === 0 && (
                                <>
                                    <div className="space-y-1.5">
                                        <label className="text-xs text-neutral-600">Ημερομηνία</label>
                                        <input
                                            type="date"
                                            value={selectedDate}
                                            onChange={(e) => handleDateChange(e.target.value)}
                                            className="w-full bg-white border border-neutral-200 rounded-md px-3 py-2 text-sm h-10"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs text-neutral-600">Τύπος άδειας</label>
                                        <Select value={String(leaveType)} onValueChange={handleTypeChange}>
                                            <SelectTrigger className="w-full bg-white h-10!"><SelectValue placeholder="Τύπος άδειας" /></SelectTrigger>
                                            <SelectContent position="popper" className="bg-white border border-neutral-200 outline-0 ring-0">
                                                <SelectItem className="hover:bg-neutral-100" value="0">Όλοι οι τύποι</SelectItem>
                                                {leaves?.map(l => (
                                                    <SelectItem className="hover:bg-neutral-100" key={l.id} value={String(l.id)}>
                                                        {l.description}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </>
                            )}
                            {tableType === 1 && (
                                <>
                                    <div className="space-y-1.5">
                                        <label className="text-xs text-neutral-600">Εργασιακή κατάσταση</label>
                                        <Select value={String(selectedFlag)} onValueChange={handleFlagChange}>
                                            <SelectTrigger className="w-full bg-white h-10!"><SelectValue placeholder="Κατάσταση" /></SelectTrigger>
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
                                        <label className="text-xs text-neutral-600">Τύπος</label>
                                        <Select value={String(leaveType)} onValueChange={handleTypeChange}>
                                            <SelectTrigger className="w-full bg-white h-10!"><SelectValue placeholder="Τύπος άδειας" /></SelectTrigger>
                                            <SelectContent position="popper" className="bg-white border border-neutral-200 outline-0 ring-0">
                                                <SelectItem className="hover:bg-neutral-100" value="1">Αιμοδοτική</SelectItem>
                                                <SelectItem className="hover:bg-neutral-100" value="2">Αναρρωτική</SelectItem>
                                                <SelectItem className="hover:bg-neutral-100" value="3">Άνευ αποδοχών</SelectItem>
                                                <SelectItem className="hover:bg-neutral-100" value="4">Ασθένιας τέκνων</SelectItem>
                                                <SelectItem className="hover:bg-neutral-100" value="5">Γονική 4808-21</SelectItem>
                                                <SelectItem className="hover:bg-neutral-100" value="6">Κανονική</SelectItem>
                                                <SelectItem className="hover:bg-neutral-100" value="7">Σχολικής επίδοσης</SelectItem>
                                                <SelectItem className="hover:bg-neutral-100" value="8">Υπεύθυνη δήλωση</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs text-neutral-600">Έτος</label>
                                        <Select value={String(year)} onValueChange={handleYearChange}>
                                            <SelectTrigger className="w-full bg-white h-10!"><SelectValue placeholder="Έτος" /></SelectTrigger>
                                            <SelectContent position="popper" className="bg-white border border-neutral-200 outline-0 ring-0">
                                                <SelectItem className="hover:bg-neutral-100" value="2023">2023</SelectItem>
                                                <SelectItem className="hover:bg-neutral-100" value="2024">2024</SelectItem>
                                                <SelectItem className="hover:bg-neutral-100" value="2025">2025</SelectItem>
                                                <SelectItem className="hover:bg-neutral-100" value="2026">2026</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </>
                            )}
                            {tableType === 2 && (
                                <>
                                    <div className="space-y-1.5">
                                        <label className="text-xs text-neutral-600">Εργασιακή κατάσταση</label>
                                        <Select value={String(selectedFlag)} onValueChange={handleFlagChange}>
                                            <SelectTrigger className="w-full bg-white h-10!"><SelectValue placeholder="Κατάσταση" /></SelectTrigger>
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
                                        <label className="text-xs text-neutral-600">Μήνας</label>
                                        <Select value={String(month)} onValueChange={handleMonthChange}>
                                            <SelectTrigger className="w-full bg-white h-10!"><SelectValue placeholder="Μήνας" /></SelectTrigger>
                                            <SelectContent position="popper" className="bg-white border border-neutral-200 outline-0 ring-0">
                                                <SelectItem className="hover:bg-neutral-100" value="0">Όλοι</SelectItem>
                                                <SelectItem className="hover:bg-neutral-100" value="1">Ιανουάριος</SelectItem>
                                                <SelectItem className="hover:bg-neutral-100" value="2">Φεβρουάριος</SelectItem>
                                                <SelectItem className="hover:bg-neutral-100" value="3">Μάρτιος</SelectItem>
                                                <SelectItem className="hover:bg-neutral-100" value="4">Απρίλιος</SelectItem>
                                                <SelectItem className="hover:bg-neutral-100" value="5">Μάιος</SelectItem>
                                                <SelectItem className="hover:bg-neutral-100" value="6">Ιούνιος</SelectItem>
                                                <SelectItem className="hover:bg-neutral-100" value="7">Ιούλιος</SelectItem>
                                                <SelectItem className="hover:bg-neutral-100" value="8">Αύγουστος</SelectItem>
                                                <SelectItem className="hover:bg-neutral-100" value="9">Σεπτέμβριος</SelectItem>
                                                <SelectItem className="hover:bg-neutral-100" value="10">Οκτώβριος</SelectItem>
                                                <SelectItem className="hover:bg-neutral-100" value="11">Νοέμβριος</SelectItem>
                                                <SelectItem className="hover:bg-neutral-100" value="12">Δεκέμβριος</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs text-neutral-600">Έτος</label>
                                        <Select value={String(year)} onValueChange={handleYearChange}>
                                            <SelectTrigger className="w-full bg-white h-10!"><SelectValue placeholder="Έτος" /></SelectTrigger>
                                            <SelectContent position="popper" className="bg-white border border-neutral-200 outline-0 ring-0">
                                                <SelectItem className="hover:bg-neutral-100" value="0">Όλα</SelectItem>
                                                <SelectItem className="hover:bg-neutral-100" value="2023">2023</SelectItem>
                                                <SelectItem className="hover:bg-neutral-100" value="2024">2024</SelectItem>
                                                <SelectItem className="hover:bg-neutral-100" value="2025">2025</SelectItem>
                                                <SelectItem className="hover:bg-neutral-100" value="2026">2026</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </>
                            )}
                            {tableType === 3 && (
                                <>
                                    <div className="space-y-1.5">
                                        <label className="text-xs text-neutral-600">Εργασιακή κατάσταση</label>
                                        <Select value={String(selectedFlag)} onValueChange={handleFlagChange}>
                                            <SelectTrigger className="w-full bg-white h-10!"><SelectValue placeholder="Κατάσταση" /></SelectTrigger>
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
                                        <label className="text-xs text-neutral-600">Μήνας</label>
                                        <Select value={String(month)} onValueChange={handleMonthChange}>
                                            <SelectTrigger className="w-full bg-white h-10!"><SelectValue placeholder="Μήνας" /></SelectTrigger>
                                            <SelectContent position="popper" className="bg-white border border-neutral-200 outline-0 ring-0">
                                                <SelectItem className="hover:bg-neutral-100" value="0">Όλοι</SelectItem>
                                                <SelectItem className="hover:bg-neutral-100" value="1">Ιανουάριος</SelectItem>
                                                <SelectItem className="hover:bg-neutral-100" value="2">Φεβρουάριος</SelectItem>
                                                <SelectItem className="hover:bg-neutral-100" value="3">Μάρτιος</SelectItem>
                                                <SelectItem className="hover:bg-neutral-100" value="4">Απρίλιος</SelectItem>
                                                <SelectItem className="hover:bg-neutral-100" value="5">Μάιος</SelectItem>
                                                <SelectItem className="hover:bg-neutral-100" value="6">Ιούνιος</SelectItem>
                                                <SelectItem className="hover:bg-neutral-100" value="7">Ιούλιος</SelectItem>
                                                <SelectItem className="hover:bg-neutral-100" value="8">Αύγουστος</SelectItem>
                                                <SelectItem className="hover:bg-neutral-100" value="9">Σεπτέμβριος</SelectItem>
                                                <SelectItem className="hover:bg-neutral-100" value="10">Οκτώβριος</SelectItem>
                                                <SelectItem className="hover:bg-neutral-100" value="11">Νοέμβριος</SelectItem>
                                                <SelectItem className="hover:bg-neutral-100" value="12">Δεκέμβριος</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs text-neutral-600">Έτος</label>
                                        <Select value={String(year)} onValueChange={handleYearChange}>
                                            <SelectTrigger className="w-full bg-white h-10!"><SelectValue placeholder="Έτος" /></SelectTrigger>
                                            <SelectContent position="popper" className="bg-white border border-neutral-200 outline-0 ring-0">
                                                <SelectItem className="hover:bg-neutral-100" value="0">Όλα</SelectItem>
                                                <SelectItem className="hover:bg-neutral-100" value="2023">2023</SelectItem>
                                                <SelectItem className="hover:bg-neutral-100" value="2024">2024</SelectItem>
                                                <SelectItem className="hover:bg-neutral-100" value="2025">2025</SelectItem>
                                                <SelectItem className="hover:bg-neutral-100" value="2026">2026</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </>
                            )}
                            <div className="flex justify-end pt-2 border-neutral-200">
                                <Button variant="outline" onClick={handleClearFilters} className="cursor-pointer">
                                    Καθαρισμός
                                </Button>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
            <div data-slot='card' className='bg-card text-card-foreground flex flex-col mt-6 overflow-hidden'>
                {!isLoadingEmployeeAllLeavesList && employeeAllLeavesList?.items && employeeAllLeavesList.items.length !== 0 ? (
                    <Table className='w-full bg-white border-b-neutral-200 table-fixed' style={{ tableLayout: 'fixed' }}>
                        <TableHeader className='bg-white border-b'>
                            <TableRow className='bg-white border-b'>
                                {tableType === 1 ? (
                                    <>
                                        <TableHead className='font-bold px-3 py-3 text-left' style={{ width: '14rem' }}>Όνομα</TableHead>
                                        <TableHead className='font-bold px-3 py-3 text-left' style={{ width: '5rem' }}>ΑΜ</TableHead>
                                        <TableHead className='font-bold px-3 py-3 text-left' style={{ width: '8rem' }}>ΑΦΜ</TableHead>
                                        {leaveType === 6 && (
                                            <>
                                                <TableHead className='font-bold px-3 py-3 text-center' style={{ width: '8rem' }}>Δικαιούμενες</TableHead>
                                                <TableHead className='font-bold px-3 py-3 text-center' style={{ width: '8rem' }}>Χορηγηθήσες</TableHead>
                                                <TableHead className='font-bold px-3 py-3 text-center' style={{ width: '8rem' }}>Υπόλοιπο προ/νου έτους</TableHead>
                                            </>
                                        )}
                                        {leaveType !== 6 && (
                                            <>
                                                <TableHead className='font-bold px-3 py-3 text-center' style={{ width: '8rem' }}>Χορηγηθήσες</TableHead>
                                            </>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <TableHead className='font-bold px-3 py-3 text-left' style={{ width: '14rem' }}>Όνομα</TableHead>
                                        <TableHead className='font-bold px-3 py-3 text-left' style={{ width: '5rem' }}>ΑΜ</TableHead>
                                        <TableHead className='font-bold px-3 py-3 text-left' style={{ width: '8rem' }}>ΑΦΜ</TableHead>
                                        <TableHead className='font-bold px-3 py-3 text-left' style={{ width: '8rem' }}>Τύπος</TableHead>
                                        <TableHead className='font-bold px-3 py-3 text-left' style={{ width: '8rem' }}>Διάρκεια</TableHead>
                                        <TableHead className='font-bold px-3 py-3 text-left' style={{ width: '8rem' }}>Έναρξη</TableHead>
                                        <TableHead className='font-bold px-3 py-3 text-left' style={{ width: '8rem' }}>Λήξη</TableHead>
                                    </>
                                )}
                            </TableRow>
                        </TableHeader>
                        <TableBody className='divide-y divide-neutral-200 bg-white'>
                            {employeeAllLeavesList?.items.map((leave, idx) => (
                                <TableRow key={tableType === 1 ? `${leave.am}-${idx}` : leave.id} className='hover:bg-neutral-50 transition-colors'>
                                    {tableType === 1 ? (
                                        <>
                                            <TableCell className='px-3 py-3 text-left' style={{ width: '14rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                <div className='flex items-center gap-3'>
                                                    <Avatar className='w-8 h-8 shrink-0 bg-neutral-100 border border-neutral-200'>
                                                        <AvatarFallback className='text-xs font-semibold text-black rounded-full'>
                                                            {getInitials(leave.employeeName)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    {leave.employeeName}
                                                </div>
                                            </TableCell>
                                            <TableCell className='px-3 py-3 text-left' style={{ width: '5rem' }}>{leave.am}</TableCell>
                                            <TableCell className='px-3 py-3 text-left' style={{ width: '8rem' }}>{leave.afm}</TableCell>
                                            {leaveType === 6 ? (
                                                <>
                                                    <TableCell className='px-3 py-3 text-center' style={{ width: '8rem' }}>{leave.entitled ?? 0}</TableCell>
                                                    <TableCell className='px-3 py-3 text-center' style={{ width: '8rem' }}>{leave.totalLeaves ?? 0}</TableCell>
                                                    <TableCell className='px-3 py-3 text-center' style={{ width: '8rem' }}>{leave.carriedOver ?? 0}</TableCell>
                                                </>
                                            ) : (
                                                <TableCell className='px-3 py-3 text-center' style={{ width: '8rem' }}>{leave.totalLeaves ?? 0}</TableCell>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <TableCell className='px-3 py-3 text-left' style={{ width: '14rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                <div className='flex items-center gap-3'>
                                                    <Avatar className='w-8 h-8 shrink-0 bg-neutral-100 border border-neutral-200'>
                                                        <AvatarFallback className='text-xs font-semibold text-black rounded-full'>
                                                            {getInitials(leave.employeeName)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    {leave.employeeName}
                                                </div>
                                            </TableCell>
                                            <TableCell className='px-3 py-3 text-left' style={{ width: '5rem' }}>{leave.am}</TableCell>
                                            <TableCell className='px-3 py-3 text-left' style={{ width: '8rem' }}>{leave.afm}</TableCell>
                                            <TableCell className='px-3 py-3 text-left' style={{ width: '8rem' }}>{filterLeaveType(leave.type)}</TableCell>
                                            <TableCell className='px-3 py-3 text-left' style={{ width: '8rem' }}>{leave.duration} {leave.duration > 1 ? 'ημέρες' : 'ημέρα'}</TableCell>
                                            <TableCell className='px-3 py-3 text-left' style={{ width: '8rem' }}>{leave.dateFrom ? formatDate(leave.dateFrom.toString()) : '-'}</TableCell>
                                            <TableCell className='px-3 py-3 text-left' style={{ width: '8rem' }}>{leave.dateTo ? formatDate(leave.dateTo.toString()) : '-'}</TableCell>
                                        </>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : isErrorEmployeeAllLeavesList ? (
                    <div className='p-4 text-center text-neutral-500'>Προβλήματα κατά τη φόρτωση της λίστας αδειών.</div>
                ) : isLoadingEmployeeAllLeavesList ? (
                    <div className='p-4 text-center text-neutral-500'>Φόρτωση λίστας αδειών...</div>
                ) : (
                    <div className='p-4 text-center text-neutral-500'>Δεν βρέθηκαν άδειες.</div>
                )}
                {employeeAllLeavesList?.items && employeeAllLeavesList.items.length > 8 && (
                    <>
                        <Separator className="bg-neutral-200" />
                        <div className='flex items-center justify-center bg-white w-full h-20'>
                            <Pagination className='inline-flex items-center gap-2'>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious href='#' onClick={(e) => { e.preventDefault(); if (page > 1) setPage(page - 1); }} aria-disabled={page <= 1} />
                                    </PaginationItem>

                                    {(() => {
                                    const totalPages = Math.max(1, Math.ceil(rowCount / PAGE_SIZE));
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
                                            return ( <PaginationItem key={`dots-${idx}`}><PaginationEllipsis /></PaginationItem>);
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
                                        <PaginationNext href='#' onClick={(e) => { e.preventDefault(); const total = Math.max(1, Math.ceil(rowCount / PAGE_SIZE)); if (page < total) setPage(page + 1); }} aria-disabled={page >= Math.max(1, Math.ceil(rowCount / PAGE_SIZE))} />
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