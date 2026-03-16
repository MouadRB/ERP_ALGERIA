export const fetchBFF = async <T>(path: string): Promise<T> => {
  const baseUrl = process.env.NEXT_PUBLIC_BFF_BASE_URL ?? "";
  const response = await fetch(`${baseUrl}${path}`, { cache: "no-store" });
  if (!response.ok) {
    let message = "BFF request failed";
    try {
      const data = (await response.json()) as { error?: string };
      if (data?.error) {
        message = data.error;
      }
    } catch {
      // ignore json parsing errors
    }
    throw new Error(message);
  }
  return (await response.json()) as T;
};

export const postBFF = async <T>(
  path: string,
  body: Record<string, unknown>
): Promise<T> => {
  const baseUrl = process.env.NEXT_PUBLIC_BFF_BASE_URL ?? "";
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    let message = "BFF request failed";
    try {
      const data = (await response.json()) as { error?: string };
      if (data?.error) {
        message = data.error;
      }
    } catch {
      // ignore json parsing errors
    }
    throw new Error(message);
  }
  return (await response.json()) as T;
};
