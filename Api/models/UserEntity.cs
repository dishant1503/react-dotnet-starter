namespace Api.Models;

public class UserEntity
{
    public Guid Id { get; set; }
    public string Email { get; set; } = "";
    public byte[] PasswordHash { get; set; } = Array.Empty<byte>();
    public byte[] PasswordSalt { get; set; } = Array.Empty<byte>();

    public List<TaskEntity> Tasks { get; set; } = new();
}