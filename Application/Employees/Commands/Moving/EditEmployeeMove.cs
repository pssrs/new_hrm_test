using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Core;
using AutoMapper;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Employees.Commands.Moving
{
    public class EditEmployeeMove
    {
        public class Command : IRequest<Result<string>>
        {
            public required Move Move { get; set; }
        }

        public class Handler(AppDbContext context, IMapper mapper) : IRequestHandler<Command, Result<string>>
        {
            public async Task<Result<string>> Handle(Command request, CancellationToken cancellationToken)
            {
                var move = await context.Moves.FirstOrDefaultAsync(x => x.Id == request.Move.Id, cancellationToken);

                if (move == null) 
                {
                    return Result<string>.Failure("Move not found", 404);
                }

                mapper.Map(request.Move, move);
                context.Moves.Update(move);

                var result = await context.SaveChangesAsync(cancellationToken) > 0;

                if (!result) 
                {
                    return Result<string>.Failure("Failed to update the move", 400);
                }

                return Result<string>.Success(move.Id.ToString());
            }
        }
    }
}