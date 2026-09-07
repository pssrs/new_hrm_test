import { useEmployee } from "../../../../../lib/hooks/useEmployee";
import EmployeeBank from "../card/personal/EmployeeBank";
import EmployeeNumbers from "../card/personal/EmployeeNumbers";
import EmployeeIdentity from "../card/personal/EmployeeIdentity";
import EmployeeInfo from "../card/personal/EmployeeInfo";
import EmployeePersonal from "../card/personal/EmployeePersonal";

interface EmployeePersonalInfoProps {
    employeeId?: number;
}

export default function EmployeePersonalInfo({ employeeId }: EmployeePersonalInfoProps) {
    const { employee } = useEmployee({ id: employeeId?.toString() });
    return (
        <div className="mt-5 w-full grid grid-cols-1 md:grid-cols-2 gap-4.5">
            <EmployeePersonal employee={employee}/>
            <EmployeeInfo employee={employee} />
            <EmployeeIdentity employee={employee} />
            <EmployeeNumbers employee={employee} />
            <EmployeeBank employee={employee} />
        </div>
    );
}
