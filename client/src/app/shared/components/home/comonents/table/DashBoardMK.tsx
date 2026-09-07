import { Card, CardAction, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell,TableRow } from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDashboard } from '@/lib/hooks/useDashBoard';
import { ArrowRightIcon, BringToFrontIcon } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';

export default function DashBoardMK() {

    const navigate = useNavigate();

    const [selectedCategory, setSelectedCategory] = useState('pe');
        const { employeesMK, isLoadingEmployeesMK } = useDashboard({category: selectedCategory});

    return (
        <Card className="@container/card bg-white border border-gray-300 h-94 flex flex-col">
            <CardContent className="flex flex-row items-center justify-between gap-3 text-sm">
                <div className="flex flex-row items-center gap-6">
                    <div className="bg-gray-100 p-2 rounded-lg">
                        <BringToFrontIcon className="size-6" style={{color: 'var(--color-primary)'}} />
                    </div>
                    <span className="text-xl font-bold">Μισθολογικά Κλιμάκια</span>
                </div>
                <ArrowRightIcon onClick={() => navigate('/salary')} className="size-6 text-gray-700 hover:text-gray-500 transition-colors duration-50 hover:cursor-pointer" />
            </CardContent>
            <CardAction className="px-6 flex flex-col flex-1 overflow-auto -mt-2">
                <Tabs defaultValue="pe" onValueChange={setSelectedCategory}>
                    <TabsList variant="line" className="flex-wrap h-auto justify-start rounded-none p-0 bg-transparent border-gray-300 border-b-2">
                        <TabsTrigger value="pe" className=" transition-all duration-200 rounded-none border-b-2">ΠΕ</TabsTrigger>
                        <TabsTrigger value="de" className=" transition-all duration-200 rounded-none border-b-2">ΔΕ</TabsTrigger>
                        <TabsTrigger value="te" className=" transition-all duration-200 rounded-none border-b-2">ΤΕ</TabsTrigger>
                        <TabsTrigger value="ye0" className=" transition-all duration-200 rounded-none border-b-2">ΥΕ</TabsTrigger>
                    </TabsList>
                </Tabs>
                <Table className="w-full table-fixed border-separate border-spacing-y-2 pt-3">
                    <TableBody>
                        {isLoadingEmployeesMK ? (
                            <TableRow className="h-11">
                                <TableCell colSpan={2} className="text-center py-4">
                                    <span className="text-gray-500">Φόρτωση...</span>
                                </TableCell>
                            </TableRow>
                        ) : employeesMK?.map(emp => (
                            <TableRow key={emp.mk} className="h-11">
                                <TableCell className="bg-gray-100 rounded-l-lg pl-4">{`MK ${emp.mk}`}</TableCell>
                                <TableCell className="bg-gray-100 rounded-r-lg text-left"><span className="font-bold text-xl">{emp.count}</span><span className="text-gray-600"> υπάλληλοι</span></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardAction>
        </Card>
    );
}
