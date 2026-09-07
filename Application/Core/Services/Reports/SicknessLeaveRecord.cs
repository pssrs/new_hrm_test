using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Application.Core.Services.Reports
{
    public record SicknessLeaveRecord(
        DateOnly? StartDate,
        DateOnly? EndDate,
        int Days,
        string? Notes
    );
}