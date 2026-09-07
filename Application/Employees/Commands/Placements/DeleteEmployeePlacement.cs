using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Core;
using Domain;
using MediatR;

namespace Application.Employees.Commands.Placements
{
    public class DeleteEmployeePlacement
    {
        public class Command : IRequest<Result<string>>
        {
            public required int Id { get; set; }
        }

        public class Handler(AppDbContext context) : IRequestHandler<Command, Result<string>>
        {
            public async Task<Result<string>> Handle(Command request, CancellationToken cancellationToken)
            {
                var placement = await context.Placements
                    .FindAsync(request.Id, cancellationToken);

                if (placement == null) return Result<string>.Failure("Placement not found", 404);

                context.Placements.Remove(placement);

                var result = await context.SaveChangesAsync(cancellationToken) > 0;

                if (!result) return Result<string>.Failure("Failed to delete the placement", 400);

                return Result<string>.Success("Placement deleted successfully");
            }
        }
    }
}