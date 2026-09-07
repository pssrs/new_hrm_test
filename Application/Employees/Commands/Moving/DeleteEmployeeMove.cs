using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Core;
using Domain;
using MediatR;

namespace Application.Employees.Commands.Moving
{
    public class DeleteEmployeeMove
    {
        public class Command : IRequest<Result<string>>
        {
            public required int Id { get; set; }
        }

        public class Handler(AppDbContext context) : IRequestHandler<Command, Result<string>>
        {
            public async Task<Result<string>> Handle(Command request, CancellationToken cancellationToken)
            {
                var move = await context.Moves
                    .FindAsync(request.Id, cancellationToken);

                if (move == null) return Result<string>.Failure("Move not found", 404);

                context.Moves.Remove(move);

                var result = await context.SaveChangesAsync(cancellationToken) > 0;

                if (!result) return Result<string>.Failure("Failed to delete the move", 400);

                return Result<string>.Success("Move deleted successfully");
            }
        }
    }
}