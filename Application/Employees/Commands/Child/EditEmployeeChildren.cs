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
    public class EditEmployeeChildren
    {
        public class Command : IRequest<Result<string>>
        {
            public required Children Children { get; set; }
        }

        public class Handler(AppDbContext context, IMapper mapper, ISybaseService sybaseService, ILogger<EditEmployeeChildren> logger) : IRequestHandler<Command, Result<string>>
        {
            public async Task<Result<string>> Handle(Command request, CancellationToken cancellationToken)
            {
                var children = await context.Children.FirstOrDefaultAsync(x => x.Id == request.Children.Id, cancellationToken);

                if (children == null) 
                {
                    Console.WriteLine("\n\n\n\nChildren not found\n\n\n\n");
                    return Result<string>.Failure("Children not found", 404);
                }

                mapper.Map(request.Children, children);

                var result = await context.SaveChangesAsync(cancellationToken) >= 0;

                if (!result) { 
                    Console.WriteLine("\n\n\nFailed to create the employee children\n\n\n");
                    return Result<string>.Failure("Failed to create the employee children", 400); 
                }

                
                var employee = await context.Employees.FirstOrDefaultAsync(x => x.Am == request.Children.EmployeeId, cancellationToken);
                if (employee == null)
                {
                    Console.WriteLine("\n\n\n\nEmployee not found\n\n\n\n");
                    return Result<string>.Failure("nEmployee not found", 404);
                }

                var childrenCount = await context.Children.CountAsync(c => c.EmployeeId == employee.Am && c.ChildFlag == 1);
                var sybaseResult = await sybaseService.UpdateEmployeeChildrenAsync(employee.Afm, employee.Am, childrenCount);

                if (!sybaseResult.IsSuccess)
                {
                    logger.LogError($"\n\n\n\n\nΑποτυχία ενημέρωσης Sybase μετά την ενημέρωση στοιχείων του υπαλλήλου {employee.Am}: {sybaseResult.Error}\n\n\n\n");
                    return Result<string>.Failure($"Τα στοιχεία ενημερώθηκαν στο HRM, αλλά απέτυχε η ενημέρωση της μισθοδοσίας: {sybaseResult.Error}", sybaseResult.Code);
                }

                return Result<string>.Success(children.Id.ToString());
            }
        }
    }
}