import { Card, CardContent } from "@/components/ui/card";
import { UsersIcon } from "lucide-react";

interface DashBoardAllEmployeeCardProps {
    employeeCount: number;
}

export default function DashBoardAllEmployeeCard({ employeeCount }: DashBoardAllEmployeeCardProps) {
    return (
        <Card className="@container/card h-22 bg-white border border-gray-300">
            <CardContent className="flex flex-row items-center justify-between gap-4 text-sm">
            <div className="flex flex-row items-center gap-3">
                <div className="bg-gray-100 p-2 rounded-lg">
                    <UsersIcon className="size-6" style={{color: 'var(--color-primary)'}}/>
                </div>
                <span className="text-sm font-medium text-gray-500">Σύνολο</span>
            </div>
            <p className="text-3xl font-bold">{employeeCount}</p>
            </CardContent>
        </Card>
    );
}