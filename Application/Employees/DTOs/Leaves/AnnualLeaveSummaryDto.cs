namespace Application.Employees.DTOs.Leaves
{
    public class AnnualLeaveSummaryDto
    {
        public int Am { get; set; }
        public string EmployeeName { get; set; } = "";
        public string Afm { get; set; } = "";
        public int TotalLeaves { get; set; }
        public List<LeaveCategoryDetail> LeavesByType { get; set; } = new();
    }

    public class LeaveCategoryDetail
    {
        public string TypeName { get; set; } = "";
        public int Type { get; set; }
        public int TotalDays { get; set; }
        public int Entitled { get; set; }
        public int Used { get; set; }
        public int CarriedOver { get; set; }
    }
}
