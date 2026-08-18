"use server";

import { unstable_rethrow } from "next/navigation";
import { AppError, type ErrorCode } from "@/lib/errors";
import { requireUser } from "@/modules/auth/service";
import {
  addSectionSchema,
  reorderSectionsSchema,
  saveSectionDraftSchema,
  setSectionVisibilitySchema,
} from "./draft-schemas";
import {
  addSection,
  reorderSections,
  saveSectionDraft,
  setSectionVisibility,
} from "./service";

export type DraftActionResult = {
  error?: {
    code: ErrorCode;
    message: string;
  };
  contentVersion?: number;
  section?: {
    id: string;
    type: string;
    schemaVersion: number;
    sortOrder: number;
    isVisible: boolean;
    data: Record<string, unknown>;
  };
};

function actionError(code: ErrorCode, message: string): DraftActionResult {
  return { error: { code, message } };
}

function mapDraftError(error: unknown): DraftActionResult {
  if (error instanceof AppError) {
    return actionError(error.code, error.message);
  }
  return actionError("INTERNAL_ERROR", "操作失败，请稍后重试");
}

export async function saveSectionDraftAction(input: unknown): Promise<DraftActionResult> {
  const parsed = saveSectionDraftSchema.safeParse(input);
  if (!parsed.success) {
    return actionError("VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "输入无效");
  }

  try {
    const user = await requireUser();
    const result = await saveSectionDraft(
      user.id,
      parsed.data.resumeId,
      parsed.data.sectionId,
      parsed.data.expectedVersion,
      parsed.data.data,
    );
    return { contentVersion: result.contentVersion, section: result.section };
  } catch (error) {
    unstable_rethrow(error);
    return mapDraftError(error);
  }
}

export async function setSectionVisibilityAction(input: unknown): Promise<DraftActionResult> {
  const parsed = setSectionVisibilitySchema.safeParse(input);
  if (!parsed.success) {
    return actionError("VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "输入无效");
  }

  try {
    const user = await requireUser();
    const result = await setSectionVisibility(
      user.id,
      parsed.data.resumeId,
      parsed.data.sectionId,
      parsed.data.expectedVersion,
      parsed.data.isVisible,
    );
    return { contentVersion: result.contentVersion, section: result.section };
  } catch (error) {
    unstable_rethrow(error);
    return mapDraftError(error);
  }
}

export async function reorderSectionsAction(input: unknown): Promise<DraftActionResult> {
  const parsed = reorderSectionsSchema.safeParse(input);
  if (!parsed.success) {
    return actionError("VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "输入无效");
  }

  try {
    const user = await requireUser();
    const result = await reorderSections(
      user.id,
      parsed.data.resumeId,
      parsed.data.expectedVersion,
      parsed.data.orderedSectionIds,
    );
    return { contentVersion: result.contentVersion };
  } catch (error) {
    unstable_rethrow(error);
    return mapDraftError(error);
  }
}

export async function addSectionAction(input: unknown): Promise<DraftActionResult> {
  const parsed = addSectionSchema.safeParse(input);
  if (!parsed.success) {
    return actionError("VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "输入无效");
  }

  try {
    const user = await requireUser();
    const result = await addSection(
      user.id,
      parsed.data.resumeId,
      parsed.data.expectedVersion,
      parsed.data.type,
    );
    return { contentVersion: result.contentVersion, section: result.section };
  } catch (error) {
    unstable_rethrow(error);
    return mapDraftError(error);
  }
}
