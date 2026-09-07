using Application.Core;
using Application.Employees.DTOs.Changes;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Changes.Queries;

public class GetChangesList
{
    public class Query : IRequest<Result<PagedList<EmployeeChangesDto>>>
    {
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 8;
        public int? Month { get; set; }
        public int Year { get; set; }
        public string? Search { get; set; }
        public int? WorkRelation { get; set; }
        public int? Type { get; set; }
    }

    public class Handler : IRequestHandler<Query, Result<PagedList<EmployeeChangesDto>>>
    {
        private readonly AppDbContext _context;

        public Handler(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Result<PagedList<EmployeeChangesDto>>> Handle(Query request, CancellationToken cancellationToken)
        {
            var changesQuery = request.Month.HasValue
                ? (from ch in _context.Changes
                   where (ch.NextDate.Year == request.Year && ch.NextDate.Month == request.Month.Value)
                       || ((ch.ChangeDate.Year == request.Year && ch.ChangeDate.Month == request.Month.Value) && (ch.NextDate.Year == 1900))
                   join emp in _context.Employees on ch.AM equals emp.Am
                   select new
                   {
                       emp.Am,
                       emp.FirstName,
                       emp.LastName,
                       emp.Afm,
                       emp.WorkRelation,
                       Type = ch.Type,
                       PrevValue = ch.PreviousState.ToString(),
                       NextValue = ch.NextState.ToString(),
                       ChangeDate = ch.ChangeDate,
                       NextChangeDate = ch.NextDate,
                       Notes = ch.Notes,
                       ch.Flag,
                       ch.FlagHRM,
                       ChangeId = ch.Id,
                   })
                : (from ch in _context.Changes
                   where (ch.NextDate.Year == request.Year)
                       || (ch.ChangeDate.Year == request.Year && ch.NextDate.Year == 1900)
                   join emp in _context.Employees on ch.AM equals emp.Am
                   select new
                   {
                       emp.Am,
                       emp.FirstName,
                       emp.LastName,
                       emp.Afm,
                       emp.WorkRelation,
                       Type = ch.Type,
                       PrevValue = ch.PreviousState.ToString(),
                       NextValue = ch.NextState.ToString(),
                       ChangeDate = ch.ChangeDate,
                       NextChangeDate = ch.NextDate,
                       Notes = ch.Notes,
                       ch.Flag,
                       ch.FlagHRM,
                       ChangeId = ch.Id,
                   });

            if (request.WorkRelation.HasValue && request.WorkRelation > 0) changesQuery = changesQuery.Where(x => x.WorkRelation == request.WorkRelation.Value);

            if (request.Type.HasValue) changesQuery = changesQuery.Where(x => x.Type == request.Type.Value);

            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                var t = $"%{request.Search}%";
                changesQuery = changesQuery.Where(x =>
                    EF.Functions.Like(x.LastName + " " + x.FirstName, t, "\\") ||
                    EF.Functions.Like(x.LastName, t, "\\") ||
                    EF.Functions.Like(x.FirstName, t, "\\") ||
                    EF.Functions.Like(x.Afm, t, "\\"));
            }

            var changesList = await changesQuery.ToListAsync(cancellationToken);

            // Ποιοι υπάλληλοι έχουν ήδη μεταβολή κλιμακίου (Type 1) / βαθμού (Type 2) στον πίνακα
            // var existingMkAms = changesList.Where(x => x.Type == 1).Select(x => x.Am).ToHashSet();
            // var existingRankAms = changesList.Where(x => x.Type == 2).Select(x => x.Am).ToHashSet();

            var all = new List<EmployeeChangesDto>();

            all.AddRange(changesList.Select(x => new EmployeeChangesDto
            {
                FullName = x.LastName + " " + x.FirstName,
                Afm = x.Afm,
                Type = x.Type.ToString(),
                PrevValue = x.PrevValue,
                NextValue = x.NextValue,
                ChangeDate = x.ChangeDate,
                NextChangeDate = x.NextChangeDate,
                Notes = x.Notes,
                WorkRelation = x.WorkRelation,
                Flag = x.Flag,
                FlagHRM = x.FlagHRM,
                ChangeId = x.ChangeId,
            }));

            foreach (var change in all.ToList())
            {
                var employee = await _context.Employees.FirstOrDefaultAsync(e => e.Afm == change.Afm, cancellationToken);
                if(employee != null)
                {
                    if(change.Flag == 0 && employee.IsActive != 1) // allagh ergasiakhs katastashs
                    {
                        all.Remove(change);
                    }
                }
            }

            // // ---------- 2. Κλιμάκια από Employee (MKNextDate στον μήνα) — μόνο αν ΔΕΝ υπάρχει ήδη ----------
            // var mkQuery = (!request.Type.HasValue || request.Type == 1)
            //     ? _context.Employees.Where(e => e.MKNextDate.HasValue && e.MKNextDate.Value.Year == request.Year && e.MKNextDate.Value.Month == request.Month)
            //     : _context.Employees.Where(e => false);

            // if (request.WorkRelation.HasValue && request.WorkRelation > 0) mkQuery = mkQuery.Where(e => e.WorkRelation == request.WorkRelation.Value);

            // if (!string.IsNullOrWhiteSpace(request.Search))
            // {
            //     var t = $"%{request.Search}%";
            //     mkQuery = mkQuery.Where(e =>
            //         EF.Functions.Like(e.LastName + " " + e.FirstName, t, "\\") ||
            //         EF.Functions.Like(e.LastName, t, "\\") ||
            //         EF.Functions.Like(e.FirstName, t, "\\") ||
            //         EF.Functions.Like(e.Afm, t, "\\"));
            // }

            // var mkEmployees = await mkQuery.Select(e => new { e.Am, e.FirstName, e.LastName, e.Afm, e.WorkRelation, e.MK, e.MKDate, e.MKNextDate }).ToListAsync(cancellationToken);

            // all.AddRange(mkEmployees
            //     .Where(e => !existingMkAms.Contains(e.Am))   // ← μόνο αν δεν υπάρχει ήδη
            //     .Select(e => new EmployeeChangesDto
            //     {
            //         FullName = e.LastName + " " + e.FirstName,
            //         Afm = e.Afm,
            //         Type = "1",
            //         PrevValue = e.MK.ToString(),
            //         NextValue = (e.MK + 1).ToString(),
            //         ChangeDate = e.MKDate ?? default,
            //         NextChangeDate = e.MKNextDate ?? default,
            //         Notes = string.Empty,
            //         WorkRelation = e.WorkRelation,
            //     }));

            // var rankQuery = (!request.Type.HasValue || request.Type == 2)
            //     ? _context.Employees.Where(e => e.RankNextDate.HasValue && e.RankNextDate.Value.Year == request.Year && e.RankNextDate.Value.Month == request.Month)
            //     : _context.Employees.Where(e => false);

            // if (request.WorkRelation.HasValue && request.WorkRelation > 0) rankQuery = rankQuery.Where(e => e.WorkRelation == request.WorkRelation.Value);

            // if (!string.IsNullOrWhiteSpace(request.Search))
            // {
            //     var t = $"%{request.Search}%";
            //     rankQuery = rankQuery.Where(e =>
            //         EF.Functions.Like(e.LastName + " " + e.FirstName, t, "\\") ||
            //         EF.Functions.Like(e.LastName, t, "\\") ||
            //         EF.Functions.Like(e.FirstName, t, "\\") ||
            //         EF.Functions.Like(e.Afm, t, "\\"));
            // }

            // var rankEmployees = await rankQuery.Select(e => new { e.Am, e.FirstName, e.LastName, e.Afm, e.WorkRelation, e.Rank, e.RankDate, e.RankNextDate }).ToListAsync(cancellationToken);

            // all.AddRange(rankEmployees
            //     .Where(e => !existingRankAms.Contains(e.Am))   // ← μόνο αν δεν υπάρχει ήδη
            //     .Select(e => new EmployeeChangesDto
            //     {
            //         FullName = e.LastName + " " + e.FirstName,
            //         Afm = e.Afm,
            //         Type = "2",
            //         PrevValue = e.Rank,
            //         NextValue = (int.TryParse(e.Rank, out var r) ? (r + 1).ToString() : e.Rank),
            //         ChangeDate = e.RankDate ?? default,
            //         NextChangeDate = e.RankNextDate ?? default,
            //         Notes = string.Empty,
            //         WorkRelation = e.WorkRelation,
            //     }));

            var ordered = all.OrderBy(x => x.NextChangeDate).ThenBy(x => x.FullName).ToList();

            var totalCount = ordered.Count;

            var pageItems = ordered.Skip((request.Page - 1) * request.PageSize).Take(request.PageSize).ToList();

            var paged = new PagedList<EmployeeChangesDto>(pageItems, totalCount);

            return Result<PagedList<EmployeeChangesDto>>.Success(paged);
        }
    }
}