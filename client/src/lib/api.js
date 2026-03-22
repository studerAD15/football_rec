export const apiBaseUrl = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace(/\/$/, "");

export function apiUrl(pathname) {
  return `${apiBaseUrl}${pathname}`;
}

export function assetUrl(pathname) {
  if (!pathname) {
    return "";
  }

  if (/^https?:\/\//i.test(pathname)) {
    return pathname;
  }

  return `${apiBaseUrl}${pathname}`;
}
