using Domain;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace Application.Core
{
    public class EmployeeChangesService : IEmployeeChangesService
    {
        private readonly ILogger<EmployeeChangesService> _logger;
        private readonly AppDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public EmployeeChangesService(ILogger<EmployeeChangesService> logger, AppDbContext context, IHttpContextAccessor httpContextAccessor)
        {
            _logger = logger;
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }
        public async Task<Result<string>> CreateEmployeeChange(int am, int type, int previousState, int nextState, DateOnly changeDate, DateOnly nextChangeDate)
        {
            try
            {
                var currentUser = _httpContextAccessor.HttpContext?.User.FindFirst("userName")?.Value ?? "system";
                var flag = changeDate <= DateOnly.FromDateTime(DateTime.Now) ? 1 : 0;
                var flaghrm = changeDate <= DateOnly.FromDateTime(DateTime.Now) ? 1 : 0;
                var nextChange = new Domain.Changes
                {
                    Id = 0,
                    AM = am,
                    Type = type,
                    PreviousState = previousState,
                    NextState = nextState,
                    ChangeDate = changeDate,
                    NextDate = nextChangeDate,
                    User = currentUser,
                    Notes = "Μεταβολή από την καρτέλα του εργαζομένου",
                    AnadromikaApo = new DateOnly(1900, 1, 1),
                    AnadromikaEws = new DateOnly(1900, 1, 1),
                    Days = "0",
                    Flag = flag,
                    FlagHRM = flaghrm,
                    Protocol = "",
                    ProtocolDate = new DateOnly(1900, 1, 1)
                };
                _context.Changes.Add(nextChange);

                var result = await _context.SaveChangesAsync() >= 0;
                if (result) return Result<string>.Success("Η μεταβολή δημιουργήθηκε επιτυχώς");
                else return Result<string>.Failure("Σφάλμα κατά τη δημιουργία της μεταβολής", 400);
            }
            catch (Exception ex)
            {
                return Result<string>.Failure($"An error occurred: {ex.Message}", 500);
            }
        }
    }
}