
using Application.Core;
using AutoMapper;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Employees.Commands.Study
{
    public class CreateEmployeeStudies
    {
        public class Command : IRequest<Result<string>>
        {
            public required Studies Studies { get; set; }
        }

        public class Handler(AppDbContext context, IMapper mapper) : IRequestHandler<Command, Result<string>>
        {
            public async Task<Result<string>> Handle(Command request, CancellationToken cancellationToken)
            {
                var employee = await context.Employees.FirstOrDefaultAsync(x => x.Id == request.Studies.Am, cancellationToken);

                if (employee == null) 
                {
                    return Result<string>.Failure("Employee not found", 404);
                }

                request.Studies.Am = employee.Am;

                var studies = mapper.Map<Studies>(request.Studies);

                context.Studies.Add(studies);

                var result = await context.SaveChangesAsync(cancellationToken) > 0;

                if (!result) return Result<string>.Failure("Failed to create the employee studies", 400);

                return Result<string>.Success(studies.Id.ToString());
            }
        }
    }
}