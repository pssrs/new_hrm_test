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
    public class CreateEmployeeMove
    {
        public class Command : IRequest<Result<string>>
        {
            public required Move Move { get; set; }
        }

        public class Handler(AppDbContext context, IMapper mapper) : IRequestHandler<Command, Result<string>>
        {
            public async Task<Result<string>> Handle(Command request, CancellationToken cancellationToken)
            {
                var employee = await context.Employees.FirstOrDefaultAsync(x => x.Id == request.Move.Am, cancellationToken);

                if (employee == null) 
                {
                    return Result<string>.Failure("Employee not found", 404);
                }

                request.Move.Am = employee.Am;

                var move = mapper.Map<Move>(request.Move);
                context.Moves.Add(move);

                var result = await context.SaveChangesAsync(cancellationToken) > 0;

                if (!result) return Result<string>.Failure("Failed to create the employee move", 400);

                return Result<string>.Success(move.Id.ToString());
            }
        }
    }
}