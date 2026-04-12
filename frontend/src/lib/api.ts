function normalizeBase(value: string) {
  return value.replace(/\/$/, "");
}

function collectApiBases() {
  const bases: string[] = [];
  const envBase = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
  const envFallbacks = (import.meta.env.VITE_API_BASE_FALLBACKS as string | undefined)?.trim();

  if (envBase) bases.push(normalizeBase(envBase));
  if (envFallbacks) {
    envFallbacks
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .forEach((item) => bases.push(normalizeBase(item)));
  }

  if (typeof window !== "undefined") {
    const { hostname, origin } = window.location;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      bases.push("http://localhost:8000/api");
    } else if (hostname.endsWith("pages.dev")) {
      bases.push("https://adultapp-production.up.railway.app/api");
    } else if (hostname.endsWith("up.railway.app")) {
      bases.push(`${origin}/api`);
    }
  }

  bases.push("https://adultapp-production.up.railway.app/api");
  return [...new Set(bases.filter(Boolean))];
}

const API_BASES = collectApiBases();
const DEFAULT_TIMEOUT_MS = 8000;

let activeApiBase = API_BASES[0];

let accessToken = localStorage.getItem("adultapp_access_token") ?? "";
let refreshToken = localStorage.getItem("adultapp_refresh_token") ?? "";

export function getApiBase() {
  return activeApiBase;
}

export function hasAuthToken() {
  return Boolean(accessToken);
}

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

async function requestOnce<T>(base: string, path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers ?? {});
  const isFormData = typeof FormData !== "undefined" && init?.body instanceof FormData;
  if (!headers.has("Content-Type") && init?.body && !isFormData) headers.set("Content-Type", "application/json");
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(`${base}${path}`, { ...init, headers, signal: controller.signal });
    if (!response.ok) {
      const text = await response.text();
      if (response.status === 401) {
        clearTokens();
      }
      throw new Error(`${init?.method ?? "GET"} ${path} failed: ${response.status} ${text}`);
    }
    activeApiBase = base;
    return (await response.json()) as T;
  } finally {
    window.clearTimeout(timeout);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let lastError: unknown = null;
  for (const base of [activeApiBase, ...API_BASES.filter((item) => item !== activeApiBase)]) {
    try {
      return await requestOnce<T>(base, path, init);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error(`${init?.method ?? "GET"} ${path} failed`);
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
