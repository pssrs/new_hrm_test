import { useDashboard } from "@/lib/hooks/useDashBoard";
import DashBoardAllEmployeeCard from "./comonents/card/DashBoardAllEmployeeCard";
import DashBoardAvailableEmployeeCard from "./comonents/card/DashBoardAvailableEmployeeCard";
import DashBoardEmployeesOnLeave from "./comonents/card/DashBoardEmployeesOnLeave";

export function SectionCards() {
  const { employeeCount, leaveCount } = useDashboard({});

  return (
    <div className="grid grid-cols-3 px-8 -mt-13.5 w-full" style={{ gap: '1.25rem', paddingBottom: '1.25rem'}}>
      <DashBoardAllEmployeeCard employeeCount={employeeCount} />
      <DashBoardAvailableEmployeeCard employeeCount={employeeCount} leaveCount={leaveCount} />
      <DashBoardEmployeesOnLeave leaveCount={leaveCount} />
    </div>
  )
}
