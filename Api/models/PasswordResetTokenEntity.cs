namespace Api.Models;

public class PasswordResetTokenEntity
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }

    // store HASHED token, not raw token
    public byte[] TokenHash { get; set; } = Array.Empty<byte>();

    public DateTime ExpiresAtUtc { get; set; }
    public DateTime? UsedAtUtc { get; set; }

    public UserEntity? User { get; set; }
}