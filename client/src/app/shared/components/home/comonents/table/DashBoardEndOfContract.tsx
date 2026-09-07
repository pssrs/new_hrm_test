import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardAction, CardContent } from '@/components/ui/card'
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowRightIcon, ClockAlertIcon } from 'lucide-react'
import { useNavigate } from 'react-router';

interface DashBoardEndOfContractProps {
    employeesEndOfContract: EmployeesEndOfContract[];
    isLoadingEmployeesEndOfContract: boolean;
}

export default function DashBoardEndOfContract({ employeesEndOfContract, isLoadingEmployeesEndOfContract }: DashBoardEndOfContractProps) {

    const navigate = useNavigate();

    const getInitials = (name?: string) => {
        if (!name) return '??';
        return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    };

    const formDate = (date: string | Date | undefined | null): string => {
        if (!date) return '-';
        const d = new Date(typeof date === 'string' ? date.replace(/\//g, '-') + 'T00:00:00' : date);
        return isNaN(d.getTime()) ? '-' : `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    };

    return (
        <Card className="@container/card bg-white border border-gray-300 h-94 flex flex-col">
            <CardContent className="flex flex-row items-center justify-between gap-3 text-sm">
                <div className="flex flex-row items-center gap-6">
                    <div className="bg-gray-100 p-2 rounded-lg">
                        <ClockAlertIcon className="size-6" style={{color: 'var(--color-primary)'}} />
                    </div>
                    <span className="text-xl font-bold">Λήξη Συμβάσεων</span>
                </div>
                <ArrowRightIcon onClick={() => navigate('/changes')} className="size-6 text-gray-700 hover:text-gray-500 transition-colors duration-50 hover:cursor-pointer" />
            </CardContent>
            <CardAction className="px-6 -mt-2 flex flex-col flex-1 overflow-auto">
                <table className="border-b w-full table-fixed caption-bottom text-sm">
                    <TableHeader>
                        <TableRow className="h-11">
                            <TableHead className="w-auto">Όνομα</TableHead>
                            <TableHead className="w-24 whitespace-nowrap">Λήξη</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoadingEmployeesEndOfContract ? (
                            <TableRow className="h-11">
                                <TableCell colSpan={2} className="text-center py-4">
                                    <span className="text-gray-500">Φόρτωση...</span>
                                </TableCell>
                            </TableRow>
                        ) : employeesEndOfContract?.map((emp, idx) => (
                            <TableRow key={`endOfContract-${idx}`} className="h-14">
                                <TableCell className="w-auto overflow-hidden">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <Avatar className="w-9 h-9 shrink-0 bg-gray-100 border border-gray-200">
                                            <AvatarFallback className="w-9 h-9 text-xs font-semibold text-black rounded-full">
                                                {getInitials(emp.fullname)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="truncate" title={emp.fullname ?? ''}>{emp.fullname}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="w-24 whitespace-nowrap">{formDate(emp.date)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </table>
            </CardAction>
        </Card>
    )
}
