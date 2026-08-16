const RESERVED_SLUGS = new Set([
  "admin",
  "api",
  "app",
  "assets",
  "dashboard",
  "editor",
  "login",
  "register",
  "resumes",
  "settings",
  "static",
  "templates",
  "u",
  "www",
]);

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function normalizeSlug(value: string) {
  return value.trim().toLowerCase();
}

export function isReservedSlug(value: string) {
  return RESERVED_SLUGS.has(normalizeSlug(value));
}

export function isValidSlug(value: string) {
  const slug = normalizeSlug(value);
  return slug.length >= 3 && slug.length <= 80 && SLUG_PATTERN.test(slug) && !isReservedSlug(slug);
}
