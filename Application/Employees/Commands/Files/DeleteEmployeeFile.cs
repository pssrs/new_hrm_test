using Application.Core;
using Domain;
using MediatR;

namespace Application.Employees.Commands.Files
{
    public class DeleteEmployeeFile
    {
        public class Command : IRequest<Result<string>>
        {
            public required int Id { get; set; }
        }

        public class Handler(AppDbContext context) : IRequestHandler<Command, Result<string>>
        {
            public async Task<Result<string>> Handle(Command request, CancellationToken cancellationToken)
            {
                var file = await context.Files
                    .FindAsync(request.Id, cancellationToken);

                if (file == null) return Result<string>.Failure("File not found", 404);

                context.Files.Remove(file);

                var result = await context.SaveChangesAsync(cancellationToken) > 0;

                if (!result) return Result<string>.Failure("Failed to delete the file", 400);

                return Result<string>.Success("File deleted successfully");
            }
        }
    }
}