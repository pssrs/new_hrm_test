using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Core;
using AutoMapper;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Employees.Commands.Leaves
{
    public class CreateEmployeeLeave
    {
        public class Command : IRequest<Result<string>>
        {
            public required Leave Leave { get; set; }
        }

        public class Handler(AppDbContext context, IMapper mapper) : IRequestHandler<Command, Result<string>>
        {
            public async Task<Result<string>> Handle(Command request, CancellationToken cancellationToken)
            {
                var allowedYears = new[] { 87, 95, 12, 86, 11, 76, 13, 18, 9 };
                var isAllowedYears = allowedYears.Contains(request.Leave.Type);
                // Κανονικές άδειες (20-25/30) επιτρέπεται να καταχωρηθούν και για το επόμενο έτος
                // (χρήση του μεταφερόμενου υπολοίπου), κάθε άλλος τύπος μόνο για το τρέχον έτος.
                var maxAllowedYear = isAllowedYears ? DateTime.Now.Year + 1 : DateTime.Now.Year;

                if(request.Leave.DateFrom!.Value.Year <= DateTime.Now.Year - 2)
                    return Result<string>.Failure("Δεν έχετε τη δυνατότητα να καταχωρήσετε άδεια για το έτος αυτό", 400);

                // if((request.Leave.DateFrom!.Value.Year > maxAllowedYear) || (request.Leave.DateTo!.Value.Year > maxAllowedYear))
                //     return Result<string>.Failure("Δεν έχετε τη δυνατότητα να καταχωρήσετε άδεια για το έτος " + request.Leave.DateFrom!.Value.Year, 400);

                var employee = await context.Employees.FirstOrDefaultAsync(x => x.Id == request.Leave.Am, cancellationToken);
                if (employee == null) return Result<string>.Failure("Employee not found", 404);
                request.Leave.Am = employee.Am;

                int targetYear = request.Leave.DateFrom!.Value.Year;

                var overallLeave = await context.OverallLeaves
                    .FirstOrDefaultAsync(o => o.Am == employee.Am
                        && o.Year == DateTime.Now.Year
                        && allowedYears.Contains(o.Type)
                        && o.Flag == 1,
                    cancellationToken);

                if (targetYear != DateTime.Now.Year && request.Leave.Duration > overallLeave?.Balance)
                    return Result<string>.Failure($"Δεν υπάρχει διαθέσιμο υπόλοιπο για το έτος {targetYear}", 400);

                var usedDays = await context.Leaves
                    .Where(l => l.Am == employee.Am 
                            && l.Type == request.Leave.Type 
                            && l.State == 1
                            && l.DateFrom!.Value.Year == DateTime.Now.Year)
                    .SumAsync(l => (int?)l.Duration, cancellationToken) ?? 0;

                var leave = mapper.Map<Leave>(request.Leave);
                leave.Year = targetYear;
                context.Leaves.Add(leave);
                
                var ov_leaves = await context.OverallLeaves
                    .FirstOrDefaultAsync(o => o.Am == employee.Am
                        && o.Year == DateTime.Now.Year
                        && allowedYears.Contains(o.Type)
                        && o.Flag == 1,
                    cancellationToken);

                if (ov_leaves != null && leave.Year != DateTime.Now.Year && allowedYears.Contains(leave.Type))
                {
                    ov_leaves.Balance -= leave.Duration;
                    context.OverallLeaves.Update(ov_leaves);
                }
                
                var result = await context.SaveChangesAsync(cancellationToken) > 0;

                if (!result) return Result<string>.Failure("Failed to create the employee leave", 400);

                return Result<string>.Success(leave.Id.ToString());
            }
        }
    }
}