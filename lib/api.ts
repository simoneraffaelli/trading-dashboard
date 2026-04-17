const BASE = "/api";

export async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}/${path}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${res.statusText}`);
  }
  return res.json();
}
