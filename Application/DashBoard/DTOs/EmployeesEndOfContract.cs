using System;

namespace Application.DashBoard.DTOs;

public class EmployeesEndOfContract
{
    public required string Fullname { get; set; }
    public required DateOnly Date { get; set; }
}
