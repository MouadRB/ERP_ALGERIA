namespace engine_b.Modules.CRM.Application.Dtos;

public record UpdateCustomerRequest(
    string? FullName,
    string? Phone,
    int? Wilaya,
    string? City,
    string? Email,
    string? SecondaryPhone,
    string? PreferredChannel,
    string? PreferredLanguage,
    string? DeliveryAddress);
