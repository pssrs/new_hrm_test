using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Core;
using Domain;
using MediatR;

namespace Application.Employees.Commands.Experience
{
    public class DeleteEmployeeExperience
    {
        public class Command : IRequest<Result<string>>
        {
            public required int Id { get; set; }
        }

        public class Handler(AppDbContext context) : IRequestHandler<Command, Result<string>>
        {
            public async Task<Result<string>> Handle(Command request, CancellationToken cancellationToken)
            {
                var experience = await context.Experience
                    .FindAsync(request.Id, cancellationToken);

                if (experience == null) return Result<string>.Failure("Experience not found", 404);

                context.Experience.Remove(experience);

                var result = await context.SaveChangesAsync(cancellationToken) > 0;

                if (!result) return Result<string>.Failure("Failed to delete the experience", 400);

                return Result<string>.Success("Experience deleted successfully");
            }
        }
    }
}