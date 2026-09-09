import * as React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useNavigate } from 'react-router';
import { useEmployee } from '../../../../../lib/hooks/useEmployee';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Filter, PlusIcon, SearchIcon, XIcon } from 'lucide-react';
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Field, FieldLabel } from '@/components/ui/field';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useValues } from '@/lib/hooks/useValues';
import { Separator } from '@/components/ui/separator';

const PAGE_SIZE = 8;
const REFERENCE_WIDTH = 1600;
const MIN_SCALE = 0.6;

export default function EmployeeList() {
  const navigate = useNavigate();
  const [scale, setScale] = React.useState(1);

  React.useEffect(() => {
    const updateScale = () => {
      const nextScale = Math.min(1, Math.max(MIN_SCALE, window.innerWidth / REFERENCE_WIDTH));
      setScale(nextScale);
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState('');
  const [selectedFlag, setSelectedFlag] = React.useState<number>(0);
  const [selectedAddress, setSelectedAddress] = React.useState<number>(0);
  const [draftSelectedFlag, setDraftSelectedFlag] = React.useState<string>('0');
  const [draftSelectedAddress, setDraftSelectedAddress] = React.useState<string>('-1');
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [draftSelect2, setDraftSelect2] = React.useState<string>('-1');
  const [draftSelect3, setDraftSelect3] = React.useState<string>('-1');
  const [draftSelect4, setDraftSelect4] = React.useState<string>('-1');

  const [address_Id, setAddress_Id] = React.useState<number>(0);
  const [sector_Id, setSector_Id] = React.useState<number>(0);
  const [department_Id, setDepartment_Id] = React.useState<number>(0);
  const [office_Id, setOffice_Id] = React.useState<number>(0);

  const { employeeGroup, isLoading, isError} = useEmployee({ 
    page, pageSize: PAGE_SIZE, search, flag: selectedFlag > 0 ? selectedFlag : undefined,
    address_Id, sector_Id, department_Id, office_Id
  });
  const { sector, department, office } = useValues();
  const [sectorSelection, setSectorSelection] = React.useState<Department[]>();

  React.useEffect(() => {
    if (draftSelect2 === '-1') {
      setDraftSelect3('-1');
    }
  }, [draftSelect2]);

  React.useEffect(() => {
    if (draftSelect3 === '-1') {
      setDraftSelect4('-1');
    }
  }, [draftSelect3]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleApplyFilters = () => {
    setSelectedFlag(draftSelectedFlag ? parseInt(draftSelectedFlag, 10) : 0);
    setSelectedAddress(draftSelectedAddress !== '-1' ? parseInt(draftSelectedAddress, 10) : 0);
    setPage(1);
    setDrawerOpen(false);

    const sector_tmp = sector.find((d: Sector) => String(d.id) === draftSelect2);
    const department_tmp = department.find((d: Department) => String(d.id) === draftSelect3);
    const office_tmp = office.find((d: Office) => Number(d.id) === Number(draftSelect4));

    setAddress_Id(draftSelectedAddress !== '-1' ? parseInt(draftSelectedAddress, 10) : 0);
    setSector_Id(sector_tmp?.sectorId ?? 0);
    setDepartment_Id(department_tmp?.departmentId ?? 0);
    setOffice_Id(office_tmp?.departmentId ?? 0);
    
  };

  const handleClearFilters = () => {
    setDraftSelectedAddress('-1');
    setDraftSelect2('-1');
    setDraftSelect3('-1');
    setDraftSelect4('-1');
    setSelectedAddress(0);
    setSelectedFlag(0);
    setPage(1);
  };

  const handleSectorChange = (e: string) => {
    setDraftSelect3('-1');
    setDraftSelect4('-1');
    const value = sector.find((d: Sector) => String(d.id) === e);
    const sectorFilter = department.filter((d: Department) => d.sectorId === value?.sectorId && d.addressId === value?.addressId) as Department[];
    setSectorSelection(sectorFilter);
  };

  const rowCount = employeeGroup?.totalCount ?? 0;

  const pageTitle = 'Υπάλληλοι';

  const getInitials = (name?: string) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };

  return (
    <div title={pageTitle} className='p-8' style={{ zoom: scale }}>
      <div className='flex items-center justify-between -mt-8'>
          <h2 className='text-xl font-semibold text-neutral-900'>Υπάλληλοι</h2>
          <Button 
              variant="default"
              type="submit"
              onClick={() => navigate('/newemployee')}
              className="transition-all duration-200 hover:opacity-80 w-auto"
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
              Εισαγωγή Υπαλλήλου
          </Button>
      </div>
      <Separator className="my-4 bg-neutral-200" />
      <div className='flex items-center justify-between mt-10'>
        <div className='relative w-80'>
          <input
            className='file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex w-80 min-w-0 rounded-md px-3 py-1 text-base transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 pl-10 bg-white border border-neutral-200 shadow-sm h-10'
            value={search}
            placeholder='Αναζήτηση με όνομα, ΑΦΜ και ΑΜ'
            onChange={handleSearchChange}
          />
          <SearchIcon className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none' />
        </div>
        
        <Drawer direction="right" open={drawerOpen} onOpenChange={(v) => setDrawerOpen(Boolean(v))}>
          <DrawerTrigger asChild>
            <Button 
              className='border border-neutral-200 bg-white px-4 py-2 rounded-md h-10 hover:bg-neutral-100 transition-colors flex items-center gap-2 w-24'
              onClick={() => { setDraftSelectedAddress(selectedAddress !== 0 ? String(selectedAddress) : '-1'); setDraftSelectedFlag(String(selectedFlag)); setDrawerOpen(true); }}
            >
              <Filter fontSize='small' />Φίλτρα
            </Button>
          </DrawerTrigger>
          <DrawerContent className='bg-white'>
            <DrawerHeader>
              <div className='flex items-center justify-between'>
                <DrawerTitle>
                  <h2 id="radix-:r3g:" data-slot="sheet-title" className="text-xl font-semibold text-neutral-900">
                    Φίλτρα
                  </h2>
                </DrawerTitle>
                <button 
                  onClick={() => setDrawerOpen(false)}
                  className='p-1 hover:bg-neutral-100 rounded-md transition-colors'
                >
                  <XIcon className='w-5 h-5 text-neutral-600' />
                </button>
              </div>
              <DrawerDescription>Φιλτράρετε τους υπαλλήλους ανά τομέα, τμήμα ή θέση</DrawerDescription>
            </DrawerHeader>
            <div className='p-4 flex flex-col gap-4'>
              <Field className="w-full">
                <FieldLabel>Εργασιακή Κατάσταση</FieldLabel>
                <Select value={draftSelectedFlag} onValueChange={(v: string) => setDraftSelectedFlag(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Επιλέξτε μια κατάσταση" />
                  </SelectTrigger>
                  <SelectContent position="popper" className="bg-white border border-neutral-200 outline-0 ring-0">
                    <SelectGroup >
                      <SelectItem className="hover:bg-neutral-100" value={'0'}>Όλοι</SelectItem>
                      <SelectItem className="hover:bg-neutral-100" value={'1'}>Εν ενεργεία</SelectItem>
                      <SelectItem className="hover:bg-neutral-100" value={'2'}>Απόσπαση</SelectItem>
                      <SelectItem className="hover:bg-neutral-100" value={'3'}>Μετακίνηση</SelectItem>
                      <SelectItem className="hover:bg-neutral-100" value={'4'}>Ανενεργός</SelectItem>
                      <SelectItem className="hover:bg-neutral-100" value={'5'}>Μετάθεση</SelectItem>
                      <SelectItem className="hover:bg-neutral-100" value={'6'}>Συνταξιοδότηση</SelectItem>
                      <SelectItem className="hover:bg-neutral-100" value={'7'}>Εν ενεργεία μόνιμος</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <Field className="w-full">
                <FieldLabel>Τομέας</FieldLabel>
                <Select value={draftSelect2} onValueChange={(v: string) => 
                  {setDraftSelect2(v); handleSectorChange(v)}}>
                  <SelectTrigger>
                    <SelectValue placeholder="Επιλέξτε ένα τομέα" />
                  </SelectTrigger>
                  <SelectContent className='bg-white border-0 shadow-md'>
                    <SelectGroup >
                      {sector.map((item: Sector) => (
                        <SelectItem key={String(item.id)} value={String(item.id)}>
                          {item.sectorName}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <Field className="w-full">
                <FieldLabel>Τμήμα</FieldLabel>
                <Select value={draftSelect3} onValueChange={(v: string) => setDraftSelect3(v)}>
                  <SelectTrigger disabled={draftSelect2 === '-1'}>
                    <SelectValue placeholder={draftSelect2 === '-1' ? "Επιλέξτε πρώτα τομέα" : "Επιλέξτε ένα τμήμα"} />
                  </SelectTrigger>
                  <SelectContent className='bg-white border-0 shadow-md'>
                    <SelectGroup>
                      {(sectorSelection)?.map((d: Department) => (
                          <SelectItem key={String(d.id)} value={String(d.id)}>
                            {d.departmentName ?? d.departmentName}
                          </SelectItem>
                        ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <Field className="w-full">
                <FieldLabel>Γραφείο</FieldLabel>
                <Select value={draftSelect4} onValueChange={(v: string) => setDraftSelect4(v)}>
                  <SelectTrigger disabled={draftSelect3 === '-1'}>
                    <SelectValue placeholder={draftSelect3 === '-1' ? "Επιλέξτε πρώτα τμήμα" : "Επιλέξτε ένα γραφείο"} />
                  </SelectTrigger>
                  <SelectContent className='bg-white border-0 shadow-md'>
                    <SelectGroup>
                      {office.map((item: Office) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.officeName}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <DrawerFooter className='mt-auto flex flex-col gap-2 p-4 border-t border-neutral-200 w-full'>
              <div className='flex gap-3 justify-end w-full'>
                <Button variant='outline' className='sm:w-42 w-full transition-all duration-200 hover:bg-gray-100' onClick={handleClearFilters}>Καθαρισμός</Button>
                <Button className='sm:w-42 w-full transition-all duration-200 hover:opacity-80' style={{ background: 'var(--color-primary)', color: 'var(--color-primary-foreground)', }} onClick={handleApplyFilters}>Εφαρμογή</Button>
              </div>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>

    {isLoading && !isError ? (
      <div className='p-4 text-center text-neutral-500'>Φόρτωση λίστας υπαλλήλων...</div>
    ) : !isLoading && !isError ? (
      <div data-slot='card' className='bg-card text-card-foreground flex flex-col mt-6 overflow-hidden'>
        <Table className='w-full bg-white  border-b-neutral-200 table-fixed' style={{ tableLayout: 'fixed' }}>
          <TableHeader className='bg-white border-b'>
            <TableRow className='bg-white border-b'>
              <TableHead className='font-bold px-3 py-3 text-left' style={{ width: '12rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title='Όνομα'>Όνομα</TableHead>
              <TableHead className='font-bold px-3 py-3 text-left' style={{ width: '3rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title='ΑΜ'>ΑΜ</TableHead>
              <TableHead className='font-bold px-3 py-3 text-left' style={{ width: '5rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title='ΑΦΜ'>ΑΦΜ</TableHead>
              <TableHead className='font-bold px-3 py-3 text-left' style={{ width: '12rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title='Παράρτημα'>Διεύθυνση</TableHead>
              <TableHead className='font-bold px-3 py-3 text-left' style={{ width: '12rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title='Παράρτημα'>Τομέας</TableHead>
              <TableHead className='font-bold px-3 py-3 text-left' style={{ width: '12rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title='Τμήμα'>Τμήμα</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className='divide-y divide-neutral-200 bg-white'>
            {employeeGroup?.items.map((employee: EmployeeCard) => (
              <TableRow key={employee.id} onClick={() => navigate(`/employee/${employee.id}`)} className='hover:bg-neutral-50 transition-colors cursor-pointer'>
                <TableCell className='px-3 py-3 text-left' style={{ width: '12rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={employee.name ?? ''}>
                  <div className='flex items-center gap-3'>
                    <Avatar className='w-8 h-8 shrink-0 bg-neutral-100 border border-neutral-200'>
                      <AvatarFallback className='w-8 h-8 text-5px font-semibold text-black rounded-full'>
                        {getInitials(employee?.name)}
                      </AvatarFallback>
                    </Avatar>
                    {employee.name}
                  </div>
                </TableCell>
                <TableCell className='px-3 py-3 text-left' style={{ width: '3rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={employee.sector ?? ''}>{employee.am}</TableCell>
                <TableCell className='px-3 py-3 text-left' style={{ width: '5rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={employee.afm ?? ''}>{employee.afm}</TableCell>
                <TableCell className='px-3 py-3 text-left' style={{ width: '12rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={employee.address ?? ''}>{employee.address}</TableCell>
                <TableCell className='px-3 py-3 text-left' style={{ width: '12rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={employee.sector ?? ''}>{employee.sector}</TableCell>
                <TableCell className='px-3 py-3 text-left' style={{ width: '12rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={employee.department ?? ''}>{employee.department}</TableCell>
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
                  <PaginationNext href='#' onClick={(e) => { e.preventDefault(); const total = Math.max(1, Math.ceil(rowCount / PAGE_SIZE)); if (page < total) setPage(page + 1); }} aria-disabled={page >= Math.max(1, Math.ceil(rowCount / PAGE_SIZE))} />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
        </div>
      </div>
    ) : (
      <div className='p-4 text-center text-neutral-500'>Σφάλμα κατά τη φόρτωση της λίστας υπαλλήλων.</div>
    )}
    </div>
  );
}