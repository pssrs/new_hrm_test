using Application.Core;
using Application.Employees.DTOs.Services;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Employees.Commands.Services
{
    public class EditEmployeeBelongs
    {
        public class Command : IRequest<Result<Unit>>
        {
            public required EmployeeBelongs EmployeeBelongs { get; set; }
        }

        public class Handler(AppDbContext context) : IRequestHandler<Command, Result<Unit>>
        {
            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            {
                var employee = await context.Employees.FirstOrDefaultAsync(x => x.Am == request.EmployeeBelongs.Am, cancellationToken);

                if (employee == null) return Result<Unit>.Failure("Employee not found", 404);

                employee.Directorate = request.EmployeeBelongs.Directorate;
                employee.Sector = request.EmployeeBelongs.Sector;
                employee.Department = request.EmployeeBelongs.Department;
                employee.Office = request.EmployeeBelongs.Office;

                var result = await context.SaveChangesAsync(cancellationToken) >= 0;

                if (!result) return Result<Unit>.Failure("Failed to update the employee", 400);

                return Result<Unit>.Success(Unit.Value);
            }
        }
    }
}