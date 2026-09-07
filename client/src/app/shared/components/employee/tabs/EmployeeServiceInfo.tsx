import React, { useEffect } from "react";
import { useEmployee } from "../../../../../lib/hooks/useEmployee";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { belongsSchema, worksSchema, type BelongsSchema, type WorksSchema } from "@/lib/schemas/employeeServiceSchema";
import EmployeePosition from "../card/service/EmployeePosition";
import EmployeePositionInfo from "../card/service/EmployeePositionInfo";
import EmployeeSalary from "../card/service/EmployeeSalary";
import EmployeeGrade from "../card/service/EmployeeGrade";
import EmployeeBelongs from "../card/service/EmployeeBelongs";
import EmployeeWorks from "../card/service/EmployeeWorks";


interface EmployeeServiceInfoProps {
  id: string
}

export default function EmployeeServiceInfo({ id }: EmployeeServiceInfoProps) {
    const { employeeService } = useEmployee({ id });
    const belongsForm = useForm<BelongsSchema>({mode: 'onChange', reValidateMode: 'onChange',resolver: zodResolver(belongsSchema),defaultValues: { directorate: 0, sector: 0, department: 0, office: 0 }, });
    const worksForm = useForm<WorksSchema>({mode: 'onChange', reValidateMode: 'onChange',resolver: zodResolver(worksSchema),defaultValues: { workDirectorate: 0, workSector: 0, workDepartment: 0, workOffice: 0 }, });

    const watchOrgDirectorate = useWatch({ control: belongsForm.control, name: 'directorate' });
    const watchOrgSector = useWatch({ control: belongsForm.control, name: 'sector' });
    const watchOrgDepartment = useWatch({ control: belongsForm.control, name: 'department' });
    const watchWorkDirectorate = useWatch({ control: worksForm.control, name: 'workDirectorate' });
    const watchWorkSector = useWatch({ control: worksForm.control, name: 'workSector' });
    const watchWorkDepartment = useWatch({ control: worksForm.control, name: 'workDepartment' });

    const orgCascadeReady = React.useRef(false);
    const workCascadeReady = React.useRef(false);

    useEffect(() => {
      if (!orgCascadeReady.current) return;
      belongsForm.setValue('sector', 0);
      belongsForm.setValue('department', 0);
      belongsForm.setValue('office', 0);
    }, [watchOrgDirectorate, belongsForm]);

    useEffect(() => {
      if (!orgCascadeReady.current) return;
      belongsForm.setValue('department', 0);
      belongsForm.setValue('office', 0);
    }, [watchOrgSector, belongsForm]);

    useEffect(() => {
      if (!orgCascadeReady.current) return;
      belongsForm.setValue('office', 0);
    }, [watchOrgDepartment, belongsForm]);

    useEffect(() => {
      if (!workCascadeReady.current) return;
      worksForm.setValue('workSector', 0);
      worksForm.setValue('workDepartment', 0);
      worksForm.setValue('workOffice', 0);
    }, [watchWorkDirectorate, worksForm]);

    useEffect(() => {
      if (!workCascadeReady.current) return;
      worksForm.setValue('workDepartment', 0);
      worksForm.setValue('workOffice', 0);
    }, [watchWorkSector, worksForm]);

    useEffect(() => {
      if (!workCascadeReady.current) return;
      worksForm.setValue('workOffice', 0);
    }, [watchWorkDepartment, worksForm]);

    return (
       <>
        <div className="mt-5 w-full grid grid-cols-1 md:grid-cols-2 gap-4.5">
          <EmployeePosition employeeService={employeeService} />
          <EmployeePositionInfo employeeService={employeeService} />
          <EmployeeSalary employeeService={employeeService} />
          <EmployeeGrade employeeService={employeeService} />
          <EmployeeBelongs employeeService={employeeService} />
          <EmployeeWorks employeeService={employeeService} />
        </div>
      </>
  );
}
