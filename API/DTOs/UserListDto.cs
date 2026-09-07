namespace API.DTOs;

public class UserListDto
{
    public required int Id { get; set; }
    public int Am { get; set; }
    public required string UserName { get; set; }
    public string? FullName { get; set; }
    public string? Email { get; set; }
    public string? Name { get; set; }
}
