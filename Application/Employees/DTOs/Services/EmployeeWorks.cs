using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Application.Employees.DTOs.Services
{
    public class EmployeeWorks
    {
        public required int Am { get; set; }
        public required int WorkDirectorate { get; set; }
        public required int WorkSector { get; set; }
        public required int WorkDepartment { get; set; }
        public required int WorkOffice { get; set; }
    }
}