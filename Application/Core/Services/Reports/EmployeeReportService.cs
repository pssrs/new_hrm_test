using System;
using System.Globalization;
using System.Linq;
using System.Text;
using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using Domain;
using Microsoft.EntityFrameworkCore;

namespace Application.Core.Services.Reports;

public class EmployeeReportService : IEmployeeReportService
{
    private readonly string _workCertificateTemplatePath;
    private readonly string _adkyTemplatePath;
    private readonly string _proipiresiasTemplatePath;
    private readonly string _anarrotikisTemplatePath;
    private readonly string _metavolwnTemplatePath;
    private readonly AppDbContext _context;

    public EmployeeReportService(string workCertificateTemplatePath, string adkyTemplatePath, string proipiresiasTemplatePath, string anarrotikisTemplatePath, string metavolwnTemplatePath, AppDbContext context)
    {
        _workCertificateTemplatePath = workCertificateTemplatePath;
        _adkyTemplatePath = adkyTemplatePath;
        _proipiresiasTemplatePath = proipiresiasTemplatePath;
        _anarrotikisTemplatePath = anarrotikisTemplatePath;
        _metavolwnTemplatePath = metavolwnTemplatePath;
        _context = context;
    }

    public async Task<byte[]> GenerateWorkCertificate(Employee employee)
    {
        using var stream = new MemoryStream();
        using (var file = System.IO.File.OpenRead(_workCertificateTemplatePath))
            file.CopyTo(stream);
        stream.Position = 0;

        using (var wordDoc = WordprocessingDocument.Open(stream, true))
        {
            var body = wordDoc.MainDocumentPart!.Document!.Body!;

            var replacements = new System.Collections.Generic.Dictionary<string, string>
            {
                ["temp1"] = employee.LastName + " " + employee.FirstName,
                ["temp2"] = "___________",
                ["temp3"] = employee.FirstName,
                ["temp4"] = employee.LastName,
                ["temp5"] = employee.FatherName,
                ["temp6"] = employee.WorkRelation == 2 ? "αορίστου " : "ορισμένου ",
                ["temp7"] = await _context.Kladoi.Where(b => b.Code == employee.Branch).Select(b => b.Description).FirstOrDefaultAsync() ?? "",
                ["temp8"] = await _context.Eidikothtes.Where(b => b.Code == employee.Specialty).Select(b => b.Description).FirstOrDefaultAsync() ?? "",
                ["temp9"] = await _context.Addresses.Where(b => b.Id == employee.WorkDepartment).Select(b => b.Address_str).FirstOrDefaultAsync() ?? "",
                ["temp01"] = await _context.Parameters.Where(b => b.Name == "foreas").Select(b => b.Value1).FirstOrDefaultAsync() ?? "",
            };

            foreach (var paragraph in body.Descendants<Paragraph>())
            {
                ReplacePlaceholdersInParagraph(paragraph, replacements);
            }

            wordDoc.MainDocumentPart.Document.Save();
        }

        return stream.ToArray();
    }

    public record PreviousServiceRecord(
        string Foreas,
        int Years,
        int Months,
        int Days
    );

