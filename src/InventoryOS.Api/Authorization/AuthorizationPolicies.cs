namespace InventoryOS.Api.Authorization;

/// <summary>
/// Named authorization policies per Docs/Security.md §5.2.
/// </summary>
public static class AuthorizationPolicies
{
    public const string RequireAdmin = "RequireAdmin";
    public const string CanManageInventory = "CanManageInventory";
    public const string CanDeleteInventory = "CanDeleteInventory";
    public const string CanManageOrders = "CanManageOrders";
    public const string CanManageUsers = "CanManageUsers";
}
