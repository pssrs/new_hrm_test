using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Application.Employees.DTOs.Employee
{
    public class ChildDto
    {
        public string ChildSurname { get; set; } = string.Empty;
        public string ChildName { get; set; } = string.Empty;
        public string ChildFather { get; set; } = string.Empty;
        public int ChildSex { get; set; }
        public DateOnly? ChildBirth { get; set; }
        public DateOnly? ChildDateFrom { get; set; }
        public DateOnly? ChildDateTo { get; set; }
        public int ChildDisability { get; set; }
        public int ChildLevel { get; set; }
        public int ChildSchool { get; set; }
        public string ChildYears { get; set; } = string.Empty;
        public string ChildMonths { get; set; } = string.Empty;
        public int ChildFlag { get; set; }
        public int Child18 { get; set; }
        public string ChildSchoolDesc { get; set; } = string.Empty;
    }
}