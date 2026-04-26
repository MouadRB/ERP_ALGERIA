using engine_b.Modules.Identity.Domain;
using Microsoft.AspNetCore.Identity;

namespace engine_b.Modules.Identity.Application.Services;

public class DataSeeder(RoleManager<AppRole> roleManager)
{
    public async Task SeedRolesAsync()
    {
        foreach (var roleName in AppRoleNames.AllRoles)
        {
            if (!await roleManager.RoleExistsAsync(roleName))
            {
                await roleManager.CreateAsync(new AppRole(roleName));
            }
        }
    }
}
