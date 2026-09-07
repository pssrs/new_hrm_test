using Application.Core;
using AutoMapper;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Employees.Commands.Change
{
    public class EditEmployeeChange
    {
        public class Command : IRequest<Result<string>>
        {
            public required Domain.Changes Change { get; set; }
        }

        public class Handler(AppDbContext context, IMapper mapper, ISybaseService sybaseService) : IRequestHandler<Command, Result<string>>
        {
            public async Task<Result<string>> Handle(Command request, CancellationToken cancellationToken)
            {
                var change = await context.Changes.FirstOrDefaultAsync(x => x.Id == request.Change.Id, cancellationToken);

                if (change == null) return Result<string>.Failure("Change not found", 404);

                mapper.Map(request.Change, change);

                var employee = await context.Employees.FirstOrDefaultAsync(x => x.Am == change.AM, cancellationToken);

                if (employee != null)
                {
                    if (change.Type == 1) // allagh MK
                    {
                        if(change.ChangeDate <= DateOnly.FromDateTime(DateTime.Now))
                            {
                                employee.MK = change.NextState;
                                employee.MKDate = change.ChangeDate;
                                employee.MKNextDate = change.NextDate;
                                await sybaseService.UpdateEmployeeMKAsync(employee.Afm, employee.Am, employee.MK, change.NextDate);
                                if(change.NextDate <= DateOnly.FromDateTime(DateTime.Now))
                                {
                                    change.Flag = 1;
                                    change.FlagHRM = 1;
                                    context.Changes.Add(new Domain.Changes
                                    {
                                        Id = 0,
                                        AM = change.AM,
                                        Type = 1,
                                        PreviousState = change.NextState,
                                        NextState = change.NextState + 1,
                                        ChangeDate = change.NextDate,
                                        NextDate = employee.Category == "pe" || employee.Category == "pe6" || employee.Category == "te" ? change.NextDate.AddYears(2) : change.NextDate.AddYears(3),
                                        User = "system-metovoles",
                                        Notes = "Αυτόματη μεταβολή κλιμακίου",
                                        AnadromikaApo = new DateOnly(1900, 1, 1),
                                        AnadromikaEws = new DateOnly(1900, 1, 1),
                                        Days = "0",
                                        Flag = 0,
                                        FlagHRM = 0,
                                        Protocol = "",
                                        ProtocolDate = new DateOnly(1900, 1, 1)
                                    });
                                }
                        }
                    }

                    if (change.Type == 2) // allagh vathmou
                    {
                        if(change.ChangeDate <= DateOnly.FromDateTime(DateTime.Now))
                        {
                            employee.SalaryGrade = change.NextState.ToString();
                            employee.RankDate = change.ChangeDate;
                            employee.RankNextDate = change.NextDate;
                            change.Flag = 1;
                            change.FlagHRM = 1;
                            await sybaseService.UpdateEmployeeGradeAsync(employee.Afm, employee.Am, int.Parse(employee.SalaryGrade));
                        }
                    }

                    if (change.Type == 3) // allagh kathgorias
                    {
                        if(change.ChangeDate <= DateOnly.FromDateTime(DateTime.Now))
                        {
                            employee.Category = change.NextState == 0 ? "pe" : change.NextState == 1 ? "de" : change.NextState == 2 ? "te" : change.NextState == 3 ? "ye" : "";
                            change.Flag = 1;
                            change.FlagHRM = 1;
                        }
                    }
                        
                    if (change.Type == 4) // allagh kladoy
                        Console.WriteLine("Change type 4: allagh kladoy - not implemented yet");

                    if (change.Type == 5) // apergia
                        Console.WriteLine("Change type 4: allagh kladoy - not implemented yet");
                    
                    if (change.Type == 6) // allagh ergasiakhs katastashs
                    {
                        if(change.ChangeDate <= DateOnly.FromDateTime(DateTime.Now))
                        {
                            DateOnly nextDate = change.NextDate;
                            employee.IsActive = change.NextState;

                            if (change.NextState == 4) // If the next state is 4 (terminated), set the termination date
                            {
                                employee.TerminationDate = change.ChangeDate;
                                nextDate = change.ChangeDate;
                            }
                            if (change.NextState == 1) // If the next state is 1 (active), reset the termination date
                            {
                                employee.TerminationDate = new DateOnly(1900, 01, 01);
                                nextDate = change.NextDate;
                            }
                            await sybaseService.UpdateEmployeeBreakDate(employee.Afm, employee.Am, nextDate);
                        }
                    }

                    if (change.Type == 7) // paratash sumbashs
                    {
                        if(change.NextDate <= DateOnly.FromDateTime(DateTime.Now))
                        {
                            employee.TerminationDate = change.NextDate;
                            employee.IsActive = 1;// anenergos
                            await sybaseService.UpdateEmployeeBreakDate(employee.Afm, employee.Am, change.NextDate);
                        }
                    }

                    if (change.Type == 8) // allagh oik apoxorhsha
                    {
                        if(change.ChangeDate <= DateOnly.FromDateTime(DateTime.Now))
                        {
                            employee.TerminationDate = change.ChangeDate;
                            employee.IsActive = 1;// anenergos
                            await sybaseService.UpdateEmployeeBreakDate(employee.Afm, employee.Am, change.ChangeDate);
                        }
                    }

                    if (change.Type == 9) // allagh sumbashs
                    {
                        if(change.ChangeDate <= DateOnly.FromDateTime(DateTime.Now))
                        {
                            employee.WorkRelation = change.NextState;
                        }
                    }

                    if (change.Type == 10) // stash
                    {
                        //
                    }
                }
                await context.SaveChangesAsync(cancellationToken);

                return Result<string>.Success(change.Id.ToString());
            }
        }
    }
}