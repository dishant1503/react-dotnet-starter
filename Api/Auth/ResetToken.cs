using System.Security.Cryptography;
using System.Text;

namespace Api.Auth;

public static class ResetToken
{
    public static string GenerateRawToken()
    {
        var bytes = RandomNumberGenerator.GetBytes(32);
        return Convert.ToBase64String(bytes)
            .Replace("+", "-")
            .Replace("/", "_")
            .Replace("=", "");
    }

    public static byte[] HashToken(string rawToken)
    {
        return SHA256.HashData(Encoding.UTF8.GetBytes(rawToken));
    }
}