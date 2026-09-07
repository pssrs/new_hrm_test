using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Application.Employees.DTOs.Personal
{
    public class EmployeeIdentity
    {
        public required int Am { get; set; }
        public required string Citizenship { get; set; }
        public required string Nationality { get; set; }
        public required string IdentityCardNumber { get; set; }
        public required string IdentityCardIssueDate { get; set; }
    }
}