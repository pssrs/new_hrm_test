using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Core;
using Application.Employees.DTOs;
using Application.Employees.DTOs.Personal;
using AutoMapper;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Employees.Commands.Personal
{
    public class EditEmployeeIdentity
    {
        public class Command : IRequest<Result<Unit>>
        {
            public required EmployeeIdentity EmployeeIdentity { get; set; }
        }

        public class Handler(AppDbContext context, IMapper mapper, ISybaseService sybaseService) : IRequestHandler<Command, Result<Unit>>
        {
            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            {
                var employee = await context.Employees.FirstOrDefaultAsync(x => x.Am == request.EmployeeIdentity.Am, cancellationToken);

                if (employee == null) return Result<Unit>.Failure("Employee not found", 404);

                var empIdentityCurrent = new EmployeeIdentity
                {
                    Am = employee.Am,
                    Citizenship = employee.Citizenship,
                    Nationality = employee.Nationality,
                    IdentityCardNumber = employee.IdentityCardNumber,
                    IdentityCardIssueDate = employee.IdentityCardIssueDate?.ToString("yyyy-MM-dd") ?? ""
                };

                mapper.Map(request.EmployeeIdentity, employee);

                var result = await context.SaveChangesAsync(cancellationToken) >= 0;

                if (!result) return Result<Unit>.Failure("Failed to update the employee", 400);

                var sybaseResult = await sybaseService.UpdateEmployeeIdentityAsync(employee.Afm, employee.Am, empIdentityCurrent, request.EmployeeIdentity);

                if (!sybaseResult.IsSuccess)
                {
                    Console.WriteLine($"\n\n\n\n\nΑποτυχία ενημέρωσης Sybase μετά την ενημέρωση στοιχείων ταυτότητας του υπαλλήλου {request.EmployeeIdentity.Am}: {sybaseResult.Error}\n\n\n\n");
                    return Result<Unit>.Failure($"Τα στοιχεία ενημερώθηκαν στο HRM, αλλά απέτυχε η ενημέρωση της μισθοδοσίας: {sybaseResult.Error}", sybaseResult.Code);
                }

                return Result<Unit>.Success(Unit.Value);
            }
        }
    }
}