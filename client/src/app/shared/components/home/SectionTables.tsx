import { useDashboard } from "@/lib/hooks/useDashBoard";
import DashBoardCalendar from "./comonents/table/DashBoardCalendar";
import DashBoardEndOfContract from "./comonents/table/DashBoardEndOfContract";
import DashBoardChanges from "./comonents/table/DashBoardChanges";
import DashBoardMK from "./comonents/table/DashBoardMK";

export function SectionTables() {
    const { employeesChanges, isLoadingEmployeesChanges, employeesEndOfContract, isLoadingEmployeesEndOfContract, dashboardCalendar, isLoadingDashboardCalendar } = useDashboard({});

    return (
        <div className="grid grid-cols-3 px-8 w-full" style={{ gap: '1.25rem' }}>
            <DashBoardCalendar dashboardCalendar={dashboardCalendar} isLoadingDashboardCalendar={isLoadingDashboardCalendar} />
            <DashBoardEndOfContract employeesEndOfContract={employeesEndOfContract} isLoadingEmployeesEndOfContract={isLoadingEmployeesEndOfContract} />
            <DashBoardChanges employeesChanges={employeesChanges} isLoadingEmployeesChanges={isLoadingEmployeesChanges} />
            <DashBoardMK />
        </div>
    );
}