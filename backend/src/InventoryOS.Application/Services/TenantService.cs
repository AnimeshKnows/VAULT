using FluentValidation;
using InventoryOS.Application.DTOs.Tenants;
using InventoryOS.Application.Interfaces;
using InventoryOS.Domain.Entities;
using InventoryOS.Domain.Exceptions;

namespace InventoryOS.Application.Services;

public sealed class TenantService : ITenantService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentTenantService _currentTenant;
    private readonly IValidator<UpdateTenantRequest> _updateValidator;

    public TenantService(
        IUnitOfWork unitOfWork,
        ICurrentTenantService currentTenant,
        IValidator<UpdateTenantRequest> updateValidator)
    {
        _unitOfWork = unitOfWork;
        _currentTenant = currentTenant;
        _updateValidator = updateValidator;
    }

    public async Task<TenantDto> GetCurrentAsync(CancellationToken cancellationToken = default)
    {
        var tenant = await GetCurrentTenantEntityAsync(cancellationToken);
        return ToDto(tenant);
    }

    public async Task<TenantDto> UpdateCurrentAsync(
        UpdateTenantRequest request,
        CancellationToken cancellationToken = default)
    {
        await _updateValidator.ValidateAndThrowAsync(request, cancellationToken);
        var tenant = await GetCurrentTenantEntityAsync(cancellationToken);
        tenant.Name = request.Name.Trim();
        _unitOfWork.Repository<Tenant>().Update(tenant);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return ToDto(tenant);
    }

    private async Task<Tenant> GetCurrentTenantEntityAsync(CancellationToken cancellationToken)
    {
        if (!_currentTenant.TenantId.HasValue || _currentTenant.TenantId == Guid.Empty)
        {
            throw new UnauthorizedException("Tenant context is required.");
        }

        return await _unitOfWork.Repository<Tenant>().GetByIdAsync(_currentTenant.TenantId.Value, cancellationToken)
            ?? throw new NotFoundException(nameof(Tenant), _currentTenant.TenantId.Value);
    }

    private static TenantDto ToDto(Tenant tenant)
        => new(tenant.Id, tenant.Name, tenant.IsActive, tenant.CreatedAt);
}
