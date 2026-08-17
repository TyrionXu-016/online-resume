export function getAppUrl() {
  const url = process.env.APP_URL?.trim() || "http://localhost:3000";
  return url.replace(/\/$/, "");
}

export function getAuthCallbackUrl(next?: string) {
  const callback = `${getAppUrl()}/auth/callback`;
  if (!next) {
    return callback;
  }

  const params = new URLSearchParams({ next });
  return `${callback}?${params.toString()}`;
}

export function safeNextPath(next: string | null | undefined, fallback = "/dashboard") {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\")) {
    return fallback;
  }

  return next;
}
