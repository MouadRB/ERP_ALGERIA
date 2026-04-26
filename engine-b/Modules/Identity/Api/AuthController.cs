using System.Security.Claims;
using engine_b.Modules.Identity.Application.Dtos;
using engine_b.Modules.Identity.Application.Services;
using engine_b.Modules.Identity.Domain;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace engine_b.Modules.Identity.Api;

[ApiController]
[Route("api/auth")]
[AllowAnonymous]
public class AuthController(
    AuthService authService,
    UserManager<AppUser> userManager,
    TokenService tokenService) : ControllerBase
{
    /// <summary>Register a new user account.</summary>
    [HttpPost("register")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        try
        {
            var response = await authService.RegisterAsync(request);
            return Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>Login with email and password, receive a JWT.</summary>
    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        try
        {
            var response = await authService.LoginAsync(request);
            return Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            return Unauthorized(new { error = ex.Message });
        }
    }

    // ─── Google OAuth ─────────────────────────────────────────────────────────

    /// <summary>Redirects to Google consent screen.</summary>
    [HttpGet("google")]
    public IActionResult GoogleLogin()
    {
        var properties = new AuthenticationProperties
        {
            RedirectUri = Url.Action(nameof(GoogleCallback)),
        };
        return Challenge(properties, GoogleDefaults.AuthenticationScheme);
    }

    /// <summary>Google callback — finds or creates AppUser then returns JWT.</summary>
    [HttpGet("google/callback")]
    public async Task<IActionResult> GoogleCallback()
    {
        var result = await HttpContext.AuthenticateAsync(GoogleDefaults.AuthenticationScheme);
        if (!result.Succeeded)
            return Unauthorized(new { error = "Google authentication failed." });

        var email = result.Principal?.FindFirstValue(ClaimTypes.Email);
        var name  = result.Principal?.FindFirstValue(ClaimTypes.Name);

        if (string.IsNullOrEmpty(email))
            return BadRequest(new { error = "Could not retrieve email from Google." });

        // Find or create user
        var user = await userManager.FindByEmailAsync(email);
        if (user is null)
        {
            user = new AppUser
            {
                UserName = email,
                Email = email,
                FullName = name ?? email,
                EmailConfirmed = true,
            };

            var createResult = await userManager.CreateAsync(user);
            if (!createResult.Succeeded)
            {
                var errors = string.Join("; ", createResult.Errors.Select(e => e.Description));
                return BadRequest(new { error = $"User creation failed: {errors}" });
            }
        }

        var roles = await userManager.GetRolesAsync(user);
        var authResponse = tokenService.CreateToken(user, roles);

        return Ok(authResponse);
    }
    
    /// <summary>Testing utility: Assign a role to a specific user by email. Creates user if they don't exist.</summary>
    [HttpPost("assign-role")]
    [AllowAnonymous] // Only for testing/development - in production this would require SuperAdmin!
    public async Task<IActionResult> AssignRole([FromQuery] string email, [FromQuery] string roleName)
    {
        if (!AppRoleNames.AllRoles.Contains(roleName))
            return BadRequest(new { error = $"Invalid role. Allowed values: {string.Join(", ", AppRoleNames.AllRoles)}" });

        var user = await userManager.FindByEmailAsync(email);
        if (user is null)
        {
            user = new AppUser
            {
                UserName = email,
                Email = email,
                FullName = "Test User " + roleName,
                EmailConfirmed = true,
            };
            var createResult = await userManager.CreateAsync(user, "TestPass123!");
            if (!createResult.Succeeded)
                return BadRequest(new { error = "Failed to create test user." });
        }

        if (!await userManager.IsInRoleAsync(user, roleName))
        {
            var addResult = await userManager.AddToRoleAsync(user, roleName);
            if (!addResult.Succeeded)
                return BadRequest(new { error = "Failed to add role to user." });
        }

        return Ok(new { message = $"User {email} successfully assigned role '{roleName}'." });
    }
}