    public async Task<byte[]> GenerateAtomikoDeltioKataxis(Employee employee)
    {
        var experience = await _context.Experience
            .Where(p => p.Am == employee.Am && p.Type == 4 && p.Carrier != _context.Parameters.Where(param => param.Name == "foreas").Select(param => param.Value1).FirstOrDefault())
            .OrderBy(e => e.DateFrom)
            .ToListAsync();

        var previousServices = experience
        .Select(e =>
        {
            var (years, months, days) = CalculateDuration(e.DateFrom, e.DateTo.AddDays(1));
            return new PreviousServiceRecord(e.Carrier, years, months, days);
        })
        .ToList();

        using var stream = new MemoryStream();
        using (var file = System.IO.File.OpenRead(_adkyTemplatePath))
            file.CopyTo(stream);
        stream.Position = 0;

        using (var wordDoc = WordprocessingDocument.Open(stream, true))
        {
            var body = wordDoc.MainDocumentPart!.Document!.Body!;

            // --- Υπολογισμός συνόλου (ΕΤΗ/ΜΗΝΕΣ/ΗΜΕΡΕΣ) με μετατροπή ημερών->μηνών->ετών ---
            var totalDaysRaw = previousServices.Sum(p => p.Days);
            var totalMonthsRaw = previousServices.Sum(p => p.Months) + totalDaysRaw / 30;
            var totalYears = previousServices.Sum(p => p.Years) + totalMonthsRaw / 12;
            var totalMonths = totalMonthsRaw % 12;
            var totalDays = totalDaysRaw % 30;

            var studies = await _context.Studies   // TODO: πρόσαρμοσε αν το DbSet λέγεται διαφορετικά
                .Where(s => s.Am == employee.Am)
                .ToListAsync();

            string YearsForType(int type) =>
                studies.FirstOrDefault(s => s.Type == type)?.Years ?? "";

            string HasType(int type) =>
                studies.Any(s => s.Type == type) ? "Ναι" : "";

            // Δ/θμια ή μεταδευτεροβάθμια Εκπαίδευση: παίρνουμε το πιο "προχωρημένο"
            // επίπεδο που υπάρχει — Λύκειο (3) > ΙΕΚ (4) > Γυμνάσιο (2)
            var secondaryTypes = new[] { 2, 3}; // Γυμνάσιο, Λύκειο, ΙΕΚ
            var secondaryYears = studies
                .Where(s => secondaryTypes.Contains(s.Type))
                .Sum(s => int.TryParse(s.Years, out var y) ? y : 0)
                .ToString();

            var replacements = new Dictionary<string, string>
            {
                ["temp1"] = "",
                ["temp2"] = employee.LastName,
                ["temp3"] = employee.FirstName,
                ["temp4"] = employee.FatherName,
                ["temp5"] = employee.Afm,
                ["temp6"] = employee.Doy.ToString(),
                ["temp7"] = employee.Am.ToString(),
                ["temp8"] = await _context.Kladoi.Where(b => b.Code == employee.Branch).Select(b => b.Description).FirstOrDefaultAsync() ?? "",
                ["temp9"] = employee.Category == "pe" ? "ΠΕ" : employee.Category == "te" ? "ΤΕ" : employee.Category == "de" ? "ΔΕ" : employee.Category == "ye0" ? "ΥE" : employee.Category == "pe6" ? "ΠΕ6" : "",
                ["temp10"] = await _context.Grades.Where(b => b.Code.ToString() == employee.SalaryGrade).Select(b => b.Description).FirstOrDefaultAsync() ?? "",
                ["temp11"] = YearsForType(6),      // (α) Α.Ε.Ι.
                ["temp12"] = YearsForType(5),      // (β) Τ.Ε.Ι. ή ισότιμη σχολή
                ["temp13"] = secondaryYears,       // (γ) Δ/θμια ή μεταδευτεροβάθμια Εκπαίδευση
                ["temp14"] = YearsForType(1),      // (δ) Πρωτοβάθμια Εκπαίδευση
                ["temp15"] = HasType(9),           // Κάτοχος συναφούς τίτλου διδακτορικού
                ["temp16"] = HasType(8),           // Κάτοχος συναφούς τίτλου μεταπτυχιακού
                ["temp17"] = HasType(14), 
                ["temp18"] = employee.HireDate?.ToString("dd/MM/yyyy") ?? "",
                ["temp19"] = "",
                ["temp20"] = "",
                ["temp21"] = "",
                ["temp22"] = "",
                ["temp23"] = "",
                ["temp24"] = "",
                ["temp25"] = "",
                ["temp26"] = "",
                ["temp27"] = "",
                ["temp28"] = (await _context.Grades.Where(b => b.Code.ToString() == employee.SalaryGrade).Select(b => b.Description).FirstOrDefaultAsync() ?? "") + $" - {employee.MK}ο",
                ["temp29"] = employee.MK.ToString() + "ο",
                ["temp30"] = employee.MKNextDate?.ToString("dd/MM/yyyy") ?? "",
                ["temp31"] = DateTime.Now.ToString("dd/MM/yyyy"),
                ["temp32"] = DateTime.Now.ToString("dd/MM/yyyy"),
                ["temp33"] = employee.MK.ToString() + "ο",
                ["temp34"] = totalYears.ToString(),
                ["temp35"] = totalMonths.ToString(),
                ["temp36"] = totalDays.ToString(),
            };

            foreach (var paragraph in body.Descendants<Paragraph>())
            {
                ReplacePlaceholdersInParagraph(paragraph, replacements);
            }

            var templateRow = body.Descendants<TableRow>()
                .FirstOrDefault(tr => tr.InnerText.Contains("PREVFOREAS"));

            if (templateRow != null)
            {
                var table = (Table)templateRow.Parent!;
                OpenXmlElement insertAfter = templateRow;

                foreach (var service in previousServices)
                {
                    var newRow = (TableRow)templateRow.CloneNode(true);

                    var rowReplacements = new Dictionary<string, string>
                    {
                        ["PREVFOREAS"] = service.Foreas,
                        ["PREVYEARS"] = service.Years.ToString(),
                        ["PREVMONTHS"] = service.Months.ToString(),
                        ["PREVDAYS"] = service.Days.ToString(),
                    };

                    foreach (var paragraph in newRow.Descendants<Paragraph>())
                    {
                        ReplacePlaceholdersInParagraph(paragraph, rowReplacements);
                    }

                    table.InsertAfter(newRow, insertAfter);
                    insertAfter = newRow;
                }

                templateRow.Remove();
            }

            wordDoc.MainDocumentPart.Document.Save();
        }

        return stream.ToArray();
    }

