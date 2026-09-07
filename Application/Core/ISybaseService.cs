using System.Threading.Tasks;
using Application.Employees.DTOs;
using Application.Employees.DTOs.Personal;
using Application.Employees.DTOs.Services;
using Domain;
namespace Application.Core
{
    public interface ISybaseService
    {
        Task<bool> ExistsAsync(int am, string afm);

        // PERSONAL
        Task<Result<string>> UpdateEmployeePersonalAsync(string afm, int am, EmployeePersonal empPersonalCurrent, EmployeePersonal empPersonalNew);
        Task<Result<string>> UpdateEmployeeInfoAsync(string afm, int am, EmployeeInfo empInfoCurrent, EmployeeInfo empInfoNew);
        Task<Result<string>> UpdateEmployeeIdentityAsync(string afm, int am, EmployeeIdentity empIdentityCurrent, EmployeeIdentity empIdentityNew);
        Task<Result<string>> UpdateEmployeeNumberAsync(string afm, int am, EmployeeNumber empNumberCurrent, EmployeeNumber empNumberNew);
        Task<Result<string>> UpdateEmployeeBankAsync(string afm, int am, EmployeeBank empBankCurrent, EmployeeBank empBankNew);

        //SERVICES
        Task<Result<string>> UpdateEmployeePositionAsync(string afm, int am, EmployeePosition empPositionCurrent, EmployeePosition empPositionNew);
        Task<Result<string>> UpdateEmployeePositionInfoAsync(string afm, int am, EmployeePositionInfo empPositionInfoCurrent, EmployeePositionInfo empPositionInfoNew);
        Task<Result<string>> UpdateEmployeeSalaryAsync(string afm, int am, EmployeeSalary empSalaryCurrent, EmployeeSalary empSalaryNew);
        Task<Result<string>> UpdateEmployeeGradeAsync(string afm, int am, int grade);


        //CREATE EMPLOYEE
        Task CreateEmployeePersonalAsync(Employee employee, int childrenCount);

        //UPDATE CHILDREN
        Task<Result<string>> UpdateEmployeeChildrenAsync(string afm, int am, int employeeChildrenCount);

        Task<Result<string>> UpdateEmployeeMKAsync(string afm, int am, int MK, DateOnly MKNextDate);

        //Changes
        Task<Result<string>> UpdateEmployeeBreakDate(string afm, int am, DateOnly breakDate);
    }
}
