export const roles = ["admin", "manager", "operator", "viewer"] as const;

export type Role = (typeof roles)[number];
