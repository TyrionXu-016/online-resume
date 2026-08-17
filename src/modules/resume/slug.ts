import { isValidSlug, normalizeSlug } from "@/lib/validation/slug";
import { AppError } from "@/lib/errors";

const FALLBACK = "resume";
const MAX_SLUG_LENGTH = 80;

export function slugifyCandidate(value: string) {
  const slug = normalizeSlug(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return isValidSlug(slug) ? slug : FALLBACK;
}

export function slugFromEmail(email: string) {
  const local = email.split("@")[0] ?? "";
  return slugifyCandidate(local);
}

export function numberedSlug(base: string, n: number) {
  if (n <= 1) {
    return fitSlug(base);
  }

  return fitSlug(base, `-${n}`);
}

export function duplicateSlugBase(original: string) {
  return fitSlug(original, "-copy");
}

export async function allocateUniqueSlug(
  base: string,
  isTaken: (slug: string) => Promise<boolean>,
  maxAttempts = 50,
) {
  const root = fitSlug(base);

  for (let n = 1; n <= maxAttempts; n += 1) {
    const candidate = numberedSlug(root, n);
    if (!(await isTaken(candidate))) {
      return candidate;
    }
  }

  throw new AppError("RESUME_SLUG_TAKEN", "无法生成唯一地址，请稍后再试", 409);
}

function fitSlug(base: string, suffix = "") {
  const maxCore = MAX_SLUG_LENGTH - suffix.length;
  let core = normalizeSlug(base)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, Math.max(maxCore, 0))
    .replace(/-+$/g, "");

  if (core.length < 3) {
    core = FALLBACK;
  }

  const candidate = `${core}${suffix}`;
  if (isValidSlug(candidate)) {
    return candidate;
  }

  const fallback = `${FALLBACK}${suffix}`;
  return isValidSlug(fallback) ? fallback : FALLBACK;
}
