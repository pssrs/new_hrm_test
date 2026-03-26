using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using API.DTOs;
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

        public AccountController(AppDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
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
            var UserName = User.FindFirst("UserName")?.Value;

            var user = await _context.Users
                .Where(e => e.UserName == UserName)
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
