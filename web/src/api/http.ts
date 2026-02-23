const API_BASE = import.meta.env.VITE_API_BASE_URL as string;

export async function http<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed: ${res.status}`);
  }

  // For 204 No Content
  if (res.status === 204) return undefined as T;

  return (await res.json()) as T;
}
