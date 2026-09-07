using Application.Core;
using Application.Employees.DTOs.Services;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Employees.Commands.Services
{
    public class EditEmployeePositionInfo
    {
        public class Command : IRequest<Result<Unit>>
        {
            public required EmployeePositionInfo EmployeePositionInfo { get; set; }
        }

        public class Handler(AppDbContext context, ISybaseService sybaseService) : IRequestHandler<Command, Result<Unit>>
        {
            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            {
                var employee = await context.Employees.FirstOrDefaultAsync(x => x.Am == request.EmployeePositionInfo.Am, cancellationToken);

                if (employee == null) return Result<Unit>.Failure("Employee not found", 404);

                var empPositionInfoCurrent = new EmployeePositionInfo
                {
                    Am = employee.Am,
                    Fek = employee.Fek,
                    HireDate = employee.HireDate,
                    Position = employee.Position,
                    EmploymentType = employee.EmploymentType
                };

                if (request.EmployeePositionInfo.HireDate.HasValue)
                    employee.HireDate = request.EmployeePositionInfo.HireDate.Value;
                employee.Position = request.EmployeePositionInfo.Position;
                employee.EmploymentType = request.EmployeePositionInfo.EmploymentType;
                employee.Fek = request.EmployeePositionInfo.Fek;

                var result = await context.SaveChangesAsync(cancellationToken) >= 0;

                if (!result) return Result<Unit>.Failure("Failed to update the employee", 400);

                var sybaseResult = await sybaseService.UpdateEmployeePositionInfoAsync(employee.Afm, employee.Am, empPositionInfoCurrent, request.EmployeePositionInfo);

                if (!sybaseResult.IsSuccess)
                {
                    Console.WriteLine($"\n\n\n\n\nΑποτυχία ενημέρωσης Sybase μετά την ενημέρωση θέσης του υπαλλήλου {request.EmployeePositionInfo.Am}: {sybaseResult.Error}\n\n\n\n");
                    return Result<Unit>.Failure($"Τα στοιχεία ενημερώθηκαν στο HRM, αλλά απέτυχε η ενημέρωση της μισθοδοσίας: {sybaseResult.Error}", sybaseResult.Code);
                }

                return Result<Unit>.Success(Unit.Value);
            }
        }
    }
}