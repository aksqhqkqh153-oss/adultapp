const UPDATE_QUERY_KEY = "app_updated";
const VERSION_QUERY_KEY = "v";

function cleanupUpdatedQueryFlag(): void {
  const url = new URL(window.location.href);
  let changed = false;

  if (url.searchParams.has(UPDATE_QUERY_KEY)) {
    url.searchParams.delete(UPDATE_QUERY_KEY);
    changed = true;
  }

  if (url.searchParams.has(VERSION_QUERY_KEY)) {
    url.searchParams.delete(VERSION_QUERY_KEY);
    changed = true;
  }

  if (changed) {
    window.history.replaceState({}, document.title, url.toString());
  }
}

export function setupAppUpdateSync(): void {
  cleanupUpdatedQueryFlag();
}
