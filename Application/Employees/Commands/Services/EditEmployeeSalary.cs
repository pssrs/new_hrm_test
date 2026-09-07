using Application.Core;
using Application.Employees.DTOs;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace Application.Employees.Commands.Services
{
    public class EditEmployeeSalary
    {
        public class Command : IRequest<Result<Unit>>
        {
            public required EmployeeSalary EmployeeSalary { get; set; }
        }

        public class Handler(AppDbContext context, IEmployeeChangesService employeeChangesService, IHttpContextAccessor httpContextAccessor) : IRequestHandler<Command, Result<Unit>>
        {
            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            {
                var currentUser = httpContextAccessor.HttpContext?.User.FindFirst("userName")?.Value ?? "system";

                var employee = await context.Employees.FirstOrDefaultAsync(x => x.Am == request.EmployeeSalary.Am, cancellationToken);

                if (employee == null) return Result<Unit>.Failure("Employee not found", 404);

                var has_change = employee.MK != request.EmployeeSalary.MK;
                var old_mk = employee.MK;

                employee.MK = request.EmployeeSalary.MK;
                if (request.EmployeeSalary.MKDate.HasValue)
                    employee.MKDate = request.EmployeeSalary.MKDate.Value;
                if (request.EmployeeSalary.MKNextDate.HasValue)
                    employee.MKNextDate = request.EmployeeSalary.MKNextDate.Value;
                employee.SalaryCode = request.EmployeeSalary.SalaryCode;

                var result = await context.SaveChangesAsync(cancellationToken) >= 0;

                if (!result) return Result<Unit>.Failure("Failed to update the employee", 400);

                if(has_change)
                    await employeeChangesService.CreateEmployeeChange(employee.Am, 1, request.EmployeeSalary.MK, request.EmployeeSalary.MK + 1, request.EmployeeSalary.MKDate ?? new DateOnly(1900, 1, 1), request.EmployeeSalary.MKNextDate ?? new DateOnly(1900, 1, 1));

                return Result<Unit>.Success(Unit.Value);
            }
        }
    }
}