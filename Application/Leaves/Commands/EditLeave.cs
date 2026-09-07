using System;
using Application.Core;
using AutoMapper;
using Domain;
using MediatR;

namespace Application.Leaves.Commands;

public class EditLeave
{
    public class Command : IRequest<Result<Unit>>
    {
        public required Leave leave { get; set; }
    }

    public class Handler(AppDbContext context, IMapper mapper) : IRequestHandler<Command, Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
        {
            var leave = await context.Leaves
                .FindAsync(request.leave.Id, cancellationToken);

            if (leave == null) return Result<Unit>.Failure("Leave not found", 404);

            mapper.Map(request.leave, leave);

            var result = await context.SaveChangesAsync(cancellationToken) >= 0;

            if (!result) return Result<Unit>.Failure("Failed to update the leave", 400);

            return Result<Unit>.Success(Unit.Value);
        }
    }
}
