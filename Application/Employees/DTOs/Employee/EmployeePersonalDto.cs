using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Application.Employees.DTOs.Employee
{
    public class EmployeePersonalDto
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public DateOnly? BirthDate { get; set; }
        public string FatherName { get; set; } = string.Empty;
        public string MotherName { get; set; } = string.Empty;
        public int FamilyStatus { get; set; }
        public string Address { get; set; } = string.Empty;
        public string AddressNumber { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string PostCode { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string IdentityCardNumber { get; set; } = string.Empty;
        public DateOnly? IdentityCardIssueDate { get; set; }
        public string Citizenship { get; set; } = string.Empty;
        public string Nationality { get; set; } = string.Empty;
        public string Afm { get; set; } = string.Empty;
        public string Amka { get; set; } = string.Empty;
        public string Ama { get; set; } = string.Empty;
        public string PersonalNumber { get; set; } = string.Empty;
        public string Doy { get; set; } = string.Empty;
        public string Iban1 { get; set; } = string.Empty;
        public string Iban2 { get; set; } = string.Empty;
    }
}