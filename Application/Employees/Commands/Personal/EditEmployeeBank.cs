using System;
using System.Linq;
using System.Threading.Tasks;
using Application.Core;
using Application.Employees.DTOs;
using Application.Employees.DTOs.Personal;
using AutoMapper;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Application.Employees.Commands.Personal
{
    public class EditEmployeeBank
    {
        public class Command : IRequest<Result<Unit>>
        {
            public required EmployeeBank EmployeeBank { get; set; }
        }

        public class Handler(AppDbContext context, IMapper mapper, ILogger<EditEmployeeBank> logger, ISybaseService sybaseService) : IRequestHandler<Command, Result<Unit>>
        {
            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            {
                var employee = await context.Employees.FirstOrDefaultAsync(x => x.Am == request.EmployeeBank.Am, cancellationToken);

                if (employee == null) return Result<Unit>.Failure("Employee not found", 404);

                var empBankCurrent = new EmployeeBank
                {
                    Am = employee.Am,
                    Iban1 = employee.Iban1,
                    Iban2 = employee.Iban2
                };

                mapper.Map(request.EmployeeBank, employee);

                var result = await context.SaveChangesAsync(cancellationToken) >= 0;

                if (!result) return Result<Unit>.Failure("Failed to update the employee", 400);

                var sybaseResult = await sybaseService.UpdateEmployeeBankAsync(employee.Afm, employee.Am, empBankCurrent, request.EmployeeBank);

                if (!sybaseResult.IsSuccess)
                {
                    logger.LogError($"\n\n\n\n\nΑποτυχία ενημέρωσης Sybase μετά την ενημέρωση τραπεζικών στοιχείων του υπαλλήλου {request.EmployeeBank.Am}: {sybaseResult.Error}\n\n\n\n");
                    return Result<Unit>.Failure($"Τα στοιχεία ενημερώθηκαν στο HRM, αλλά απέτυχε η ενημέρωση της μισθοδοσίας: {sybaseResult.Error}", sybaseResult.Code);
                }

                return Result<Unit>.Success(Unit.Value);
            }
        }
    }
}