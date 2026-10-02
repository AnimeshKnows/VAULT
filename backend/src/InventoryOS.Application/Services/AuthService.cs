using FluentValidation;
using InventoryOS.Application.DTOs.Auth;
using InventoryOS.Application.Interfaces;
using InventoryOS.Domain.Entities;
using InventoryOS.Domain.Enums;
using InventoryOS.Domain.Exceptions;

namespace InventoryOS.Application.Services;

public sealed class AuthService : IAuthService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserRepository _users;
    private readonly ITokenService _tokenService;
    private readonly IPasswordHasherService _passwordHasher;
    private readonly IValidator<RegisterRequest> _registerValidator;
    private readonly IValidator<LoginRequest> _loginValidator;
    private readonly ICurrentTenantService _currentTenant;
    private readonly ICurrentUserService _currentUser;

    public AuthService(
        IUnitOfWork unitOfWork,
        IUserRepository users,
        ITokenService tokenService,
        IPasswordHasherService passwordHasher,
        IValidator<RegisterRequest> registerValidator,
        IValidator<LoginRequest> loginValidator,
        ICurrentTenantService currentTenant,
        ICurrentUserService currentUser)
    {
        _unitOfWork = unitOfWork;
        _users = users;
        _tokenService = tokenService;
        _passwordHasher = passwordHasher;
        _registerValidator = registerValidator;
        _loginValidator = loginValidator;
        _currentTenant = currentTenant;
        _currentUser = currentUser;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default)
    {
        await _registerValidator.ValidateAndThrowAsync(request, cancellationToken);

        var tenant = new Tenant
        {
            Name = request.TenantName.Trim(),
            IsActive = true
        };

        await _unitOfWork.Repository<Tenant>().AddAsync(tenant, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Bind tenant for subsequent scoped writes / filters
        _currentTenant.SetTenantId(tenant.Id);

        var user = new User
        {
            TenantId = tenant.Id,
            Email = request.Email.Trim().ToLowerInvariant(),
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName.Trim(),
            Role = Role.Admin,
            IsActive = true
        };
        user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);

        await _users.AddAsync(user, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return await _tokenService.IssueTokensAsync(user, cancellationToken);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        await _loginValidator.ValidateAndThrowAsync(request, cancellationToken);

        var email = request.Email.Trim().ToLowerInvariant();
        var user = await _users.GetByEmailAndTenantIgnoreFiltersAsync(email, request.TenantId, cancellationToken);

        if (user is null || !user.IsActive
            || !_passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password))
        {
            throw new UnauthorizedException("Invalid email, password, or tenant.");
        }

        _currentTenant.SetTenantId(user.TenantId);
        return await _tokenService.IssueTokensAsync(user, cancellationToken);
    }

    public Task<AuthResponse> RefreshAsync(RefreshTokenRequest request, CancellationToken cancellationToken = default)
        => _tokenService.RefreshAsync(request.RefreshToken, cancellationToken);

    public Task LogoutAsync(RefreshTokenRequest request, CancellationToken cancellationToken = default)
        => _tokenService.RevokeRefreshTokenAsync(request.RefreshToken, cancellationToken);

    public async Task<CurrentUserDto> GetCurrentUserAsync(CancellationToken cancellationToken = default)
    {
        if (!_currentUser.UserId.HasValue || _currentUser.UserId == Guid.Empty)
        {
            throw new UnauthorizedException("User context is required.");
        }

        var user = await _users.GetByIdAsync(_currentUser.UserId.Value, cancellationToken)
            ?? throw new NotFoundException(nameof(User), _currentUser.UserId.Value);

        return new CurrentUserDto(
            user.Id,
            user.TenantId,
            user.Email,
            user.FirstName,
            user.LastName,
            user.Role.ToString(),
            user.IsActive);
    }
}
