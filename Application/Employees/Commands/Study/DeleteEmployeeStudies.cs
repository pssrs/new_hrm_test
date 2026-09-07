using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Core;
using Domain;
using MediatR;

namespace Application.Employees.Commands.Study
{
    public class DeleteEmployeeStudies
    {
        public class Command : IRequest<Result<string>>
        {
            public required int Id { get; set; }
        }

        public class Handler(AppDbContext context) : IRequestHandler<Command, Result<string>>
        {
            public async Task<Result<string>> Handle(Command request, CancellationToken cancellationToken)
            {
                var study = await context.Studies
                    .FindAsync(request.Id, cancellationToken);

                if (study == null) return Result<string>.Failure("Study not found", 404);

                context.Studies.Remove(study);

                var result = await context.SaveChangesAsync(cancellationToken) > 0;

                if (!result) return Result<string>.Failure("Failed to delete the study", 400);

                return Result<string>.Success("Study deleted successfully");
            }
        }
    }
}