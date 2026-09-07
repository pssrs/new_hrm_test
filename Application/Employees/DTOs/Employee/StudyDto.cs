using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Application.Employees.DTOs.Employee
{
    public class StudyDto
    {
        public int Type { get; set; }
        public string Description { get; set; } = string.Empty;
        public int Education { get; set; }
        public int Local { get; set; }
        public int Category { get; set; }
        public string Years { get; set; } = string.Empty;
        public DateOnly? Date { get; set; }
        public string Degree { get; set; } = string.Empty;
        public int Employee { get; set; }
        public int Relevance { get; set; }
        public string Comment { get; set; } = string.Empty;
        public DateOnly? DateRequired { get; set; }
        public string Location { get; set; } = string.Empty;
    }
}