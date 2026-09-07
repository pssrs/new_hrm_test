using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Core;
using Application.Employees.DTOs.Personal;
using AutoMapper;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Employees.Commands.Personal
{
    public class EditEmployeeInfo
    {
        public class Command : IRequest<Result<Unit>>
        {
            public required EmployeeInfo EmployeeInfo { get; set; }
        }

        public class Handler(AppDbContext context, IMapper mapper, ISybaseService sybaseService) : IRequestHandler<Command, Result<Unit>>
        {
            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            {
                var employee = await context.Employees.FirstOrDefaultAsync(x => x.Am == request.EmployeeInfo.Am, cancellationToken);

                if (employee == null) return Result<Unit>.Failure("Employee not found", 404);

                var empInfoCurrent = new EmployeeInfo
                {
                    Am = employee.Am,
                    Address = employee.Address,
                    City = employee.City,
                    PostCode = employee.PostCode,
                    Phone = employee.Phone,
                    Email = employee.Email
                };

                mapper.Map(request.EmployeeInfo, employee);

                var result = await context.SaveChangesAsync(cancellationToken) >= 0;

                if (!result) return Result<Unit>.Failure("Failed to update the employee", 400);

                var sybaseResult = await sybaseService.UpdateEmployeeInfoAsync(employee.Afm, employee.Am, empInfoCurrent, request.EmployeeInfo);

                if (!sybaseResult.IsSuccess)
                {
                    Console.WriteLine($"\n\n\n\n\nΑποτυχία ενημέρωσης Sybase μετά την ενημέρωση στοιχείων επικοινωνίας του υπαλλήλου {request.EmployeeInfo.Am}: {sybaseResult.Error}\n\n\n\n");
                    return Result<Unit>.Failure($"Τα στοιχεία ενημερώθηκαν στο HRM, αλλά απέτυχε η ενημέρωση της μισθοδοσίας: {sybaseResult.Error}", sybaseResult.Code);
                }

                return Result<Unit>.Success(Unit.Value);
            }
        }
    }
}