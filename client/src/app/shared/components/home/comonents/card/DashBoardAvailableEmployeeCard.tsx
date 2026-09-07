import { Card, CardContent } from "@/components/ui/card";
import { UserRoundCheckIcon } from "lucide-react";

interface DashBoardAvailableEmployeeCard {
    employeeCount: number;
    leaveCount: number | undefined;
}

export default function DashBoardAvailableEmployeeCard({ employeeCount, leaveCount }: DashBoardAvailableEmployeeCard) {
    return (
        <Card className="@container/card h-22 bg-white border border-gray-300">
            <CardContent className="flex flex-row items-center justify-between gap-3 text-sm">
                <div className="flex flex-row items-center gap-4">
                    <div className="bg-gray-100 p-2 rounded-lg">
                        <UserRoundCheckIcon className="size-6" style={{color: 'var(--color-primary)'}}/>
                    </div>
                    <span className="text-sm font-medium text-gray-500">Παρόντες</span>
                </div>
                <p className="text-3xl font-bold">{leaveCount != null ? employeeCount - leaveCount : employeeCount}</p>
            </CardContent>
        </Card>
    )
}
