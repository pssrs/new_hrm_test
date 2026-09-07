using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Application.Employees.DTOs.Services
{
    public class EmployeeBelongs
    {
        public required int Am { get; set; }
        public required int Directorate { get; set; }
        public required int Sector { get; set; }
        public required int Department { get; set; }
        public required int Office { get; set; }
    }
}