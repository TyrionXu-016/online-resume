import { z } from "zod";
import { isValidSlug, normalizeSlug } from "@/lib/validation/slug";

export const resumeIdSchema = z.object({
  resumeId: z.uuid("简历 ID 无效"),
});

export const resumeMetaSchema = z.object({
  resumeId: z.uuid("简历 ID 无效"),
  title: z.string().trim().min(1, "请输入标题").max(160, "标题最多 160 字"),
  slug: z
    .string()
    .trim()
    .transform(normalizeSlug)
    .refine(isValidSlug, "地址需为 3–80 位小写字母、数字或连字符"),
});
