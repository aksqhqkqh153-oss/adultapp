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
    const savedBase = window.localStorage.getItem("adultapp_active_api_base")?.trim();
    if (savedBase) bases.push(normalizeBase(savedBase));

    const { hostname, origin } = window.location;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      bases.push("http://localhost:8000/api");
      bases.push("http://127.0.0.1:8000/api");
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
const DEFAULT_TIMEOUT_MS = 10000;

let activeApiBase = API_BASES[0];

let accessToken = localStorage.getItem("adultapp_access_token") ?? "";
let refreshToken = localStorage.getItem("adultapp_refresh_token") ?? "";
let refreshPromise: Promise<boolean> | null = null;

function timeoutForPath(path: string) {
  if (path.startsWith("/auth/login")) return 12000;
  if (path.startsWith("/auth/me")) return 8000;
  if (path.startsWith("/auth/refresh")) return 8000;
  return DEFAULT_TIMEOUT_MS;
}

function saveActiveApiBase(base: string) {
  activeApiBase = base;
  if (typeof window !== "undefined") {
    window.localStorage.setItem("adultapp_active_api_base", base);
  }
}

function shouldSkipRefresh(path: string) {
  return path.startsWith("/auth/login") || path.startsWith("/auth/refresh") || path.startsWith("/auth/logout");
}

async function refreshAccessToken(): Promise<boolean> {
  if (!refreshToken) return false;
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    for (const base of [activeApiBase, ...API_BASES.filter((item) => item !== activeApiBase)]) {
      try {
        const response = await requestOnce<{ access_token: string; refresh_token: string }>(
          base,
          "/auth/refresh",
          {
            method: "POST",
            body: JSON.stringify({ refresh_token: refreshToken }),
          },
          false,
        );
        if (response.access_token) setAuthToken(response.access_token);
        if (response.refresh_token) setRefreshToken(response.refresh_token);
        saveActiveApiBase(base);
        return true;
      } catch {
        // try next base
      }
    }
    clearTokens();
    return false;
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

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

export async function ensureAuthSession() {
  if (accessToken) return true;
  if (!refreshToken) return false;
  return refreshAccessToken();
}

async function requestOnce<T>(base: string, path: string, init?: RequestInit, allowRefresh = true): Promise<T> {
  const headers = new Headers(init?.headers ?? {});
  const isFormData = typeof FormData !== "undefined" && init?.body instanceof FormData;
  if (!headers.has("Content-Type") && init?.body && !isFormData) headers.set("Content-Type", "application/json");
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

  const controller = new AbortController();
  const timeoutMs = timeoutForPath(path);
  const timeout = window.setTimeout(() => controller.abort(new DOMException(`timeout after ${timeoutMs}ms`, "TimeoutError")), timeoutMs);

  try {
    const response = await fetch(`${base}${path}`, { ...init, headers, signal: controller.signal });
    if (!response.ok) {
      const text = await response.text();
      if (response.status === 401 && allowRefresh && refreshToken && !shouldSkipRefresh(path)) {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          return requestOnce<T>(base, path, init, false);
        }
      }
      if (response.status === 401 && shouldSkipRefresh(path)) {
        clearTokens();
      }
      throw new Error(`${init?.method ?? "GET"} ${path} failed: ${response.status} ${text}`);
    }
    saveActiveApiBase(base);
    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error(`${init?.method ?? "GET"} ${path} timeout`);
    }
    throw error;
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
