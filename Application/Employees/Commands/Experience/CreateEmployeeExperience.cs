using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Core;
using Application.Employees.DTOs.Experience;
using AutoMapper;
using Domain;
using MediatR;

namespace Application.Employees.Commands.Experience
{
    public class CreateEmployeeExperience
    {
        public class Command : IRequest<Result<string>>
        {
            public required EmployeeExperience Experience { get; set; }
        }

        public class Handler(AppDbContext context, IMapper mapper) : IRequestHandler<Command, Result<string>>
        {
            public async Task<Result<string>> Handle(Command request, CancellationToken cancellationToken)
            {
                var experience = mapper.Map<Domain.Experience>(request.Experience);

                context.Experience.Add(experience);

                var result = await context.SaveChangesAsync(cancellationToken) > 0;

                if (!result) return Result<string>.Failure("Failed to create the employee experience", 400);

                return Result<string>.Success(experience.Id.ToString());
            }
        }
    }
}