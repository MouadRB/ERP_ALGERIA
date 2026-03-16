export const can = (role: string, action: string) => {
  if (role === "admin") {
    return true;
  }
  return action !== "dangerous";
};
