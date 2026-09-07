using Application.Core.Services;
using AutoMapper;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers.Employee
{
    [ApiController]
    [Route("api/[controller]")]
    public class EmpReportController : BaseApiController
    {
        private readonly IMediator _mediator;
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<EmployeeController> _logger;
        private readonly IEmployeeReportService _employeeReportService;

        public EmpReportController(IMediator mediator, AppDbContext context, IMapper mapper, ILogger<EmployeeController> logger, IEmployeeReportService employeeReportService)
        {
            _mediator = mediator;
            _context = context;
            _mapper = mapper;
            _logger = logger;
            _employeeReportService = employeeReportService;
        }
        
        [HttpGet("GetWorkReport/{id}")]
        public async Task<IActionResult> GetWorkReport(int id)
        {
            var employee = await _context.Employees.FindAsync(id);

            if (employee == null)
            {
                _logger.LogWarning("Employee with ID {EmployeeId} not found", id);
                return NotFound($"Δεν βρέθηκε ο εργαζόμενος με ID {id}.");
            }

            byte[] fileBytes;
            try
            {
                fileBytes = await _employeeReportService.GenerateWorkCertificate(employee);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to generate employment certificate for employee {EmployeeId}", id);
                return StatusCode(500, "Αποτυχία δημιουργίας βεβαίωσης εργασίας.");
            }

            var fileName = $"Vevaiosi_Ergasias_{employee.LastName}.docx";

            return File(
                fileBytes,
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                fileName);
        }

        [HttpGet("GetAtomikoDeltioKataxis/{id}")]
        public async Task<IActionResult> GetAtomikoDeltioKataxis(int id)
        {
            var employee = await _context.Employees.FindAsync(id);

            if (employee == null)
            {
                _logger.LogWarning("Employee with ID {EmployeeId} not found", id);
                return NotFound($"Δεν βρέθηκε ο εργαζόμενος με ID {id}.");
            }

            byte[] fileBytes;
            try
            {
                fileBytes = await _employeeReportService.GenerateAtomikoDeltioKataxis(employee);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to generate employment certificate for employee {EmployeeId}", id);
                return StatusCode(500, "Αποτυχία δημιουργίας βεβαίωσης εργασίας.");
            }

            var fileName = $"Vevaiosi_Ergasias_{employee.LastName}.docx";

            return File(
                fileBytes,
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                fileName);
        }

        [HttpGet("GetVevaiwshProuphresiass/{id}")]
        public async Task<IActionResult> GetVevaiwshProuphresias(int id)
        {
            _logger.LogWarning("=== GetVevaiwshProuphresias CALLED for id={Id} ===", id);
            var employee = await _context.Employees.FindAsync(id);

            if (employee == null)
            {
                _logger.LogWarning("Employee with ID {EmployeeId} not found", id);
                return NotFound($"Δεν βρέθηκε ο εργαζόμενος με ID {id}.");
            }

            byte[] fileBytes;
            try
            {
                fileBytes = await _employeeReportService.GenerateVevaiosiProipiresias(employee);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to generate employment certificate for employee {EmployeeId}", id);
                return StatusCode(500, "Αποτυχία δημιουργίας βεβαίωσης εργασίας.");
            }

            var fileName = $"Vevaiosi_Ergasias_{employee.LastName}.docx";

            return File(
                fileBytes,
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                fileName);
        }

        [HttpGet("GetVevaiwshAnarrotikhs/{id}")]
        public async Task<IActionResult> GetVevaiwshAnarrotikhs(int id)
        {
            _logger.LogWarning("=== GetVevaiwshAnarrotikhs CALLED for id={Id} ===", id);

            var employee = await _context.Employees.FindAsync(id);
            if (employee == null)
                return NotFound($"Δεν βρέθηκε ο εργαζόμενος με ID {id}.");

            byte[] fileBytes;
            try
            {
                fileBytes = await _employeeReportService.GenerateKatastasiAnarrotikwn(employee);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to generate sickness leave report for employee {EmployeeId}", id);
                return StatusCode(500, "Αποτυχία δημιουργίας κατάστασης αναρρωτικών αδειών.");
            }

            return File(
                fileBytes,
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                $"Katastasi_Anarrotikwn_{employee.LastName}.docx");
        }

        [HttpGet("GetDeltioYpiresiakonMetavolon/{id}")]
        public async Task<IActionResult> GetDeltioYpiresiakonMetavolon(int id)
        {
            _logger.LogWarning("=== GetVevaiwshAnarrotikhs CALLED for id={Id} ===", id);

            var employee = await _context.Employees.FindAsync(id);
            if (employee == null)
                return NotFound($"Δεν βρέθηκε ο εργαζόμενος με ID {id}.");

            byte[] fileBytes;
            try
            {
                fileBytes = await _employeeReportService.GenerateYphresiakesMetavoles(employee);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to generate sickness leave report for employee {EmployeeId}", id);
                return StatusCode(500, "Αποτυχία δημιουργίας κατάστασης αναρρωτικών αδειών.");
            }

            return File(
                fileBytes,
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                $"Katastasi_Anarrotikwn_{employee.LastName}.docx");
        }
    }
}