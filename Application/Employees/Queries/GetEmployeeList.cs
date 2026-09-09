using Application.Core;
using Application.DTOs.Employee;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using System.Linq;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Employees.Queries;

public class GetEmployeeList
{
    public class Query : IRequest<Result<PagedList<EmployeeListDto>>>
    {
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 7;
        public string? Search { get; set; }
        public int? Flag { get; set; }
        public int? Address { get; set; }
        public int? Sector { get; set; }
        public int? Department { get; set; }    
        public int? Office { get; set; }
        public string? SpecialtyCode { get; set; }
        public string? BranchCode { get; set; }
        public int? Mk { get; set; }
        public int? WorkRelation { get; set; }
        public string? Grade { get; set; }
    }

    public class Handler : IRequestHandler<Query, Result<PagedList<EmployeeListDto>>>
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public Handler(AppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<Result<PagedList<EmployeeListDto>>> Handle(Query request, CancellationToken cancellationToken)
        {
            var baseQuery = _context.Employees.AsQueryable();
            
            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                var searchTerm = $"%{request.Search}%";
                baseQuery = baseQuery.Where(e => 
                    EF.Functions.Like(e.FirstName + " " + e.LastName, searchTerm, "\\") ||
                    EF.Functions.Like(e.LastName, searchTerm, "\\") ||
                    EF.Functions.Like(e.FirstName, searchTerm, "\\") ||
                    EF.Functions.Like(e.Afm.ToString(), searchTerm, "\\") ||
                    EF.Functions.Like(e.Am.ToString(), searchTerm, "\\")
                );
            }

            if (request.Flag.HasValue && request.Flag > 0) baseQuery = baseQuery.Where(e => e.IsActive == request.Flag.Value);
            if (request.Address.HasValue && request.Address > 0) baseQuery = baseQuery.Where(e => e.Directorate == request.Address.Value);
            if (request.Sector.HasValue && request.Sector > 0) baseQuery = baseQuery.Where(e => e.Sector == request.Sector.Value);
            if (request.Department.HasValue && request.Department > 0) baseQuery = baseQuery.Where(e => e.Department == request.Department.Value);
            if (request.Office.HasValue && request.Office > 0) baseQuery = baseQuery.Where(e => e.Office == request.Office.Value);
            if (!string.IsNullOrEmpty(request.SpecialtyCode) && request.SpecialtyCode != "all") baseQuery = baseQuery.Where(e => e.Specialty == request.SpecialtyCode);
            if (!string.IsNullOrEmpty(request.BranchCode) && request.BranchCode != "all") baseQuery = baseQuery.Where(e => e.Branch == request.BranchCode);
            if (request.Mk.HasValue && request.Mk != 0) baseQuery = baseQuery.Where(e => e.MK == request.Mk.Value);
            if (request.WorkRelation.HasValue && request.WorkRelation != 0) baseQuery = baseQuery.Where(e => e.WorkRelation == request.WorkRelation.Value);
            if (!string.IsNullOrEmpty(request.Grade) && request.Grade != "all") baseQuery = baseQuery.Where(e => e.Rank == request.Grade);

            var totalCount = await baseQuery.CountAsync(cancellationToken);
            var employeesPage = await baseQuery
                .OrderBy(e => e.LastName)
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize)
                .Select(e => new
                {
                    e.Id,
                    e.FirstName,
                    e.LastName,
                    e.Afm,
                    e.Am,
                    e.IsActive,
                    Directorate = e.Directorate,
                    Sector = e.Sector,
                    Department = e.Department,
                    Office = e.Office,
                    e.MK,
                    e.Category,
                    e.MKDate,
                    e.MKNextDate,
                    e.Branch,
                    e.Specialty,
                    e.Rank,
                    e.RankDate,
                    e.RankNextDate
                })
                .ToListAsync(cancellationToken);

            // Batch-fetch τα reference δεδομένα (Addresses/Sectors/Departments/Offices) μία φορά για
            // όλη τη σελίδα αντί για 4 queries ανά υπάλληλο (N+1), και τα κάνουμε join in-memory.
            var directorateIds = employeesPage.Select(e => e.Directorate).Distinct().ToList();
            var officeIds = employeesPage.Select(e => e.Office).Distinct().ToList();

            var addresses = await _context.Addresses
                .Where(a => directorateIds.Contains(a.Id))
                .Select(a => new { a.Id, a.Address_str })
                .ToDictionaryAsync(a => a.Id, a => a.Address_str, cancellationToken);

            var sectors = await _context.Sectors
                .Where(s => directorateIds.Contains(s.AddressId))
                .Select(s => new { s.SectorId, s.AddressId, s.SectorName })
                .ToListAsync(cancellationToken);
            var sectorLookup = sectors.ToDictionary(s => (s.AddressId, s.SectorId), s => s.SectorName);

            var departments = await _context.Departments
                .Where(d => directorateIds.Contains(d.AddressId))
                .Select(d => new { d.DepartmentId, d.AddressId, d.SectorId, d.DepartmentName })
                .ToListAsync(cancellationToken);
            var departmentLookup = departments.ToDictionary(d => (d.AddressId, d.SectorId, d.DepartmentId), d => d.DepartmentName);

            var offices = await _context.Offices
                .Where(o => officeIds.Contains(o.DepartmentId))
                .Select(o => new { o.DepartmentId, o.OfficeName })
                .ToDictionaryAsync(o => o.DepartmentId, o => o.OfficeName, cancellationToken);

            var employees = employeesPage.Select(e => new EmployeeListDto
            {
                Id = e.Id,
                Name = e.LastName + " " + e.FirstName,
                Afm = e.Afm,
                AM = e.Am,
                Address = addresses.GetValueOrDefault(e.Directorate, string.Empty),
                Sector = sectorLookup.GetValueOrDefault((e.Directorate, e.Sector), string.Empty),
                Department = departmentLookup.GetValueOrDefault((e.Directorate, e.Sector, e.Department), string.Empty),
                Office = offices.GetValueOrDefault(e.Office, string.Empty),
                IsActive = e.IsActive,
                Mk = e.MK,
                Category = e.Category ?? string.Empty,
                MkDate = e.MKDate ?? new DateOnly(1900, 1, 1),
                MkNextDate = e.MKNextDate ?? new DateOnly(1900, 1, 1),
                Branch = e.Branch ?? string.Empty,
                Specialty = e.Specialty ?? string.Empty,
                Grade = e.Rank,
                GrDate = e.RankDate ?? new DateOnly(1900, 1, 1),
                GrNextDate = e.RankNextDate ?? new DateOnly(1900, 1, 1),
            }).ToList();

            var paged = new PagedList<EmployeeListDto>(employees, totalCount);

            return Result<PagedList<EmployeeListDto>>.Success(paged);
        }
    }
}
