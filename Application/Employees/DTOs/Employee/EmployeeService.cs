using System;

namespace Application.DTOs.Employee;

public class EmployeeService
{
    public int Id { get; set; }
    public int Am { get; set; }

    // Dates
    public DateOnly? HireDate { get; set; }
    public DateOnly? PublicationDate { get; set; }
    public DateOnly? AppointmentDate { get; set; }
    public DateOnly? TerminationDate { get; set; }
    public DateOnly? MKDate { get; set; }
    public DateOnly? RankDate { get; set; }

    // Selects
    public int WorkRelation { get; set; }
    public int Position { get; set; }
    public int EmploymentType { get; set; }

    // Salary
    public int MK { get; set; }
    public string SalaryGrade { get; set; } = "";
    public string SalaryCode { get; set; } = "";

    // Career
    public string Category { get; set; } = "";
    public string Branch { get; set; } = "";
    public string Specialty { get; set; } = "";
    public string Rank { get; set; } = "";
    public string Fek { get; set; } = "";

    // Organization
    public int Directorate { get; set; }
    public int Sector { get; set; }
    public int Department { get; set; }
    public int Office { get; set; }
    public int WorkDirectorate { get; set; }
    public int WorkSector { get; set; }
    public int WorkDepartment { get; set; }
    public int WorkOffice { get; set; }

    public int Flag { get; set; }
}
