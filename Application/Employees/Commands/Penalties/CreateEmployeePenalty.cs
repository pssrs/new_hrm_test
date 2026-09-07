using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Core;
using AutoMapper;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Employees.Commands.Penalties
{
    public class CreateEmployeePenalty
    {
        public class Command : IRequest<Result<string>>
        {
            public required Penalty Penalty { get; set; }
        }

        public class Handler(AppDbContext context, IMapper mapper) : IRequestHandler<Command, Result<string>>
        {
            public async Task<Result<string>> Handle(Command request, CancellationToken cancellationToken)
            {
                var employee = await context.Employees.FirstOrDefaultAsync(x => x.Id == request.Penalty.Am, cancellationToken);

                if (employee == null) return Result<string>.Failure("Employee not found", 404);

                request.Penalty.Am = employee.Am;

                var penalty = mapper.Map<Penalty>(request.Penalty);
                context.Penalties.Add(penalty);

                var result = await context.SaveChangesAsync(cancellationToken) > 0;

                if (!result) return Result<string>.Failure("Failed to create the employee penalty", 400);

                return Result<string>.Success(penalty.Id.ToString());
            }
        }
    }
}