using FluentValidation;
using InventoryOS.Application.DTOs.Users;
using InventoryOS.Application.Interfaces;
using InventoryOS.Domain.Entities;
using InventoryOS.Domain.Enums;
using InventoryOS.Domain.Exceptions;
using DomainValidationException = InventoryOS.Domain.Exceptions.ValidationException;

namespace InventoryOS.Application.Services;

public sealed class UserService : IUserService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPasswordHasherService _passwordHasher;
    private readonly ICurrentTenantService _currentTenant;
    private readonly ICurrentUserService _currentUser;
    private readonly ITokenService _tokenService;
    private readonly IValidator<CreateUserRequest> _createValidator;
    private readonly IValidator<UpdateUserRequest> _updateValidator;

    public UserService(
        IUnitOfWork unitOfWork,
        IPasswordHasherService passwordHasher,
        ICurrentTenantService currentTenant,
        ICurrentUserService currentUser,
        ITokenService tokenService,
        IValidator<CreateUserRequest> createValidator,
        IValidator<UpdateUserRequest> updateValidator)
    {
        _unitOfWork = unitOfWork;
        _passwordHasher = passwordHasher;
        _currentTenant = currentTenant;
        _currentUser = currentUser;
        _tokenService = tokenService;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
    }

    public async Task<IReadOnlyList<UserDto>> ListAsync(CancellationToken cancellationToken = default)
    {
        var users = await _unitOfWork.Users.ListAllAsync(cancellationToken);
        return users
            .OrderBy(u => u.Email)
            .Select(ToDto)
            .ToList();
    }

    public async Task<UserDto> CreateAsync(CreateUserRequest request, CancellationToken cancellationToken = default)
    {
        await _createValidator.ValidateAndThrowAsync(request, cancellationToken);
        EnsureTenant();

        if (request.Role is not (Role.Admin or Role.Staff))
        {
            throw new DomainValidationException("Role must be Admin or Staff.");
        }

        var email = request.Email.Trim().ToLowerInvariant();
        if (await _unitOfWork.Users.EmailExistsForTenantIgnoreFiltersAsync(
                email, _currentTenant.TenantId!.Value, cancellationToken))
        {
            throw new ConflictException($"Email '{email}' is already registered for this tenant.");
        }

        var user = new User
        {
            TenantId = _currentTenant.TenantId.Value,
            Email = email,
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName.Trim(),
            Role = request.Role,
            IsActive = true
        };
        user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);

        await _unitOfWork.Users.AddAsync(user, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return ToDto(user);
    }

    public async Task<UserDto> UpdateAsync(
        Guid id,
        UpdateUserRequest request,
        CancellationToken cancellationToken = default)
    {
        await _updateValidator.ValidateAndThrowAsync(request, cancellationToken);

        if (request.Role is not (Role.Admin or Role.Staff))
        {
            throw new DomainValidationException("Role must be Admin or Staff.");
        }

        var user = await _unitOfWork.Users.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException(nameof(User), id);

        if (_currentUser.UserId == id && !request.IsActive)
        {
            throw new DomainValidationException("You cannot deactivate your own account.");
        }

        var wasActive = user.IsActive;
        user.FirstName = request.FirstName.Trim();
        user.LastName = request.LastName.Trim();
        user.Role = request.Role;
        user.IsActive = request.IsActive;

        _unitOfWork.Users.Update(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        if (wasActive && !user.IsActive)
        {
            await _tokenService.RevokeAllRefreshTokensForUserAsync(user.Id, cancellationToken);
        }

        return ToDto(user);
    }

    public async Task DeactivateAsync(Guid id, CancellationToken cancellationToken = default)
    {
        if (_currentUser.UserId == id)
        {
            throw new DomainValidationException("You cannot deactivate your own account.");
        }

        var user = await _unitOfWork.Users.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException(nameof(User), id);

        user.IsActive = false;
        _unitOfWork.Users.Update(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        await _tokenService.RevokeAllRefreshTokensForUserAsync(user.Id, cancellationToken);
    }

    private void EnsureTenant()
    {
        if (!_currentTenant.TenantId.HasValue || _currentTenant.TenantId == Guid.Empty)
        {
            throw new UnauthorizedException("Tenant context is required.");
        }
    }

    private static UserDto ToDto(User user)
        => new(
            user.Id,
            user.Email,
            user.FirstName,
            user.LastName,
            user.Role.ToString(),
            user.IsActive,
            user.CreatedAt,
            user.UpdatedAt);
}
