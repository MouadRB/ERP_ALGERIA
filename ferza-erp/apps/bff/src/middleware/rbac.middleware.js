function extractRoles(decoded) {
  const realmRoles = decoded?.realm_access?.roles;
  if (Array.isArray(realmRoles)) return realmRoles;
  return [];
}

export function requireRoles(...roles) {
  return (req, res, next) => {
    const decoded = req.user?.decoded;
    if (!decoded) return res.status(401).json({ error: "Unauthorized" });
    const userRoles = extractRoles(decoded);
    const allowed = roles.some((r) => userRoles.includes(r));
    if (!allowed) return res.status(403).json({ error: "Forbidden" });
    return next();
  };
}
