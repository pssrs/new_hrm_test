using System;

namespace Application.DTOs.Employee;

public class EmployeeListDto
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string Afm { get; set; }
    public required int AM { get; set; }
    public required string Address { get; set; }
    public required string Sector { get; set; }
    public required string Department { get; set; }
    public required string Office { get; set; }
    public int IsActive { get; set; }
    public int Mk { get; set; }
    public string Category { get; set; } = "";
    public required DateOnly MkDate { get; set; }
    public required DateOnly MkNextDate { get; set; }
    public string Branch { get; set; } = "";
    public string Specialty { get; set; } = "";
    public string Grade { get; set; } = "";
    public required DateOnly GrDate { get; set; }
    public required DateOnly GrNextDate { get; set; }
}
