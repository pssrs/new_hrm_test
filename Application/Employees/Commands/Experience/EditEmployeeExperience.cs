using Application.Core;
using AutoMapper;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Application.Employees.DTOs.Experience;

namespace Application.Employees.Commands.Experience
{
    public class EditEmployeeExperience
    {
        public class Command : IRequest<Result<string>>
        {
            public required EmployeeExperience Experience { get; set; }
        }

        public class Handler(AppDbContext context, IMapper mapper) : IRequestHandler<Command, Result<string>>
        {
            public async Task<Result<string>> Handle(Command request, CancellationToken cancellationToken)
            {
                var experience = await context.Experience.FirstOrDefaultAsync(x => x.Id == request.Experience.Id, cancellationToken);

                if (experience == null) return Result<string>.Failure("Experience not found", 404);

                mapper.Map(request.Experience, experience);

                var result = await context.SaveChangesAsync(cancellationToken) >= 0;

                if (!result) return Result<string>.Failure("Failed to update the experience", 400);

                return Result<string>.Success(experience.Id.ToString());
            }
        }
    }
}