using Application.Core;
using Application.Employees.DTOs.Services;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Employees.Commands.Services
{
    public class EditEmployeeWorks
    {
        public class Command : IRequest<Result<Unit>>
        {
            public required EmployeeWorks EmployeeWorks { get; set; }
        }

        public class Handler(AppDbContext context) : IRequestHandler<Command, Result<Unit>>
        {
            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            {
                var employee = await context.Employees.FirstOrDefaultAsync(x => x.Am == request.EmployeeWorks.Am, cancellationToken);

                if (employee == null) return Result<Unit>.Failure("Employee not found", 404);

                employee.WorkDirectorate = request.EmployeeWorks.WorkDirectorate;
                employee.WorkSector = request.EmployeeWorks.WorkSector;
                employee.WorkDepartment = request.EmployeeWorks.WorkDepartment;
                employee.WorkOffice = request.EmployeeWorks.WorkOffice;

                var result = await context.SaveChangesAsync(cancellationToken) >= 0;

                if (!result) return Result<Unit>.Failure("Failed to update the employee", 400);

                return Result<Unit>.Success(Unit.Value);
            }
        }
    }
}