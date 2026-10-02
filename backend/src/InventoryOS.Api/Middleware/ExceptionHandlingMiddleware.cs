using System.Net;
using FluentValidation;
using InventoryOS.Domain.Exceptions;
using Microsoft.AspNetCore.Mvc;
using DomainValidationException = InventoryOS.Domain.Exceptions.ValidationException;

namespace InventoryOS.Api.Middleware;

/// <summary>
/// Global exception → ProblemDetails mapping per Docs/Rules &amp; Coding Standards.md §3.3.
/// </summary>
public sealed class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;
    private readonly IHostEnvironment _environment;

    public ExceptionHandlingMiddleware(
        RequestDelegate next,
        ILogger<ExceptionHandlingMiddleware> logger,
        IHostEnvironment environment)
    {
        _next = next;
        _logger = logger;
        _environment = environment;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await WriteProblemDetailsAsync(context, ex);
        }
    }

    private async Task WriteProblemDetailsAsync(HttpContext context, Exception exception)
    {
        var (status, title, errors) = MapException(exception);

        if (status >= (int)HttpStatusCode.InternalServerError)
        {
            _logger.LogError(exception, "Unhandled exception for {Method} {Path}", context.Request.Method, context.Request.Path);
        }
        else
        {
            _logger.LogWarning(exception, "Handled exception ({Status}) for {Method} {Path}", status, context.Request.Method, context.Request.Path);
        }

        var problem = new ProblemDetails
        {
            Status = status,
            Title = title,
            Detail = ResolveDetail(exception, status),
            Instance = context.Request.Path
        };

        if (errors is not null)
        {
            problem.Extensions["errors"] = errors;
        }

        context.Response.ContentType = "application/problem+json";
        context.Response.StatusCode = status;
        await context.Response.WriteAsJsonAsync(problem);
    }

    /// <summary>
    /// Development may return exception messages for debugging.
    /// Non-Development returns messages only for intentional domain/validation failures;
    /// unexpected errors always get a sanitized generic detail (no stack traces / system messages).
    /// </summary>
    private string ResolveDetail(Exception exception, int status)
    {
        if (_environment.IsDevelopment())
        {
            return exception.Message;
        }

        if (status >= (int)HttpStatusCode.InternalServerError)
        {
            return "An unexpected error occurred.";
        }

        return exception switch
        {
            NotFoundException or DomainValidationException or ConflictException
                or UnauthorizedException or UnauthorizedAccessException
                or FluentValidation.ValidationException => exception.Message,
            _ => "An unexpected error occurred."
        };
    }

    private static (int Status, string Title, IDictionary<string, string[]>? Errors) MapException(Exception exception)
    {
        return exception switch
        {
            NotFoundException => ((int)HttpStatusCode.NotFound, "Not Found", null),
            DomainValidationException dve => ((int)HttpStatusCode.BadRequest, "Validation Failed", dve.Errors),
            FluentValidation.ValidationException fve => (
                (int)HttpStatusCode.BadRequest,
                "Validation Failed",
                fve.Errors
                    .GroupBy(e => e.PropertyName)
                    .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray())),
            ConflictException => ((int)HttpStatusCode.Conflict, "Conflict", null),
            UnauthorizedException => ((int)HttpStatusCode.Unauthorized, "Unauthorized", null),
            UnauthorizedAccessException => ((int)HttpStatusCode.Forbidden, "Forbidden", null),
            _ => ((int)HttpStatusCode.InternalServerError, "Server Error", null)
        };
    }
}
