export const getLoginUrl = (locale: string) => {
  return `/login?locale=${locale}`;
};

export const exchangeCodeForToken = async (code: string) => {
  return { accessToken: `mock-access-${code}`, refreshToken: "mock-refresh" };
};

export const refreshToken = async () => {
  return { accessToken: "mock-access-refreshed" };
};