    private static (int Years, int Months, int Days) CalculateDuration(DateOnly start, DateOnly end)
    {
        if (end < start) return (0, 0, 0);

        int years = end.Year - start.Year;
        int months = end.Month - start.Month;
        int days = end.Day - start.Day;

        if (days < 0)
        {
            months--;
            var previousMonth = end.Month == 1 ? 12 : end.Month - 1;
            var previousMonthYear = end.Month == 1 ? end.Year - 1 : end.Year;
            days += DateTime.DaysInMonth(previousMonthYear, previousMonth);
        }
        if (months < 0)
        {
            years--;
            months += 12;
        }

        return (years, months, days);
    }

    public record ServiceChangeRecord(
        DateOnly ChangeDate,
        string TypeDescription,
        string FromDescription,
        string ToDescription,
        string Reason,
        string Notes
    );

    private static string DescribePlacementType(int type) => type switch
    {
        1 => "Τοποθέτηση σε Μονάδα/Τμήμα",
        2 => "Ορισμός Προϊσταμένου",
        3 => "Ορισμός Αναπλ. Προϊσταμένου",
        _ => "Τοποθέτηση"
    };

    private async Task<string> DescribeDepartment(int addressId, int sectorId, int departmentId)
    {
        if (addressId == 0 && sectorId == 0 && departmentId == 0) return "";

        return await _context.Departments
            .Where(d => d.AddressId == addressId && d.SectorId == sectorId && d.DepartmentId == departmentId)
            .Select(d => d.DepartmentName)
            .FirstOrDefaultAsync() ?? "";
    }

