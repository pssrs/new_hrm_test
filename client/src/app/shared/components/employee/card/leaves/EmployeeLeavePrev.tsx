import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EmployeeLeavePrevProps {
    leaveCount: number;
}

export default function EmployeeLeavePrev({ leaveCount }: EmployeeLeavePrevProps) {
    return (
        <Card className="relative bg-white h-25.5 rounded-xl overflow-hidden">
            <div className="absolute left-0 top-0 h-full w-[6px] bg-[#FE9A00]" />

            <CardHeader className="flex flex-row items-center justify-between -mt-2.5">
                <CardTitle className="text-sm text-gray-600">
                    Προηγούμενο έτος
                </CardTitle>
            </CardHeader>

            <CardContent>
                <div className="text-3xl -mt-2.5">{leaveCount}</div>
            </CardContent>
        </Card>
    )
}
