using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Application.Employees.DTOs.Personal
{
    public class EmployeeBank
    {
        public required int Am { get; set; }
        public required string Iban1 { get; set; }
        public required string Iban2 { get; set; }
    }
}