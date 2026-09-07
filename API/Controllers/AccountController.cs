using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.RegularExpressions;
using API.DTOs;
using API.Services;
using Domain;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : BaseApiController
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;
        private readonly IEmailService _emailService;

        public AccountController(AppDbContext context, IConfiguration config, IEmailService emailService)
        {
            _context = context;
            _config = config;
            _emailService = emailService;
        }
        
        [HttpPost("login")]
        public async Task<ActionResult<UserDto>> Login([FromBody] LoginDto loginDto)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(x => x.UserName == loginDto.UserName && x.Password == loginDto.Password);

            if (user == null)
                return Unauthorized();

            var userDto = new UserDto
            {
                UserName = user.UserName,
                Group = user.Groups.ToString(),
                FullName = user.Fullname,
                Kk = int.TryParse(user.Kk, out var kkVal) ? kkVal : 0,
                Email = user.Email,
                Token = CreateToken(user.Email, user.UserName)
            };

            return Ok(userDto);
        }

        [Authorize]
        [HttpGet("current")]
        public async Task<ActionResult<UserDto>> GetCurrentUser()
        {
            var userName = User.FindFirst("userName")?.Value;

            var user = await _context.Users
                .Where(e => e.UserName == userName)
                .FirstOrDefaultAsync();

            if (user == null) return NotFound();

            var userDto = new UserDto
            {
                UserName = user.UserName,
                Group = user.Groups.ToString(),
                FullName = user.Fullname,
                Kk = int.TryParse(user.Kk, out var kkVal) ? kkVal : 0,
                Email = user.Email,
                Token = CreateToken(user.Email, user.UserName)
            };

            return Ok(userDto);
        }

        [Authorize]
        [HttpGet("users/check-username/{username}")]
        public async Task<ActionResult<object>> CheckUsernameAvailability(string username)
        {
            var exists = await _context.Users.AnyAsync(u => u.UserName == username);
            return Ok(new { available = !exists });
        }

        [Authorize]
        [HttpGet("users/check-am/{am}")]
        public async Task<ActionResult<object>> CheckAmAvailability(int am)
        {
            var exists = await _context.Users.AnyAsync(u => u.Am == am);
            return Ok(new { available = !exists });
        }

        [Authorize]
        [HttpGet("users")]
        public async Task<ActionResult<List<UserListDto>>> GetAllUsers()
        {
            if (!await IsAdminAsync())
                return Unauthorized();

            var users = await _context.Users
                .Where(u => u.Kk != "1")
                .Select(u => new UserListDto
                {
                    Id = u.Id,
                    UserName = u.UserName ?? "",
                    FullName = u.Fullname ?? "Χωρίς όνομα",
                    Email = u.Email ?? "",
                    Name = u.Fullname ?? "Χωρίς όνομα",
                    Am = u.Am
                })
                .OrderBy(u => u.FullName)
                .ToListAsync();

            return Ok(users);
        }

        [Authorize]
        [HttpPost("users")]
        public async Task<ActionResult<string>> CreateUser([FromBody] CreateUserDto dto)
        {
            if (!await IsAdminAsync())
                return Unauthorized();

            var nonAdminUserCount = await _context.Users.CountAsync(u => u.Kk != "1");
            if (nonAdminUserCount >= 15)
                return BadRequest("Έχετε φτάσει το όριο των 15 χρηστών");

            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.UserName == dto.UserName);
            if (existingUser != null)
                return BadRequest("Ο χρήστης υπάρχει ήδη");

            var employee = await _context.Employees.FirstOrDefaultAsync(e => e.Am == dto.Am);
            if (employee == null)
                return BadRequest("Δεν βρέθηκε υπάλληλος με το δεδομένο ΑΜ");

            var generatedPassword = GeneratePassword(employee.Afm);

            var user = new User
            {
                Id = 0,
                UserName = dto.UserName,
                Fullname = dto.FullName,
                Email = dto.Email,
                Am = dto.Am,
                Password = generatedPassword,
                Kk = "",
                Groups = 1
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            try
            {
                await _emailService.SendPasswordEmailAsync(user.Email, user.UserName, generatedPassword);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to send password email: {ex.Message}");
            }

            return Ok("Ο χρήστης δημιουργήθηκε με επιτυχία");
        }

        private static string GeneratePassword(string afm)
        {
            var specialChars = new[] { "!", "@", "#", "$", "%", "^", "&", "*" };
            var smallLetters = "abcdefghijklmnopqrstuvwxyz";
            var bigLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            var random = new Random();

            var symbol = specialChars[random.Next(specialChars.Length)];

            var randomLetters = new List<char>
            {
                smallLetters[random.Next(smallLetters.Length)],
                smallLetters[random.Next(smallLetters.Length)],
                bigLetters[random.Next(bigLetters.Length)]
            };

            randomLetters = randomLetters.OrderBy(x => random.Next()).ToList();
            var lettersString = new string(randomLetters.ToArray());
            var lastFourAfm = afm?.Length >= 4 ? afm.Substring(afm.Length - 4) : "0000";

            return $"{symbol}{lettersString}{lastFourAfm}{symbol}";
        }

        [Authorize]
        [HttpPut("users/{id}")]
        public async Task<ActionResult<string>> UpdateUser(int id, [FromBody] CreateUserDto dto)
        {
            if (!await IsAdminAsync())
                return Unauthorized();

            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound("Ο χρήστης δεν βρέθηκε");

            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.UserName == dto.UserName && u.Id != id);
            if (existingUser != null)
                return BadRequest("Το username χρησιμοποιείται ήδη");

            user.UserName = dto.UserName;
            user.Fullname = dto.FullName;
            user.Email = dto.Email;
            user.Am = dto.Am;

            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            return Ok("Ο χρήστης ενημερώθηκε με επιτυχία");
        }

        [Authorize]
        [HttpDelete("users/{id}")]
        public async Task<ActionResult<string>> DeleteUser(int id)
        {
            if (!await IsAdminAsync())
                return Unauthorized();

            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound("Ο χρήστης δεν βρέθηκε");

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return Ok("Ο χρήστης διαγράφηκε με επιτυχία");
        }

        [Authorize]
        [HttpPost("change-password")]
        public async Task<ActionResult<string>> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            var userName = User.FindFirst("userName")?.Value;
            if (string.IsNullOrEmpty(userName))
                return Unauthorized();

            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserName == userName);
            if (user == null)
                return NotFound("Ο χρήστης δεν βρέθηκε");

            if (user.Password != dto.CurrentPassword)
                return BadRequest("Ο τρέχων κωδικός δεν είναι σωστός");

            if (string.IsNullOrWhiteSpace(dto.NewPassword) ||
                !Regex.IsMatch(dto.NewPassword, @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$"))
                return BadRequest("Ο νέος κωδικός πρέπει να έχει τουλάχιστον 8 χαρακτήρες και να περιέχει ένα κεφαλαίο, ένα πεζό, έναν αριθμό και ένα σύμβολο");

            user.Password = dto.NewPassword;
            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            return Ok("Ο κωδικός άλλαξε με επιτυχία");
        }

        private async Task<bool> IsAdminAsync()
        {
            var userName = User.FindFirst("userName")?.Value;
            if (string.IsNullOrEmpty(userName))
                return false;

            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserName == userName);
            return user?.Kk == "1";
        }

        private string CreateToken(string email, string userName)
        {
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, email),
                new Claim("userName", userName),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(2),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

    }
}
