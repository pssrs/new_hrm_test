using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Core;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using Microsoft.Extensions.Logging;

namespace Application.Employees.Commands.Child
{
    public class DeleteEmployeeChildren
    {
        public class Command : IRequest<Result<string>>
        {
            public required int Id { get; set; }
        }

        public class Handler(AppDbContext context, ISybaseService sybaseService, ILogger<DeleteEmployeeChildren> logger) : IRequestHandler<Command, Result<string>>
        {
            public async Task<Result<string>> Handle(Command request, CancellationToken cancellationToken)
            {
                var child = await context.Children
                    .FindAsync(request.Id, cancellationToken);

                if (child == null) return Result<string>.Failure("Child not found", 404);

                context.Children.Remove(child);

                var result = await context.SaveChangesAsync(cancellationToken) > 0;

                var employee = await context.Employees.FirstOrDefaultAsync(x => x.Am == child.EmployeeId, cancellationToken);
                if (employee == null) return Result<string>.Failure("Employee not found", 404);

                if (!result) return Result<string>.Failure("Failed to delete the child", 400);
                
                var childrenCount = await context.Children.CountAsync(c => c.EmployeeId == employee.Am && c.ChildFlag == 1);
                var sybaseResult = await sybaseService.UpdateEmployeeChildrenAsync(employee.Afm, employee.Am, childrenCount);

                if (!sybaseResult.IsSuccess)
                {
                    logger.LogError($"\n\n\n\n\nΑποτυχία ενημέρωσης Sybase μετά την ενημέρωση στοιχείων του υπαλλήλου {employee.Am}: {sybaseResult.Error}\n\n\n\n");
                    return Result<string>.Failure($"Τα στοιχεία ενημερώθηκαν στο HRM, αλλά απέτυχε η ενημέρωση της μισθοδοσίας: {sybaseResult.Error}", sybaseResult.Code);
                }

                return Result<string>.Success("Child deleted successfully");
            }
        }
    }
}