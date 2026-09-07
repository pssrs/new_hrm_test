using Application.Core;
using Application.Employees.DTOs.Personal;
using AutoMapper;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Employees.Commands.Personal
{
    public class EditEmployeeNumber
    {
        public class Command : IRequest<Result<Unit>>
        {
            public required EmployeeNumber EmployeeNumber { get; set; }
        }

        public class Handler(AppDbContext context, IMapper mapper, ISybaseService sybaseService) : IRequestHandler<Command, Result<Unit>>
        {
            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            {
                var employee = await context.Employees.FirstOrDefaultAsync(x => x.Am == request.EmployeeNumber.Am, cancellationToken);

                if (employee == null) return Result<Unit>.Failure("Employee not found", 404);

                var empNumberCurrent = new EmployeeNumber
                {
                    Am = employee.Am,
                    Afm = employee.Afm,
                    Amka = employee.Amka,
                    Ama = employee.Ama,
                    PersonalNumber = employee.PersonalNumber,
                    Doy = employee.Doy
                };

                mapper.Map(request.EmployeeNumber, employee);

                var changesCount = await context.SaveChangesAsync(cancellationToken);

                if (changesCount == 0) return Result<Unit>.Failure("No rows were updated", 400);

                var sybaseResult = await sybaseService.UpdateEmployeeNumberAsync(employee.Afm, employee.Am, empNumberCurrent, request.EmployeeNumber);

                if (!sybaseResult.IsSuccess)
                {
                    Console.WriteLine($"\n\n\n\n\nΑποτυχία ενημέρωσης Sybase μετά την ενημέρωση αριθμού μητρώου του υπαλλήλου {request.EmployeeNumber.Am}: {sybaseResult.Error}\n\n\n\n");
                    return Result<Unit>.Failure($"Τα στοιχεία ενημερώθηκαν στο HRM, αλλά απέτυχε η ενημέρωση της μισθοδοσίας: {sybaseResult.Error}", sybaseResult.Code);
                }

                return Result<Unit>.Success(Unit.Value);
            }
        }
    }
}