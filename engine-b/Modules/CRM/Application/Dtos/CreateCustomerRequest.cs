namespace engine_b.Modules.CRM.Application.Dtos;

public record CreateCustomerRequest(
    string FullName,
    string Phone,
    int Wilaya,
    string City,
    string? Email = null);
