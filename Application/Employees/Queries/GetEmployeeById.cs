using Application.Core;
using Application.DTOs.Employee;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Employees.Queries;

public class GetEmployeeById
{
    public class Query : IRequest<Result<EmployeeListDto>>
    {
        public int Id { get; set; }
    }

    public class Handler : IRequestHandler<Query, Result<EmployeeListDto>>
    {
        private readonly AppDbContext _context;

        public Handler(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Result<EmployeeListDto>> Handle(Query request, CancellationToken cancellationToken)
        {
            var e = await _context.Employees
                .Where(e => e.Id == request.Id)
                .Select(e => new
                {
                    e.Id,
                    e.FirstName,
                    e.LastName,
                    e.Afm,
                    e.Am,
                    e.IsActive,
                    e.Directorate,
                    e.Sector,
                    e.Department,
                    e.Office,
                    e.MK,
                    e.Category,
                    e.MKDate,
                    e.MKNextDate,
                    e.Rank,
                    e.RankDate,
                    e.RankNextDate
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (e == null)
                return Result<EmployeeListDto>.Failure("Employee not found", 404);

            var dto = new EmployeeListDto
            {
                Id = e.Id,
                Name = e.LastName + " " + e.FirstName,
                Afm = e.Afm,
                AM = e.Am,
                Address = _context.Addresses.Where(a => a.Id == e.Directorate).Select(a => a.Address_str).FirstOrDefault() ?? string.Empty,
                Sector = _context.Sectors.Where(s => s.SectorId == e.Sector && s.AddressId == e.Directorate).Select(s => s.SectorName).FirstOrDefault() ?? string.Empty,
                Department = _context.Departments.Where(d => d.DepartmentId == e.Department && d.AddressId == e.Directorate && d.SectorId == e.Sector).Select(d => d.DepartmentName).FirstOrDefault() ?? string.Empty,
                Office = _context.Offices.Where(o => o.DepartmentId == e.Office).Select(o => o.OfficeName).FirstOrDefault() ?? string.Empty,
                IsActive = e.IsActive,
                Mk = e.MK,
                Category = e.Category ?? string.Empty,
                MkDate = e.MKDate ?? new DateOnly(1900, 1, 1),
                MkNextDate = e.MKNextDate ?? new DateOnly(1900, 1, 1),
                Grade = e.Rank,
                GrDate = e.RankDate ?? new DateOnly(1900, 1, 1),
                GrNextDate = e.RankNextDate ?? new DateOnly(1900, 1, 1),
            };

            return Result<EmployeeListDto>.Success(dto);
        }
    }
}
