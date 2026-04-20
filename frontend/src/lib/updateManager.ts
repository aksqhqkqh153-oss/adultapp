const BUILD_VERSION = __APP_BUILD_VERSION__;
const VERSION_URL = "/version.json";
const UPDATE_ATTEMPT_KEY = "adultapp:update-attempt-version";
const UPDATE_ATTEMPT_AT_KEY = "adultapp:update-attempt-at";
const UPDATE_QUERY_KEY = "app_updated";
const UPDATE_COOLDOWN_MS = 30 * 1000;

function getNow(): number {
  return Date.now();
}

async function getRemoteBuildVersion(): Promise<string | null> {
  try {
    const response = await fetch(`${VERSION_URL}?t=${getNow()}`, {
      cache: "no-store",
      headers: {
        "cache-control": "no-cache, no-store, must-revalidate",
        pragma: "no-cache"
      }
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as { version?: string };
    return typeof data.version === "string" && data.version.trim() ? data.version.trim() : null;
  } catch {
    return null;
  }
}

async function clearBrowserCaches(): Promise<void> {
  if (!("caches" in window)) {
    return;
  }

  try {
    const cacheKeys = await caches.keys();
    await Promise.all(cacheKeys.map((key) => caches.delete(key)));
  } catch {
    // noop
  }
}

function canAttemptReload(nextVersion: string): boolean {
  const previousVersion = window.sessionStorage.getItem(UPDATE_ATTEMPT_KEY);
  const previousAt = Number(window.sessionStorage.getItem(UPDATE_ATTEMPT_AT_KEY) ?? "0");

  if (previousVersion !== nextVersion) {
    return true;
  }

  return getNow() - previousAt > UPDATE_COOLDOWN_MS;
}

function markReloadAttempt(nextVersion: string): void {
  window.sessionStorage.setItem(UPDATE_ATTEMPT_KEY, nextVersion);
  window.sessionStorage.setItem(UPDATE_ATTEMPT_AT_KEY, String(getNow()));
}

function clearReloadAttempt(): void {
  window.sessionStorage.removeItem(UPDATE_ATTEMPT_KEY);
  window.sessionStorage.removeItem(UPDATE_ATTEMPT_AT_KEY);
}

function cleanupUpdatedQueryFlag(): void {
  const url = new URL(window.location.href);
  if (!url.searchParams.has(UPDATE_QUERY_KEY)) {
    return;
  }

  url.searchParams.delete(UPDATE_QUERY_KEY);
  window.history.replaceState({}, document.title, url.toString());
}

async function reloadToLatest(nextVersion: string): Promise<void> {
  if (!canAttemptReload(nextVersion)) {
    return;
  }

  markReloadAttempt(nextVersion);
  await clearBrowserCaches();

  const nextUrl = new URL(window.location.href);
  nextUrl.searchParams.set("v", nextVersion);
  nextUrl.searchParams.set(UPDATE_QUERY_KEY, "1");
  window.location.replace(nextUrl.toString());
}

async function checkForAppUpdate(): Promise<void> {
  const remoteVersion = await getRemoteBuildVersion();
  if (!remoteVersion) {
    return;
  }

  if (remoteVersion === BUILD_VERSION) {
    clearReloadAttempt();
    cleanupUpdatedQueryFlag();
    return;
  }

  await reloadToLatest(remoteVersion);
}

export function setupAppUpdateSync(): void {
  void checkForAppUpdate();

  const runCheck = () => {
    void checkForAppUpdate();
  };

  window.addEventListener("focus", runCheck);
  window.addEventListener("online", runCheck);
  window.addEventListener("pageshow", runCheck);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      runCheck();
    }
  });

  window.setInterval(runCheck, 60 * 1000);
}
