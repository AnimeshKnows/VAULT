namespace InventoryOS.Domain.Exceptions;

/// <summary>Maps to HTTP 401 Unauthorized.</summary>
public class UnauthorizedException : Exception
{
    public UnauthorizedException(string message) : base(message)
    {
    }
}
