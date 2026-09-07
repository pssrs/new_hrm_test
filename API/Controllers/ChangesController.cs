using Application.Changes.Queries;
using Application.Core;
using Application.Employees.DTOs.Changes;
using AutoMapper;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChangesController : BaseApiController
    {
        private readonly IMediator _mediator;
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public ChangesController(IMediator mediator, AppDbContext context, IMapper mapper)
        {
            _mediator = mediator;
            _context = context;
            _mapper = mapper;
        }

        [HttpGet("changesList")]
        public async Task<ActionResult<PagedList<EmployeeChangesDto>>> GetChangesList( [FromQuery] int page = 1, [FromQuery] int pageSize = 8, [FromQuery] int? month = null, [FromQuery] int year = 0, [FromQuery] string? search = null, [FromQuery] int? workRelation = null, [FromQuery] int? type = null)
        {
            return HandleResult(await _mediator.Send(new GetChangesList.Query{ Page = page, PageSize = pageSize, Month = month, Year = year, Search = search, WorkRelation = workRelation, Type = type}));
        }
    }
}