using Application.Core;
using Application.DTOs.Employee;
using AutoMapper;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Employees.Commands;

public class CreateEmployeeData
{
    public class Command : IRequest<Result<string>>
    {
        public required EmployeeCard EmployeeCard { get; set; }
    }

    public class Handler(AppDbContext context, IMapper mapper) : IRequestHandler<Command, Result<string>>
    {
        public async Task<Result<string>> Handle(Command request, CancellationToken cancellationToken)
        {
            var employee = mapper.Map<Employee>(request.EmployeeCard);

            // Generate next Am (has UNIQUE constraint)
            var maxAm = await context.Employees.AnyAsync(cancellationToken) 
                ? await context.Employees.MaxAsync(e => e.Am, cancellationToken) 
                : 0;

            employee.Id = 0; // Let the database auto-increment
            employee.Am = maxAm + 1;

            context.Employees.Add(employee);

            var result = await context.SaveChangesAsync(cancellationToken) > 0;

            if (!result) return Result<string>.Failure("Failed to create the employee", 400);

            return Result<string>.Success(employee.Id.ToString());
        }
    }
}
