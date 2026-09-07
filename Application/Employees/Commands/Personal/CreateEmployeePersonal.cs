using Application.Core;
using Application.Employees.DTOs.Personal;
using AutoMapper;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Employees.Commands.Personal
{
    public class CreateEmployeePersonal
    {
        public class Command : IRequest<Result<Unit>>
        {
            public required EmployeePersonal EmployeePersonal { get; set; }
        }

        public class Handler(AppDbContext context, IMapper mapper) : IRequestHandler<Command, Result<Unit>>
        {
            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            {
                var employee = await context.Employees.FirstOrDefaultAsync(x => x.Am == request.EmployeePersonal.Am, cancellationToken);

                if (employee == null) return Result<Unit>.Failure("Employee not found", 404);

                mapper.Map(request.EmployeePersonal, employee);

                var result = await context.SaveChangesAsync(cancellationToken) >= 0;

                if (!result) return Result<Unit>.Failure("Failed to update the employee", 400);

                return Result<Unit>.Success(Unit.Value);
            }
        }
    }
}
