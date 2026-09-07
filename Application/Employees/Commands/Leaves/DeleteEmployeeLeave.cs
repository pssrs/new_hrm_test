using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Core;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Employees.Commands.Leaves
{
    public class DeleteEmployeeLeave
    {
        public class Command : IRequest<Result<string>>
        {
            public required int Id { get; set; }
        }

        public class Handler(AppDbContext context) : IRequestHandler<Command, Result<string>>
        {
            public async Task<Result<string>> Handle(Command request, CancellationToken cancellationToken)
            {
                var leave = await context.Leaves.FindAsync(request.Id, cancellationToken);

                if (leave == null) return Result<string>.Failure("Leave not found", 404);

                if(leave.Year != DateTime.Now.Year && (leave.Type == 20 || leave.Type == 21 || leave.Type == 22 || leave.Type == 23 || leave.Type == 24 || leave.Type == 25))
                {
                    var ov_leaves = await context.OverallLeaves
                        .FirstOrDefaultAsync(o => o.Am == leave.Am
                            && o.Year == DateTime.Now.Year
                            && (o.Type == 20 || o.Type == 21 || o.Type == 22 || o.Type == 23 || o.Type == 24 || o.Type == 25)
                            && o.Flag == 1, 
                        cancellationToken);

                    if (ov_leaves != null)
                    {
                        ov_leaves.Balance += leave.Duration;
                        context.OverallLeaves.Update(ov_leaves);
                    }
                }

                context.Leaves.Remove(leave);

                var result = await context.SaveChangesAsync(cancellationToken) > 0;

                if (!result) return Result<string>.Failure("Failed to delete the leave", 400);

                return Result<string>.Success("Leave deleted successfully");
            }
        }
    }
}