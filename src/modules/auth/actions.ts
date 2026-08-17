"use server";

import { redirect } from "next/navigation";
import { getAuthCallbackUrl, safeNextPath } from "@/lib/app-url";
import { AppError, type ErrorCode } from "@/lib/errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { credentialsSchema, emailSchema, passwordSchema } from "@/modules/auth/schemas";
import { ensureUserProfile, signOut as signOutSession } from "@/modules/auth/service";

export type AuthActionResult = {
  error?: {
    code: ErrorCode;
    message: string;
  };
  checkEmail?: boolean;
};

function actionError(code: ErrorCode, message: string): AuthActionResult {
  return { error: { code, message } };
}

function mapAuthError(message: string): AuthActionResult {
  const lower = message.toLowerCase();
  if (lower.includes("already registered") || lower.includes("already been registered")) {
    return actionError("VALIDATION_ERROR", "该邮箱已被注册");
  }
  if (lower.includes("invalid login credentials")) {
    return actionError("AUTH_REQUIRED", "邮箱或密码不正确");
  }
  if (lower.includes("email not confirmed")) {
    return actionError("EMAIL_NOT_VERIFIED", "请先点击邮件中的验证链接");
  }
  return actionError("INTERNAL_ERROR", "认证失败，请稍后重试");
}

export async function signInAction(
  _prev: AuthActionResult,
  formData: FormData,
): Promise<AuthActionResult> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return actionError("VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "输入无效");
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return mapAuthError(error.message);
  }
  if (!data.user) {
    return actionError("AUTH_REQUIRED", "登录失败");
  }

  try {
    await ensureUserProfile(data.user);
  } catch (error) {
    if (error instanceof AppError) {
      return actionError(error.code, error.message);
    }
    throw error;
  }

  redirect(safeNextPath(formData.get("next")?.toString()));
}

export async function signUpAction(
  _prev: AuthActionResult,
  formData: FormData,
): Promise<AuthActionResult> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return actionError("VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "输入无效");
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: getAuthCallbackUrl("/dashboard"),
    },
  });
  if (error) {
    return mapAuthError(error.message);
  }

  if (data.user && data.session) {
    try {
      await ensureUserProfile(data.user);
    } catch (profileError) {
      if (profileError instanceof AppError) {
        return actionError(profileError.code, profileError.message);
      }
      throw profileError;
    }
    redirect("/dashboard");
  }

  return { checkEmail: true };
}

export async function forgotPasswordAction(
  _prev: AuthActionResult,
  formData: FormData,
): Promise<AuthActionResult> {
  const parsed = emailSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return actionError("VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "请输入有效邮箱");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: getAuthCallbackUrl("/reset-password"),
  });
  if (error) {
    return mapAuthError(error.message);
  }

  return { checkEmail: true };
}

export async function updatePasswordAction(
  _prev: AuthActionResult,
  formData: FormData,
): Promise<AuthActionResult> {
  const parsed = passwordSchema.safeParse({ password: formData.get("password") });
  if (!parsed.success) {
    return actionError("VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "密码至少 8 位");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    return mapAuthError(error.message);
  }

  redirect("/dashboard");
}

export async function signOutAction() {
  await signOutSession();
  redirect("/");
}
