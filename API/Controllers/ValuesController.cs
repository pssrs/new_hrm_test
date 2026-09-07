using API.DTOs;
using AutoMapper;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class ValuesController : BaseApiController
    {
        private readonly IMediator _mediator;
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public ValuesController(IMediator mediator, AppDbContext context, IMapper mapper)
        {
            _mediator = mediator;
            _context = context;
            _mapper = mapper;
        }

        [HttpGet("Kladoi")]
        public async Task<ActionResult<List<Kladoi>>> GetKladoi()
        {
            var kladoi = await _context.Kladoi.Where(x => x.Visible == 1).ToListAsync();
            if (kladoi == null || kladoi.Count == 0)
                return NotFound("No kladoi found.");

            return Ok(kladoi);
        }

        [HttpGet("Position")]
        public async Task<ActionResult<List<Position>>> GetPositions()
        {
            var positions = await _context.Positions.Where(x => x.Visible == 1).ToListAsync();
            if (positions == null || positions.Count == 0)
                return NotFound("No positions found.");

            return Ok(positions);
        }

        [HttpGet("Eidikothtes")]
        public async Task<ActionResult<List<Eidikothtes>>> GetEidikothtes()
        {
            var eidikothtes = await _context.Eidikothtes.Where(x => x.Visible == 1).ToListAsync();
            if (eidikothtes == null || eidikothtes.Count == 0)
                return NotFound("No eidikothtes found.");

            return Ok(eidikothtes);
        }

        [HttpGet("Address")]
        public async Task<ActionResult<List<Address>>> GetAddresses()
        {
            var addresses = await _context.Addresses.ToListAsync();
            if (addresses == null || addresses.Count == 0)
                return NotFound("No addresses found.");

            return Ok(addresses);
        }

        [HttpGet("Sector")]
        public async Task<ActionResult<List<Sector>>> GetSectors()
        {
            var sectors = await _context.Sectors.ToListAsync();
            if (sectors == null || sectors.Count == 0)
                return NotFound("No sectors found.");

            return Ok(sectors);
        }

        [HttpGet("Department")]
        public async Task<ActionResult<List<Department>>> GetDepartments()
        {
            var departments = await _context.Departments.ToListAsync();
            if (departments == null || departments.Count == 0)
                return NotFound("No departments found.");

            return Ok(departments);
        }

        [HttpGet("Office")]
        public async Task<ActionResult<List<Office>>> GetOffices()
        {
            var offices = await _context.Offices.ToListAsync();
            if (offices == null || offices.Count == 0)
                return NotFound("No offices found.");

            return Ok(offices);
        }

        [HttpGet("Category")]
        public async Task<ActionResult<List<Category>>> GetCategories()
        {
            var categories = await _context.Categories.ToListAsync();
            if (categories == null || categories.Count == 0)
                return NotFound("No categories found.");

            return Ok(categories);
        }

        [HttpGet("Grade")]
        public async Task<ActionResult<List<Grade>>> GetGrade()
        {
            var grades = await _context.Grades.ToListAsync();
            if (grades == null || grades.Count == 0)
                return NotFound("No grades found.");

            return Ok(grades);
        }

        [HttpGet("Doy")]
        public async Task<ActionResult<List<Doy>>> GetDoy()
        {
            var doy = await _context.Doys.ToListAsync();
            if (doy == null || doy.Count == 0)
                return NotFound("No Doy found.");

            return Ok(doy);
        }

        [HttpGet("Penalty")]
        public async Task<ActionResult<List<PenaltyDescription>>> GetPenaltyDescriptions()
        {
            var penaltyDescriptions = await _context.PenaltyDescriptions.ToListAsync();
            if (penaltyDescriptions == null || penaltyDescriptions.Count == 0)
                return NotFound("No Penalty Descriptions found.");

            return Ok(penaltyDescriptions);
        }

        [HttpGet("Leaves")]
        public async Task<ActionResult<List<LeaveType>>> GetLeaves()
        {
            var leaves = await _context.LeaveTypes.ToListAsync();
            if (leaves == null || leaves.Count == 0)
                return NotFound("No Leaves found.");

            foreach (var leave in leaves)
                if(leave.Id == 20 || leave.Id == 21 || leave.Id == 22 || leave.Id == 23 || leave.Id == 24 || leave.Id == 25)
                    leave.Description += " (" + leave.Duration + ")";

            return Ok(leaves);
        }

        [HttpGet("ChangeType")]
        public async Task<ActionResult<List<ChangeType>>> GetChangeTypes()
        {
            var changes = await _context.ChangeType.ToListAsync();
            if (changes == null || changes.Count == 0)
                return NotFound("No Change Types found.");

            return Ok(changes);
        }

        [HttpGet("ChangeTypeMap")]
        public async Task<ActionResult<List<ChangeTypeMap>>> GetChangeTypeMaps()
        {
            var changes = await _context.ChangeTypeMap.ToListAsync();
            if (changes == null || changes.Count == 0)
                return NotFound("No Change Type Maps found.");

            return Ok(changes);
        }

        [HttpGet("FileTypes")]
        public async Task<ActionResult<List<FileType>>> GetFileTypes()
        {
            var changes = await _context.FileTypes.ToListAsync();
            if (changes == null || changes.Count == 0)
                return NotFound("No File Types found.");

            return Ok(changes);
        }

        [HttpGet("Foreas")]
        public async Task<ActionResult<string>> GetForeas()
        {
            var foreas = await _context.Parameters.FirstOrDefaultAsync(x => x.Name == "FOREAS");
            return Ok(foreas != null ? foreas.Value1 : "");
        }

        [HttpGet("PositionSum")]
        public async Task<ActionResult<List<PositionNumberDTO>>> GetPositionSum()
        {
            var employees = await _context.Employees.Where(e => e.IsActive == 1).ToListAsync();
            if (employees == null) return NotFound("No Employees found.");

            var positionSum = await _context.PositionSum.ToListAsync();
            if (positionSum == null)
                return NotFound("No File Types found.");

            var result = positionSum.Select(pos =>
            {
                var used = employees.Count(e =>
                    e.WorkDirectorate == pos.AddressId &&
                    e.WorkSector == pos.SectorId &&
                    e.WorkDepartment == pos.DepartmentId
                );

                var unused = pos.Sum - used;

                return new PositionNumberDTO
                {
                    Id = pos.Id,
                    AddressId = pos.AddressId,
                    SectorId = pos.SectorId,
                    DepartmentId = pos.DepartmentId,
                    OfficeId = pos.OfficeId,
                    Sum = pos.Sum,
                    Used = used,
                    Unused = unused
                };
            }).ToList();

            return Ok(result);
        }

        [HttpGet("studyTypes")]
        public async Task<ActionResult<List<StudyTypes>>> GetStudyTypes()
        {
            var studyTypes = await _context.StudyTypes.ToListAsync();
            if (studyTypes == null || studyTypes.Count == 0)
                return NotFound("No Study Types found.");

            return Ok(studyTypes);
        }

        [HttpGet("argies")]
        public async Task<ActionResult<List<Argies>>> GetArgies()
        {
            var argies = await _context.Argies.ToListAsync();
            if (argies == null || argies.Count == 0)
                return NotFound("No Argies found.");

            return Ok(argies);
        }
    }
}