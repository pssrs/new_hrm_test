using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Core;
using Application.DashBoard.DTOs;
using Application.Employees.Commands.Child;
using AutoMapper;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers.Employee
{
    [ApiController]
    [Route("api/[controller]")]
    public class EmpChildrenController : BaseApiController
    {
        private readonly IMediator _mediator;
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<EmployeeController> _logger;
        private readonly ISybaseService _sybaseService;

        public EmpChildrenController(IMediator mediator, AppDbContext context, IMapper mapper, ILogger<EmployeeController> logger, ISybaseService sybaseService)
        {
            _mediator = mediator;
            _context = context;
            _mapper = mapper;
            _logger = logger;
            _sybaseService = sybaseService;
        }
        [HttpGet("childrenList/{id}")]
        public async Task<ActionResult<List<Children>>> GetEmployeeChildrenList(int id)
        {
            var employee = await _context.Employees.FindAsync(id);

            if (employee == null) return NotFound();

            var children = await _context.Children.Where(c => c.EmployeeId == employee.Am).ToListAsync();

            if (children == null) return NotFound();

            return Ok(children);
        }

        [HttpPost("createChildren")]
        public async Task<ActionResult<string>> CreateEmployeeChildren(Children employeeChildren)
        {
            return HandleResult(await Mediator.Send(new CreateEmployeeChildren.Command { Children = employeeChildren }));
        }

        [HttpPut("editChildren")]
        public async Task<ActionResult<string>> EditEmployeeChildren(Children employeeChildren)
        {
            return HandleResult(await Mediator.Send(new EditEmployeeChildren.Command { Children = employeeChildren }));
        }

        [HttpDelete("deleteChildren/{id}")]
        public async Task<ActionResult<string>> DeleteEmployeeChildren(int id)
        {
            return HandleResult(await Mediator.Send(new DeleteEmployeeChildren.Command { Id = id }));
        }

        [HttpPut("executeAdulthood/{id}")]
        public async Task<ActionResult<string>> ExecuteChildAdulthood(int id)
        {
            var child = await _context.Children.FirstOrDefaultAsync(c => c.Id == id);
            if (child == null) return NotFound("Το τέκνο δεν βρέθηκε");

            var employee = await _context.Employees.FirstOrDefaultAsync(e => e.Am == child.EmployeeId);
            if (employee == null) return NotFound("Ο υπάλληλος δεν βρέθηκε");

            child.Child18 = 0;
            child.ChildFlag = 1;
            await _context.SaveChangesAsync();

            var childrenCount = await _context.Children.CountAsync(c => c.EmployeeId == employee.Am && c.Child18 != 0);
            var sybaseResult = await _sybaseService.UpdateEmployeeChildrenAsync(employee.Afm, employee.Am, childrenCount);

            if (!sybaseResult.IsSuccess)
            {
                _logger.LogError("Αποτυχία ενημέρωσης Sybase μετά την ενηλικίωση τέκνου του υπαλλήλου {Am}: {Error}", employee.Am, sybaseResult.Error);
                return BadRequest($"Το τέκνο ενημερώθηκε στο HRM, αλλά απέτυχε η ενημέρωση της μισθοδοσίας: {sybaseResult.Error}");
            }

            return Ok(child.Id.ToString());
        }

        [HttpGet("childrenCalendar")]
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
                .Where(c => c.ChildLevel != 0)
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

            return Ok(calendars.OrderBy(x => x.Days).ToList());
        }
    }
}