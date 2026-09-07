using System;

namespace Application.DashBoard.DTOs;

public class EmployeesChanges
{
    public required string Fullname { get; set; }
    public required string ChangeType { get; set; }
    public required string NextValue { get; set; }
    public required int RemainingDays { get; set; }
}
