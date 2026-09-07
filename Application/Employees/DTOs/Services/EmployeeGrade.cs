using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Application.Employees.DTOs.Services
{
    public class EmployeeGrade
    {
        public required int Am { get; set; }
        public string Rank { get; set; } = "";
        public string GradeFek { get; set; } = "";
        public DateOnly? RankDate { get; set; }
        public DateOnly? RankNextDate { get; set; }
    }
}