namespace engine_b.Modules.Identity.Application.Dtos;

public record AuthResponse(string Token, DateTime Expiry);
