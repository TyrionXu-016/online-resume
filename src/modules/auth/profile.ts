import { AppError } from "@/lib/errors";

export type AuthIdentity = {
  id: string;
  email?: string | null;
  emailConfirmedAt?: string | null;
  displayName?: string | null;
};

export type UserProfileInput = {
  id: string;
  email: string;
  displayName: string | null;
};

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function assertAuthenticated<T>(user: T | null | undefined): asserts user is T {
  if (!user) {
    throw new AppError("AUTH_REQUIRED", "请先登录", 401);
  }
}

export function profileFromAuthUser(user: AuthIdentity): UserProfileInput {
  const email = normalizeEmail(user.email ?? "");
  if (!user.id || !email) {
    throw new AppError("AUTH_REQUIRED", "登录态无效", 401);
  }

  const displayName = user.displayName?.trim() || email.split("@")[0] || null;

  return {
    id: user.id,
    email,
    displayName,
  };
}

export function isEmailVerified(emailConfirmedAt: string | null | undefined) {
  return Boolean(emailConfirmedAt);
}
