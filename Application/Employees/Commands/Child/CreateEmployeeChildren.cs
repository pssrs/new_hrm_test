using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Core;
using AutoMapper;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Application.Employees.Commands.Child
{
    public class CreateEmployeeChildren
    {
        public class Command : IRequest<Result<string>>
        {
            public required Children Children { get; set; }
        }

        public class Handler(AppDbContext context, IMapper mapper, ISybaseService sybaseService, ILogger<CreateEmployeeChildren> logger) : IRequestHandler<Command, Result<string>>
        {
            public async Task<Result<string>> Handle(Command request, CancellationToken cancellationToken)
            {
                var employee = await context.Employees.FirstOrDefaultAsync(x => x.Id == request.Children.EmployeeId, cancellationToken);

                if (employee == null) return Result<string>.Failure("Employee not found", 404);

                request.Children.EmployeeId = employee.Am;

                var children = mapper.Map<Domain.Children>(request.Children);

                context.Children.Add(children);

                var result = await context.SaveChangesAsync(cancellationToken) > 0;

                if (!result) { 
                    Console.WriteLine("Failed to create the employee children");
                    return Result<string>.Failure("Failed to create the employee children", 400); 
                }

                var childrenCount = await context.Children.CountAsync(c => c.EmployeeId == employee.Am && c.ChildFlag == 1);
                var sybaseResult = await sybaseService.UpdateEmployeeChildrenAsync(employee.Afm, employee.Am, childrenCount);

                if (!sybaseResult.IsSuccess)
                {
                    logger.LogError($"\n\n\n\n\nΑποτυχία ενημέρωσης Sybase μετά την ενημέρωση στοιχείων του υπαλλήλου {request.Children.EmployeeId}: {sybaseResult.Error}\n\n\n\n");
                    return Result<string>.Failure($"Τα στοιχεία ενημερώθηκαν στο HRM, αλλά απέτυχε η ενημέρωση της μισθοδοσίας: {sybaseResult.Error}", sybaseResult.Code);
                }

                return Result<string>.Success(children.Id.ToString());
            }
        }
    }
}