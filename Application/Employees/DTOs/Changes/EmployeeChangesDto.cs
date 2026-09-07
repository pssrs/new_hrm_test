using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Application.Employees.DTOs.Changes
{
    public class EmployeeChangesDto
    {
        public required string FullName { get; set; }
        public required string Afm { get; set; }
        public required string Type { get; set; }
        public required string PrevValue { get; set; }
        public required string NextValue { get; set; }
        public required DateOnly ChangeDate { get; set; }
        public required DateOnly NextChangeDate { get; set; }
        public required string Notes { get; set; }
        public required int WorkRelation { get; set; }
        public int Flag { get; set; } = 0;
        public int FlagHRM { get; set; } = 0;
        public int? ChangeId { get; set; }
    }
}