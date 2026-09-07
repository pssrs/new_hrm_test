using Application.Core;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Employees.Commands.Files
{
    public class EditEmployeeFile
    {
        public class Command : IRequest<Result<string>>
        {
            public required Domain.File File { get; set; }
        }

        public class Handler(AppDbContext context) : IRequestHandler<Command, Result<string>>
        {
            public async Task<Result<string>> Handle(Command request, CancellationToken cancellationToken)
            {
                var file = await context.Files.FirstOrDefaultAsync(x => x.Id == request.File.Id, cancellationToken);

                if (file == null) return Result<string>.Failure("File not found", 404);

                file.Type = request.File.Type;
                file.Name = request.File.Name;
                file.Location = request.File.Location;

                var result = await context.SaveChangesAsync(cancellationToken) > 0;

                if (!result) return Result<string>.Failure("Failed to update the file", 400);

                return Result<string>.Success(file.Id.ToString());
            }
        }
    }
}