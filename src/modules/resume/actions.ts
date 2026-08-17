"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
import { AppError, type ErrorCode } from "@/lib/errors";
import { requireUser } from "@/modules/auth/service";
import { resumeIdSchema, resumeMetaSchema } from "./schemas";
import {
  createResume,
  duplicateResume,
  softDeleteResume,
  updateResumeMeta,
} from "./service";

export type ResumeActionResult = {
  error?: {
    code: ErrorCode;
    message: string;
  };
};

function actionError(code: ErrorCode, message: string): ResumeActionResult {
  return { error: { code, message } };
}

function mapResumeError(error: unknown): ResumeActionResult {
  if (error instanceof AppError) {
    return actionError(error.code, error.message);
  }

  return actionError("INTERNAL_ERROR", "操作失败，请稍后重试");
}

function revalidateResumeLists() {
  revalidatePath("/dashboard");
  revalidatePath("/resumes");
}

export async function createResumeAction(
  prev: ResumeActionResult,
  formData: FormData,
): Promise<ResumeActionResult> {
  void prev;
  void formData;

  try {
    const user = await requireUser();
    const resume = await createResume(user.id, user.email);
    revalidateResumeLists();
    redirect(`/editor/${resume.id}`);
  } catch (error) {
    unstable_rethrow(error);
    return mapResumeError(error);
  }
}

export async function duplicateResumeAction(
  _prev: ResumeActionResult,
  formData: FormData,
): Promise<ResumeActionResult> {
  const parsed = resumeIdSchema.safeParse({ resumeId: formData.get("resumeId") });
  if (!parsed.success) {
    return actionError("VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "简历 ID 无效");
  }

  try {
    const user = await requireUser();
    await duplicateResume(user.id, parsed.data.resumeId);
    revalidateResumeLists();
    return {};
  } catch (error) {
    unstable_rethrow(error);
    return mapResumeError(error);
  }
}

export async function deleteResumeAction(
  _prev: ResumeActionResult,
  formData: FormData,
): Promise<ResumeActionResult> {
  const parsed = resumeIdSchema.safeParse({ resumeId: formData.get("resumeId") });
  if (!parsed.success) {
    return actionError("VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "简历 ID 无效");
  }

  try {
    const user = await requireUser();
    await softDeleteResume(user.id, parsed.data.resumeId);
    revalidateResumeLists();
    return {};
  } catch (error) {
    unstable_rethrow(error);
    return mapResumeError(error);
  }
}

export async function updateResumeMetaAction(
  _prev: ResumeActionResult,
  formData: FormData,
): Promise<ResumeActionResult> {
  const parsed = resumeMetaSchema.safeParse({
    resumeId: formData.get("resumeId"),
    title: formData.get("title"),
    slug: formData.get("slug"),
  });
  if (!parsed.success) {
    return actionError("VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "输入无效");
  }

  try {
    const user = await requireUser();
    await updateResumeMeta(user.id, parsed.data.resumeId, {
      title: parsed.data.title,
      slug: parsed.data.slug,
    });
    revalidateResumeLists();
    return {};
  } catch (error) {
    unstable_rethrow(error);
    return mapResumeError(error);
  }
}
