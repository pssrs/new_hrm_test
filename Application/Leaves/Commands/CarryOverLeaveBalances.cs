using Application.Core;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Application.Leaves.Commands;

public class CarryOverLeaveBalances
{
    public class Command : IRequest<Result<string>>
    {
    }

    public class Handler(AppDbContext context, ILogger<CarryOverLeaveBalances> logger) : IRequestHandler<Command, Result<string>>
    {
        private static readonly int[] NormalLeaveTypes = [20, 21, 22, 23, 24, 25, 30];

        public async Task<Result<string>> Handle(Command request, CancellationToken cancellationToken)
        {
            var currentYear = DateTime.Now.Year;
            var previousYear = currentYear - 1;

            var employees = await context.Employees
                .Where(e => e.IsActive == 1)
                .Select(e => new { e.Am, e.HireDate, e.SalaryCode })
                .Distinct()
                .ToListAsync(cancellationToken);

            var allLeaveTypes = await context.LeaveTypes.ToListAsync(cancellationToken);

            var processed = 0;

            foreach (var emp in employees)
            {
                var am = emp.Am;
                var alreadyCarried = await context.OverallLeaves
                    .AnyAsync(o => o.Am == am && o.Year == currentYear && o.Flag == 1 && NormalLeaveTypes.Contains(o.Type), cancellationToken);

                if (alreadyCarried) continue;

                var prevNormalRow = await context.OverallLeaves
                    .Where(o => o.Am == am && o.Year == previousYear && NormalLeaveTypes.Contains(o.Type) && o.Flag == 1)
                    .Select(o => new { o.Type, o.ManualChangeOv })
                    .FirstOrDefaultAsync(cancellationToken);

                var isM = (emp.SalaryCode ?? "").Contains('M') || (emp.SalaryCode ?? "").Contains('Μ');

                var manualChangeOv = 0;
                int usedType;
                int prevUsedType;

                if (prevNormalRow != null && prevNormalRow.ManualChangeOv == 1)
                {
                    // Χειροκίνητη αλλαγή που συνεχίζει να μετράει κανονικά από εκεί και πέρα.
                    prevUsedType = prevNormalRow.Type;
                    usedType = AdvanceOneYear(prevNormalRow.Type, isM);
                    manualChangeOv = 1;
                }
                else if (prevNormalRow != null && prevNormalRow.ManualChangeOv == 2)
                {
                    // Χειροκίνητη αλλαγή που "παγώνει" μόνιμα σε αυτόν τον τύπο - δεν προχωράει άλλο.
                    prevUsedType = prevNormalRow.Type;
                    usedType = prevNormalRow.Type;
                    manualChangeOv = 2;
                }
                else
                {
                    var years = emp.HireDate.HasValue
                        ? GetYearsOfService(emp.HireDate.Value, DateOnly.FromDateTime(DateTime.Now)) : 0;
                    var prevYears = emp.HireDate.HasValue
                        ? GetYearsOfService(emp.HireDate.Value, new DateOnly(previousYear, 12, 31)) : 0;

                    usedType = GetEntitledDays(years, emp.SalaryCode ?? "");
                    prevUsedType = GetEntitledDays(prevYears, emp.SalaryCode ?? "");
                }

                var leaveTypeData = await context.LeaveTypes.FirstOrDefaultAsync(lt => lt.Id == usedType, cancellationToken);
                if (leaveTypeData == null) continue;

                var prevLeaveTypeData = await context.LeaveTypes.FirstOrDefaultAsync(lt => lt.Id == prevUsedType, cancellationToken);

                var prevEntitledDays = prevLeaveTypeData?.Duration ?? 0;

                if (manualChangeOv == 0 && emp.HireDate.HasValue && emp.HireDate.Value.Year == previousYear)
                {
                    var prevMonthsWorked = 12 - emp.HireDate.Value.Month + 1;
                    prevEntitledDays = (int)Math.Round(prevMonthsWorked * 1.6, MidpointRounding.AwayFromZero);
                }

                var usedDays = await context.Leaves
                    .Where(l => l.Am == am && l.Year == previousYear && l.Type == prevUsedType)
                    .SumAsync(l => (int?)l.Duration, cancellationToken) ?? 0;

                var prevYearRecordExists = await context.OverallLeaves
                    .AnyAsync(o => o.Am == am && o.Year == previousYear && o.Type == prevUsedType, cancellationToken);

                var carriedFromPrevYear = 0;

                if (prevYearRecordExists)
                {
                    var prevYearBalance = await context.OverallLeaves
                        .Where(o => o.Am == am && o.Year == previousYear && o.Type == prevUsedType)
                        .Select(o => (int?)o.Balance)
                        .FirstOrDefaultAsync(cancellationToken) ?? 0;

                    carriedFromPrevYear = Math.Max(0, prevEntitledDays + prevYearBalance - usedDays);
                }

                var entitledDays = leaveTypeData.Duration;

                if (manualChangeOv == 0 && emp.HireDate.HasValue && emp.HireDate.Value.Year == currentYear)
                {
                    var monthsWorked = 12 - emp.HireDate.Value.Month + 1;
                    entitledDays = (int)Math.Round(monthsWorked * 1.6, MidpointRounding.AwayFromZero);
                }

                logger.LogInformation(
                    "Carry-over AM={Am} Type={Type} (PrevType={PrevType}, PrevEntitledDays={PrevEntitledDays}, PrevYearRecordExists={PrevYearRecordExists}, UsedDays={UsedDays}): entitledDays={EntitledDays}, carriedFromPrevYear={CarriedFromPrevYear}",
                    am, usedType, prevUsedType, prevEntitledDays, prevYearRecordExists, usedDays, entitledDays, carriedFromPrevYear);

                context.OverallLeaves.Add(new OverallLeaves
                {
                    Am = am,
                    Type = usedType,
                    Duration = entitledDays,
                    Year = currentYear,
                    Balance = carriedFromPrevYear,
                    Flag = 1,
                    Epik = 0,
                    EpikDays = 0,
                    GrossDays = 0,
                    ManualChangeOv = manualChangeOv
                });

                var tenureYears = emp.HireDate.HasValue
                    ? GetYearsOfService(emp.HireDate.Value, DateOnly.FromDateTime(DateTime.Now)) : 0;

                // Αναρρωτική: κάτω από 1 έτος υπηρεσίας -> τύπος 97 (Αναρρωτική 15), αλλιώς τύπος 15 (Αναρρωτική 30)
                var sickLeaveType = tenureYears < 1 ? 97 : 15;

                foreach (var lt in allLeaveTypes)
                {
                    if (lt.Id == usedType) continue;

                    var isSickLeaveVariant = lt.Id == 15 || lt.Id == 97;
                    var flag = isSickLeaveVariant
                        ? (lt.Id == sickLeaveType ? 1 : 0)
                        : (NormalLeaveTypes.Contains(lt.Id) ? 0 : (lt.Flag == 1 ? 1 : 0));

                    context.OverallLeaves.Add(new OverallLeaves
                    {
                        Am = am,
                        Type = lt.Id,
                        Duration = lt.Duration,
                        Year = currentYear,
                        Balance = 0,
                        Flag = flag,
                        Epik = 0,
                        EpikDays = 0,
                        GrossDays = 0
                    });
                }

                processed++;
            }

            if (processed > 0)
                await context.SaveChangesAsync(cancellationToken);

            return Result<string>.Success($"Μεταφέρθηκαν υπόλοιπα κανονικών αδειών για {processed} υπαλλήλους στο έτος {currentYear}");
        }

