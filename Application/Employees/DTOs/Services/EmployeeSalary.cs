using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Application.Employees.DTOs
{
    public class EmployeeSalary
    {
        public required int Am { get; set; }
        public DateOnly? MKDate { get; set; }
        public DateOnly? MKNextDate { get; set; }
        public int MK { get; set; }
        public string SalaryCode { get; set; } = "";
    }
}