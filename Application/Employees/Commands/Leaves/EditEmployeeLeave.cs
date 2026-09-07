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
    public class EditEmployeeLeave
    {
        public class Command : IRequest<Result<string>>
        {
            public required Leave Leave { get; set; }
        }

        public class Handler(AppDbContext context, IMapper mapper) : IRequestHandler<Command, Result<string>>
        {
            public async Task<Result<string>> Handle(Command request, CancellationToken cancellationToken)
            {
                int[] normalTypeLeaves = [20, 21, 22, 23, 24, 25, 30];

                if (request.Leave.DateFrom!.Value.Year <= DateTime.Now.Year - 2)
                    return Result<string>.Failure("Δεν έχετε τη δυνατότητα να καταχωρήσετε άδεια για το έτος αυτό", 400);

                var leave = await context.Leaves.FirstOrDefaultAsync(x => x.Id == request.Leave.Id, cancellationToken);

                if (leave == null) return Result<string>.Failure("Leave not found", 404);

                int oldYear = leave.Year;
                int oldDuration = leave.Duration;

                int newYear = request.Leave.DateFrom.HasValue ? request.Leave.DateFrom.Value.Year : oldYear;
                int newDuration = request.Leave.Duration;

                request.Leave.Year = newYear;

                if (normalTypeLeaves.Contains(leave.Type))
                {
                    var overallLeave = await context.OverallLeaves
                        .FirstOrDefaultAsync(o => o.Am == leave.Am
                            && o.Year == leave.Year
                            && (o.Type == 20 || o.Type == 21 || o.Type == 22 || o.Type == 23 || o.Type == 24 || o.Type == 25)
                            && o.Flag == 1,
                        cancellationToken);

                    if (request.Leave.Duration > overallLeave?.Balance + leave.Duration)
                        return Result<string>.Failure($"Δεν υπάρχει διαθέσιμο υπόλοιπο για το έτος {leave.Year}", 400);

                    if (overallLeave != null && leave.Year != DateTime.Now.Year && (leave.Type == 20 || leave.Type == 21 || leave.Type == 22 || leave.Type == 23 || leave.Type == 24 || leave.Type == 25))
                    {
                        overallLeave.Balance = overallLeave.Balance + leave.Duration - request.Leave.Duration;
                        context.OverallLeaves.Update(overallLeave);
                    }
                }

                mapper.Map(request.Leave, leave);

                var result = await context.SaveChangesAsync(cancellationToken) >= 0;

                if (!result) return Result<string>.Failure("Failed to update the leave", 400);

                return Result<string>.Success(leave.Id.ToString());
            }
        }
    }
}