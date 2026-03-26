using API.DTOs;
using AutoMapper;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LeaveController : BaseApiController
    {
        private readonly IMediator _mediator;
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public LeaveController(IMediator mediator, AppDbContext context, IMapper mapper)
        {
            _mediator = mediator;
            _context = context;
            _mapper = mapper;
        }
        
        [HttpGet]
        public async Task<ActionResult<int>> CountLeaveOfMonth([FromQuery] DateOnly date)
        {
            var totalDuration = await _context.Leaves
                .Where(l => l.DateFrom.HasValue && l.DateFrom.Value.Month == date.Month && l.DateFrom.Value.Year == date.Year && l.State == 0)
                .SumAsync(l => l.Duration);

            return Ok(totalDuration);
        }

        [HttpGet("monthly")]
        public async Task<ActionResult<List<LeaveMonthCountDto>>> GetMonthlyCounts([FromQuery] int year)
        {
            var grouped = await _context.Leaves
                .Where(l => l.DateFrom.HasValue && l.DateFrom.Value.Year == year && l.State == 1)
                .GroupBy(l => l.DateFrom!.Value.Month)
                .Select(g => new { Month = g.Key, Sum = g.Sum(l => l.Duration) })
                .ToListAsync();

            var result = Enumerable.Range(1, 12)
                .Select(m => new LeaveMonthCountDto
                {
                    Month = m,
                    Count = grouped.FirstOrDefault(x => x.Month == m)?.Sum ?? 0
                })
                .ToList();

            return Ok(result);
        }
    }
}
