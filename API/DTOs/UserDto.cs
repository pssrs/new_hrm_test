using System;

namespace API.DTOs;

public class UserDto
{
    public required string UserName { get; set; }
    public required string Group { get; set; }
    public required string FullName { get; set; }
    public required int Kk { get; set; }
    public required string Email { get; set; }
    public required string Token { get; set; }
}
