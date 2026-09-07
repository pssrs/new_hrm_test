using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Core;
using Domain;
using MediatR;

namespace Application.Employees.Commands.Penalties
{
    public class DeleteEmployeePenalty
    {
        public class Command : IRequest<Result<string>>
        {
            public required int Id { get; set; }
        }

        public class Handler(AppDbContext context) : IRequestHandler<Command, Result<string>>
        {
            public async Task<Result<string>> Handle(Command request, CancellationToken cancellationToken)
            {
                var penalty = await context.Penalties
                    .FindAsync(request.Id, cancellationToken);

                if (penalty == null) return Result<string>.Failure("Penalty not found", 404);

                context.Penalties.Remove(penalty);

                var result = await context.SaveChangesAsync(cancellationToken) > 0;

                if (!result) return Result<string>.Failure("Failed to delete the penalty", 400);

                return Result<string>.Success("Penalty deleted successfully");
            }
        }
    }
}