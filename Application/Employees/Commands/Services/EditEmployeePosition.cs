using Application.Core;
using Application.Employees.DTOs.Services;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Employees.Commands.Services
{
    public class EditEmployeePosition
    {
        public class Command : IRequest<Result<Unit>>
        {
            public required EmployeePosition EmployeePosition { get; set; }
        }

        public class Handler(AppDbContext context, ISybaseService sybaseService, IEmployeeChangesService employeeChangesService) : IRequestHandler<Command, Result<Unit>>
        {
            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            {
                var employee = await context.Employees.FirstOrDefaultAsync(x => x.Am == request.EmployeePosition.Am, cancellationToken);

                if (employee == null) return Result<Unit>.Failure("Employee not found", 404);

                var empPositionCurrent = new EmployeePosition
                {
                    Am = employee.Am,
                    WorkRelation = employee.WorkRelation,
                    Category = employee.Category,
                    Branch = employee.Branch,
                    Specialty = employee.Specialty
                };

                employee.WorkRelation = request.EmployeePosition.WorkRelation;
                employee.Category = request.EmployeePosition.Category;
                employee.Branch = request.EmployeePosition.Branch;
                employee.Specialty = request.EmployeePosition.Specialty;
                var result = await context.SaveChangesAsync(cancellationToken) >= 0;

                if (!result) return Result<Unit>.Failure("Failed to update the employee", 400);

                var sybaseResult = await sybaseService.UpdateEmployeePositionAsync(employee.Afm, employee.Am, empPositionCurrent, request.EmployeePosition);

                if (!sybaseResult.IsSuccess)
                {
                    Console.WriteLine($"\n\n\n\n\nΑποτυχία ενημέρωσης Sybase μετά την ενημέρωση θέσης του υπαλλήλου {request.EmployeePosition.Am}: {sybaseResult.Error}\n\n\n\n");
                    return Result<Unit>.Failure($"Τα στοιχεία ενημερώθηκαν στο HRM, αλλά απέτυχε η ενημέρωση της μισθοδοσίας: {sybaseResult.Error}", sybaseResult.Code);
                }

                if(empPositionCurrent.WorkRelation != request.EmployeePosition.WorkRelation)
                    await employeeChangesService.CreateEmployeeChange(employee.Am, 9, empPositionCurrent.WorkRelation, request.EmployeePosition.WorkRelation, DateOnly.FromDateTime(DateTime.Now), new DateOnly(1900, 1, 1));
                if(empPositionCurrent.Category != request.EmployeePosition.Category)
                    await employeeChangesService.CreateEmployeeChange(
                        employee.Am, 3, 
                        empPositionCurrent.Category == "pe" ? 0 : empPositionCurrent.Category == "de" ? 1 : empPositionCurrent.Category == "te" ? 2 : empPositionCurrent.Category == "ye" ? 3 : 0,
                        request.EmployeePosition.Category == "pe" ? 0 : request.EmployeePosition.Category == "de" ? 1 : request.EmployeePosition.Category == "te" ? 2 : request.EmployeePosition.Category == "ye" ? 3 : 0,
                        DateOnly.FromDateTime(DateTime.Now), new DateOnly(1900, 1, 1)
                    );


                return Result<Unit>.Success(Unit.Value);
            }
        }
    }
}