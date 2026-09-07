using Domain;

namespace Application.Core.Services
{
    public interface IEmployeeReportService
    {
        Task<byte[]> GenerateWorkCertificate(Employee employee);
        Task<byte[]> GenerateAtomikoDeltioKataxis(Employee employee);
        Task<byte[]> GenerateVevaiosiProipiresias(Employee employee);
        Task<byte[]> GenerateKatastasiAnarrotikwn(Employee employee);
        Task<byte[]> GenerateYphresiakesMetavoles(Employee employee);
    }
}