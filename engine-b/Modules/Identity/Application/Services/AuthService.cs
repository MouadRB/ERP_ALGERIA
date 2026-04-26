using engine_b.Modules.Identity.Application.Dtos;
using engine_b.Modules.Identity.Domain;
using Microsoft.AspNetCore.Identity;

namespace engine_b.Modules.Identity.Application.Services;

public class AuthService(
    UserManager<AppUser> userManager,
    RoleManager<AppRole> roleManager,
    TokenService tokenService)
{
    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        var existing = await userManager.FindByEmailAsync(request.Email);
        if (existing is not null)
            throw new InvalidOperationException("A user with this email already exists.");

        var user = new AppUser
        {
            UserName = request.Email,
            Email = request.Email,
            FullName = request.FullName,
        };

        var result = await userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            var errors = string.Join("; ", result.Errors.Select(e => e.Description));
            throw new InvalidOperationException($"Registration failed: {errors}");
        }

        // Ensure default role exists then assign
        const string defaultRole = "User";
        if (!await roleManager.RoleExistsAsync(defaultRole))
            await roleManager.CreateAsync(new AppRole(defaultRole));

        await userManager.AddToRoleAsync(user, defaultRole);

        var roles = await userManager.GetRolesAsync(user);
        return tokenService.CreateToken(user, roles, user.TenantId);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var user = await userManager.FindByEmailAsync(request.Email)
            ?? throw new InvalidOperationException("Invalid email or password.");

        var valid = await userManager.CheckPasswordAsync(user, request.Password);
        if (!valid)
            throw new InvalidOperationException("Invalid email or password.");

        var roles = await userManager.GetRolesAsync(user);
        return tokenService.CreateToken(user, roles, user.TenantId);
    }
}
