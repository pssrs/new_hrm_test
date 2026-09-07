using API.DTOs;
using Application.Core;
using Application.Employees.Commands.Leaves;
using Application.Employees.DTOs.Leaves;
using Application.Leaves.Commands;
using AutoMapper;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class LeaveController : BaseApiController
    {
        private readonly IMediator _mediator;
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public LeaveController(IMediator mediator, AppDbContext context, IMapper mapper)
        {
            _mediator = mediator;
            _context = context;
            _mapper = mapper;
        }

        [HttpPost("carryOverBalances")]
        public async Task<ActionResult<string>> CarryOverLeaveBalances()
        {
            return HandleResult(await Mediator.Send(new CarryOverLeaveBalances.Command()));
        }

        [HttpGet("monthly")]
        public async Task<ActionResult<List<LeaveMonthCountDto>>> GetMonthlyCounts([FromQuery] int year)
        {
            var grouped = await _context.Leaves
                .Where(l => l.DateFrom.HasValue && l.DateFrom.Value.Year == year )
                .GroupBy(l => l.DateFrom!.Value.Month)
                .Select(g => new { Month = g.Key, Sum = g.Sum(l => l.Duration) })
                .ToListAsync();

            var result = Enumerable.Range(1, 12)
                .Select(m => new LeaveMonthCountDto
                {
                    Month = m,
                    Count = grouped.FirstOrDefault(x => x.Month == m)?.Sum ?? 0
                })
                .ToList();

            return Ok(result);
        }

        [HttpGet("employeeLeaves/{employeeId}")]
        public async Task<ActionResult<List<Leave>>> GetEmployeeLeaves(int employeeId, int year)
        {
            var grouped = await _context.Leaves
                .Where(l => l.DateFrom.HasValue && l.State == 0 && l.Am == employeeId && l.Year == year)
                .ToListAsync();

            return Ok(grouped);
        }

        [HttpGet("leaveList/{id}")]
        public async Task<ActionResult<List<Leave>>> GetEmployeeLeaveList(int id)
        {
            var employee = await _context.Employees.FindAsync(id);

            if (employee == null)
                return NotFound();

            var leaves = await _context.Leaves
                .Where(l => l.Am == employee.Am)
                .OrderByDescending(l => l.Year).ThenByDescending(l => l.DateFrom)
                .ToListAsync();

            if (leaves == null)
                return NotFound();

            return Ok(leaves);
        }

        [HttpPost("createLeave")]
        public async Task<ActionResult<string>> CreateEmployeeLeave(Leave employeeLeave)
        {
            return HandleResult(await Mediator.Send(new CreateEmployeeLeave.Command { Leave = employeeLeave }));
        }

        [HttpPut("editLeave")]
        public async Task<ActionResult<string>> EditEmployeeLeave(Leave employeeLeave)
        {
            return HandleResult(await Mediator.Send(new EditEmployeeLeave.Command { Leave = employeeLeave }));
        }

        [HttpDelete("deleteLeave/{id}")]
        public async Task<ActionResult<string>> DeleteEmployeeLeave(int id)
        {
            return HandleResult(await Mediator.Send(new DeleteEmployeeLeave.Command { Id = id }));
        }

        [HttpGet("emplLeaveType/{id}")]
        public async Task<ActionResult<List<LeaveType>>> GetEmployeeLeaveTypeList(int id)
        {
            var employee = await _context.Employees.FindAsync(id);
            if (employee == null) return NotFound();

            var currentYear = DateTime.Now.Year;

            var flaggedTypeIds = await _context.OverallLeaves
                .Where(o => o.Am == employee.Am && o.Year == currentYear && o.Flag == 1)
                .Select(o => o.Type)
                .Distinct()
                .ToListAsync();

            var leaveTypes = await _context.LeaveTypes
                .Where(lt => flaggedTypeIds.Contains(lt.Id))
                .OrderBy(lt => lt.Description)
                .ToListAsync();

            foreach (var leave in leaveTypes)
                if(leave.Id == 20 || leave.Id == 21 || leave.Id == 22 || leave.Id == 23 || leave.Id == 24 || leave.Id == 25)
                    leave.Description += " (" + leave.Duration + ")";

            return Ok(leaveTypes);
        }


        [HttpGet("leaveNow/{id}")]
        public async Task<ActionResult<int>> GetEmployeeLeaveNow(int id)
        {
            var normalLeaveTypes = new[] { 20, 21, 22, 23, 24, 25, 30 };
            var employee = await _context.Employees.FindAsync(id);
            if (employee == null) return NotFound();

            var balance = await _context.OverallLeaves
                .Where(o => o.Am == employee.Am && o.Year == DateTime.Now.Year && normalLeaveTypes.Contains(o.Type) && o.Flag == 1)
                .Select(o => (int?)o.Duration)
                .FirstOrDefaultAsync() ?? 0;

            return Ok(balance);
        }

        [HttpGet("overallLeaves/{id}")]
        public async Task<ActionResult<List<OverallLeaves>>> GetEmployeeOverallLeaves(int id)
        {
            var employee = await _context.Employees.FindAsync(id);
            if (employee == null) return NotFound();

            var overallLeaves = await _context.OverallLeaves
                .Where(o => o.Am == employee.Am && o.Year == DateTime.Now.Year)
                .ToListAsync();

            return Ok(overallLeaves);
        }

        [HttpPut("overallLeaves/{id}")]
        public async Task<ActionResult<List<OverallLeaves>>> UpdateEmployeeOverallLeaves(int id, [FromBody] List<int> types)
        {
            var employee = await _context.Employees.FindAsync(id);
            if (employee == null) return NotFound();

            var currentYear = DateTime.Now.Year;
            var normalLeaveTypes = new[] { 20, 21, 22, 23, 24, 25, 30 };

            var existing = await _context.OverallLeaves
                .Where(o => o.Am == employee.Am && o.Year == currentYear)
                .ToListAsync();

            var oldNormalType = existing.FirstOrDefault(o => normalLeaveTypes.Contains(o.Type) && o.Flag == 1);
            var newNormalType = types.FirstOrDefault(t => normalLeaveTypes.Contains(t));
            var isNormalTypeChange = oldNormalType != null && newNormalType != 0 && oldNormalType.Type != newNormalType;

            foreach (var o in existing)
                o.Flag = types.Contains(o.Type) ? 1 : 0;

            if (isNormalTypeChange)
            {
                var newNormalExisting = existing.FirstOrDefault(o => o.Type == newNormalType);
                if (newNormalExisting != null)
                {
                    newNormalExisting.Balance = oldNormalType!.Balance;
                    newNormalExisting.ManualChangeOv = 1;
                }

                oldNormalType!.Balance = 0;
                oldNormalType.ManualChangeOv = 0;
            }

            var existingTypes = existing.Select(o => o.Type).ToHashSet();
            var toAddTypes = types.Where(t => !existingTypes.Contains(t)).ToList();

            if (toAddTypes.Count > 0)
            {
                var leaveTypesData = await _context.LeaveTypes
                    .Where(lt => toAddTypes.Contains(lt.Id))
                    .ToListAsync();

                foreach (var lt in leaveTypesData)
                {
                    var isNormalType = normalLeaveTypes.Contains(lt.Id);

                    _context.OverallLeaves.Add(new OverallLeaves
                    {
                        Am = employee.Am,
                        Type = lt.Id,
                        Duration = lt.Duration,
                        Year = currentYear,
                        Balance = isNormalType && isNormalTypeChange ? oldNormalType!.Balance : lt.Duration,
                        Flag = 1,
                        Epik = 0,
                        EpikDays = 0,
                        GrossDays = 0,
                        ManualChangeOv = isNormalType && isNormalTypeChange ? 1 : 0
                    });

                    if (isNormalType && isNormalTypeChange)
                        oldNormalType!.Balance = 0;
                }
            }

            await _context.SaveChangesAsync();

            var result = await _context.OverallLeaves
                .Where(o => o.Am == employee.Am && o.Year == currentYear)
                .ToListAsync();

            return Ok(result);
        }

        [HttpGet("leavePrev/{id}")]
        public async Task<ActionResult<int>> GetEmployeeLeavePrev(int id)
        {
            var normalLeaveTypes = new[] { 20, 21, 22, 23, 24, 25, 30 };
            var employee = await _context.Employees.FindAsync(id);
            if (employee == null) return NotFound();

            var balance = await _context.OverallLeaves
                .Where(o => o.Am == employee.Am && o.Year == DateTime.Now.Year && normalLeaveTypes.Contains(o.Type) && o.Flag == 1)
                .Select(o => (int?)o.Balance)
                .FirstOrDefaultAsync() ?? 0;

            return Ok(balance);
        }

        [HttpGet("leaveSum/{id}")]
        public async Task<ActionResult<int>> GetEmployeeLeaveSum(int id)
        {
            var normalLeaveTypes = new[] { 20, 21, 22, 23, 24, 25, 30 };
            var employee = await _context.Employees.FindAsync(id);
            if (employee == null) return NotFound();

            var balance = await _context.OverallLeaves
                .Where(o => o.Am == employee.Am && o.Year == DateTime.Now.Year && normalLeaveTypes.Contains(o.Type) && o.Flag == 1)
                .Select(o => (int?)o.Balance)
                .FirstOrDefaultAsync() ?? 0;

            var duration = await _context.OverallLeaves
                .Where(o => o.Am == employee.Am && o.Year == DateTime.Now.Year && normalLeaveTypes.Contains(o.Type) && o.Flag == 1)
                .Select(o => (int?)o.Duration)
                .FirstOrDefaultAsync() ?? 0;


            var leaves = await _context.Leaves.Where(l => l.Am == employee.Am && l.Year == DateTime.Now.Year && normalLeaveTypes.Contains(l.Type)).ToListAsync();
            

            return Ok(balance + duration - leaves.Sum(l => l.Duration));
        }

        [HttpGet("leaveSickness/{id}")]
        public async Task<ActionResult<int>> GetEmployeeLeaveSickness(int id)
        {
            var employee = await _context.Employees.FindAsync(id);

            if (employee == null) return NotFound();

            var sickLeaveTypes = new[] { 15, 97 };

            var duration = await _context.OverallLeaves
                .Where(o => o.Am == employee.Am && o.Year == DateTime.Now.Year && sickLeaveTypes.Contains(o.Type) && o.Flag == 1)
                .Select(o => (int?)o.Duration)
                .FirstOrDefaultAsync() ?? 0;

            return Ok(duration);
        }

        [HttpGet("leaveSicknessSum/{id}")]
        public async Task<ActionResult<int>> GetEmployeeLeaveSicknessSum(int id)
        {
            var employee = await _context.Employees.FindAsync(id);

            if (employee == null) return NotFound();

            var sickLeaveTypes = new[] { 15, 97 };

            var flaggedSickType = await _context.OverallLeaves
                .Where(o => o.Am == employee.Am && o.Year == DateTime.Now.Year && sickLeaveTypes.Contains(o.Type) && o.Flag == 1)
                .Select(o => (int?)o.Type)
                .FirstOrDefaultAsync();

            if (flaggedSickType == null) return Ok(0);

            var usedDays = await _context.Leaves
                .Where(l => l.Am == employee.Am && l.Year == DateTime.Now.Year && l.Type == flaggedSickType)
                .SumAsync(l => (int?)l.Duration) ?? 0;

            return Ok(usedDays);
        }

        [HttpGet("allLeaves")]
        public async Task<ActionResult> GetAllLeaves([FromQuery] int page = 1, [FromQuery] int pageSize = 8, [FromQuery] string? search = null, [FromQuery] int? flag = null, [FromQuery] int? leaveType = null, [FromQuery] int? month = null, [FromQuery] int? year = null, [FromQuery] int? tableType = null, [FromQuery] string? date = null)
        {
            if (tableType == 1)
            {
                var effectiveYear = year.HasValue && year > 0 ? year.Value : DateTime.Now.Year;
                var leaveTypeFilter = GetLeaveTypesForCategory(leaveType);
                int[] normalLeaveTypes = [20, 21, 22, 23, 24, 25, 30];

                var summaryQuery =
                    from emp in _context.Employees
                    group emp by new { emp.Am, emp.FirstName, emp.LastName, emp.Afm } into g
                    select new { g.Key.Am, g.Key.FirstName, g.Key.LastName, g.Key.Afm };

                if (flag.HasValue && flag > 0)
                    summaryQuery = summaryQuery.Where(x =>
                        _context.Employees.Any(e => e.Am == x.Am && e.IsActive == flag.Value));

                // Φίλτρα για αδειες φέτος
                if (leaveType == 6)
                {
                    // Για κανονικές άδειες, κοίταξε αν έχει κανονικά leave types
                    summaryQuery = summaryQuery.Where(x =>
                        _context.Leaves.Any(l => l.Am == x.Am && l.Year == effectiveYear && normalLeaveTypes.Contains(l.Type)));
                }
                else if (leaveTypeFilter != null && leaveTypeFilter.Length > 0)
                {
                    // Για άλλες κατηγορίες
                    summaryQuery = summaryQuery.Where(x =>
                        _context.Leaves.Any(l => l.Am == x.Am && l.Year == effectiveYear && leaveTypeFilter.Contains(l.Type)));
                }
                else
                {
                    // Αν δεν υπάρχει φίλτρο, δείξε όσους έχουν οποιαδήποτε άδεια φέτος
                    summaryQuery = summaryQuery.Where(x =>
                        _context.Leaves.Any(l => l.Am == x.Am && l.Year == effectiveYear));
                }

                if (!string.IsNullOrWhiteSpace(search))
                {
                    var t = $"%{search}%";
                    summaryQuery = summaryQuery.Where(x =>
                        EF.Functions.Like(x.LastName + " " + x.FirstName, t) ||
                        EF.Functions.Like(x.Afm, t) ||
                        EF.Functions.Like(x.Am.ToString(), t));
                }

                var totalCount = await summaryQuery.CountAsync();

                var summaryItems = await summaryQuery
                    .OrderBy(x => x.LastName).ThenBy(x => x.FirstName)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                var result = new List<LeaveListDto>();

                leaveTypeFilter = GetLeaveTypesForCategory(leaveType);

                foreach (var emp in summaryItems)
                {
                    int totalLeaves;

                    if (leaveType == 6)
                    {
                        // Για κανονικές άδειες, κοίταξε μόνο τα normal leave types
                        totalLeaves = await _context.Leaves
                            .Where(l => l.Am == emp.Am && l.Year == effectiveYear && normalLeaveTypes.Contains(l.Type))
                            .SumAsync(l => l.Duration);
                    }
                    else if (leaveTypeFilter != null && leaveTypeFilter.Length > 0)
                    {
                        totalLeaves = await _context.Leaves
                            .Where(l => l.Am == emp.Am && l.Year == effectiveYear && leaveTypeFilter.Contains(l.Type))
                            .SumAsync(l => l.Duration);
                    }
                    else
                    {
                        totalLeaves = await _context.Leaves.Where(l => l.Am == emp.Am && l.Year == effectiveYear).SumAsync(l => l.Duration);
                    }

                    if (totalLeaves == 0)
                        continue;

                    int? entitled = null;
                    int? used = null;
                    int? carriedOver = null;

                    if (leaveType == 6)
                    {
                        // Βρες ποιο normal leave type χρησιμοποίησε ο εργαζόμενος φέτος
                        var usedLeaveType = await _context.Leaves
                            .Where(l => l.Am == emp.Am && l.Year == effectiveYear && normalLeaveTypes.Contains(l.Type))
                            .Select(l => l.Type)
                            .FirstOrDefaultAsync();

                        if (usedLeaveType > 0)
                        {
                            // Πάρε τα δεδομένα από OverallLeaves (flag = 1 και οποιοδήποτε normal leave type)
                            var overallNormal = await _context.OverallLeaves
                                .FirstOrDefaultAsync(ol => ol.Am == emp.Am && ol.Year == effectiveYear && normalLeaveTypes.Contains(ol.Type) && ol.Flag == 1);

                            // Πάρε το Duration από LeaveTypes
                            var leaveTypeData = await _context.LeaveTypes
                                .FirstOrDefaultAsync(lt => lt.Id == usedLeaveType);

                            if (leaveTypeData != null)
                            {
                                int entitledDays = leaveTypeData.Duration;
                                int usedDays = totalLeaves;
                                int remainingDays = overallNormal?.Balance ?? 0;

                                entitled = entitledDays;
                                used = usedDays;
                                carriedOver = remainingDays;
                            }
                            else
                            {
                                // Αν δεν υπάρχει LeaveType, βάλε defaults
                                entitled = 0;
                                used = totalLeaves;
                                carriedOver = 0;
                            }
                        }
                        else
                        {
                            // Αν δεν υπάρχει κανονικό leave type, βάλε defaults
                            entitled = 0;
                            used = totalLeaves;
                            carriedOver = 0;
                        }
                    }

                    result.Add(new LeaveListDto
                    {
                        Am = emp.Am,
                        EmployeeName = emp.LastName + " " + emp.FirstName,
                        Afm = emp.Afm,
                        TotalLeaves = totalLeaves,
                        Entitled = entitled,
                        Used = used,
                        CarriedOver = carriedOver,
                    });
                }

                result = result.OrderBy(x => x.EmployeeName).ToList();
                return Ok(new PagedList<LeaveListDto>(result, totalCount));
            }
            else
            {
                var query =
                    from l in _context.Leaves
                    join emp in _context.Employees on l.Am equals emp.Am
                    select new { l, emp };

                if (flag.HasValue && flag > 0)
                    query = query.Where(x => x.emp.IsActive == flag.Value);

                if (tableType.HasValue)
                {
                    if (tableType == 0)
                    {
                        if (!string.IsNullOrWhiteSpace(date))
                        {
                            if (DateOnly.TryParse(date, out var selectedDate))
                            {
                                query = query.Where(x => x.l.DateFrom.HasValue && x.l.DateTo.HasValue &&
                                                         x.l.DateFrom <= selectedDate && selectedDate <= x.l.DateTo);
                            }
                        }
                        if (leaveType.HasValue && leaveType > 0)
                            query = query.Where(x => x.l.Type == leaveType.Value);
                    }
                    else if (tableType == 2)
                    {
                        var sickLeaveTypes = new[] { 15, 16, 41, 49, 52, 76, 97 };
                        query = query.Where(x => sickLeaveTypes.Contains(x.l.Type));
                    }
                    // tableType == 3 ("Μηνιαίες άδειες"): no type restriction, return every leave for the period.
                }
                else if (leaveType.HasValue && leaveType > 0)
                    query = query.Where(x => x.l.Type == leaveType.Value);

                if (year.HasValue && year > 0)
                    query = query.Where(x => x.l.Year == year.Value);

                if (month.HasValue && month > 0)
                    query = query.Where(x => x.l.DateFrom.HasValue && x.l.DateFrom.Value.Month == month.Value);

                if (!string.IsNullOrWhiteSpace(search))
                {
                    var t = $"%{search}%";
                    query = query.Where(x =>
                        EF.Functions.Like(x.emp.LastName + " " + x.emp.FirstName, t) ||
                        EF.Functions.Like(x.emp.Afm, t) ||
                        EF.Functions.Like(x.l.Am.ToString(), t));
                }

                var totalCount = await query.CountAsync();

                var items = await query
                    .OrderBy(x => x.emp.LastName).ThenBy(x => x.emp.FirstName)
                    .ThenByDescending(x => x.l.Year).ThenByDescending(x => x.l.DateFrom)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(x => new LeaveListDto
                    {
                        Id = x.l.Id,
                        Am = x.l.Am,
                        Afm = x.emp.Afm,
                        EmployeeName = x.emp.LastName + " " + x.emp.FirstName,
                        Type = x.l.Type,
                        Duration = x.l.Duration,
                        DateFrom = x.l.DateFrom,
                        DateTo = x.l.DateTo,
                    })
                    .ToListAsync();

                return Ok(new PagedList<LeaveListDto>(items, totalCount));
            }
        }

        private int[]? GetLeaveTypesForCategory(int? categoryId)
        {
            return categoryId switch
            {
                1 => new[] { 8 }, // Αιμοδοτική
                2 => new[] { 15, 16, 41, 49, 52, 76, 97 }, // Αναρρωτική
                3 => new[] { 18, 47 }, // Άνευ αποδοχών
                4 => new[] { 46 }, // Ασθένιας τέκνων
                5 => new[] { 43 }, // Γονική 4808-21
                6 => new[] { 20, 21, 22, 23, 24, 25, 30 }, // Κανονική
                7 => new[] { 98 }, // Σχολικής επίδοσης
                8 => new[] { 80 }, // Υπεύθυνη δήλωση
                _ => null
            };
        }
    }
}
