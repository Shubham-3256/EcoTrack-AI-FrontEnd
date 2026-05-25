// lib/api.ts
import { auth } from "@/lib/firebase"

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000"

/**
 * Get the current Firebase ID token.
 * Throws if the user is not signed in.
 */
async function getFirebaseToken(): Promise<string | null> {
  const user = auth.currentUser
  if (!user) return null
  // forceRefresh=false: uses cached token unless it's about to expire
  return user.getIdToken(false)
}

export async function getAuthHeaders(
  headers?: HeadersInit,
  includeJsonContentType = true
): Promise<Headers> {
  const result = new Headers(headers || {})

  if (includeJsonContentType && !result.has("Content-Type")) {
    result.set("Content-Type", "application/json")
  }

  const token = await getFirebaseToken()
  if (token) {
    result.set("Authorization", `Bearer ${token}`)
  }

  return result
}

export async function apiFetch<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${path}`

  const headers = await getAuthHeaders(options.headers)

  const res = await fetch(url, {
    ...options,
    headers,
  })

  if (!res.ok) {
    let msg = `Request failed with status ${res.status}`
    try {
      const body = await res.json()
      if (body?.error) msg = body.error
    } catch {
      // ignore JSON parse error
    }
    throw new Error(msg)
  }

  if (res.status === 204) return {} as T
  return (await res.json()) as T
}

export function postJson<T = any>(path: string, body: unknown) {
  return apiFetch<T>(path, {
    method: "POST",
    body: JSON.stringify(body),
  })
}

export function getJson<T = any>(path: string) {
  return apiFetch<T>(path, { method: "GET" })
}

export function patchJson<T = any>(path: string, body: unknown) {
  return apiFetch<T>(path, {
    method: "PATCH",
    body: JSON.stringify(body),
  })
}

export function deleteJson<T = any>(path: string, body?: unknown) {
  return apiFetch<T>(path, {
    method: "DELETE",
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
}

export async function apiFetchBlob(
  path: string,
  options: RequestInit = {}
): Promise<Blob> {
  const headers = await getAuthHeaders(options.headers, false)

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })

  if (!res.ok) {
    let msg = `Request failed with status ${res.status}`
    try {
      const body = await res.json()
      if (body?.error) msg = body.error
    } catch {
      // ignore JSON parse error
    }
    throw new Error(msg)
  }

  const blob = await res.blob()
  if (!blob || blob.size === 0) throw new Error("Downloaded file is empty")
  return blob
}
