// Separation of Duties (SoD) middleware placeholder.
// Implement domain-specific rules here (e.g. maker-checker: creator cannot approve).

export function enforceSoD(_options = {}) {
  return (req, res, next) => {
    // TODO: add SoD checks based on req.user + resource ownership.
    return next();
  };
}
