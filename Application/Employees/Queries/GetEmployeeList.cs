using Application.Core;
using Application.DTOs.Employee;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Employees.Queries;

public class GetEmployeeList
{
    public class Query : IRequest<Result<PagedList<EmployeeCard>>>
    {
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 5;
    }

    public class Handler : IRequestHandler<Query, Result<PagedList<EmployeeCard>>>
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public Handler(AppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<Result<PagedList<EmployeeCard>>> Handle(Query request, CancellationToken cancellationToken)
        {
            var totalCount = await _context.Employees.CountAsync(cancellationToken);

            var employees = await _context.Employees.OrderBy(e => e.LastName)
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize)
                .ProjectTo<EmployeeCard>(_mapper.ConfigurationProvider)
                .ToListAsync(cancellationToken);

            var paged = new PagedList<EmployeeCard>(employees, totalCount);

            return Result<PagedList<EmployeeCard>>.Success(paged);
        }
    }
}
