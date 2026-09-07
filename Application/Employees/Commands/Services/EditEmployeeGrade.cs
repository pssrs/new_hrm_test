using Application.Core;
using Application.Employees.DTOs.Services;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Application.Employees.Commands.Services
{
    public class EditEmployeeGrade
    {
        public class Command : IRequest<Result<Unit>>
        {
            public required EmployeeGrade EmployeeGrade { get; set; }
        }

        public class Handler(AppDbContext context, ISybaseService sybaseService, ILogger<EditEmployeeGrade> logger, IEmployeeChangesService employeeChangesService) : IRequestHandler<Command, Result<Unit>>
        {
            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            {
                var employee = await context.Employees.FirstOrDefaultAsync(x => x.Am == request.EmployeeGrade.Am, cancellationToken);

                if (employee == null) return Result<Unit>.Failure("Employee not found", 404);

                var currentGrade = employee.Rank;

                employee.Rank = request.EmployeeGrade.Rank;
                employee.GradeFek = request.EmployeeGrade.GradeFek;
                if (request.EmployeeGrade.RankDate.HasValue)
                    employee.RankDate = request.EmployeeGrade.RankDate.Value;
                if (request.EmployeeGrade.RankNextDate.HasValue)
                    employee.RankNextDate = request.EmployeeGrade.RankNextDate.Value;

                var result = await context.SaveChangesAsync(cancellationToken) >= 0;

                if (!result) return Result<Unit>.Failure("Σφάλμα κατά την ενημέρωση των βαθμολογικών στοιχείων", 400);

                // Update Sybase with the new grade
                var sybaseResult = await sybaseService.UpdateEmployeeGradeAsync(employee.Afm, employee.Am, int.Parse(employee.SalaryGrade));
                if (!sybaseResult.IsSuccess)
                {
                    logger.LogError($"\n\n\n\n\nΑποτυχία ενημέρωσης Sybase μετά την ενημέρωση βαθμού του υπαλλήλου {request.EmployeeGrade.Am}: {sybaseResult.Error}\n\n\n\n");
                    return Result<Unit>.Failure($"Τα στοιχεία ενημερώθηκαν στο HRM, αλλά απέτυχε η ενημέρωση της μισθοδοσίας: {sybaseResult.Error}", sybaseResult.Code);
                }
                await employeeChangesService.CreateEmployeeChange(employee.Am, 2, int.Parse(currentGrade), int.Parse(employee.Rank), employee.RankDate ?? new DateOnly(1900, 1, 1), new DateOnly(1900, 1, 1));
                
                return Result<Unit>.Success(Unit.Value);
            }
        }
    }
}