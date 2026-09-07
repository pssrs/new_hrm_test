import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardAction, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useValues } from '@/lib/hooks/useValues'
import { ArrowRightIcon, RefreshCwIcon } from 'lucide-react'
import { useNavigate } from 'react-router'

interface DashBoardChangesProps {
    employeesChanges: employeesChanges[];
    isLoadingEmployeesChanges: boolean;
}

export default function DashBoardChanges({ employeesChanges, isLoadingEmployeesChanges }: DashBoardChangesProps) {
    
    const {changeTypeMap, changeTypes} = useValues();
    
    const navigate = useNavigate();

    const getInitials = (name?: string) => {
        if (!name) return '??';
        return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    };

    const getDaysColor = (days: number) => {
        if (days > 30) return { bg: '#E5E7EB', text: '#000' };
        if (days <= 10) return { bg: '#FEE2E2', text: '#000' };
        return { bg: '#FEF9C3', text: '#000' };
    };

    function filterChangeType(changeType?: number | null){
        if (!changeType) return "";
        const change = changeTypes?.find((l) => l.id === Number(changeType));
        return change ? change.description : changeType;
    }

    function filterChangeTypeMap(changeType?: number | null, changeValue?: number | null) {
        const change = changeTypeMap?.find((l) => l.type === Number(changeType) && l.value === changeValue);
        return change ? changeType == 1 ? " Κλιμάκιο " + change.description : change.description : changeType;
    }

    return (
        <Card className="@container/card bg-white border border-gray-300 col-span-2 h-94 flex flex-col">
            <CardContent className="flex flex-row items-center justify-between gap-3 text-sm">
                <div className="flex flex-row items-center gap-6">
                    <div className="bg-gray-100 p-2 rounded-lg">
                        <RefreshCwIcon className="size-6" style={{color: 'var(--color-primary)'}} />
                    </div>
                    <span className="text-xl font-bold">Μεταβολές</span>
                </div>
                <ArrowRightIcon onClick={() => navigate('/changes')} className="size-6 text-gray-700 hover:text-gray-500 transition-colors duration-50 hover:cursor-pointer" />
            </CardContent>
            <CardAction className="px-6 -mt-2 flex flex-col flex-1 overflow-auto">
                <Table className="border-b w-full table-fixed">
                    <TableHeader>
                        <TableRow className="h-11">
                            <TableHead className="w-3/7">Όνομα</TableHead>
                            <TableHead className="w-2/7">Είδος Μεταβολής</TableHead>
                            <TableHead className="w-1/7">Επόμενη Τιμή</TableHead>
                            <TableHead className="w-1/7">Απομένουν</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoadingEmployeesChanges ? (
                            <TableRow className="h-11">
                                <TableCell colSpan={2} className="text-center py-4">
                                    <span className="text-gray-500">Φόρτωση...</span>
                                </TableCell>
                            </TableRow>
                        ) : employeesChanges?.map((emp, idx) => (
                            <TableRow key={`changes-${idx}`} className="h-14">
                                <TableCell className="flex items-center gap-3">
                                    <Avatar className="w-9 h-9 shrink-0 bg-gray-100 border border-gray-200">
                                        <AvatarFallback className="w-9 h-9 text-xs font-semibold text-black rounded-full">
                                            {getInitials(emp.fullname)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span>{emp.fullname}</span>
                                </TableCell>
                                <TableCell>{filterChangeType(Number(emp.changeType))}</TableCell>
                                <TableCell>{filterChangeTypeMap(Number(emp.changeType), Number(emp.nextValue))}</TableCell>
                                <TableCell>
                                    <Badge variant="destructive" style={{backgroundColor: getDaysColor(emp.remainingDays).bg, color: getDaysColor(emp.remainingDays).text}}>
                                        {emp.remainingDays} ημέρες
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardAction>
        </Card>
    )
}
