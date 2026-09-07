using Application.Employees.Commands.Change;
using Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class EmpChangesController : BaseApiController
    {
        private readonly AppDbContext _context;

        public EmpChangesController(AppDbContext context)
        {
            _context = context;
        }
        
        [HttpGet("changeList/{id}")]
        public async Task<ActionResult<List<Changes>>> GetEmployeeChangeList(int id)
        {
            var employee = await _context.Employees.FindAsync(id);

            if (employee == null) return NotFound();

            var changes = await _context.Changes
                .Where(c => c.AM == employee.Am)
                .OrderByDescending(c => c.Id)
                .ToListAsync();

            if (changes == null) return NotFound();

            return Ok(changes);
        }

        [HttpPost("createChange")]
        public async Task<ActionResult<string>> CreateEmployeeChange(Changes employeeChange)
        {
            return HandleResult(await Mediator.Send(new CreateEmployeeChange.Command { Change = employeeChange }));
        }

        [HttpPut("editChange")]
        public async Task<ActionResult<string>> EditEmployeeChange(Changes employeeChange)
        {
            return HandleResult(await Mediator.Send(new EditEmployeeChange.Command { Change = employeeChange }));
        }

        [HttpDelete("deleteChange/{id}")]
        public async Task<ActionResult<string>> DeleteEmployeeChange(int id)
        {
            return HandleResult(await Mediator.Send(new DeleteEmployeeChange.Command { Id = id }));
        }

        [HttpPut("executeChange/{id}")]
        public async Task<ActionResult<string>> ExecuteEmployeeChange(int id)
        {
            var change = await _context.Changes.FindAsync(id);
            if (change == null) return NotFound();

            var currentUser = User.FindFirst("userName")?.Value ?? "system";
            var employee = await _context.Employees.FirstOrDefaultAsync(e => e.Am == change.AM);
            if (employee == null) return NotFound("Employee not found");

            change.Flag = 1;
            change.FlagHRM = 1;

            if (change.Type == 1)
            {
                var peCategories = new[] { "pe", "pe6", "te" };
                var mkYears = peCategories.Contains(employee.Category.ToLower().Trim()) ? 2 : 3;

                employee.MK = change.NextState;
                employee.MKDate = change.NextDate;
                employee.MKNextDate = change.NextDate.AddYears(mkYears);

                var nextMKChange = await _context.Changes
                    .Where(c => c.AM == change.AM && c.Type == 1 && c.Id != change.Id && c.FlagHRM == 0)
                    .OrderBy(c => c.ChangeDate)
                    .FirstOrDefaultAsync();

                if (nextMKChange != null)
                {
                    nextMKChange.PreviousState = change.NextState;
                    nextMKChange.NextState = change.NextState + 1;
                    nextMKChange.ChangeDate = change.NextDate;
                    nextMKChange.NextDate = change.NextDate.AddYears(mkYears);
                    nextMKChange.User = currentUser;
                    nextMKChange.Notes = "Αυτόματη μεταβολή κλιμακίου";
                    nextMKChange.AnadromikaApo = change.NextDate;
                    nextMKChange.AnadromikaEws = change.NextDate;
                }
                else
                {
                    var nextChange = new Changes
                    {
                        Id = 0,
                        AM = change.AM,
                        Type = 1,
                        PreviousState = change.NextState,
                        NextState = change.NextState + 1,
                        ChangeDate = change.NextDate,
                        NextDate = change.NextDate.AddYears(mkYears),
                        User = currentUser,
                        Notes = "Αυτόματη μεταβολή κλιμακίου",
                        AnadromikaApo = change.NextDate,
                        AnadromikaEws = change.NextDate,
                        Days = "0",
                        Flag = 0,
                        FlagHRM = 0,
                        Protocol = "",
                        ProtocolDate = change.NextDate
                    };
                    _context.Changes.Add(nextChange);
                }
            }
            else if (change.Type == 2)
            {
                // NextState/PreviousState έρχονται από τον πίνακα changes_map (type=2): 7-12
                var gradeMap = new Dictionary<int, string>
                {
                    { 7, "Α" }, { 8, "Β" }, { 9, "Γ" },
                    { 10, "Δ" }, { 11, "Ε" }, { 12, "ΣΤ" }
                };

                // Ο πίνακας vathmoi αποθηκεύει τον βαθμό με δικούς του κωδικούς (101-106),
                // διαφορετικούς από αυτούς του changes_map — εκεί αποθηκεύεται το employee.Rank
                var vathmoiCodeMap = new Dictionary<string, int>
                {
                    { "Α", 101 }, { "Β", 102 }, { "Γ", 103 },
                    { "Δ", 104 }, { "Ε", 105 }, { "ΣΤ", 106 }
                };

                var newRankCode = change.NextState;
                var newRankStr = gradeMap.TryGetValue(newRankCode, out var rStr) ? rStr : newRankCode.ToString();
                var cat = employee.Category.ToLower().Trim();

                // Χρόνοι παραμονής στον ΝΕΟ βαθμό (null = τερματικός)
                int? rankYears = (newRankCode, cat) switch
                {
                    (12, _)                             => 2,  // ΣΤ: 2 έτη για όλους
                    (11, "pe" or "pe6" or "te")         => 4,  // Ε: ΠΕ/ΤΕ 4 έτη
                    (11, "de")                          => 6,  // Ε: ΔΕ 6 έτη
                    (11, "ye0")                          => 10, // Ε: ΥΕ 10 έτη
                    (10, "pe" or "pe6" or "te")         => 4,  // Δ: ΠΕ/ΤΕ 4 έτη
                    (10, "de")                          => 6,  // Δ: ΔΕ 6 έτη
                    (10, "ye0")                          => 10, // Δ: ΥΕ 10 έτη
                    (9, "pe" or "pe6" or "te")          => 4,  // Γ: ΠΕ/ΤΕ 4 έτη
                    (9, "de")                           => 8,  // Γ: ΔΕ 8 έτη
                    (9, "ye0")                           => null, // Γ: ΥΕ τερματικός
                    (8, "pe" or "pe6")                  => 6,  // Β: ΠΕ 6 έτη
                    (8, "te")                           => 8,  // Β: ΤΕ 8 έτη
                    (8, "de")                           => null, // Β: ΔΕ τερματικός
                    (7, _)                               => null, // Α: τερματικός για όλους
                    _                                    => null
                };

                // Ενημέρωση employee — το emp_vathmos αποθηκεύει τον κωδικό του vathmoi (101-106)
                employee.Rank = (vathmoiCodeMap.TryGetValue(newRankStr, out var vCode) ? vCode : newRankCode).ToString();
                employee.RankDate = change.NextDate;
                employee.RankNextDate = rankYears.HasValue ? change.NextDate.AddYears(rankYears.Value) : null;

                // Δημιουργία επόμενης μεταβολής μόνο αν δεν είναι τερματικός βαθμός
                if (rankYears.HasValue)
                {
                    var nextChange = new Changes
                    {
                        Id = 0,
                        AM = change.AM,
                        Type = 2,
                        PreviousState = newRankCode,
                        NextState = newRankCode - 1, // ΣΤ(106)→Ε(105)→Δ(104)→Γ(103)→Β(102)→Α(101)
                        ChangeDate = change.NextDate,
                        NextDate = change.NextDate.AddYears(rankYears.Value),
                        User = currentUser,
                        Notes = "Αυτόματη μεταβολή βαθμού",
                        AnadromikaApo = change.NextDate,
                        AnadromikaEws = change.NextDate,
                        Days = "0",
                        Flag = 0,
                        Protocol = "",
                        ProtocolDate = change.NextDate,
                        FlagHRM = 0
                    };
                    _context.Changes.Add(nextChange);
                }
            }

            var result = await _context.SaveChangesAsync() >= 0;
            if (!result) return BadRequest("Αποτυχία εκτέλεσης μεταβολής");
            return Ok(id.ToString());
        }
    }
}