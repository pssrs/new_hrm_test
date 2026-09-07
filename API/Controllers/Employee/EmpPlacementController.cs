using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Core;
using Application.Employees.Commands.Placements;
using AutoMapper;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EmpPlacementController : BaseApiController
    {
        private readonly IMediator _mediator;
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<EmpPlacementController> _logger;
        private readonly ISybaseService _sybaseService;

        public EmpPlacementController(IMediator mediator, AppDbContext context, IMapper mapper, ILogger<EmpPlacementController> logger, ISybaseService sybaseService)
        {
            _mediator = mediator;
            _context = context;
            _mapper = mapper;
            _logger = logger;
            _sybaseService = sybaseService;
        }

        [HttpGet("placementList/{id}")]
        public async Task<ActionResult<List<Placement>>> GetEmployeeChangePlacement(int id)
        {
            var employee = await _context.Employees.FindAsync(id);

            if (employee == null) return NotFound();

            var changes = await _context.Placements
                .Where(c => c.Am == employee.Am)
                .OrderByDescending(c => c.Id)
                .ToListAsync();

            if (changes == null)
                return NotFound();

            return Ok(changes);
        }

        [HttpPost("createPlacement")]
        public async Task<ActionResult<string>> CreateEmployeePlacement(Placement employeePlacement)
        {
            return HandleResult(await Mediator.Send(new CreateEmployeePlacement.Command { Placement = employeePlacement }));
        }

        [HttpPut("editPlacement")]
        public async Task<ActionResult<string>> EditEmployeePlacement(Placement employeePlacement)
        {
            return HandleResult(await Mediator.Send(new EditEmployeePlacement.Command { Placement = employeePlacement }));
        }

        [HttpDelete("deletePlacement/{id}")]
        public async Task<ActionResult<string>> DeleteEmployeePlacement(int id)
        {
            return HandleResult(await Mediator.Send(new DeleteEmployeePlacement.Command { Id = id }));
        }
    }
}