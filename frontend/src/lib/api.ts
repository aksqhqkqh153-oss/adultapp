function resolveApiBase() {
  const envBase = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
  if (envBase) return envBase.replace(/\/$/, "");

  if (typeof window !== "undefined") {
    const { hostname, origin } = window.location;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "http://localhost:8000/api";
    }
    if (hostname.endsWith("pages.dev")) {
      return "https://adultapp-production.up.railway.app/api";
    }
    if (hostname.endsWith("up.railway.app")) {
      return `${origin}/api`;
    }
  }

  return "https://adultapp-production.up.railway.app/api";
}

const API_BASE = resolveApiBase();

let accessToken = localStorage.getItem("adultapp_access_token") ?? "";
let refreshToken = localStorage.getItem("adultapp_refresh_token") ?? "";

export function setAuthToken(token: string) {
  accessToken = token;
  if (token) localStorage.setItem("adultapp_access_token", token);
  else localStorage.removeItem("adultapp_access_token");
}

export function setRefreshToken(token: string) {
  refreshToken = token;
  if (token) localStorage.setItem("adultapp_refresh_token", token);
  else localStorage.removeItem("adultapp_refresh_token");
}

export function getRefreshToken() {
  return refreshToken;
}

export function clearTokens() {
  setAuthToken("");
  setRefreshToken("");
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers ?? {});
  const isFormData = typeof FormData !== "undefined" && init?.body instanceof FormData;
  if (!headers.has("Content-Type") && init?.body && !isFormData) headers.set("Content-Type", "application/json");
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
  const response = await fetch(`${API_BASE}${path}`, { ...init, headers });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${init?.method ?? "GET"} ${path} failed: ${response.status} ${text}`);
  }
  return (await response.json()) as T;
}

export function getJson<T>(path: string): Promise<T> {
  return request<T>(path);
}

export function postJson<T>(path: string, payload: unknown): Promise<T> {
  return request<T>(path, { method: "POST", body: JSON.stringify(payload) });
}

export function postForm<T>(path: string, formData: FormData): Promise<T> {
  return request<T>(path, { method: "POST", body: formData });
}
