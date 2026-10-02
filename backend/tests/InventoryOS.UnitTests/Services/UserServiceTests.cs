using InventoryOS.Application.DTOs.Users;
using InventoryOS.Application.Interfaces;
using InventoryOS.Application.Services;
using InventoryOS.Application.Validators;
using InventoryOS.Domain.Entities;
using InventoryOS.Domain.Enums;
using InventoryOS.Domain.Exceptions;
using Moq;

namespace InventoryOS.UnitTests.Services;

public class UserServiceTests
{
    private readonly Mock<IUnitOfWork> _uow = new();
    private readonly Mock<IUserRepository> _users = new();
    private readonly Mock<IPasswordHasherService> _hasher = new();
    private readonly Mock<ICurrentTenantService> _tenant = new();
    private readonly Mock<ICurrentUserService> _currentUser = new();
    private readonly Mock<ITokenService> _tokens = new();
    private readonly Guid _tenantId = Guid.NewGuid();
    private readonly UserService _sut;

    public UserServiceTests()
    {
        _uow.SetupGet(x => x.Users).Returns(_users.Object);
        _tenant.SetupGet(x => x.TenantId).Returns(_tenantId);
        _currentUser.SetupGet(x => x.UserId).Returns(Guid.NewGuid());
        _hasher.Setup(h => h.HashPassword(It.IsAny<User>(), It.IsAny<string>())).Returns("hashed");
        _sut = new UserService(
            _uow.Object,
            _hasher.Object,
            _tenant.Object,
            _currentUser.Object,
            _tokens.Object,
            new CreateUserRequestValidator(),
            new UpdateUserRequestValidator());
    }

    [Fact]
    public async Task CreateAsync_WhenEmailExists_ThrowsConflictException()
    {
        _users.Setup(u => u.EmailExistsForTenantIgnoreFiltersAsync(
                It.IsAny<string>(), _tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        await Assert.ThrowsAsync<ConflictException>(() =>
            _sut.CreateAsync(new CreateUserRequest(
                "dup@test.com", "Password1!", "A", "B", Role.Staff)));
    }

    [Fact]
    public async Task CreateAsync_WhenValid_CreatesStaffUser()
    {
        _users.Setup(u => u.EmailExistsForTenantIgnoreFiltersAsync(
                It.IsAny<string>(), _tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);
        _users.Setup(u => u.AddAsync(It.IsAny<User>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((User user, CancellationToken _) => user);

        var result = await _sut.CreateAsync(new CreateUserRequest(
            "new@test.com", "Password1!", "New", "User", Role.Staff));

        Assert.Equal("new@test.com", result.Email);
        Assert.Equal(nameof(Role.Staff), result.Role);
        _uow.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task DeactivateAsync_WhenSelf_ThrowsValidationException()
    {
        var selfId = Guid.NewGuid();
        _currentUser.SetupGet(x => x.UserId).Returns(selfId);

        await Assert.ThrowsAsync<ValidationException>(() => _sut.DeactivateAsync(selfId));
    }

    [Fact]
    public async Task DeactivateAsync_WhenOtherUser_RevokesRefreshTokens()
    {
        var targetId = Guid.NewGuid();
        _users.Setup(u => u.GetByIdAsync(targetId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new User
            {
                Id = targetId,
                TenantId = _tenantId,
                Email = "staff@test.com",
                IsActive = true,
                Role = Role.Staff
            });

        await _sut.DeactivateAsync(targetId);

        _tokens.Verify(
            t => t.RevokeAllRefreshTokensForUserAsync(targetId, It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task UpdateAsync_WhenDeactivating_RevokesRefreshTokens()
    {
        var targetId = Guid.NewGuid();
        _users.Setup(u => u.GetByIdAsync(targetId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new User
            {
                Id = targetId,
                TenantId = _tenantId,
                Email = "staff@test.com",
                FirstName = "Staff",
                LastName = "User",
                IsActive = true,
                Role = Role.Staff
            });

        await _sut.UpdateAsync(
            targetId,
            new UpdateUserRequest("Staff", "User", Role.Staff, IsActive: false));

        _tokens.Verify(
            t => t.RevokeAllRefreshTokensForUserAsync(targetId, It.IsAny<CancellationToken>()),
            Times.Once);
    }
}
