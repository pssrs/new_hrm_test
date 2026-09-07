using Application.Core;
using Domain;
using MediatR;

namespace Application.Leaves.Commands;

public class CreateLeave
{
    public class Command : IRequest<Result<string>>
    {
        public required Leave Leave { get; set; }
    }

    public class Handler(AppDbContext context) : IRequestHandler<Command, Result<string>>
    {
        public async Task<Result<string>> Handle(Command request, CancellationToken cancellationToken)
        {
            var leave = request.Leave;
            leave.Id = 0; // Ensure auto-increment

            context.Leaves.Add(leave);

            var result = await context.SaveChangesAsync(cancellationToken) > 0;

            if (!result) return Result<string>.Failure("Failed to create the leave", 400);

            return Result<string>.Success(leave.Id.ToString());
        }
    }
}
