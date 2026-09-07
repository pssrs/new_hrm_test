using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Application.Employees.DTOs.Services
{
    public class EmployeePositionInfo
    {
        public required int Am { get; set; }

        public string Fek { get; set; } = "";
        public DateOnly? HireDate { get; set; }
        public int Position { get; set; }
        public int EmploymentType { get; set; }
    }
}