
namespace Application.Employees.DTOs.File
{
    public class CreateEmployeeFileDto
    {
        public int Am { get; set; }

        public int Type { get; set; }

        public IFormFile File { get; set; } = null!;
    }
}