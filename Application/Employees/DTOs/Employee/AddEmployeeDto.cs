using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Application.Employees.DTOs.Employee
{
    public class AddEmployeeDto
    {
        public required EmployeePersonalDto Personal { get; set; }
        public required EmployeeServiceDto Service { get; set; }
        public List<ExperienceDto> Experience { get; set; } = new();
        public List<ChildDto> Children { get; set; } = new();
        public List<StudyDto> Studies { get; set; } = new();
    }
}