    public async Task<byte[]> GenerateYphresiakesMetavoles(Employee employee)
    {
        // --- Υπηρεσιακές μεταβολές (changes) ---
        var changes = await _context.Changes
            .Where(c => c.AM == employee.Am)
            .ToListAsync();

        var changeTypeDescriptions = await _context.ChangeType
            .ToDictionaryAsync(t => t.Id, t => t.Description);

        var changeTypeMapEntries = await _context.ChangeTypeMap
            .ToListAsync();

        string DescribeMappedValue(int type, int value) =>
            changeTypeMapEntries
                .FirstOrDefault(m => m.Type == type && m.Value == value)
                ?.Description ?? "";

        var changeRecords = changes
            .Select(c => new ServiceChangeRecord(
                c.ChangeDate,
                changeTypeDescriptions.GetValueOrDefault(c.Type, ""),
                DescribeMappedValue(c.Type, c.PreviousState),
                DescribeMappedValue(c.Type, c.NextState),
                c.Notes,
                c.Protocol))
            .ToList();

        // --- Τοποθετήσεις: ΠΟΙΟ ΤΜΗΜΑ ΠΡΙΝ -> ΠΟΙΟ ΤΜΗΜΑ ΜΕΤΑ ---
        var placements = await _context.Placements
            .Where(p => p.Am == employee.Am)
            .OrderBy(p => p.Date)
            .ToListAsync();

        var placementRecords = new List<ServiceChangeRecord>();
        foreach (var p in placements)
        {
            placementRecords.Add(new ServiceChangeRecord(
                p.Date,
                DescribePlacementType(p.Type),
                await DescribeDepartment(p.OldAddress, p.OldSector, p.OldDepartment),
                await DescribeDepartment(p.NewAddress, p.NewSector, p.NewDepartment),
                p.Comment,
                p.Duration));
        }

        // --- Ενοποίηση & χρονολογική ταξινόμηση ---
        var serviceChanges = changeRecords
            .Concat(placementRecords)
            .OrderBy(r => r.ChangeDate)
            .ToList();

        using var stream = new MemoryStream();
        using (var file = System.IO.File.OpenRead(_metavolwnTemplatePath))
            file.CopyTo(stream);
        stream.Position = 0;

        using (var wordDoc = WordprocessingDocument.Open(stream, true))
        {
            var body = wordDoc.MainDocumentPart!.Document!.Body!;

            var lastChange = serviceChanges.LastOrDefault();

            var replacements = new Dictionary<string, string>
            {
                ["temp1"] = $"{employee.LastName} {employee.FirstName}",
                ["temp2"] = employee.Am.ToString(),
                ["temp3"] = employee.HireDate?.ToString("dd/MM/yyyy") ?? "",
                ["temp4"] = await DescribeDepartment(employee.Directorate, employee.Sector, employee.Department),
                ["temp5"] = await DescribeDepartment(employee.WorkDirectorate, employee.WorkSector, employee.WorkDepartment),
                ["temp6"] = await _context.Positions
                                .Where(b => b.Id == employee.Position)
                                .Select(b => b.Description).FirstOrDefaultAsync() ?? "",
                ["temp7"] = (await _context.Grades.Where(b => b.Code.ToString() == employee.SalaryGrade).Select(b => b.Description).FirstOrDefaultAsync() ?? "") + $" - {employee.MK}ο",
                ["temp8"] = lastChange?.ChangeDate.ToString("dd/MM/yyyy") ?? "",
                ["temp9"] = "", // Προϊστάμενος — TODO
                ["temp10"] = "", // Καθεστώς Απασχόλησης — TODO
                ["temp11"] = DateTime.Now.ToString("dd/MM/yyyy"),
            };

            foreach (var paragraph in body.Descendants<Paragraph>())
            {
                ReplacePlaceholdersInParagraph(paragraph, replacements);
            }

            var templateRow = body.Descendants<TableRow>()
                .FirstOrDefault(tr => tr.InnerText.Contains("MCHRAA"));

            if (templateRow != null)
            {
                var table = (Table)templateRow.Parent!;
                OpenXmlElement insertAfter = templateRow;

                for (int i = 0; i < serviceChanges.Count; i++)
                {
                    var change = serviceChanges[i];
                    var newRow = (TableRow)templateRow.CloneNode(true);

                    var rowReplacements = new Dictionary<string, string>
                    {
                        ["MCHRAA"] = (i + 1).ToString(),
                        ["MCHRDATE"] = change.ChangeDate.ToString("dd/MM/yyyy"),
                        ["MCHRTYPE"] = change.TypeDescription,
                        ["MCHRFROM"] = change.FromDescription,
                        ["MCHRTO"] = change.ToDescription,
                        ["MCHRREASON"] = change.Reason,
                        ["MCHRNOTES"] = change.Notes,
                    };

                    foreach (var paragraph in newRow.Descendants<Paragraph>())
                    {
                        ReplacePlaceholdersInParagraph(paragraph, rowReplacements);
                    }

                    table.InsertAfter(newRow, insertAfter);
                    insertAfter = newRow;
                }

                templateRow.Remove();
            }

            wordDoc.MainDocumentPart.Document.Save();
        }

        return stream.ToArray();
    }

    private static string DescribeState(int stateCode) => stateCode switch
    {
        1 => "Ενεργός",
        2 => "Απόσπαση",
        3 => "Μετακίνηση",
        4 => "Ανενεργός",
        5 => "Μετάθεση",
        6 => "Συνταξιοδότηση",
        7 => "Αναστολή",
        _ => ""
    };

