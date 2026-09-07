using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Application.Employees.DTOs.Services
{
    public class EmployeePosition
    {
        public required int Am { get; set; }
        public required int WorkRelation { get; set; }
        public required string Category { get; set; }
        public required string Branch { get; set; }
        public required string Specialty { get; set; }
    }
}