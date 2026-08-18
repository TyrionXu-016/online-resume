import { z } from "zod";
import { SECTION_TYPES } from "@/types/resume";

export const draftBaseSchema = z.object({
  resumeId: z.uuid("简历 ID 无效"),
  expectedVersion: z.number().int().min(1, "版本号无效"),
});

export const saveSectionDraftSchema = draftBaseSchema.extend({
  sectionId: z.uuid("模块 ID 无效"),
  data: z.record(z.string(), z.unknown()),
});

export const setSectionVisibilitySchema = draftBaseSchema.extend({
  sectionId: z.uuid("模块 ID 无效"),
  isVisible: z.boolean(),
});

export const reorderSectionsSchema = draftBaseSchema.extend({
  orderedSectionIds: z.array(z.uuid("模块 ID 无效")).min(1, "至少包含一个模块"),
});

export const addSectionSchema = draftBaseSchema.extend({
  type: z.enum(SECTION_TYPES),
});
