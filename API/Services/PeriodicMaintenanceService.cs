using Application.Core;
using Application.Employees.DTOs;
using Application.Employees.DTOs.Personal;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace API.Services
{
    public class PeriodicMaintenanceService(IServiceScopeFactory scopeFactory, ILogger<PeriodicMaintenanceService> logger) : BackgroundService
    {
        private static readonly TimeSpan Interval = TimeSpan.FromSeconds(60);

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                using var scope = scopeFactory.CreateScope();

                try
                {
                    await RunAsync(scope.ServiceProvider, stoppingToken);
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Το PeriodicMaintenanceService απέτυχε");
                }

                await Task.Delay(Interval, stoppingToken);
            }
        }

        private async Task RunAsync(IServiceProvider services, CancellationToken cancellationToken)
        {
            var context = services.GetRequiredService<AppDbContext>();
            var sybaseService = services.GetRequiredService<ISybaseService>();

            var pendingChanges = await context.Changes.Where(c => 
                c.Flag != 1 && 
                (c.Type == 1 || c.Type == 7) && 
                (c.NextDate <= DateOnly.FromDateTime(DateTime.Now) &&
                c.NextDate >= DateOnly.FromDateTime(DateTime.Now).AddMonths(-1)) || 
                (c.ChangeDate <= DateOnly.FromDateTime(DateTime.Now) &&
                c.ChangeDate >= DateOnly.FromDateTime(DateTime.Now).AddMonths(-1) && c.NextDate == new DateOnly(1900, 1, 1))
            ).ToListAsync(cancellationToken);
            
            var peCategories = new[] { "pe", "pe6", "te" };

            foreach (var change in pendingChanges)
            {
                var employee = await context.Employees.FirstOrDefaultAsync(e => e.Am == change.AM, cancellationToken);
                if (employee == null)
                {
                    logger.LogWarning("Δεν βρέθηκε υπάλληλος για τη μεταβολή {ChangeId} (AM={Am})", change.Id, change.AM);
                    continue;
                }
                
                if (change.Type == 1 && change.Flag != 1) // MK change, dhmiourgeitai h nea metavolh
                {
                    var mkYears = peCategories.Contains(employee.Category.ToLower().Trim()) ? 2 : 3;
                    var nextChangeDate = change.NextDate.AddYears(mkYears);
                    context.Changes.Add(new Changes
                    {
                        Id = 0,
                        AM = change.AM,
                        Type = 1,
                        PreviousState = change.NextState,
                        NextState = change.NextState + 1,
                        ChangeDate = change.NextDate,
                        NextDate = nextChangeDate,
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

                    change.Flag = 1;
                    change.FlagHRM = 1;

                    employee.MK = change.NextState + 1;
                    employee.MKDate = change.NextDate;
                    employee.MKNextDate = nextChangeDate;

                    var nextMKChange = await context.Changes
                        .Where(c => c.AM == employee.Am && c.Type == 1 && c.Id != change.Id && c.FlagHRM == 0)
                        .OrderBy(c => c.ChangeDate)
                        .FirstOrDefaultAsync(cancellationToken);

                    if (nextMKChange != null)
                    {
                        context.Changes.Remove(nextMKChange);
                    }
                    logger.LogInformation("Εκτελέστηκε η μεταβολή MK {ChangeId} για τον υπάλληλο {Am}", change.Id, change.AM);
                }
                else if(change.Type == 7 && change.Flag != 1)// liksi paratasis sumbasis
                {
                    if(change.NextState == 1)// simainei oti elikse i sumbasi opote kataxwrei sti mithodosia, hm/nia diakopis
                    {
                        change.Flag = 1;
                        change.FlagHRM = 1;
                        employee.TerminationDate = change.NextDate;
                        employee.IsActive = 4; // anenergos
                        Console.WriteLine($"\n\n\n\n\n\n\nYOOO1\n\n\n\n\n\n");
                        await sybaseService.UpdateEmployeeBreakDate(employee.Afm, employee.Am, change.NextDate);
                        logger.LogInformation("Εκτελέστηκε η μεταβολή λήξης παράτασης σύμβασης {ChangeId} για τον υπάλληλο {Am}", change.Id, change.AM);
                    }
                }
            }

            var pendingChanges2 = await context.Changes.Where(c => 
                c.Flag != 1 && 
                (c.Type == 2 || c.Type == 3 || c.Type == 6 || c.Type == 8) && 
                (c.NextDate <= DateOnly.FromDateTime(DateTime.Now) &&
                c.NextDate >= DateOnly.FromDateTime(DateTime.Now).AddMonths(-1)) || 
                (c.ChangeDate <= DateOnly.FromDateTime(DateTime.Now) && c.ChangeDate >= DateOnly.FromDateTime(DateTime.Now).AddMonths(-1) && c.NextDate == new DateOnly(1900, 1, 1))
            ).ToListAsync(cancellationToken);

            foreach (var change in pendingChanges2)
            {
                var employee = await context.Employees.FirstOrDefaultAsync(e => e.Am == change.AM, cancellationToken);
                if (employee == null)
                {
                    logger.LogWarning("Δεν βρέθηκε υπάλληλος για τη μεταβολή {ChangeId} (AM={Am})", change.Id, change.AM);
                    continue;
                }
                
                if (change.Type == 2 && change.Flag != 1) // Vathmou change
                {
                    change.Flag = 1;
                    change.FlagHRM = 1;

                    employee.SalaryGrade = change.NextState.ToString();
                    employee.RankDate = change.ChangeDate;
                    employee.RankNextDate = change.NextDate;
                    await sybaseService.UpdateEmployeeGradeAsync(employee.Afm, employee.Am, int.Parse(employee.SalaryGrade));

                    logger.LogInformation("Εκτελέστηκε η μεταβολή Βαθμου {ChangeId} για τον υπάλληλο {Am}", change.Id, change.AM);
                }

                if (change.Type == 3 && change.Flag != 1) // Vathmou change
                {
                    employee.Category = change.NextState == 0 ? "pe" : change.NextState == 1 ? "de" : change.NextState == 2 ? "te" : change.NextState == 3 ? "ye" : "";
                    change.Flag = 1;
                    change.FlagHRM = 1;
                    Console.WriteLine($"\n\n\n\n\n\n\nYOOO3\n\n\n\n\n\n");
                    await sybaseService.UpdateEmployeeGradeAsync(employee.Afm, employee.Am, int.Parse(employee.SalaryGrade));

                    logger.LogInformation("Εκτελέστηκε η μεταβολή Βαθμου {ChangeId} για τον υπάλληλο {Am}", change.Id, change.AM);
                }

                if (change.Type == 6 && change.Flag != 1) // Vathmou change
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
                        change.Flag = 1;
                        change.FlagHRM = 1;
                        
                        Console.WriteLine($"change.ChangeDate: {change.ChangeDate}, change.NextDate: {change.NextDate}, nextDate: {nextDate}, employee.TerminationDate: {employee.TerminationDate}, employee.IsActive: {employee.IsActive}, change.Flag: {change.Flag}, change.FlagHRM {change.FlagHRM}");
                        await sybaseService.UpdateEmployeeBreakDate(employee.Afm, employee.Am, nextDate);
                    }
                }

                if(change.Type == 8 && change.Flag != 1)
                {
                    employee.TerminationDate = change.ChangeDate;
                    employee.IsActive = 1;// anenergos
                    change.Flag = 1;
                    change.FlagHRM = 1;
                    
                    Console.WriteLine($"\n\n\n\n\n\n\nYOOO2\n\n\n\n\n\n");
                    await sybaseService.UpdateEmployeeBreakDate(employee.Afm, employee.Am, change.ChangeDate);
                }
            }

            await context.SaveChangesAsync(cancellationToken);
        }
    }
}
