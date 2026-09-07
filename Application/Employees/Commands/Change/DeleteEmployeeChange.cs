using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Core;
using Domain;
using MediatR;

namespace Application.Employees.Commands.Change
{
    public class DeleteEmployeeChange
    {
        public class Command : IRequest<Result<string>>
        {
            public required int Id { get; set; }
        }

        public class Handler(AppDbContext context) : IRequestHandler<Command, Result<string>>
        {
            public async Task<Result<string>> Handle(Command request, CancellationToken cancellationToken)
            {
                var change = await context.Changes.FindAsync(request.Id, cancellationToken);

                if (change == null) return Result<string>.Failure("Change not found", 404);

                context.Changes.Remove(change);

                var result = await context.SaveChangesAsync(cancellationToken) > 0;

                if (!result) return Result<string>.Failure("Failed to delete the change", 400);

                return Result<string>.Success("Change deleted successfully");
            }
        }
    }
}