using Application.Core;
using Domain;
using MediatR;

namespace Application.Employees.Commands;

public class DeleteEmployeeCard
{
    public class Command : IRequest<Result<Unit>>
    {
        public required int Id { get; set; }
    }

    public class Handler(AppDbContext context) : IRequestHandler<Command, Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
        {
            var employee = await context.Employees
                .FindAsync(request.Id, cancellationToken);

            if (employee == null) return Result<Unit>.Failure("Employee not found", 404);

            context.Employees.Remove(employee);

            var result = await context.SaveChangesAsync(cancellationToken) > 0;

            if (!result) return Result<Unit>.Failure("Failed to delete the employee", 400);

            return Result<Unit>.Success(Unit.Value);
        }
    }
}
