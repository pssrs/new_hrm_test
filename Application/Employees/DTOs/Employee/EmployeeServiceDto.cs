using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Application.Employees.DTOs.Employee
{
    public class EmployeeServiceDto
    {
        public int WorkRelation { get; set; }
        public required string Category { get; set; }
        public string Specialty { get; set; } = string.Empty;
        public string Branch { get; set; } = string.Empty;
        public int Position { get; set; }
        public int EmploymentType { get; set; }
        public DateOnly? HireDate { get; set; }
        public string Fek { get; set; } = string.Empty;
        public string SalaryCode { get; set; } = "Μ01";
        public int MK { get; set; }
        public DateOnly? MKDate { get; set; }
        public DateOnly? MKNextDate { get; set; }
        public string Rank { get; set; } = "0";
        public DateOnly? RankDate { get; set; }
        public DateOnly? RankNextDate { get; set; }
        public string GradeFek { get; set; } = string.Empty;
        // "Ανήκει"
        public int Directorate { get; set; }
        public int Sector { get; set; }
        public int Department { get; set; }
        public int Office { get; set; }
        // "Δουλεύει"
        public int WorksDirectorate { get; set; }
        public int WorksSector { get; set; }
        public int WorksDepartment { get; set; }
        public int WorksOffice { get; set; }
    }
}