// lib/api.ts
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";

function getAuthHeaders(extra?: HeadersInit): Headers {
  const headers = new Headers(extra || {});
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return headers;
}

export async function apiFetch<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${path}`;
  const headers = getAuthHeaders(options.headers);

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let msg = `Request failed with ${res.status}`;
    try {
      const body = await res.json();
      if (body?.error) msg = body.error;
    } catch {
      // ignore JSON parse error
    }
    throw new Error(msg);
  }

  // handle empty responses gracefully
  if (res.status === 204) return {} as T;
  return (await res.json()) as T;
}

// Optional tiny helpers:

export function postJson<T = any>(path: string, body: unknown) {
  return apiFetch<T>(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function getJson<T = any>(path: string) {
  return apiFetch<T>(path, {
    method: "GET",
  });
}
