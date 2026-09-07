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
import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CATEGORY_OPTIONS } from '@/lib/types/constTypes';
import * as XLSX from "xlsx";

const PAGE_SIZE = 8;

export type ColumnDef = {
    key: string;
    label: string;
    width: string;
    value: (e: EmployeeListDto) => string;
};

export type ViewType = "org" | "specialty";

type EmployeeListViewProps = {
    view: ViewType;
    exportFileNamePrefix: string;
};

export default function EmployeeListView({ view, exportFileNamePrefix }: EmployeeListViewProps) {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [selectedFlag, setSelectedFlag] = useState<number>(0);

    const [selectedAddressRowId, setSelectedAddressRowId] = useState<string | undefined>(undefined);
    const [selectedSectorRowId, setSelectedSectorRowId] = useState<string | undefined>(undefined);
    const [selectedDepartmentRowId, setSelectedDepartmentRowId] = useState<string | undefined>(undefined);
    const [specialtyCode, setSpecialtyCode] = useState<string | undefined>("all");
    const [branchCode, setBranchCode] = useState<string | undefined>("all");

    const [address_Id, setAddress_Id] = useState<number>(0);
    const [sector_Id, setSector_Id] = useState<number>(0);
    const [department_Id, setDepartment_Id] = useState<number>(0);

    const { address, sector, department, eidikothtes, kladoi } = useValues();

    const { employeeGroup, isLoading, isError, fetchAllEmployees } = useEmployee({
        page,
        pageSize: PAGE_SIZE,
        search,
        flag: selectedFlag > 0 ? selectedFlag : undefined,
        address_Id: view === "org" && address_Id > 0 ? address_Id : undefined,
        sector_Id: view === "org" && sector_Id > 0 ? sector_Id : undefined,
        department_Id: view === "org" && department_Id > 0 ? department_Id : undefined,
        specialtyCode: view === "specialty" ? specialtyCode : undefined,
        branchCode: view === "specialty" ? branchCode : undefined,
    });

    const handleAddressChange = (v: string) => {
        const isAll = v === "all";
        setSelectedAddressRowId(isAll ? undefined : v);
        setSelectedSectorRowId(undefined);
        setSelectedDepartmentRowId(undefined);

        const addr = isAll ? undefined : address.find(a => String(a.id) === v);
        setAddress_Id(addr?.id ?? 0);
        setSector_Id(0);
        setDepartment_Id(0);
        setPage(1);
    };

    const handleSectorChange = (v: string) => {
        const isAll = v === "all";
        setSelectedSectorRowId(isAll ? undefined : v);
        setSelectedDepartmentRowId(undefined);

        const sec = isAll ? undefined : sector.find(s => String(s.id) === v);
        setSector_Id(sec?.sectorId ?? 0);
        setDepartment_Id(0);
        setPage(1);
    };

    const handleDepartmentChange = (v: string) => {
        const isAll = v === "all";
        setSelectedDepartmentRowId(isAll ? undefined : v);

        const dep = isAll ? undefined : department.find(d => String(d.id) === v);
        setDepartment_Id(dep?.departmentId ?? 0);
        setPage(1);
    };

    const selectedAddress = selectedAddressRowId
        ? address.find(a => String(a.id) === selectedAddressRowId)
        : undefined;

    const selectedSector = selectedSectorRowId
        ? sector.find(s => String(s.id) === selectedSectorRowId)
        : undefined;

    const filteredSectors = selectedAddress
        ? sector.filter(s => s.addressId === selectedAddress.id)
        : [];

    const filteredDepartments = (selectedAddress && selectedSector)
        ? department.filter(d => d.addressId === selectedAddress.id && d.sectorId === selectedSector.sectorId)
        : [];

    const handleFlagChange = (v: string) => {
        setSelectedFlag(Number(v));
        setPage(1);
    };

    const handleSpecialtyChange = (v: string) => {
        setSpecialtyCode(v === "all" ? undefined : v);
        setPage(1);
    };

    const handleBranchChange = (v: string) => {
        setBranchCode(v === "all" ? undefined : v);
        setPage(1);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setPage(1);
    };

    const rowCount = employeeGroup?.totalCount ?? 0;

    const getInitials = (name?: string) => {
        if (!name) return '??';
        return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    };

    const [filtersOpen, setFiltersOpen] = useState(false);

    const handleClearFilters = () => {
        setSelectedFlag(0);
        setSelectedAddressRowId(undefined);
        setSelectedSectorRowId(undefined);
        setSelectedDepartmentRowId(undefined);
        setSpecialtyCode(undefined);
        setBranchCode(undefined);
        setAddress_Id(0);
        setSector_Id(0);
        setDepartment_Id(0);
        setSearch('');
        setPage(1);
        setFiltersOpen(false);
    };

    const [exporting, setExporting] = useState(false);

    const formatCategory = (v?: string | null) => {
        const code = String(v ?? "").toLowerCase();
        return CATEGORY_OPTIONS.find(o => o.value.toLowerCase() === code)?.label ?? String(v ?? "-");
    };

    const formatSpecialty = (v?: string | null) =>
        eidikothtes.find(e => e.code === v)?.description ?? String(v ?? "-");

    const formatBranch = (v?: string | null) =>
        kladoi.find(k => k.code === v)?.description ?? String(v ?? "-");

    const columns: ColumnDef[] = view === "org"
        ? [
            { key: "address", label: "Διεύθυνση", width: "12rem", value: (e) => e.address ?? "-" },
            { key: "sector", label: "Τομέας", width: "12rem", value: (e) => e.sector ?? "-" },
            { key: "department", label: "Τμήμα", width: "12rem", value: (e) => e.department ?? "-" },
        ]
        : view === "specialty"
        ? [
            { key: "category", label: "Κατηγορία", width: "10rem", value: (e) => formatCategory(e.category) },
            { key: "branch", label: "Κλάδος", width: "14rem", value: (e) => formatBranch(e.branch) },
            { key: "specialty", label: "Ειδικότητα", width: "14rem", value: (e) => formatSpecialty(e.specialty) },
        ]
        : [];

    const handleExport = async () => {
        setExporting(true);
        try {
            const all = await fetchAllEmployees();
            if (!all.length) return;

            const rows = all.map((e: EmployeeListDto) => {
                const row: Record<string, string> = {
                    "Όνομα": e.name ?? "",
                    "ΑΜ": String(e.am ?? ""),
                    "ΑΦΜ": e.afm ?? "",
                };
                columns.forEach(col => { row[col.label] = col.value(e); });
                return row;
            });

            const worksheet = XLSX.utils.json_to_sheet(rows);
            worksheet["!cols"] = [
                { wch: 28 }, { wch: 8 }, { wch: 12 },
                ...columns.map(c => ({ wch: Math.max(14, c.label.length + 4) })),
            ];

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Υπάλληλοι");
            XLSX.writeFile(workbook, `${exportFileNamePrefix}_${new Date().toISOString().slice(0, 10)}.xlsx`);
        } finally {
            setExporting(false);
        }
    };

    return (
        <div>
            <div className='flex items-center justify-between mt-4 gap-4 flex-wrap'>
                <div className='relative w-72'>
                    <input
                        className='flex w-72 min-w-0 rounded-md px-3 py-1 text-sm outline-none pl-10 bg-white border border-neutral-200 shadow-sm h-10'
                        value={search}
                        placeholder='Αναζήτηση με όνομα, ΑΦΜ και ΑΜ'
                        onChange={handleSearchChange}
                    />
                    <SearchIcon className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none' />
                </div>
                <div className='flex items-center gap-2'>
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
                            {view === "org" && (
                                <>
                                    <div className="space-y-1.5">
                                        <label className="text-xs text-neutral-600">Διεύθυνση</label>
                                        <Select value={selectedAddressRowId} onValueChange={handleAddressChange}>
                                            <SelectTrigger className="w-full bg-white h-10!">
                                                <SelectValue placeholder="Διεύθυνση" />
                                            </SelectTrigger>
                                            <SelectContent position="popper" className="bg-white border border-neutral-200 outline-0 ring-0">
                                                <SelectItem className="hover:bg-neutral-100" value="all">Όλες οι Διευθύνσεις</SelectItem>
                                                {address.filter(a => a.address_str).map(a => (
                                                    <SelectItem className="hover:bg-neutral-100" key={a.id} value={String(a.id)}>
                                                        {a.address_str}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs text-neutral-600">Τομέας</label>
                                        <Select
                                            key={`sector-${selectedAddressRowId ?? 'none'}`}
                                            value={selectedSectorRowId}
                                            onValueChange={handleSectorChange}
                                            disabled={!selectedAddressRowId}
                                        >
                                            <SelectTrigger className="w-full bg-white h-10! disabled:opacity-50 disabled:cursor-not-allowed">
                                                <SelectValue placeholder="Τομέας" />
                                            </SelectTrigger>
                                            <SelectContent position="popper" className="bg-white border border-neutral-200 outline-0 ring-0">
                                                <SelectItem className="hover:bg-neutral-100" value="all">Όλοι οι Τομείς</SelectItem>
                                                {filteredSectors.filter(s => s.sectorName).map(s => (
                                                    <SelectItem className="hover:bg-neutral-100" key={s.id} value={String(s.id)}>
                                                        {s.sectorName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs text-neutral-600">Τμήμα</label>
                                        <Select
                                            key={`department-${selectedAddressRowId ?? 'none'}-${selectedSectorRowId ?? 'none'}`}
                                            value={selectedDepartmentRowId}
                                            onValueChange={handleDepartmentChange}
                                            disabled={!selectedSectorRowId}
                                        >
                                            <SelectTrigger className="w-full bg-white h-10! disabled:opacity-50 disabled:cursor-not-allowed">
                                                <SelectValue placeholder="Τμήμα" />
                                            </SelectTrigger>
                                            <SelectContent position="popper" className="bg-white border border-neutral-200 outline-0 ring-0">
                                                <SelectItem className="hover:bg-neutral-100" value="all">Όλα τα Τμήματα</SelectItem>
                                                {filteredDepartments.filter(d => d.departmentName).map(d => (
                                                    <SelectItem className="hover:bg-neutral-100" key={d.id} value={String(d.id)}>
                                                        {d.departmentName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </>
                            )}
                            {view === "specialty" && (
                                <>
                                    <div className="space-y-1.5">
                                        <label className="text-xs text-neutral-600">Ειδικότητα</label>
                                        <Select
                                            key={`specialty-${specialtyCode ?? 'all'}`}
                                            value={specialtyCode}
                                            onValueChange={handleSpecialtyChange}
                                        >
                                            <SelectTrigger className="w-full bg-white h-10!">
                                                <SelectValue placeholder="Ειδικότητα" />
                                            </SelectTrigger>
                                            <SelectContent position="popper" className="bg-white border border-neutral-200 outline-0 ring-0">
                                                <SelectItem className="hover:bg-neutral-100" value="all">Όλες οι Ειδικότητες</SelectItem>
                                                {eidikothtes.map(d => (
                                                    <SelectItem className="hover:bg-neutral-100" key={d.code} value={String(d.code)}>
                                                        {d.description}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs text-neutral-600">Κλάδος</label>
                                        <Select
                                            key={`branch-${branchCode ?? 'all'}`}
                                            value={branchCode}
                                            onValueChange={handleBranchChange}
                                        >
                                            <SelectTrigger className="w-full bg-white h-10!">
                                                <SelectValue placeholder="Κλάδος" />
                                            </SelectTrigger>
                                            <SelectContent position="popper" className="bg-white border border-neutral-200 outline-0 ring-0">
                                                <SelectItem className="hover:bg-neutral-100" value="all">Όλοι οι Κλάδοι</SelectItem>
                                                {kladoi.map(d => (
                                                    <SelectItem className="hover:bg-neutral-100" key={d.code} value={String(d.code)}>
                                                        {d.description}
                                                    </SelectItem>
                                                ))}
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
            </div>
            {isLoading && !isError ? (
                <div className='p-4 text-center text-neutral-500'>Φόρτωση λίστας υπαλλήλων...</div>
            ) : !isLoading && !isError ? (
                <div data-slot='card' className='bg-card text-card-foreground flex flex-col mt-6 overflow-hidden'>
                    <Table className='w-full bg-white border-b-neutral-200 table-fixed' style={{ tableLayout: 'fixed' }}>
                        <TableHeader className='bg-white border-b'>
                            <TableRow className='bg-white border-b'>
                                <TableHead className='font-bold px-3 py-3 text-left' style={{ width: '14rem' }}>Όνομα</TableHead>
                                <TableHead className='font-bold px-3 py-3 text-left' style={{ width: '5rem' }}>ΑΜ</TableHead>
                                <TableHead className='font-bold px-3 py-3 text-left' style={{ width: '8rem' }}>ΑΦΜ</TableHead>
                                {columns.map(col => (
                                    <TableHead key={col.key} className='font-bold px-3 py-3 text-left' style={{ width: col.width }}>
                                        {col.label}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody className='divide-y divide-neutral-200 bg-white'>
                            {employeeGroup?.items.map((employee: EmployeeListDto) => (
                                <TableRow key={employee.id} className='hover:bg-neutral-50 transition-colors'>
                                    <TableCell className='px-3 py-3 text-left' style={{ width: '14rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={employee.name ?? ''}>
                                        <div className='flex items-center gap-3'>
                                            <Avatar className='w-8 h-8 shrink-0 bg-neutral-100 border border-neutral-200'>
                                                <AvatarFallback className='text-xs font-semibold text-black rounded-full'>
                                                    {getInitials(employee?.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            {employee.name}
                                        </div>
                                    </TableCell>
                                    <TableCell className='px-3 py-3 text-left' style={{ width: '5rem' }}>{employee.am}</TableCell>
                                    <TableCell className='px-3 py-3 text-left' style={{ width: '8rem' }}>{employee.afm}</TableCell>
                                    {columns.map(col => {
                                        const v = col.value(employee);
                                        return (
                                            <TableCell key={col.key} className='px-3 py-3 text-left'
                                                style={{ width: col.width, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                                title={v}
                                            >
                                                {v}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {rowCount > 8 && (
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
            ) : (
                <div className='p-4 text-center text-neutral-500'>Σφάλμα κατά τη φόρτωση της λίστας υπαλλήλων.</div>
            )}
        </div>
    );
}