    private static void ReplacePlaceholdersInParagraph(Paragraph paragraph, System.Collections.Generic.Dictionary<string, string> replacements)
    {
        bool foundAny = true;

        while (foundAny)
        {
            foundAny = false;

            var spans = new System.Collections.Generic.List<(Run Run, Text TextEl, int Start, int Length)>();
            var sb = new StringBuilder();

            foreach (var run in paragraph.Elements<Run>())
            {
                var text = run.GetFirstChild<Text>();
                if (text?.Text is null) continue;
                if (run.ChildElements.Any(e => e is not RunProperties && e is not Text)) continue;

                spans.Add((run, text, sb.Length, text.Text.Length));
                sb.Append(text.Text);
            }

            var fullText = sb.ToString();

            // ΑΛΛΑΓΗ: .OrderByDescending(kv => kv.Key.Length) — χωρίς αυτό, το "temp1"
            // ταιριάζει μέσα στο "temp10"/"temp11".../"temp19" πριν προλάβει να ελεγχθεί
            // το σωστό, μεγαλύτερο key, και σβήνει μόνο τα πρώτα 5 γράμματά τους.
            foreach (var (placeholder, value) in replacements.OrderByDescending(kv => kv.Key.Length))
            {
                var idx = fullText.IndexOf(placeholder, StringComparison.Ordinal);
                if (idx < 0) continue;

                var matchStart = idx;
                var matchEnd = idx + placeholder.Length;

                var overlapping = spans
                    .Where(s => s.Start < matchEnd && s.Start + s.Length > matchStart)
                    .ToList();
                if (overlapping.Count == 0) continue;

                var first = overlapping[0];
                var last = overlapping[^1];

                var prefix = first.TextEl.Text.Substring(0, Math.Max(0, matchStart - first.Start));
                var suffix = last.TextEl.Text.Substring(
                    Math.Min(last.TextEl.Text.Length, matchEnd - last.Start));

                if (first.Run == last.Run)
                {
                    first.TextEl.Text = prefix + value + suffix;
                }
                else
                {
                    first.TextEl.Text = prefix + value;
                    last.TextEl.Text = suffix;

                    foreach (var mid in overlapping.Skip(1).SkipLast(1))
                    {
                        mid.Run.Remove();
                    }
                }

                first.TextEl.Space = SpaceProcessingModeValues.Preserve;
                last.TextEl.Space = SpaceProcessingModeValues.Preserve;

                foundAny = true;
                break;
            }
        }
        
    }

    public async Task<byte[]> GenerateVevaiosiProipiresias(Employee employee)
    {
        using var stream = new MemoryStream();
        using (var file = System.IO.File.OpenRead(_proipiresiasTemplatePath))
            file.CopyTo(stream);
        stream.Position = 0;

        using (var wordDoc = WordprocessingDocument.Open(stream, true))
        {
            var body = wordDoc.MainDocumentPart!.Document!.Body!;

            var greekCulture = new CultureInfo("el-GR");
            var noTerminationDate = new DateOnly(1900, 1, 1);
            var isStillActive = !employee.TerminationDate.HasValue || employee.TerminationDate.Value == noTerminationDate;
            var effectiveTerminationDate = isStillActive ? null : employee.TerminationDate;

            string durationText = "";
            if (employee.HireDate.HasValue)
            {
                durationText = FormatDuration(employee.HireDate.Value, effectiveTerminationDate);
}

            var replacements = new Dictionary<string, string>
            {
                ["temp1"] = "_______", // Διεύθυνση εταιρείας
                ["temp2"] = "_______", // Τηλέφωνο εταιρείας
                ["temp3"] = "_______", // Α.Φ.Μ. εταιρείας
                ["temp4"] = "_______", // Email εταιρείας
                ["temp5"] = DateTime.Now.ToString("dd/MM/yyyy"),
                ["temp6"] = "_______", // Αριθμός πρωτοκόλου
                ["temp7"] = "_______", // Επωνυμία εταιρείας
                ["temp8"] = "_______", // Έδρα εταιρείας
                ["temp9"] = $"{employee.LastName} {employee.FirstName}",
                ["temp10"] = employee.FatherName,
                ["temp11"] = employee.IdentityCardNumber,
                ["temp12"] = employee.Afm,
                ["temp13"] = employee.HireDate?.ToString("dd/MM/yyyy", greekCulture) ?? "",
                ["temp14"] = effectiveTerminationDate?.ToString("dd/MM/yyyy", greekCulture) ?? "σήμερα",
                ["temp15"] = durationText,
                ["temp16"] = await _context.Eidikothtes.Where(b => b.Code == employee.Specialty).Select(b => b.Description).FirstOrDefaultAsync() ?? "",
                ["temp17"] = await _context.Kladoi.Where(b => b.Code == employee.Branch).Select(b => b.Description).FirstOrDefaultAsync() ?? "",
                ["temp18"] = "_______",
                ["temp19"] = "_______",
                ["temp20"] = employee.WorkRelation == 2 ? "αορίστου" : "ορισμένου",
                ["temp21"] = "_______",
                ["temp22"] = "_______",
            };

            foreach (var paragraph in body.Descendants<Paragraph>())
            {
                ReplacePlaceholdersInParagraph(paragraph, replacements);
            }

            wordDoc.MainDocumentPart.Document.Save();
        }

        return stream.ToArray();
    }

