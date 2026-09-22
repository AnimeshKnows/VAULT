using InventoryOS.Application.Interfaces;
using InventoryOS.Domain.Entities;
using Microsoft.AspNetCore.Identity;

namespace InventoryOS.Infrastructure.Identity;

public sealed class PasswordHasherService : IPasswordHasherService
{
    private readonly PasswordHasher<User> _hasher = new();

    public string HashPassword(User user, string password)
        => _hasher.HashPassword(user, password);

    public bool VerifyHashedPassword(User user, string hashedPassword, string providedPassword)
    {
        var result = _hasher.VerifyHashedPassword(user, hashedPassword, providedPassword);
        return result is PasswordVerificationResult.Success or PasswordVerificationResult.SuccessRehashNeeded;
    }
}
