using Microsoft.AspNetCore.Identity;

namespace engine_b.Modules.Identity.Domain;

public class AppRole : IdentityRole<Guid>
{
    public AppRole() { }
    public AppRole(string roleName) : base(roleName) { }
}
