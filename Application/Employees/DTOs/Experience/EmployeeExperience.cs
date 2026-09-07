namespace Application.Employees.DTOs.Experience
{
    public class EmployeeExperience
    {
        public int Id { get; set; }
        public int Am { get; set; }
        public int Type { get; set; }
        public DateOnly? DateFrom { get; set; }
        public DateOnly? DateTo { get; set; }

        public string? Years { get; set; }

        public string? Months { get; set; }
        public string? Days { get; set; }

        public string? Carrier { get; set; }

        public string? DecisionId { get; set; }

        public string? Comments { get; set; }

        public int Agonis { get; set; }

        public int Mk { get; set; }

        public int Grade { get; set; }

        public int Sunt { get; set; }

        public DateOnly? DateCouncil { get; set; }

        public int Auto { get; set; }
    }
}