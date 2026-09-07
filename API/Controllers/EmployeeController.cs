using Application.Employees.Commands;
using Application.Core;
using Application.DTOs.Employee;
using Application.Employees.Queries;
using AutoMapper;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Application.Activities.Commands;
using Microsoft.EntityFrameworkCore;
using Application.Employees.DTOs.Employee;
using Application.Employees.DTOs;
using Application.Employees.DTOs.Personal;
using Application.Employees.DTOs.Services;
using Application.Employees.Commands.Services;
using Application.Employees.Commands.Personal;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmployeeController : BaseApiController
    {
        private readonly IMediator _mediator;
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<EmployeeController> _logger;
        private readonly ISybaseService _sybaseService;

        public EmployeeController(IMediator mediator, AppDbContext context, IMapper mapper, ILogger<EmployeeController> logger, ISybaseService sybaseService)
        {
            _mediator = mediator;
            _context = context;
            _mapper = mapper;
            _logger = logger;
            _sybaseService = sybaseService;
        }
        
        [HttpGet]
        public async Task<ActionResult<PagedList<EmployeeListDto>>> GetEmployees([FromQuery] int page = 1, [FromQuery] int pageSize = 8, [FromQuery] string? search = null, [FromQuery] int? flag = null,[FromQuery] int? address_Id = null,[FromQuery] int? sector_Id = null, [FromQuery] int? department_Id = null, [FromQuery] int? office_Id = null, [FromQuery] string? specialtyCode = null, [FromQuery] string? branchCode = null, [FromQuery] int? mk = null, [FromQuery] int? workRelation = null, [FromQuery] string? grade = null)
        {
            return HandleResult(await _mediator.Send(new GetEmployeeList.Query{Page = page, PageSize = pageSize, Search = search, Flag = flag, Address = address_Id, Sector = sector_Id, Department = department_Id, Office = office_Id, SpecialtyCode = specialtyCode, BranchCode = branchCode, Mk = mk, WorkRelation = workRelation, Grade = grade}));
        }

        [HttpPost("setEmployeeCountMonthly")]
        public async Task<ActionResult<string>> SetEmployeeCountMonthly()
        {
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

        [HttpGet("countEmpCumulativePerMonth")]
        public async Task<ActionResult<List<EmployeeCountPerMonth>>> GetEmployeeCountCumulativePerMonth()
        {
            var end = DateTime.Now;
            var start = end.AddMonths(-11);

            var startYear = start.Year;
            var startMonth = start.Month;
            var endYear = end.Year;
            var endMonth = end.Month;

            var monthlyData = await _context.EmployeeCountMonthly
                .Where(x => (x.Year > startYear || (x.Year == startYear && x.Month >= startMonth)) &&
                            (x.Year < endYear || (x.Year == endYear && x.Month <= endMonth)))
                .OrderBy(x => x.Year)
                .ThenBy(x => x.Month)
                .ToListAsync();

            var result = new List<EmployeeCountPerMonth>();

            for (int i = 0; i < 12; i++)
            {
                var monthDate = start.AddMonths(i);
                var monthData = monthlyData.FirstOrDefault(x => x.Year == monthDate.Year && x.Month == monthDate.Month);
                
                result.Add(new EmployeeCountPerMonth 
                { 
                    Month = monthDate.Month, 
                    Count = monthData?.Count ?? 0 
                });
            }

            return Ok(result);
        }

        [HttpGet("employeeCard/{id}")]
        public async Task<ActionResult<EmployeeListDto>> GetEmployeeData(int id)
        {
            return HandleResult(await Mediator.Send(new GetEmployeeById.Query { Id = id }));
        }

        [HttpGet("byam/{am}")]
        public async Task<ActionResult<object>> GetEmployeeByAm(int am)
        {
            var employee = await _context.Employees.FirstOrDefaultAsync(e => e.Am == am);

            if (employee == null)
                return NotFound("Employee not found");

            return Ok(new
            {
                fullName = $"{employee.FirstName} {employee.LastName}".Trim() ?? string.Empty,
                email = employee.Email ?? string.Empty,
                am = employee.Am
            });
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<EmployeeCard>> GetEmployeeDataCard(int id)
        {
            var employee = await _context.Employees.FindAsync(id);

            if (employee == null)
                return NotFound();

            var employeeCard = _mapper.Map<EmployeeCard>(employee);
            
            // Lookup department name
            employeeCard.Department = await _context.Departments
                .Where(d => d.DepartmentId == employee.Department && d.AddressId == employee.Directorate && d.SectorId == employee.Sector)
                .Select(d => d.DepartmentName)
                .FirstOrDefaultAsync() ?? string.Empty;
            
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

            
            // employeeService.MKNextDate = await _context.Changes.Where(a => a.AM == employee.Am && a.Type == 1).Select(a => (DateOnly?)a.NextDate).MaxAsync() ?? employeeService.MKDate;
            // employeeService.MKDate = await _context.Changes.Where(a => a.AM == employee.Am && a.Type == 1).Select(a => (DateOnly?)a.ChangeDate).MaxAsync();
            // employeeService.RankDate = await _context.Changes.Where(a => a.AM == employee.Am && a.Type == 2).Select(a => (DateOnly?)a.ChangeDate).MaxAsync();
            // employeeService.RankNextDate = await _context.Changes.Where(a => a.AM == employee.Am && a.Type == 2).Select(a => (DateOnly?)a.NextDate).MaxAsync();
            return Ok(employeeService);
        }

        [HttpPut("Services")]
        public async Task<ActionResult<string>> EditEmployeeServices(EmployeeService employeeService)
        {
            return HandleResult(await Mediator.Send(new EditEmployeeService.Command { EmployeeService = employeeService }));
        }

        [HttpPut("personal")]
        public async Task<ActionResult<string>> EditEmployeePersonal(EmployeePersonal employeePersonal)
        {
            return HandleResult(await Mediator.Send(new EditEmployeePersonal.Command { EmployeePersonal = employeePersonal }));
        }

        [HttpPut("info")]
        public async Task<ActionResult<string>> EditEmployeeInfo(EmployeeInfo employeeInfo)
        {
            return HandleResult(await Mediator.Send(new EditEmployeeInfo.Command { EmployeeInfo = employeeInfo }));
        }

        [HttpPut("identity")]
        public async Task<ActionResult<string>> EditEmployeeIdentity(EmployeeIdentity employeeIdentity)
        {
            return HandleResult(await Mediator.Send(new EditEmployeeIdentity.Command { EmployeeIdentity = employeeIdentity }));
        }

        [HttpPut("number")]
        public async Task<ActionResult<string>> EditEmployeeNumber(EmployeeNumber employeeNumber)
        {
            return HandleResult(await Mediator.Send(new EditEmployeeNumber.Command { EmployeeNumber = employeeNumber }));
        }

        [HttpPut("bank")]
        public async Task<ActionResult<string>> EditEmployeeBank(EmployeeBank employeeBank)
        {
            return HandleResult(await Mediator.Send(new EditEmployeeBank.Command { EmployeeBank = employeeBank }));
        }

        [HttpPut("position")]
        public async Task<ActionResult<string>> EditEmployeePosition(EmployeePosition employeePosition)
        {
            return HandleResult(await Mediator.Send(new EditEmployeePosition.Command { EmployeePosition = employeePosition }));
        }

        [HttpPut("positionInfo")]
        public async Task<ActionResult<string>> EditEmployeePositionInfo(EmployeePositionInfo employeePositionInfo)
        {
            return HandleResult(await Mediator.Send(new EditEmployeePositionInfo.Command { EmployeePositionInfo = employeePositionInfo }));
        }

        [HttpPut("salary")]
        public async Task<ActionResult<string>> EditEmployeeSalary(EmployeeSalary employeeSalary)
        {
            return HandleResult(await Mediator.Send(new EditEmployeeSalary.Command { EmployeeSalary = employeeSalary }));
        }

        [HttpPut("grade")]
        public async Task<ActionResult<string>> EditEmployeeGrade(EmployeeGrade employeeGrade)
        {
            return HandleResult(await Mediator.Send(new EditEmployeeGrade.Command { EmployeeGrade = employeeGrade }));
        }

        [HttpPut("belongs")]
        public async Task<ActionResult<string>> EditEmployeeBelongs(EmployeeBelongs employeeBelongs)
        {
            return HandleResult(await Mediator.Send(new EditEmployeeBelongs.Command { EmployeeBelongs = employeeBelongs }));
        }

        [HttpPut("works")]
        public async Task<ActionResult<string>> EditEmployeeWorks(EmployeeWorks employeeWorks)
        {
            return HandleResult(await Mediator.Send(new EditEmployeeWorks.Command { EmployeeWorks = employeeWorks }));
        }

        [HttpPost("addFull")]
        public async Task<ActionResult<int>> AddFullEmployee(AddEmployeeDto dto)
        {
            return HandleResult(await Mediator.Send(new CreateEmployeeFull.Command { EmployeeDto = dto }));
        }

    }
}
