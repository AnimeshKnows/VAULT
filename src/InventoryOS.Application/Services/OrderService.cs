using FluentValidation;
using InventoryOS.Application.DTOs.Common;
using InventoryOS.Application.DTOs.Orders;
using InventoryOS.Application.Interfaces;
using InventoryOS.Application.Mapping;
using InventoryOS.Domain.Entities;
using InventoryOS.Domain.Enums;
using InventoryOS.Domain.Exceptions;
using DomainValidationException = InventoryOS.Domain.Exceptions.ValidationException;

namespace InventoryOS.Application.Services;

public sealed class OrderService : IOrderService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentTenantService _currentTenant;
    private readonly IValidator<CreateOrderRequest> _createValidator;

    public OrderService(
        IUnitOfWork unitOfWork,
        ICurrentTenantService currentTenant,
        IValidator<CreateOrderRequest> createValidator)
    {
        _unitOfWork = unitOfWork;
        _currentTenant = currentTenant;
        _createValidator = createValidator;
    }

    public async Task<PagedResult<OrderListDto>> GetPagedAsync(
        int page,
        int pageSize,
        OrderStatus? status,
        CancellationToken cancellationToken = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var (items, total) = await _unitOfWork.Orders.GetPagedOrdersAsync(page, pageSize, status, cancellationToken);
        return new PagedResult<OrderListDto>(items.Select(o => o.ToListDto()).ToList(), page, pageSize, total);
    }

    public async Task<OrderDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var order = await _unitOfWork.Orders.GetOrderWithItemsAsync(id, cancellationToken)
            ?? throw new NotFoundException(nameof(Order), id);
        return order.ToDto();
    }

    public async Task<OrderDto> CreateAsync(CreateOrderRequest request, CancellationToken cancellationToken = default)
    {
        await _createValidator.ValidateAndThrowAsync(request, cancellationToken);
        EnsureTenant();

        var orderId = await _unitOfWork.ExecuteInTransactionAsync(async () =>
        {
            var order = new Order
            {
                TenantId = _currentTenant.TenantId!.Value,
                OrderNumber = await GenerateOrderNumberAsync(cancellationToken),
                CustomerName = request.CustomerName.Trim(),
                CustomerEmail = request.CustomerEmail.Trim().ToLowerInvariant(),
                Status = OrderStatus.Draft
            };

            decimal total = 0;
            foreach (var line in request.Items)
            {
                var product = await _unitOfWork.Products.GetByIdAsync(line.ProductId, cancellationToken)
                    ?? throw new NotFoundException(nameof(Product), line.ProductId);

                if (!product.IsActive)
                {
                    throw new DomainValidationException($"Product '{product.Sku}' is inactive.");
                }

                if (product.Stock < line.Quantity)
                {
                    throw new DomainValidationException(
                        $"Insufficient stock for '{product.Sku}'. Available: {product.Stock}, requested: {line.Quantity}.");
                }

                var lineTotal = product.Price * line.Quantity;
                total += lineTotal;

                order.Items.Add(new OrderItem
                {
                    TenantId = _currentTenant.TenantId!.Value,
                    ProductId = product.Id,
                    Quantity = line.Quantity,
                    UnitPrice = product.Price,
                    TotalPrice = lineTotal
                });
            }

            order.TotalAmount = total;
            await _unitOfWork.Orders.AddAsync(order, cancellationToken);
            return order.Id;
        }, cancellationToken);

        var created = await _unitOfWork.Orders.GetOrderWithItemsAsync(orderId, cancellationToken)
            ?? throw new NotFoundException(nameof(Order), orderId);
        return created.ToDto();
    }

    public async Task<OrderDto> UpdateStatusAsync(Guid id, UpdateOrderStatusRequest request, CancellationToken cancellationToken = default)
    {
        return await _unitOfWork.ExecuteInTransactionAsync(async () =>
        {
            var order = await _unitOfWork.Orders.GetOrderWithItemsAsync(id, cancellationToken)
                ?? throw new NotFoundException(nameof(Order), id);

            ValidateTransition(order.Status, request.Status);

            if (request.Status == OrderStatus.Confirmed && order.Status == OrderStatus.Draft)
            {
                await DecrementStockForOrderAsync(order, cancellationToken);
            }

            if (request.Status == OrderStatus.Cancelled
                && order.Status is OrderStatus.Confirmed or OrderStatus.Fulfilled)
            {
                await RestockForOrderAsync(order, cancellationToken);
            }

            order.Status = request.Status;
            _unitOfWork.Orders.Update(order);
            return order.ToDto();
        }, cancellationToken);
    }

    public Task CancelAsync(Guid id, CancellationToken cancellationToken = default)
        => UpdateStatusAsync(id, new UpdateOrderStatusRequest(OrderStatus.Cancelled), cancellationToken);

    private async Task DecrementStockForOrderAsync(Order order, CancellationToken cancellationToken)
    {
        foreach (var item in order.Items)
        {
            var product = await _unitOfWork.Products.GetByIdAsync(item.ProductId, cancellationToken)
                ?? throw new NotFoundException(nameof(Product), item.ProductId);

            if (product.Stock < item.Quantity)
            {
                throw new DomainValidationException(
                    $"Cannot confirm order: insufficient stock for '{product.Sku}'.");
            }

            product.Stock -= item.Quantity;
            _unitOfWork.Products.Update(product);
        }
    }

    private async Task RestockForOrderAsync(Order order, CancellationToken cancellationToken)
    {
        foreach (var item in order.Items)
        {
            var product = await _unitOfWork.Products.GetByIdAsync(item.ProductId, cancellationToken);
            if (product is null)
            {
                continue;
            }

            product.Stock += item.Quantity;
            _unitOfWork.Products.Update(product);
        }
    }

    private static void ValidateTransition(OrderStatus current, OrderStatus next)
    {
        var allowed = current switch
        {
            OrderStatus.Draft => new[] { OrderStatus.Confirmed, OrderStatus.Cancelled },
            OrderStatus.Confirmed => new[] { OrderStatus.Fulfilled, OrderStatus.Cancelled },
            OrderStatus.Fulfilled => Array.Empty<OrderStatus>(),
            OrderStatus.Cancelled => Array.Empty<OrderStatus>(),
            _ => Array.Empty<OrderStatus>()
        };

        if (!allowed.Contains(next))
        {
            throw new DomainValidationException($"Cannot transition order from {current} to {next}.");
        }
    }

    private async Task<string> GenerateOrderNumberAsync(CancellationToken cancellationToken)
    {
        for (var attempt = 0; attempt < 5; attempt++)
        {
            var candidate = $"ORD-{DateTime.UtcNow:yyyyMMddHHmmss}-{Random.Shared.Next(1000, 9999)}";
            var existing = await _unitOfWork.Orders.GetByOrderNumberAsync(candidate, cancellationToken);
            if (existing is null)
            {
                return candidate;
            }
        }

        return $"ORD-{Guid.NewGuid():N}"[..20];
    }

    private void EnsureTenant()
    {
        if (!_currentTenant.TenantId.HasValue || _currentTenant.TenantId == Guid.Empty)
        {
            throw new UnauthorizedException("Tenant context is required.");
        }
    }
}
