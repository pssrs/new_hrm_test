using System;

namespace Application.Employees.DTOs.Personal
{
    public class EmployeeInfo
    {
        public required int Am { get; set; }
        public required string Address { get; set; }
        public required string City { get; set; }
        public required string PostCode { get; set; }
        public required string Phone { get; set; }
        public required string Email { get; set; }
    }
}