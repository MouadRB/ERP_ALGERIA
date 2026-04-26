namespace engine_b.Modules.Identity.Application.Dtos;

public record RegisterRequest(string Email, string Password, string FullName);
