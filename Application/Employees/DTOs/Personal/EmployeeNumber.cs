using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Application.Employees.DTOs.Personal
{
    public class EmployeeNumber
    {
        public required int Am { get; set; }
        public required string Afm { get; set; }
        public required string Amka { get; set; }
        public required string Ama { get; set; }
        public required string PersonalNumber { get; set; }
        public required int Doy { get; set; }
    }
}