using Application.Core;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Employees.Commands;

public class DeleteEmployeeCard
{
    public class Command : IRequest<Result<Unit>>
    {
        public required int Id { get; set; }
    }

    public class Handler(AppDbContext context) : IRequestHandler<Command, Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
        {
            using var transaction = await context.Database.BeginTransactionAsync(cancellationToken);
            try
            {
                var employee = await context.Employees
                    .FirstOrDefaultAsync(e => e.Id == request.Id, cancellationToken);

                if (employee == null)
                    return Result<Unit>.Failure("Ο υπάλληλος δεν βρέθηκε", 404);

                var am = employee.Am;

                // Διαγραφή child records (FK -> Am)
                var children = context.Children.Where(x => x.EmployeeId == am);
                var experience = context.Experience.Where(x => x.Am == am);
                var studies = context.Studies.Where(x => x.Am == am);
                var changes = context.Changes.Where(x => x.AM == am);
                var leaves = context.Leaves.Where(x => x.Am == am);
                var penalties = context.Penalties.Where(x => x.Am == am);
                var moves = context.Moves.Where(x => x.Am == am);
                var placements = context.Placements.Where(x => x.Am == am);
                var files = context.Files.Where(x => x.Am == am);

                context.Children.RemoveRange(children);
                context.Experience.RemoveRange(experience);
                context.Studies.RemoveRange(studies);
                context.Changes.RemoveRange(changes);
                context.Leaves.RemoveRange(leaves);
                context.Penalties.RemoveRange(penalties);
                context.Moves.RemoveRange(moves);
                context.Placements.RemoveRange(placements);
                context.Files.RemoveRange(files);

                context.Employees.Remove(employee);

                await context.SaveChangesAsync(cancellationToken);
                await transaction.CommitAsync(cancellationToken);

                return Result<Unit>.Success(Unit.Value);
            }
            catch
            {
                await transaction.RollbackAsync(cancellationToken);
                return Result<Unit>.Failure("Σφάλμα κατά τη διαγραφή του υπαλλήλου", 500);
            }
}
    }
}
