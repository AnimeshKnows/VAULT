using InventoryOS.Domain.Entities;

namespace InventoryOS.Application.Interfaces;

public interface IPasswordHasherService
{
    string HashPassword(User user, string password);
    bool VerifyHashedPassword(User user, string hashedPassword, string providedPassword);
}
