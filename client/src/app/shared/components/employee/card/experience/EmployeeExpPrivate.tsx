import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

interface EmployeeExpPrivateProps {
    experienceList?: Experience[];
}

export default function EmployeeExpPrivate({ experienceList = [] }: EmployeeExpPrivateProps) {
    // Helper functions για singular/plural
    const getYearLabel = (years: number) => years === 1 ? 'χρόνος' : 'έτη';
    const getMonthLabel = (months: number) => months === 1 ? 'μήνας' : 'μήνες';
    const getDayLabel = (days: number) => days === 1 ? 'μέρα' : 'μέρες';

    // Υπολογισμός διαφοράς ημερομηνιών
    const calculateDateDifference = (dateFrom: Date | string, dateTo: Date | string) => {
        const from = new Date(dateFrom);
        let to = new Date(dateTo);
        
        // Αν η dateTo είναι 1/1/1900, σημαίνει τρέχουσα θέση - χρησιμοποιούμε σήμερα
        if (to.getFullYear() === 1900 && to.getMonth() === 0 && to.getDate() === 1) {
            to = new Date();
        }
        
        let years = to.getFullYear() - from.getFullYear();
        let months = to.getMonth() - from.getMonth();
        let days = to.getDate() - from.getDate();

        // Αν οι ημέρες είναι αρνητικές, αφαιρούμε 1 από τους μήνες
        if (days < 0) {
            months--;
            // Προσθέτουμε τις ημέρες του προηγούμενου μήνα
            const prevMonth = new Date(to.getFullYear(), to.getMonth(), 0);
            days += prevMonth.getDate();
        }

        // Αν οι μήνες είναι αρνητικοί, αφαιρούμε 1 από τα χρόνια
        if (months < 0) {
            years--;
            months += 12;
        }

        return { years, months, days };
    };

    const calculatePrivateTotal = () => {
        if (!experienceList || experienceList.length === 0) {
            return { years: 0, months: 0, days: 0 };
        }

        let totalYears = 0, totalMonths = 0, totalDays = 0;

        experienceList.forEach(exp => {
            if (exp.type === 3) {
                if (exp.dateFrom && exp.dateTo) {
                    const { years, months, days } = calculateDateDifference(exp.dateFrom, exp.dateTo);
                    totalYears += years;
                    totalMonths += months;
                    totalDays += days;
                } else {
                    totalYears += Number(exp.years) || 0;
                    totalMonths += Number(exp.months) || 0;
                    totalDays += Number(exp.days) || 0;
                }
            }
        });

        // Κανονικοποίηση
        if (totalDays >= 30) {
            totalMonths += Math.floor(totalDays / 30);
            totalDays = totalDays % 30;
        }
        if (totalMonths >= 12) {
            totalYears += Math.floor(totalMonths / 12);
            totalMonths = totalMonths % 12;
        }

        return { years: totalYears, months: totalMonths, days: totalDays };
    };

    const { years, months, days } = calculatePrivateTotal();
    return (
        <Card className="bg-white h-27.5 font-definitions font-family-body font-weight-400">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm flex items-center text-gray-600 -mt-2">
                    Ιδιωτικός τομέας
                </CardTitle>
            </CardHeader>
            <CardContent className="-mt-4 flex items-center justify-center h-full">
                <Table className="border-collapse w-full">
                    <TableBody>
                        <TableRow className="border-none text-center">
                            <TableCell className="border-r border-gray-300 p-0 w-1/3">
                                <div className="flex flex-col items-center">
                                    <div className="text-3xl font-normal">{years}</div>
                                    <div className="text-xs font-normal" style={{ color: '#737373' }}>{getYearLabel(years)}</div>
                                </div>
                            </TableCell>
                            <TableCell className="border-r border-gray-300 p-0 w-1/3">
                                <div className="flex flex-col items-center">
                                    <div className="text-3xl font-normal">{months}</div>
                                    <div className="text-xs font-normal" style={{ color: '#737373' }}>{getMonthLabel(months)}</div>
                                </div>
                            </TableCell>
                            <TableCell className="p-0 w-1/3">
                                <div className="flex flex-col items-center">
                                    <div className="text-3xl font-normal">{days}</div>
                                    <div className="text-xs font-normal" style={{ color: '#737373' }}>{getDayLabel(days)}</div>
                                </div>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
