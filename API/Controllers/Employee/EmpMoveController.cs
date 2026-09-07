using Application.Core;
using Application.Employees.Commands.Moving;
using AutoMapper;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers.Employee
{
    [ApiController]
    [Route("api/[controller]")]
    public class EmpMoveController : BaseApiController
    {
        private readonly IMediator _mediator;
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<EmpMoveController> _logger;
        private readonly ISybaseService _sybaseService;

        public EmpMoveController(IMediator mediator, AppDbContext context, IMapper mapper, ILogger<EmpMoveController> logger, ISybaseService sybaseService)
        {
            _mediator = mediator;
            _context = context;
            _mapper = mapper;
            _logger = logger;
            _sybaseService = sybaseService;
        }
        
        [HttpGet("moveList/{id}")]
        public async Task<ActionResult<List<Move>>> GetEmployeeMoveList(int id)
        {
            var employee = await _context.Employees.FindAsync(id);

            if (employee == null)
                return NotFound();

            var moves = await _context.Moves.Where(m => m.Am == employee.Am).ToListAsync();

            if (moves == null)
                return NotFound();

            return Ok(moves);
        }
    
        [HttpPost("createMove")]
        public async Task<ActionResult<string>> CreateMove(Move employeeMove)
        {
            return HandleResult(await Mediator.Send(new CreateEmployeeMove.Command { Move = employeeMove }));
        }

        [HttpPut("editMove")]
        public async Task<ActionResult<string>> UpdateMove(Move employeeMove)
        {
            return HandleResult(await Mediator.Send(new EditEmployeeMove.Command { Move = employeeMove }));
        }

        [HttpDelete("deleteMove/{id}")]
        public async Task<ActionResult<string>> DeleteMove(int id)
        {
            return HandleResult(await Mediator.Send(new DeleteEmployeeMove.Command { Id = id }));
        }
    }
}