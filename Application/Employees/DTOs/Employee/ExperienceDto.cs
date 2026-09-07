using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Application.Employees.DTOs.Employee
{
    public class ExperienceDto
    {
        public int Type { get; set; }
        public DateOnly? DateFrom { get; set; }
        public DateOnly? DateTo { get; set; }
        public string Years { get; set; } = string.Empty;
        public string Months { get; set; } = string.Empty;
        public string Days { get; set; } = string.Empty;
        public string Carrier { get; set; } = string.Empty;
        public string DecisionId { get; set; } = string.Empty;
        public string Comments { get; set; } = string.Empty;
        public int Agonis { get; set; }
        public int Mk { get; set; }
        public int Grade { get; set; }
        public int Sunt { get; set; }
        public DateOnly? DateCouncil { get; set; }
        public int Auto { get; set; }
    }
}