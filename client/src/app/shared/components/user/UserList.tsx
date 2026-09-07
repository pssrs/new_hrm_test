import * as React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAccount } from '@/lib/hooks/useAccount';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { SearchIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import UserForm from './UserForm';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toastHelpers';

const PAGE_SIZE = 8;
const REFERENCE_WIDTH = 1600;
const MIN_SCALE = 0.6;

export default function UserList() {
    const [scale, setScale] = React.useState(1);

    React.useEffect(() => {
        const updateScale = () => {
            const raw = Math.min(1, Math.max(MIN_SCALE, window.innerWidth / REFERENCE_WIDTH));
            const stepped = Math.round(raw * 20) / 20;
            setScale(stepped);
        };
        updateScale();
        window.addEventListener('resize', updateScale);
        return () => window.removeEventListener('resize', updateScale);
    }, []);

    const [page, setPage] = React.useState(1);
    const [search, setSearch] = React.useState('');
    const [drawerOpen, setDrawerOpen] = React.useState(false);
    const [selectedUser, setSelectedUser] = React.useState<UserList | null>(null);
    const { usersList, usersLoading, deleteUser } = useAccount();

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setPage(1);
    };

    const handleOpenCreateDrawer = () => {
        setSelectedUser(null);
        setDrawerOpen(true);
    };

    const handleOpenEditDrawer = (user: UserList) => {
        setSelectedUser(user);
        setDrawerOpen(true);
    };

    const handleDelete = async (user: UserList, e: React.MouseEvent) => {
        e.stopPropagation();

        const confirmDelete = window.confirm(`Είστε σίγουροι ότι θέλετε να διαγράψετε τον χρήστη "${user.fullName}";`);
        if (!confirmDelete) return;

        try {
            const userId = typeof user.id === 'string' ? parseInt(user.id) : user.id;
            await deleteUser(userId);
            showSuccessToast("Ο χρήστης διαγράφηκε με επιτυχία");
        } catch (error) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const msg = (error as any)?.response?.data || (error as any)?.message || "Άγνωστο σφάλμα";
            showErrorToast("Σφάλμα κατά τη διαγραφή του χρήστη: " + msg);
            console.error(error);
        }
    };

    const filteredUsers = React.useMemo(() => {
        if (!usersList || !Array.isArray(usersList)) return [];
        return usersList.filter(user =>
        user.fullName.toLowerCase().includes(search.toLowerCase()) ||
        user.userName.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
        );
    }, [usersList, search]);

    const paginatedUsers = React.useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return filteredUsers.slice(start, start + PAGE_SIZE);
    }, [filteredUsers, page]);

    const rowCount = filteredUsers.length;
    const pageTitle = 'Χρήστες';
    const maxUsers = 15;
    const isLimitReached = usersList.length >= maxUsers;
    const remainingSlots = maxUsers - usersList.length;

    const getInitials = (name?: string) => {
        if (!name) return '??';
        return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    };

    return (
        <div title={pageTitle} style={{ zoom: scale }} className='p-8'>
        <div className='flex items-center justify-between -mt-8'>
            <div>
                <h2 className='text-xl font-semibold text-neutral-900'>Χρήστες</h2>
                <p className='text-sm text-gray-500 mt-1'>
                    {usersList.length}/{maxUsers} χρήστες
                    {isLimitReached ? (
                        <span className='text-red-500 font-semibold'> (Όριο επιτευχθείν)</span>
                    ) : (
                        <span className='text-blue-500'> ({remainingSlots} διαθέσιμα)</span>
                    )}
                </p>
            </div>
            <Button
                variant="default"
                type="submit"
                onClick={handleOpenCreateDrawer}
                disabled={isLimitReached}
                className="transition-all duration-200 hover:opacity-80 w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                    display: 'flex',
                    height: 'var(--Height-H-10, 40px)',
                    padding: 'var(--Padding-Y-py-2, 8px) var(--Padding-X-px-4, 16px)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    alignSelf: 'stretch',
                    borderRadius: 'var(--Radius-Rounded-Medium, 6px)',
                    background: isLimitReached ? '#ccc' : 'var(--color-primary)',
                    color: 'var(--color-primary-foreground)',
                }}
                title={isLimitReached ? 'Έχετε φτάσει το όριο των 15 χρηστών' : ''}
            >
                <PlusIcon fontSize='small' />Δημιουργία Χρήστη
            </Button>
        </div>
        <Separator className="my-4 bg-neutral-200" />
        <div className='flex items-center mt-10'>
            <div className='relative w-80'>
            <input
                className='file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex w-80 min-w-0 rounded-md px-3 py-1 text-base transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 pl-10 bg-white border border-neutral-200 shadow-sm h-10'
                value={search}
                placeholder='Αναζήτηση με όνομα, username ή email'
                onChange={handleSearchChange}
            />
            <SearchIcon className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none' />
            </div>
        </div>

        {usersLoading && !usersList.length ? (
            <div className='p-4 text-center text-neutral-500'>Φόρτωση λίστας χρηστών...</div>
        ) : usersList.length > 0 ? (
            <div data-slot='card' className='bg-card text-card-foreground flex flex-col mt-6 overflow-hidden'>
                <Table className='w-full bg-white border-b-neutral-200 table-fixed' style={{ tableLayout: 'fixed' }}>
                    <TableHeader className='bg-white border-b'>
                    <TableRow className='bg-white border-b'>
                        <TableHead className='font-bold px-3 py-3 text-left' style={{ width: '14rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title='Όνομα'>Όνομα</TableHead>
                        <TableHead className='font-bold px-3 py-3 text-left' style={{ width: '10rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title='Username'>Username</TableHead>
                        <TableHead className='font-bold px-3 py-3 text-left' style={{ width: '14rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title='Email'>Email</TableHead>
                        <TableHead className='font-bold px-3 py-3 text-left' style={{ width: '5rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title='ΑΜ'>ΑΜ</TableHead>
                        <TableHead className='font-bold px-3 py-3 text-center' style={{ width: '3rem' }} title='Ενέργειες'></TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody className='divide-y divide-neutral-200 bg-white'>
                    {paginatedUsers.map((user: UserList) => (
                        <TableRow key={user.id} onClick={() => handleOpenEditDrawer(user)} className='hover:bg-neutral-50 transition-colors cursor-pointer'>
                        <TableCell className='px-3 py-3 text-left' style={{ width: '14rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={user.fullName ?? ''}>
                            <div className='flex items-center gap-3'>
                            <Avatar className='w-8 h-8 shrink-0 bg-neutral-100 border border-neutral-200'>
                                <AvatarFallback className='w-8 h-8 text-5px font-semibold text-black rounded-full'>
                                {getInitials(user.fullName)}
                                </AvatarFallback>
                            </Avatar>
                            {user.fullName}
                            </div>
                        </TableCell>
                        <TableCell className='px-3 py-3 text-left' style={{ width: '10rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={user.userName ?? ''}>{user.userName}</TableCell>
                        <TableCell className='px-3 py-3 text-left' style={{ width: '14rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={user.email ?? ''}>{user.email}</TableCell>
                        <TableCell className='px-3 py-3 text-left' style={{ width: '5rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={user.am?.toString() ?? ''}>{user.am ?? '-'}</TableCell>
                        <TableCell className='px-3 py-3 text-center' style={{ width: '3rem' }}>
                            <button
                                onClick={(e) => handleDelete(user, e)}
                                className="hover:text-red-500 transition-colors cursor-pointer"
                                title="Διαγραφή"
                                type="button"
                            >
                                <Trash2Icon size={18} />
                            </button>
                        </TableCell>
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
            <div className='p-4 text-center text-neutral-500'>Δεν υπάρχουν χρήστες.</div>
        )}

        <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
            <SheetContent className='bg-white'>
            <SheetHeader>
                <SheetTitle>{selectedUser ? 'Επεξεργασία Χρήστη' : 'Δημιουργία Χρήστη'}</SheetTitle>
            </SheetHeader>
            <UserForm user={selectedUser} onClose={() => setDrawerOpen(false)} />
            </SheetContent>
        </Sheet>
        </div>
    );
}
