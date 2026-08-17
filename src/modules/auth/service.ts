import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { requireDb } from "@/db/client";
import { users } from "@/db/schema";
import { AppError } from "@/lib/errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  assertAuthenticated,
  isEmailVerified,
  profileFromAuthUser,
} from "./profile";

export type CurrentUser = {
  id: string;
  email: string;
  displayName: string | null;
  plan: string;
  status: string;
  emailVerified: boolean;
};

export async function getAuthIdentity() {
  const supabase = await createSupabaseServerClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims?.sub) {
    return null;
  }

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return null;
  }

  return data.user;
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const authUser = await getAuthIdentity();
  if (!authUser) {
    return null;
  }

  const profile = await ensureUserProfile(authUser);

  return {
    id: profile.id,
    email: profile.email,
    displayName: profile.displayName,
    plan: profile.plan,
    status: profile.status,
    emailVerified: isEmailVerified(authUser.email_confirmed_at),
  };
}

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  assertAuthenticated(user);
  return user;
}

export async function requireUserOrRedirect(next = "/dashboard") {
  try {
    return await requireUser();
  } catch (error) {
    if (error instanceof AppError && error.code === "AUTH_REQUIRED") {
      const params = new URLSearchParams({ next });
      redirect(`/login?${params.toString()}`);
    }
    throw error;
  }
}

export async function ensureUserProfile(authUser: {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}) {
  const input = profileFromAuthUser({
    id: authUser.id,
    email: authUser.email,
    displayName:
      typeof authUser.user_metadata?.display_name === "string"
        ? authUser.user_metadata.display_name
        : null,
  });

  const db = requireDb();
  const now = new Date();

  const [profile] = await db
    .insert(users)
    .values({
      id: input.id,
      email: input.email,
      displayName: input.displayName,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: users.id,
      set: {
        email: input.email,
        displayName: input.displayName,
        updatedAt: now,
      },
    })
    .returning();

  if (!profile) {
    const existing = await db.select().from(users).where(eq(users.id, input.id)).limit(1);
    if (!existing[0]) {
      throw new AppError("INTERNAL_ERROR", "无法创建用户资料", 500);
    }
    return existing[0];
  }

  return profile;
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
}
