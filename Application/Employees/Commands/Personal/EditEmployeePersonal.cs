using Application.Core;
using Application.Employees.DTOs.Personal;
using AutoMapper;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Employees.Commands.Personal
{
    public class EditEmployeePersonal
    {
        public class Command : IRequest<Result<Unit>>
        {
            public required EmployeePersonal EmployeePersonal { get; set; }
        }

        public class Handler(AppDbContext context, IMapper mapper, ISybaseService sybaseService) : IRequestHandler<Command, Result<Unit>>
        {
            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            {
                var employee = await context.Employees.FirstOrDefaultAsync(x => x.Am == request.EmployeePersonal.Am, cancellationToken);

                if (employee == null) return Result<Unit>.Failure("Employee not found", 404);

                var empPersonalCurrent = new EmployeePersonal
                {
                    Am = employee.Am,
                    BirthDate = employee.BirthDate ?? default,
                    FamilyStatus = employee.FamilyStatus,
                    FatherName = employee.FatherName,
                    MotherName = employee.MotherName
                };

                mapper.Map(request.EmployeePersonal, employee);

                var result = await context.SaveChangesAsync(cancellationToken) >= 0;

                if (!result) return Result<Unit>.Failure("Failed to update the employee", 400);

                var sybaseResult = await sybaseService.UpdateEmployeePersonalAsync(employee.Afm, employee.Am, empPersonalCurrent, request.EmployeePersonal);

                if (!sybaseResult.IsSuccess)
                {
                    Console.WriteLine($"\n\n\n\n\nΑποτυχία ενημέρωσης Sybase μετά την ενημέρωση προσωπικών στοιχείων του υπαλλήλου {request.EmployeePersonal.Am}: {sybaseResult.Error}\n\n\n\n");
                    return Result<Unit>.Failure($"Τα στοιχεία ενημερώθηκαν στο HRM, αλλά απέτυχε η ενημέρωση της μισθοδοσίας: {sybaseResult.Error}", sybaseResult.Code);
                }

                return Result<Unit>.Success(Unit.Value);
            }
        }
    }
}
