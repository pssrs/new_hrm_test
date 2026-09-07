import { Card, CardAction, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowRightIcon, CalendarIcon } from 'lucide-react'
import { useNavigate } from 'react-router';

interface DashBoardCalendarProps {
    dashboardCalendar: dashboardCalendar[];
    isLoadingDashboardCalendar: boolean;
}

export default function DashBoardCalendar({ dashboardCalendar, isLoadingDashboardCalendar }: DashBoardCalendarProps) {

    const navigate = useNavigate();

    const formDate = (date: string | Date | undefined | null): string => {
        if (!date) return '-';
        const d = new Date(typeof date === 'string' ? date.replace(/\//g, '-') + 'T00:00:00' : date);
        return isNaN(d.getTime()) ? '-' : `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    };

    const getDaysBadgeColor = (days: number | undefined): { borderColor: string; dotColor: string; label: string } => {
        if (!days) return { borderColor: 'border-gray-300', dotColor: 'bg-gray-300', label: '0' };
        if (days < 30) return { borderColor: 'border-red-500', dotColor: 'bg-red-500', label: `${days} ημέρες` };
        if (days < 90) return { borderColor: 'border-yellow-500', dotColor: 'bg-yellow-500', label: `${days} ημέρες` };
        return { borderColor: 'border-blue-500', dotColor: 'bg-blue-500', label: `${days} ημέρες` };
    };

    return (
        <Card className="@container/card bg-white border border-gray-300 col-span-2 h-94 flex flex-col">
            <CardContent className="flex flex-row items-center justify-between gap-4 text-sm">
                <div className="flex flex-row items-center gap-6">
                    <div className="bg-gray-100 p-2 rounded-lg">
                        <CalendarIcon className="size-6" style={{color: 'var(--color-primary)'}} />
                    </div>
                    <span className="text-xl font-bold">Ημερολόγιο</span>
                </div>
                <ArrowRightIcon onClick={() => navigate('/calendar')} className="size-6 text-gray-700 hover:text-gray-500 transition-colors duration-50 hover:cursor-pointer" />
            </CardContent>
            <CardAction className="px-6 -mt-2 flex flex-col flex-1 overflow-auto">
                <Table className="border-b w-full table-fixed">
                    <TableHeader>
                        <TableRow className="h-11">
                            <TableHead className="w-1/4">Ημερομηνία</TableHead>
                            <TableHead className="w-1/4">Συμβάν</TableHead>
                            <TableHead className="w-1/4">Όνομα</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoadingDashboardCalendar ? (
                            <TableRow className="h-11">
                                <TableCell colSpan={2} className="text-center py-4">
                                    <span className="text-gray-500">Φόρτωση...</span>
                                </TableCell>
                            </TableRow>
                        ) : dashboardCalendar?.map((emp, idx) => {
                            const { borderColor, dotColor } = getDaysBadgeColor(emp.days);
                            return (
                            <TableRow key={`dashboardCalendar-${idx}`} className="h-14">
                                <TableCell>{formDate(emp.date)}</TableCell>
                                <TableCell>{emp.event}</TableCell>
                                <TableCell>{emp.fullName}</TableCell>
                                <TableCell style={{ position: 'relative', paddingRight: '5rem', textAlign: 'right' }}>
                                    <div style={{ position: 'absolute', top: '50%', right: '5rem', transform: 'translateY(-50%)' }}>
                                        <div className={`flex items-center justify-center w-4 h-4 border ${borderColor} rounded-full bg-white`}>
                                            <div className={`w-0.5 h-0.5 rounded-full ${dotColor}`} />
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </CardAction>
        </Card>
    )
}
