using System;

namespace Application.DTOs.Employee;

public class EmployeeListDto
{
    public int Id { get; set; }
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public required string AFM { get; set; }
}
