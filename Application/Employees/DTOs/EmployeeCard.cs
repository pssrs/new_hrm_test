using System;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace Application.DTOs.Employee;

public class EmployeeCard
{
    public required int Id { get; set; }
    public required int Am { get; set; }
    public required string Name { get; set; }
    public required string LastName { get; set; }
    public required string FirstName { get; set; }
    public required string FatherName { get; set; }
    public required string MotherName { get; set; }
    public required string SpouseName { get; set; }
    public required string BirthDate { get; set; }
    public required string BirthPlace { get; set; }
    public required string Address { get; set; }
    public required string Area { get; set; }
    public required string City { get; set; }
    public required string PostCode { get; set; }
    public required string Sex { get; set; }
    public required string FamilyStatus { get; set; }
    public required string Nationality { get; set; }
    public required string Citizenship { get; set; }
    public required string Ama { get; set; }
    public required string Phone { get; set; }
    public required string IdentityCardNumber { get; set; }
    public required string IdentityCardIssueDate { get; set; }
    public required string Amka { get; set; }
    public required string Email { get; set; }
    public required string Afm { get; set; }
    public required string PersonalNumber { get; set; }
    public required string Doy { get; set; }
    public required string EmploymentState { get; set; }
    public required string Iban1 { get; set; }
    public required string Iban2 { get; set; }
    public string Specialty { get; set; } = "";
    public string Department { get; set; } = "";
    public int IsActive { get; set; }
    public int Mk { get; set; }
    public string Category { get; set; } = "";
    public DateOnly TerminationDate { get; set; }
    public DateOnly MkDate { get; set; }
    public DateOnly MkNextDate { get; set; }
}