    private static string FormatDuration(DateOnly start, DateOnly? end)
    {
        var actualEnd = end ?? DateOnly.FromDateTime(DateTime.Now);
        if (actualEnd < start) return "";

        int years = actualEnd.Year - start.Year;
        int months = actualEnd.Month - start.Month;
        int days = actualEnd.Day - start.Day;

        if (days < 0)
        {
            months--;
            var previousMonth = actualEnd.Month == 1 ? 12 : actualEnd.Month - 1;
            var previousMonthYear = actualEnd.Month == 1 ? actualEnd.Year - 1 : actualEnd.Year;
            days += DateTime.DaysInMonth(previousMonthYear, previousMonth);
        }
        if (months < 0)
        {
            years--;
            months += 12;
        }

        var parts = new System.Collections.Generic.List<string>();
        if (years > 0) parts.Add($"{years} έτ{(years == 1 ? "ος" : "η")}");
        if (months > 0) parts.Add($"{months} μήν{(months == 1 ? "α" : "ες")}");
        if (days > 0) parts.Add($"{days} ημέρ{(days == 1 ? "α" : "ες")}");

        return parts.Count > 0 ? string.Join(" και ", parts) : "λιγότερο από μία ημέρα";
    }

    public async Task<byte[]> GenerateKatastasiAnarrotikwn(Employee employee)
    {
        var sicknessLeaveTypes = new[] { 15, 97 };

        var leaves = await _context.Leaves
            .Where(l => l.Am == employee.Am && sicknessLeaveTypes.Contains(l.Type))
            .OrderBy(l => l.DateFrom)
            .Select(l => new SicknessLeaveRecord(
                l.DateFrom,
                l.DateTo,
                l.Duration,
                l.Notes))
            .ToListAsync();

        using var stream = new MemoryStream();
        using (var file = System.IO.File.OpenRead(_anarrotikisTemplatePath))
            file.CopyTo(stream);
        stream.Position = 0;

        using (var wordDoc = WordprocessingDocument.Open(stream, true))
        {
            var body = wordDoc.MainDocumentPart!.Document!.Body!;

            var totalDays = leaves.Sum(l => l.Days);
            var episodeCount = leaves.Count;

            var replacements = new Dictionary<string, string>
            {
                ["temp1"] = $"{employee.LastName} {employee.FirstName}",
                ["temp2"] = employee.Am.ToString(),
                ["temp3"] = "", // Τμήμα/Θέση — TODO: ποιο πεδίο;
                ["temp4"] = DateTime.Now.Year.ToString(),
                ["temp5"] = totalDays.ToString(),
                ["temp6"] = episodeCount.ToString(),
                ["temp7"] = "", // Ημέρες με αμοιβή από εργοδότη — TODO: υπολογισμός;
                ["temp8"] = "", // Ημέρες με επίδομα ΕΦΚΑ — TODO: υπολογισμός;
                ["temp9"] = DateTime.Now.ToString("dd/MM/yyyy"),
            };

            foreach (var paragraph in body.Descendants<Paragraph>())
            {
                ReplacePlaceholdersInParagraph(paragraph, replacements);
            }

            var templateRow = body.Descendants<TableRow>()
                .FirstOrDefault(tr => tr.InnerText.Contains("ROWAA"));

            if (templateRow != null)
            {
                var table = (Table)templateRow.Parent!;
                OpenXmlElement insertAfter = templateRow;

                for (int i = 0; i < leaves.Count; i++)
                {
                    var leave = leaves[i];
                    var newRow = (TableRow)templateRow.CloneNode(true);

                    var rowReplacements = new Dictionary<string, string>
                    {
                        ["ROWAA"] = (i + 1).ToString(),
                        ["ROWSTART"] = leave.StartDate?.ToString("dd/MM/yyyy") ?? "",
                        ["ROWEND"] = leave.EndDate?.ToString("dd/MM/yyyy") ?? "",
                        ["ROWDAYS"] = leave.Days.ToString(),
                        ["ROWNOTES"] = leave.Notes ?? "",
                    };

                    foreach (var paragraph in newRow.Descendants<Paragraph>())
                    {
                        ReplacePlaceholdersInParagraph(paragraph, rowReplacements);
                    }

                    table.InsertAfter(newRow, insertAfter);
                    insertAfter = newRow;
                }

                templateRow.Remove();
            }

            wordDoc.MainDocumentPart.Document.Save();
        }

        return stream.ToArray();
    }
}