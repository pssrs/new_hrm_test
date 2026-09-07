using System;

namespace Application.Employees.DTOs.Personal;

public class EmployeePersonal
{
    public required int Am { get; set; }
    public required DateOnly BirthDate { get; set; }
    public required int FamilyStatus { get; set; }
    public required string FatherName { get; set; }
    public required string MotherName { get; set; }
}
