using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Core;
using Application.Employees.Commands.Study;
using AutoMapper;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers.Employee
{
    [ApiController]
    [Route("api/[controller]")]
    public class EmpStudiesController : BaseApiController
    {
        private readonly IMediator _mediator;
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<EmpStudiesController> _logger;
        private readonly ISybaseService _sybaseService;

        public EmpStudiesController(IMediator mediator, AppDbContext context, IMapper mapper, ILogger<EmpStudiesController> logger, ISybaseService sybaseService)
        {
            _mediator = mediator;
            _context = context;
            _mapper = mapper;
            _logger = logger;
            _sybaseService = sybaseService;
        }
        [HttpGet("studiesList/{id}")]
        public async Task<ActionResult<List<Studies>>> GetEmployeeStudiesList(int id)
        {
            var employee = await _context.Employees.FindAsync(id);

            if (employee == null)
                return NotFound();

            var studies = await _context.Studies.Where(s => s.Am == employee.Am).ToListAsync();
            if (studies == null)
                return NotFound();

            return Ok(studies);
        }

        [HttpPost("createStudies")]
        public async Task<ActionResult<string>> CreateEmployeeStudies(Studies employeeStudies)
        {
            return HandleResult(await Mediator.Send(new CreateEmployeeStudies.Command{Studies = employeeStudies}));
        }

        [HttpPut("editStudies")]
        public async Task<ActionResult<string>> EditEmployeeStudies(Studies employeeStudies)
        {
            return HandleResult(await Mediator.Send(new EditEmployeeStudies.Command { Studies = employeeStudies }));
        }

        [HttpDelete("deleteStudies/{id}")]
        public async Task<ActionResult<string>> DeleteEmployeeStudies(int id)
        {
            return HandleResult(await Mediator.Send(new DeleteEmployeeStudies.Command { Id = id }));
        }
    }
}