namespace API.DTOs;

public class CreateUserDto
{
    public required string UserName { get; set; }
    public required string FullName { get; set; }
    public required string Email { get; set; }
    public int Am { get; set; }
}
