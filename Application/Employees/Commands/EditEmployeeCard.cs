using Application.Core;
using Application.DTOs.Employee;
using AutoMapper;
using Domain;
using MediatR;
using Persistence;

namespace Application.Activities.Commands;

public class EditEmployeeCard
{
    public class Command : IRequest<Result<Unit>>
    {
        public required EmployeeCard EmployeeCard { get; set; }
    }

    public class Handler(AppDbContext context, IMapper mapper) : IRequestHandler<Command, Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
        {
            var activity = await context.Employees
                .FindAsync(request.EmployeeCard.Id, cancellationToken);
                
            if (activity == null) return Result<Unit>.Failure("Employee not found", 404);

            mapper.Map(request.EmployeeCard, activity);

            var result = await context.SaveChangesAsync(cancellationToken) >= 0;

            if (!result) return Result<Unit>.Failure("Failed to update the employee", 400);

            return Result<Unit>.Success(Unit.Value);
        }
    }
}
