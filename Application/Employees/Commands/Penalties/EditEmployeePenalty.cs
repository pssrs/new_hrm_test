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
    public class EditEmployeePenalty
    {
        public class Command : IRequest<Result<string>>
        {
            public required Penalty Penalty { get; set; }
        }

        public class Handler(AppDbContext context, IMapper mapper) : IRequestHandler<Command, Result<string>>
        {
            public async Task<Result<string>> Handle(Command request, CancellationToken cancellationToken)
            {
                var penalty = await context.Penalties.FirstOrDefaultAsync(x => x.Id == request.Penalty.Id, cancellationToken);

                if (penalty == null) return Result<string>.Failure("Penalty not found", 404);

                mapper.Map(request.Penalty, penalty);
                context.Penalties.Update(penalty);

                var result = await context.SaveChangesAsync(cancellationToken) > 0;

                if (!result) return Result<string>.Success("Penalty updated successfully");

                return Result<string>.Success(penalty.Id.ToString());
            }
        }
    }
}