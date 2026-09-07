namespace Application.Employees.DTOs.Leaves
{
    public class LeaveListDto
    {
        public int Id { get; set; }
        public int Am { get; set; }
        public string Afm { get; set; } = "";
        public string EmployeeName { get; set; } = "";
        public int Type { get; set; }
        public int Duration { get; set; }
        public DateOnly? DateFrom { get; set; }
        public DateOnly? DateTo { get; set; }
        public int? TotalLeaves { get; set; }
        public int? Entitled { get; set; }
        public int? Used { get; set; }
        public int? CarriedOver { get; set; }
    }
}