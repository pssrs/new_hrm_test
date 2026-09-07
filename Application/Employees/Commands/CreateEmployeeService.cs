using System;
using Application.Core;
using Application.DTOs.Employee;
using AutoMapper;
using Domain;
using MediatR;

namespace Application.Employees.Commands;

public class CreateEmployeeService
{
    public class Command : IRequest<Result<Unit>>
    {
        public required EmployeeService EmployeeService { get; set; }
    }

    public class Handler(AppDbContext context, IMapper mapper) : IRequestHandler<Command, Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
        {
            var employee = await context.Employees
                .FindAsync(request.EmployeeService.Id, cancellationToken);
                
            if (employee == null) return Result<Unit>.Failure("Employee not found", 404);

            mapper.Map(request.EmployeeService, employee);

            var result = await context.SaveChangesAsync(cancellationToken) >= 0;

            if (!result) return Result<Unit>.Failure("Failed to update employee service info", 400);

            return Result<Unit>.Success(Unit.Value);
        }
    }
}
