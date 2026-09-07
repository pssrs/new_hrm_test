using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Core;
using AutoMapper;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Employees.Commands.Study
{
    public class EditEmployeeStudies
    {
        public class Command : IRequest<Result<string>>
        {
            public required Studies Studies { get; set; }
        }

        public class Handler(AppDbContext context, IMapper mapper) : IRequestHandler<Command, Result<string>>
        {
            public async Task<Result<string>> Handle(Command request, CancellationToken cancellationToken)
            {
                var studies = await context.Studies.FirstOrDefaultAsync(x => x.Id == request.Studies.Id, cancellationToken);

                if (studies == null) return Result<string>.Failure("Studies not found", 404);

                mapper.Map(request.Studies, studies);

                var result = await context.SaveChangesAsync(cancellationToken) >= 0;

                if (!result) return Result<string>.Failure("Failed to update the studies", 400);

                return Result<string>.Success(studies.Id.ToString());
            }
        }
    }
}