        private static int GetYearsOfService(DateOnly hireDate, DateOnly referenceDate)
        {
            if (referenceDate < hireDate) return 0;
            int years = referenceDate.Year - hireDate.Year;
            return Math.Max(years, 0);
        }

        private static readonly int[] MTypeOrder = [20, 21, 22, 23, 24, 25];
        private static readonly int[] MMinYears = [0, 1, 2, 3, 4, 5];
        private static readonly int[] NonMTypeOrder = [20, 21, 22, 25];
        private static readonly int[] NonMMinYears = [0, 1, 2, 10];

        private static int GetMinYearsForType(int type, bool isM)
        {
            var order = isM ? MTypeOrder : NonMTypeOrder;
            var minYears = isM ? MMinYears : NonMMinYears;
            var idx = Array.IndexOf(order, type);
            return idx >= 0 ? minYears[idx] : 0;
        }

        private static int AdvanceOneYear(int type, bool isM)
        {
            var baseYears = GetMinYearsForType(type, isM);
            return GetEntitledDays(baseYears + 1, isM ? "M" : "");
        }

        private static int GetEntitledDays(int years, string code)
        {
            if (code.Contains("M") || code.Contains("Μ"))
                if (years < 1) return 20;
                else if (years < 2) return 21;
                else if (years < 3) return 22;
                else if (years < 4) return 23;
                else if (years < 5) return 24;
                else return 25;
            else
                if (years < 1) return 20;
                else if (years < 2) return 21;
                else if (years < 3) return 22;
                else if (years >= 10) return 25;
                else return 22;
        }
    }
}
