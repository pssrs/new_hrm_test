using API.DTOs.File;
using Application.Core;
using Application.Employees.Commands.Files;
using Application.Employees.DTOs.File;
using AutoMapper;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EmpFileController : BaseApiController
    {
        private readonly IMediator _mediator;
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<EmpFileController> _logger;
        private readonly ISybaseService _sybaseService;
        
        public EmpFileController(IMediator mediator, AppDbContext context, IMapper mapper, ILogger<EmpFileController> logger, ISybaseService sybaseService)
        {
            _mediator = mediator;
            _context = context;
            _mapper = mapper;
            _logger = logger;
            _sybaseService = sybaseService;
        }
        
        [HttpGet("fileList/{id}")]
        public async Task<ActionResult<List<Domain.File>>> GetEmployeeFiles(int id)
        {
            var employee = await _context.Employees.FindAsync(id);

            if (employee == null) return NotFound();

            var files = await _context.Files
                .Where(f => f.Am == employee.Am)
                .OrderByDescending(f => f.Id)
                .ToListAsync();

            if (files == null)
                return NotFound();

            return Ok(files);
        }

        [HttpPost("createFile")]
        public async Task<ActionResult<string>> CreateEmployeeFile([FromForm] CreateEmployeeFileDto dto)
        {
            var uploadsFolder = await _context.Paths.FirstOrDefaultAsync(x => x.Id == (dto.Type));
            if (uploadsFolder == null) return NotFound("Upload folder not found for the specified type.");

            var fileName = Path.GetFileName(dto.File.FileName);
            var fullPath = Path.Combine(uploadsFolder.Url, fileName);
            
            Console.WriteLine($"Creating employee file: {fullPath} withe type {dto.Type}");
            if (System.IO.File.Exists(fullPath)) return BadRequest("Υπάρχει ήδη αρχείο με το ίδιο όνομα.");

            Directory.CreateDirectory(uploadsFolder.Url);

            await using (var stream = new FileStream(fullPath, FileMode.Create)) await dto.File.CopyToAsync(stream);

            var employeeFile = new Domain.File
            {
                Am = dto.Am,
                Type = dto.Type,
                Name = fileName,
                Location = fullPath
            };

            return HandleResult(await Mediator.Send(
                new CreateEmployeeFile.Command
                {
                    File = employeeFile
                }));
        }

        [HttpPut("editFile")]
        public async Task<IActionResult> EditEmployeeFile([FromForm] UpdateEmployeeFileDto dto)
        {
            var employeeFile = await _context.Files.FirstOrDefaultAsync(x => x.Id == dto.Id);
            if (employeeFile == null) return NotFound();

            var folder = await _context.Paths.FirstOrDefaultAsync(x => x.Id == dto.Type);
            if (folder == null) return BadRequest("Δεν βρέθηκε φάκελος.");

            Directory.CreateDirectory(folder.Url);

            bool typeChanged = employeeFile.Type != dto.Type;
            bool fileChanged = dto.File != null;

            if (fileChanged)
            {
                if (Path.GetExtension(dto.File!.FileName).ToLower() != ".pdf") return BadRequest("Επιτρέπονται μόνο αρχεία PDF.");
                var newLocation = Path.Combine(folder.Url, dto.File.FileName);
                if (System.IO.File.Exists(newLocation)) return BadRequest("Υπάρχει ήδη αρχείο με το ίδιο όνομα.");
                if (!string.IsNullOrWhiteSpace(employeeFile.Location) && System.IO.File.Exists(employeeFile.Location)) System.IO.File.Delete(employeeFile.Location);
                await using (var stream = new FileStream(newLocation, FileMode.Create)) await dto.File.CopyToAsync(stream);
                employeeFile.Name = dto.File.FileName;
                employeeFile.Location = newLocation;
                employeeFile.Type = dto.Type;
            }
            else if (typeChanged)
            {
                var fileName = Path.GetFileName(employeeFile.Location);
                var newLocation = Path.Combine(folder.Url, fileName);
                if (System.IO.File.Exists(newLocation)) return BadRequest("Υπάρχει ήδη αρχείο με το ίδιο όνομα.");
                if (System.IO.File.Exists(employeeFile.Location)) System.IO.File.Move(employeeFile.Location, newLocation);
                employeeFile.Location = newLocation;
                employeeFile.Type = dto.Type;
            }

            var updatedFile = new Domain.File { Id = employeeFile.Id, Am = employeeFile.Am, Type = dto.Type, Name = employeeFile.Name, Location = employeeFile.Location };
            return HandleResult(await Mediator.Send(new EditEmployeeFile.Command { File = updatedFile }));
        }

        [HttpDelete("deleteFile/{id}")]
        public async Task<ActionResult<string>> DeleteEmployeeFile(int id)
        {
            var file = await _context.Files.FirstOrDefaultAsync(x => x.Id == id);
            if (file == null) return NotFound("Το αρχείο δεν βρέθηκε.");
            if (!string.IsNullOrWhiteSpace(file.Location) && System.IO.File.Exists(file.Location)) System.IO.File.Delete(file.Location);
            return HandleResult(await Mediator.Send(new DeleteEmployeeFile.Command { Id = id }));
        }

        [HttpGet("downloadFile/{id}")]
        public async Task<IActionResult> Download(int id)
        {
            var file = await _context.Files.FindAsync(id);

            if (file == null) return NotFound();
            
            if (string.IsNullOrWhiteSpace(file.Location)) return NotFound();
            
            if (!System.IO.File.Exists(file.Location)) return NotFound();
            
            return PhysicalFile(file.Location, "application/octet-stream", file.Name);
        }
    }
}