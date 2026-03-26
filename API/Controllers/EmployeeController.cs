using Application.Employees.Commands;
using Application.Core;
using Application.DTOs.Employee;
using Application.Employees.Queries;
using AutoMapper;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Application.Activities.Commands;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Application.Employees.DTOs.Employee;

namespace API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class EmployeeController : BaseApiController
    {
        private readonly IMediator _mediator;
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public EmployeeController(IMediator mediator, AppDbContext context, IMapper mapper)
        {
            _mediator = mediator;
            _context = context;
            _mapper = mapper;
        }
        
        [HttpGet]
        public async Task<ActionResult<PagedList<EmployeeCard>>> GetEmployees([FromQuery] int page = 1, [FromQuery] int pageSize = 3)
        {
            return HandleResult(await _mediator.Send(new GetEmployeeList.Query{Page = page, PageSize = pageSize}));
        }

        [HttpGet("countEmp")]
        public async Task<ActionResult<EmployeeCount>> GetEmployeeCount(DateOnly date)
        {
            var count = await _context.Employees.CountAsync();
            var count_Month = await _context.Employees.CountAsync(l => l.DateAdded.HasValue && l.DateAdded.Value.Month == date.Month && l.DateAdded.Value.Year == date.Year);
            if (count == 0)
                return NotFound("No employees found.");

            return Ok(new EmployeeCount { TotalCount = count, MonthlyCount = count_Month });
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<EmployeeCard>> GetEmployeeData(int id)
        {
            var employee = await _context.Employees.FindAsync(id);

            if (employee == null)
                return NotFound();

            var employeeCard = _mapper.Map<EmployeeCard>(employee);
            return Ok(employeeCard);
        }

        [HttpPost]
        public async Task<ActionResult<string>> CreateEmployeeData(EmployeeCard employeeCard)
        {
            return HandleResult(await Mediator.Send(new CreateEmployeeData.Command { EmployeeCard = employeeCard }));
        }

        [HttpPut]
        public async Task<ActionResult<string>> EditEmployeeData(EmployeeCard employeeCard)
        {
            return HandleResult(await Mediator.Send(new EditEmployeeCard.Command { EmployeeCard = employeeCard }));
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<string>> DeleteEmployeeData(int id)
        {
            return HandleResult(await Mediator.Send(new DeleteEmployeeCard.Command { Id = id }));
        }

        [HttpGet("Services/{id}")]
        public async Task<ActionResult<EmployeeService>> GetEmployeeServices(int id)
        {
            var employee = await _context.Employees.FindAsync(id);

            if (employee == null)
                return NotFound();

            var employeeService = _mapper.Map<EmployeeService>(employee);
            return Ok(employeeService);
        }

        [HttpPut("Services")]
        public async Task<ActionResult<string>> EditEmployeeServices(EmployeeService employeeService)
        {
            return HandleResult(await Mediator.Send(new EditEmployeeService.Command { EmployeeService = employeeService }));
        }
    }
}
