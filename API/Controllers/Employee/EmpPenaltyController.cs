using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Core;
using Application.Employees.Commands.Penalties;
using AutoMapper;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers.Employee
{
    [ApiController]
    [Route("api/[controller]")]
    public class EmpPenaltyController : BaseApiController
    {
        private readonly IMediator _mediator;
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<EmpPenaltyController> _logger;
        private readonly ISybaseService _sybaseService;

        public EmpPenaltyController(IMediator mediator, AppDbContext context, IMapper mapper, ILogger<EmpPenaltyController> logger, ISybaseService sybaseService)
        {
            _mediator = mediator;
            _context = context;
            _mapper = mapper;
            _logger = logger;
            _sybaseService = sybaseService;
        }
        
        [HttpGet("penaltyList/{id}")]
        public async Task<ActionResult<List<Penalty>>> GetEmployeePenaltyList(int id)
        {
            var employee = await _context.Employees.FindAsync(id);

            if (employee == null)
                return NotFound();

            var penalties = await _context.Penalties.Where(p => p.Am == employee.Am).ToListAsync();

            if (penalties == null)
                return NotFound();

            return Ok(penalties);
        }

        [HttpPost("createPenalty")]
        public async Task<ActionResult<string>> CreatePenalty(Penalty employeePenalty)
        {
            return HandleResult(await Mediator.Send(new CreateEmployeePenalty.Command { Penalty = employeePenalty }));
        }

        [HttpPut("editPenalty")]
        public async Task<ActionResult<string>> UpdatePenalty(Penalty employeePenalty)
        {
            return HandleResult(await Mediator.Send(new EditEmployeePenalty.Command { Penalty = employeePenalty }));
        }

        [HttpDelete("deletePenalty/{id}")]
        public async Task<ActionResult<string>> DeletePenalty(int id)
        {
            return HandleResult(await Mediator.Send(new DeleteEmployeePenalty.Command { Id = id }));
        }
    }
}