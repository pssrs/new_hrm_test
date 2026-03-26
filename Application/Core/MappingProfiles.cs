using AutoMapper;
using Application.DTOs.Employee;
using Domain;

namespace Application.Core;

public class MappingProfiles : Profile
{
    public MappingProfiles()
    {
        CreateMap<Employee, EmployeeListDto>()
            .ForMember(dest => dest.AFM, opt => opt.MapFrom(src => src.Afm));
        
        CreateMap<Employee, EmployeeCard>()
            .ForMember(dest => dest.PostCode, opt => opt.MapFrom(src => src.PostCode))
            .ForMember(dest => dest.Iban1, opt => opt.MapFrom(src => src.Iban1))
            .ForMember(dest => dest.Iban2, opt => opt.MapFrom(src => src.Iban2))
            .ForMember(dest => dest.BirthDate, opt => opt.MapFrom(src => src.BirthDate.HasValue ? src.BirthDate.Value.ToString("yyyy-MM-dd") : ""))
            .ForMember(dest => dest.IdentityCardIssueDate, opt => opt.MapFrom(src => src.IdentityCardIssueDate.HasValue ? src.IdentityCardIssueDate.Value.ToString("yyyy-MM-dd") : ""))
            .ForMember(dest => dest.Sex, opt => opt.MapFrom(src => src.Sex.ToString()))
            .ForMember(dest => dest.FamilyStatus, opt => opt.MapFrom(src => src.FamilyStatus.ToString()))
            .ForMember(dest => dest.Ama, opt => opt.MapFrom(src => src.Ama))
            .ForMember(dest => dest.Am, opt => opt.MapFrom(src => src.Am))
            .ForMember(dest => dest.EmploymentState, opt => opt.MapFrom(src => src.IsActive.ToString()));

        CreateMap<EmployeeCard, Employee>()
            .ForMember(dest => dest.PostCode, opt => opt.MapFrom(src => src.PostCode))
            .ForMember(dest => dest.BirthDate, opt => opt.MapFrom(src => string.IsNullOrEmpty(src.BirthDate) ? (DateOnly?)null : DateOnly.Parse(src.BirthDate)))
            .ForMember(dest => dest.IdentityCardIssueDate, opt => opt.MapFrom(src => string.IsNullOrEmpty(src.IdentityCardIssueDate) ? (DateOnly?)null : DateOnly.Parse(src.IdentityCardIssueDate)))
            .ForMember(dest => dest.Sex, opt => opt.MapFrom(src => string.IsNullOrEmpty(src.Sex) ? 0 : int.Parse(src.Sex)))
            .ForMember(dest => dest.FamilyStatus, opt => opt.MapFrom(src => string.IsNullOrEmpty(src.FamilyStatus) ? 0 : int.Parse(src.FamilyStatus)))
            .ForMember(dest => dest.Ama, opt => opt.MapFrom(src => src.Ama))
            .ForMember(dest => dest.Am, opt => opt.MapFrom(src => src.Am))
            .ForMember(dest => dest.Iban1, opt => opt.MapFrom(src => src.Iban1))
            .ForMember(dest => dest.Iban2, opt => opt.MapFrom(src => src.Iban2))
            .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => string.IsNullOrEmpty(src.EmploymentState) ? 0 : int.Parse(src.EmploymentState)))
            // Ignore properties not in EmployeeCard
            .ForMember(dest => dest.GenderDescription, opt => opt.Ignore())
            .ForMember(dest => dest.Headquarters, opt => opt.Ignore())
            .ForMember(dest => dest.Children, opt => opt.Ignore())
            .ForMember(dest => dest.HireDate, opt => opt.Ignore())
            .ForMember(dest => dest.PublicationDate, opt => opt.Ignore())
            .ForMember(dest => dest.AppointmentDate, opt => opt.Ignore())
            .ForMember(dest => dest.TerminationDate, opt => opt.Ignore())
            .ForMember(dest => dest.Directorate, opt => opt.Ignore())
            .ForMember(dest => dest.Sector, opt => opt.Ignore())
            .ForMember(dest => dest.Department, opt => opt.Ignore())
            .ForMember(dest => dest.Office, opt => opt.Ignore())
            .ForMember(dest => dest.WorkDirectorate, opt => opt.Ignore())
            .ForMember(dest => dest.WorkSector, opt => opt.Ignore())
            .ForMember(dest => dest.WorkDepartment, opt => opt.Ignore())
            .ForMember(dest => dest.WorkOffice, opt => opt.Ignore())
            .ForMember(dest => dest.Position, opt => opt.Ignore())
            .ForMember(dest => dest.Rank, opt => opt.Ignore())
            .ForMember(dest => dest.EmploymentType, opt => opt.Ignore())
            .ForMember(dest => dest.Category, opt => opt.Ignore())
            .ForMember(dest => dest.Specialty, opt => opt.Ignore())
            .ForMember(dest => dest.Branch, opt => opt.Ignore())
            .ForMember(dest => dest.MK, opt => opt.Ignore())
            .ForMember(dest => dest.SalaryGrade, opt => opt.Ignore())
            .ForMember(dest => dest.MKDate, opt => opt.Ignore())
            .ForMember(dest => dest.SalaryCode, opt => opt.Ignore())
            .ForMember(dest => dest.Flag, opt => opt.Ignore())
            .ForMember(dest => dest.SecondaryEmployeeNumber, opt => opt.Ignore())
            .ForMember(dest => dest.WorkRelation, opt => opt.Ignore())
            .ForMember(dest => dest.RankDate, opt => opt.Ignore())
            .ForMember(dest => dest.Fek, opt => opt.Ignore())
            .ForMember(dest => dest.Notes, opt => opt.Ignore());

        // ==============================
        // Employee → EmployeeService
        // ==============================
        CreateMap<Employee, EmployeeService>();

        // ==============================
        // EmployeeService → Employee
        // ==============================
        CreateMap<EmployeeService, Employee>()
            // Ignore properties not in EmployeeService
            .ForMember(dest => dest.LastName, opt => opt.Ignore())
            .ForMember(dest => dest.FirstName, opt => opt.Ignore())
            .ForMember(dest => dest.FatherName, opt => opt.Ignore())
            .ForMember(dest => dest.MotherName, opt => opt.Ignore())
            .ForMember(dest => dest.SpouseName, opt => opt.Ignore())
            .ForMember(dest => dest.GenderDescription, opt => opt.Ignore())
            .ForMember(dest => dest.BirthDate, opt => opt.Ignore())
            .ForMember(dest => dest.BirthPlace, opt => opt.Ignore())
            .ForMember(dest => dest.IdentityCardNumber, opt => opt.Ignore())
            .ForMember(dest => dest.IdentityCardIssueDate, opt => opt.Ignore())
            .ForMember(dest => dest.Address, opt => opt.Ignore())
            .ForMember(dest => dest.Area, opt => opt.Ignore())
            .ForMember(dest => dest.City, opt => opt.Ignore())
            .ForMember(dest => dest.PostCode, opt => opt.Ignore())
            .ForMember(dest => dest.Sex, opt => opt.Ignore())
            .ForMember(dest => dest.FamilyStatus, opt => opt.Ignore())
            .ForMember(dest => dest.Children, opt => opt.Ignore())
            .ForMember(dest => dest.Nationality, opt => opt.Ignore())
            .ForMember(dest => dest.Citizenship, opt => opt.Ignore())
            .ForMember(dest => dest.Ama, opt => opt.Ignore())
            .ForMember(dest => dest.Amka, opt => opt.Ignore())
            .ForMember(dest => dest.Afm, opt => opt.Ignore())
            .ForMember(dest => dest.Doy, opt => opt.Ignore())
            .ForMember(dest => dest.Phone, opt => opt.Ignore())
            .ForMember(dest => dest.Email, opt => opt.Ignore())
            .ForMember(dest => dest.Iban1, opt => opt.Ignore())
            .ForMember(dest => dest.Iban2, opt => opt.Ignore())
            .ForMember(dest => dest.IsActive, opt => opt.Ignore())
            .ForMember(dest => dest.SecondaryEmployeeNumber, opt => opt.Ignore())
            .ForMember(dest => dest.Headquarters, opt => opt.Ignore())
            .ForMember(dest => dest.Notes, opt => opt.Ignore());
    }
}