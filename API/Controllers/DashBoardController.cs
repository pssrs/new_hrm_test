using Application.DashBoard.DTOs;
using AutoMapper;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    [AllowAnonymous]
    [Route("api/[controller]")]
    [ApiController]
    public class DashBoardController : BaseApiController
    {
        private readonly IMediator _mediator;
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public DashBoardController(IMediator mediator, AppDbContext context, IMapper mapper)
        {
            _mediator = mediator;
            _context = context;
            _mapper = mapper;
        }

        [HttpGet("employeesMK")]
        public async Task<ActionResult<List<EmployeesMK>>> GetEmployeesMK([FromQuery] string category = "pe")
        {
            var employees = await _context.Employees
                .Where(e => e.IsActive == 1 && e.Category == category)
                .GroupBy(e => e.MK)
                .Select(g => new EmployeesMK
                {
                    MK = g.Key,
                    Count = g.Count()                
                })
                .OrderBy(x => x.MK)
                .ToListAsync();

            if (!employees.Any())
                return NotFound("No employees found.");

            return Ok(employees);
        }

        [HttpGet("employeesChanges")]
        public async Task<ActionResult<List<EmployeesChanges>>> GetEmployeesChanges()
        {
            var today = DateOnly.FromDateTime(DateTime.Now);
            var changes = await _context.Changes
                .Where(c => c.NextDate >= today && c.Flag == 0 && c.FlagHRM == 0)
                .Join(
                    _context.Employees,
                    c => c.AM,
                    e => e.Am,
                    (c, e) => new { Change = c, Employee = e }
                )
                .Where(x => x.Employee.IsActive == 1)
                .OrderBy(x => x.Change.NextDate)
                .Take(4)
                .Select(x => new 
                {
                    x.Employee.FirstName,
                    x.Employee.LastName,
                    x.Change.Type,
                    x.Change.NextState,
                    x.Change.NextDate
                })
                .ToListAsync();

            var result = changes.Select(x => new EmployeesChanges
            {
                Fullname = $"{x.FirstName} {x.LastName}",
                ChangeType = x.Type.ToString(),
                NextValue = x.NextState.ToString(),
                RemainingDays = (int)(x.NextDate.ToDateTime(TimeOnly.MinValue) - DateTime.Now).TotalDays
            }).ToList();

            if (!result.Any()) return NotFound("No changes found.");

            return Ok(result);
        }

        [HttpGet("employeesEndOfContract")]
        public async Task<ActionResult<List<EmployeesEndOfContract>>> GetEmployeesEndOfContract()
        {
            var today = DateOnly.FromDateTime(DateTime.Now);
            var changes = await _context.Changes
                .Where(c => c.NextDate >= today && c.Type == 7)
                .Join(
                    _context.Employees,
                    c => c.AM,
                    e => e.Am,
                    (c, e) => new { Change = c, Employee = e }
                )
                .OrderBy(x => x.Change.NextDate)
                .Take(4)
                .Select(x => new
                {
                    x.Employee.FirstName,
                    x.Employee.LastName,
                    x.Change.NextDate
                })
                .ToListAsync();

            var result = changes.Select(x => new EmployeesEndOfContract
            {
                Fullname = $"{x.FirstName} {x.LastName}",
                Date = x.NextDate
            }).ToList();

            if (!result.Any())
                return NotFound("No employees found.");

            return Ok(result);
        }

        [HttpGet("countEmp")]
        public async Task<ActionResult<EmployeeCount>> GetEmployeeCount()
        {
            var cur = DateTime.Now;
            var prev = cur.AddMonths(-1);
            var count = await _context.Employees.Where(x => x.IsActive == 1).CountAsync();
            if (count == 0)
                return NotFound("No employees found 1.");

            return Ok(new EmployeeCount { TotalCount = count, MonthlyCount = count});
        }

        [HttpPost("setEmployeeCountMonthly")]
        public async Task<ActionResult<string>> SetEmployeeCountMonthly()
        {
            Console.WriteLine("Setting employee count monthly...");
            var cur = DateTime.Now;
            var count = await _context.Employees.Where(e => e.IsActive == 1).CountAsync();

            var existingRecord = await _context.EmployeeCountMonthly.FirstOrDefaultAsync(x => x.Year == cur.Year && x.Month == cur.Month);
            if (existingRecord != null)
            {
                existingRecord.Count = count;
                _context.EmployeeCountMonthly.Update(existingRecord);
            }
            else
            {
                var newRecord = new EmployeeCountMonthly
                {
                    Year = cur.Year,
                    Month = cur.Month,
                    Count = count
                };
                _context.EmployeeCountMonthly.Add(newRecord);
            }

            var result = await _context.SaveChangesAsync() > 0;

            if (!result) return NotFound("Failed to update employee count.");

            return Ok("Employee count updated successfully.");
        }

        [HttpGet("leaveCountPerDay")]
        public async Task<ActionResult<int>> CountLeavePerDay()
        {
            var today = DateOnly.FromDateTime(DateTime.Now);
            var count = await _context.Leaves
                .Where(l => l.DateFrom.HasValue && l.DateTo.HasValue 
                    && l.DateFrom.Value <= today 
                    && l.DateTo.Value >= today 
                    && l.State == 0)
                .CountAsync();

            return Ok(count);
        }

        [HttpGet("dashboardCalendar")]
        public async Task<ActionResult<List<DashBoardCalendar>>> DashboardCalendar()
        {
            var today = DateOnly.FromDateTime(DateTime.Now);
            var children = await _context.Children.ToListAsync();
            var calendars = new List<DashBoardCalendar>();
            // 1. Παιδιά που γίνονται 18 ετών
            var eighteenthBirthdayChildren = children
                .Select(child =>
                {
                    var birthDate = child.ChildBirth;
                    var eighteenthBirthday = birthDate.AddYears(18);

                    return new
                    {
                        Child = child,
                        EventDate = eighteenthBirthday,
                        EventDateTime = eighteenthBirthday.ToDateTime(TimeOnly.MinValue),
                        EventType = "Ενηλικίωση Τέκνου"
                    };
                })
                .Where(x => x.EventDate >= today && x.Child.ChildFlag == 0 && x.Child.Child18 == 1)
                .OrderBy(x => x.EventDate)
                .ToList();

            foreach (var item in eighteenthBirthdayChildren)
            {
                var employee = await _context.Employees.FirstOrDefaultAsync(e => e.Am == item.Child.EmployeeId);
                if (employee != null)
                {
                    var remainingDays = (int)(item.EventDateTime - DateTime.Now).TotalDays;
                    calendars.Add(new DashBoardCalendar
                    {
                        Date = item.EventDate,
                        FullName = $"{employee.FirstName} {employee.LastName}",
                        Event = item.EventType,
                        Days = remainingDays,
                        ChildId = item.Child.Id,
                        Am = employee.Am,
                        ChildFlag = item.Child.ChildFlag
                    });
                }
            }

            // 2. Παιδιά που τελειώνουν τις σπουδές (ChildLevel != 0 και ChildDateTo >= today)
            var schoolFinishChildren = children
                .Where(c => c.ChildLevel != 0 && c.ChildDateTo >= today && c.ChildFlag == 0)
                .Select(child =>
                {
                    return new
                    {
                        Child = child,
                        EventDate = child.ChildDateTo,
                        EventDateTime = child.ChildDateTo.ToDateTime(TimeOnly.MinValue),
                        EventType = "Ολοκλήρωση Σπουδών"
                    };
                })
                .OrderBy(x => x.EventDate)
                .ToList();

            foreach (var item in schoolFinishChildren)
            {
                var employee = await _context.Employees.FirstOrDefaultAsync(e => e.Am == item.Child.EmployeeId);
                if (employee != null)
                {
                    var remainingDays = (int)(item.EventDateTime - DateTime.Now).TotalDays;
                    calendars.Add(new DashBoardCalendar
                    {
                        Date = item.EventDate,
                        FullName = $"{employee.FirstName} {employee.LastName}",
                        Event = item.EventType,
                        Days = remainingDays,
                        ChildId = item.Child.Id,
                        Am = employee.Am,
                        ChildFlag = item.Child.ChildFlag
                    });
                }
            }

            if (!calendars.Any()) return NotFound("No events found.");

            return Ok(calendars.OrderBy(x => x.Days).Take(4).ToList());
        }
    }
}
