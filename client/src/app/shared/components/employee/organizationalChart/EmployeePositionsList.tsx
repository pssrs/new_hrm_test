import { useState } from 'react';
import { useValues } from '@/lib/hooks/useValues';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { DownloadIcon } from 'lucide-react';
import * as XLSX from "xlsx";

const PAGE_SIZE = 8;

export default function EmployeePositionsList() {
    const { address, sector, department, positionSum } = useValues();
    const [page, setPage] = useState(1);
    const [exporting, setExporting] = useState(false);

    const rows = positionSum.map((p) => {
        const addressName = address.find(a => a.id === p.addressId)?.address_str ?? "-";
        const sectorName = sector.find(s => s.sectorId === p.sectorId && s.addressId === p.addressId)?.sectorName ?? "-";
        const departmentName = department.find(d => d.departmentId === p.departmentId && d.sectorId === p.sectorId && d.addressId === p.addressId)?.departmentName ?? "-";

        return {
            key: p.id,
            addressName,
            sectorName,
            departmentName,
            total: p.sum,
            used: p.used,
            unused: p.unused,
        };
    });

    const rowCount = rows.length;
    const totalPages = Math.max(1, Math.ceil(rowCount / PAGE_SIZE));
    const startIdx = (page - 1) * PAGE_SIZE;
    const paginatedRows = rows.slice(startIdx, startIdx + PAGE_SIZE);

    const handleExport = async () => {
        setExporting(true);
        try {
            if (!rows.length) return;

            const exportRows = rows.map((row) => ({
                "Διεύθυνση": row.addressName,
                "Τομέας": row.sectorName,
                "Τμήμα": row.departmentName,
                "Σύνολο θέσεων": row.total,
                "Καλυμμένες θέσεις": row.used,
                "Κενές θέσεις": row.unused,
            }));

            const worksheet = XLSX.utils.json_to_sheet(exportRows);
            worksheet["!cols"] = [
                { wch: 28 }, { wch: 20 }, { wch: 20 }, { wch: 16 }, { wch: 18 }, { wch: 16 },
            ];

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Πληρότητα θέσεων");
            XLSX.writeFile(workbook, `Πληρότητα_θέσεων_${new Date().toISOString().slice(0, 10)}.xlsx`);
        } finally {
            setExporting(false);
        }
    };

    return (
        <div>
            <div className='flex items-center justify-end mt-4'>
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
            <div data-slot='card' className='bg-card text-card-foreground flex flex-col mt-6 overflow-hidden'>
                <Table className='w-full bg-white border-b-neutral-200 table-fixed' style={{ tableLayout: 'fixed' }}>
                    <TableHeader className='bg-white border-b'>
                        <TableRow className='bg-white border-b'>
                            <TableHead className='font-bold px-3 py-3 text-left' style={{ width: '25%' }}>Διεύθυνση</TableHead>
                            <TableHead className='font-bold px-3 py-3 text-left' style={{ width: '20%' }}>Τομέας</TableHead>
                            <TableHead className='font-bold px-3 py-3 text-left' style={{ width: '20%' }}>Τμήμα</TableHead>
                            <TableHead className='font-bold px-3 py-3 text-left' style={{ width: '12%' }}>Σύνολο θέσεων</TableHead>
                            <TableHead className='font-bold px-3 py-3 text-left' style={{ width: '12%' }}>Καλυμμένες θέσεις</TableHead>
                            <TableHead className='font-bold px-3 py-3 text-left' style={{ width: '11%' }}>Κενές θέσεις</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className='divide-y divide-neutral-200 bg-white'>
                        {paginatedRows.map((row) => (
                            <TableRow key={row.key} className='hover:bg-neutral-50 transition-colors'>
                                <TableCell className='px-3 py-3 text-left' style={{ width: '25%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={row.addressName}>{row.addressName}</TableCell>
                                <TableCell className='px-3 py-3 text-left' style={{ width: '20%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={row.sectorName}>{row.sectorName}</TableCell>
                                <TableCell className='px-3 py-3 text-left' style={{ width: '20%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={row.departmentName}>{row.departmentName}</TableCell>
                                <TableCell className='px-3 py-3 text-left' style={{ width: '12%' }}>{row.total}</TableCell>
                                <TableCell className='px-3 py-3 text-left' style={{ width: '12%' }}>{row.used}</TableCell>
                                <TableCell className='px-3 py-3 text-left' style={{ width: '11%' }}>{row.unused}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {rowCount > PAGE_SIZE && (
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
                                                return (<PaginationItem key={`dots-${idx}`}><PaginationEllipsis /></PaginationItem>);
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
                    </>
                )}
            </div>
        </div>
    );
}
