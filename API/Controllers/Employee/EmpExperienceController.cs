using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Core;
using Application.Employees.Commands.Experience;
using Application.Employees.DTOs.Experience;
using AutoMapper;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers.Employee
{
    [ApiController]
    [Route("api/[controller]")]
    public class EmpExperienceController : BaseApiController
    {
        private readonly IMediator _mediator;
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<EmpExperienceController> _logger;
        private readonly ISybaseService _sybaseService;

        public EmpExperienceController(IMediator mediator, AppDbContext context, IMapper mapper, ILogger<EmpExperienceController> logger, ISybaseService sybaseService)
        {
            _mediator = mediator;
            _context = context;
            _mapper = mapper;
            _logger = logger;
            _sybaseService = sybaseService;
        }
        
        [HttpGet("experienceList/{id}")]
        public async Task<ActionResult<List<Experience>>> GetEmployeeExperienceList(int id)
        {
            var employee = await _context.Employees.FindAsync(id);

            if (employee == null)
                return NotFound();

            var experience = await _context.Experience.Where(e => e.Am == employee.Am).ToListAsync();

            if (experience == null)
                return NotFound();

            return Ok(experience);
        }

        [HttpPost("createExperience")]
        public async Task<ActionResult<string>> CreateExperience(EmployeeExperience employeeExperience)
        {
            return HandleResult(await Mediator.Send(new CreateEmployeeExperience.Command { Experience = employeeExperience }));
        }

        [HttpPut("editExperience")]
        public async Task<ActionResult<string>> UpdateExperience(EmployeeExperience employeeExperience)
        {
            return HandleResult(await Mediator.Send(new EditEmployeeExperience.Command { Experience = employeeExperience }));
        }

        [HttpDelete("deleteExperience/{id}")]
        public async Task<ActionResult<string>> DeleteExperience(int id)
        {
            return HandleResult(await Mediator.Send(new DeleteEmployeeExperience.Command { Id = id }));
        }
    }
}