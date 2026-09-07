using Application.Core;
using Application.DTOs.Employee;
using Application.Employees.DTOs.Employee;
using AutoMapper;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Application.Employees.Commands;

public class CreateEmployeeFull
{
    public class Command : IRequest<Result<string>>
    {
        public required AddEmployeeDto EmployeeDto { get; set; }
    }

    public class Handler(AppDbContext context, IMapper mapper, ISybaseService sybaseService, ILogger<CreateEmployeeFull> logger) : IRequestHandler<Command, Result<string>>
    {
        public async Task<Result<string>> Handle(Command request, CancellationToken cancellationToken)
        {
            using var transaction = await context.Database.BeginTransactionAsync();
            var stage = "init";
            try
            {
                stage = "resolve next AM";
                var maxAm = await context.Employees.MaxAsync(e => e.Am);
                var empAm = maxAm + 1;
                logger.LogDebug("CreateEmployeeFull: resolved next AM={Am}", empAm);

                var employee = mapper.Map<Employee>(request.EmployeeDto);
                employee.Am = empAm;
                employee.Leave = 20;
                employee.Address = employee.Address + " " + request.EmployeeDto.Personal.AddressNumber;
                //employee.DateAdded = DateOnly.FromDateTime(DateTime.Now);
                employee.IsActive = 1;

                stage = "insert #1: employee";
                context.Employees.Add(employee);
                await context.SaveChangesAsync();
                logger.LogDebug("CreateEmployeeFull: employee row inserted (Am={Am})", empAm);

                stage = "insert #2: children/experience/studies/change";
                foreach (var c in request.EmployeeDto.Children) { var child = mapper.Map<Children>(c); child.EmployeeId = empAm; context.Children.Add(child); }

                foreach (var e in request.EmployeeDto.Experience) { var exp = mapper.Map<Domain.Experience>(e); exp.Am = empAm; context.Experience.Add(exp); }

                logger.LogInformation("CreateEmployeeFull: mapping {StudiesCount} studies for Am={Am}", request.EmployeeDto.Studies.Count, empAm);
                Console.WriteLine("\n\n\n\n\n\n\n request.EmployeeDto.Studies.Count: " + request.EmployeeDto.Studies.Count + "\n\n\n\n\n\n\n");
                for (int i = 0; i < request.EmployeeDto.Studies.Count; i++)
                {
                    var s = request.EmployeeDto.Studies[i];
                    try
                    {
                        var study = mapper.Map<Studies>(s);
                        study.Am = empAm;
                        context.Studies.Add(study);
                        logger.LogInformation("CreateEmployeeFull: study[{Index}] mapped OK for Am={Am} (Type={Type}, Date={Date}, DateRequired={DateRequired})",
                            i, empAm, s.Type, s.Date, s.DateRequired);
                    }
                    catch (Exception ex)
                    {
                        logger.LogError(ex, "CreateEmployeeFull: αποτυχία mapping στο study[{Index}] για Am={Am}. Payload: {@Study}", i, empAm, s);
                        throw;
                    }
                }

                context.Changes.Add(new Domain.Changes
                {
                    Id = 0,
                    AM = employee.Am,
                    Type = 1,
                    PreviousState = employee.MK,
                    NextState = employee.MK + 1,
                    ChangeDate = DateOnly.FromDateTime(DateTime.Now),
                    NextDate = DateOnly.FromDateTime(DateTime.Now),
                    User = "system",
                    Notes = "Αυτόματη μεταβολή κλιμακίου",
                    AnadromikaApo = new DateOnly(1900, 1, 1),
                    AnadromikaEws = new DateOnly(1900, 1, 1),
                    Days = "0",
                    Flag = 0,
                    FlagHRM = 0,
                    Protocol = "",
                    ProtocolDate = new DateOnly(1900, 1, 1)
                });

                await context.SaveChangesAsync();
                logger.LogDebug("CreateEmployeeFull: children/experience/studies/change rows inserted (Am={Am}, Children={ChildrenCount}, Experience={ExperienceCount}, Studies={StudiesCount})",
                    empAm, request.EmployeeDto.Children.Count, request.EmployeeDto.Experience.Count, request.EmployeeDto.Studies.Count);

                stage = "commit transaction";
                await transaction.CommitAsync();
                logger.LogInformation("CreateEmployeeFull: transaction committed for new employee Am={Am}", empAm);

                var childrenCount = await context.Children.CountAsync(c => c.EmployeeId == empAm && c.Child18 != 0);

                stage = "insert #3: sybase legacy sync (non-fatal)";
                try
                {
                    await sybaseService.CreateEmployeePersonalAsync(employee, childrenCount);
                    logger.LogDebug("CreateEmployeeFull: Sybase personal record created (Am={Am})", empAm);
                }
                catch (Exception ex)
                {
                    // Non-fatal: the employee was already committed above, so a Sybase failure
                    // here only means the legacy system is out of sync, not that the request failed.
                    logger.LogError(ex, "CreateEmployeeFull: αποτυχία δημιουργίας προσωπικών στοιχείων στη Sybase για τον υπάλληλο Am={Am}", empAm);
                }

                return Result<string>.Success(empAm.ToString());
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                logger.LogError(ex, "CreateEmployeeFull: αποτυχία στο στάδιο '{Stage}'. Inner: {InnerMessage}", stage, ex.InnerException?.Message);
                return Result<string>.Failure($"Σφάλμα: {ex.Message} | Inner: {ex.InnerException?.Message}", 400);
            }
        }
    }
}
