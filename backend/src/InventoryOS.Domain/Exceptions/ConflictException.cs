namespace InventoryOS.Domain.Exceptions;

/// <summary>Maps to HTTP 409 Conflict.</summary>
public class ConflictException : Exception
{
    public ConflictException(string message) : base(message)
    {
    }
}
