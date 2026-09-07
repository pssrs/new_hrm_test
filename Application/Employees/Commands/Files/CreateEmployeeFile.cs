using Application.Core;
using AutoMapper;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Employees.Commands.Files
{
    public class CreateEmployeeFile
    {
        public class Command : IRequest<Result<string>>
        {
            public required Domain.File File { get; set; }
        }

        public class Handler(AppDbContext context, IMapper mapper) : IRequestHandler<Command, Result<string>>
        {
            public async Task<Result<string>> Handle(Command request, CancellationToken cancellationToken)
            {
                var employee = await context.Employees.FirstOrDefaultAsync(x => x.Id == request.File.Am, cancellationToken);

                if (employee == null) return Result<string>.Failure("Employee not found", 404);

                request.File.Am = employee.Am;

                var file = mapper.Map<Domain.File>(request.File);

                context.Files.Add(file);

                var result = await context.SaveChangesAsync(cancellationToken) > 0;

                if (!result) return Result<string>.Failure("Failed to create the employee file", 400);

                return Result<string>.Success(file.Id.ToString());
            }
        }
    }
}