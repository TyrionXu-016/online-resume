import { AppError } from "@/lib/errors";
import type { SectionType } from "@/types/resume";
import { certificateDataSchema } from "./certificate";
import { customDataSchema } from "./custom";
import { educationDataSchema } from "./education";
import { experienceDataSchema } from "./experience";
import { languageDataSchema } from "./language";
import { linksDataSchema } from "./links";
import { profileDataSchema } from "./profile";
import { projectDataSchema } from "./project";
import { skillDataSchema } from "./skill";
import { summaryDataSchema } from "./summary";

export * from "./certificate";
export * from "./custom";
export * from "./education";
export * from "./experience";
export * from "./language";
export * from "./links";
export * from "./profile";
export * from "./project";
export * from "./shared";
export * from "./skill";
export * from "./summary";

const schemaByType = {
  PROFILE: profileDataSchema,
  SUMMARY: summaryDataSchema,
  EXPERIENCE: experienceDataSchema,
  PROJECT: projectDataSchema,
  EDUCATION: educationDataSchema,
  SKILL: skillDataSchema,
  LANGUAGE: languageDataSchema,
  CERTIFICATE: certificateDataSchema,
  LINKS: linksDataSchema,
  CUSTOM: customDataSchema,
} as const satisfies Record<SectionType, unknown>;

export type SectionDataByType = {
  [K in SectionType]: (typeof schemaByType)[K] extends { _output: infer O } ? O : never;
};

export function parseSectionData<T extends SectionType>(
  type: T,
  data: unknown,
): SectionDataByType[T] {
  const schema = schemaByType[type];
  const result = schema.safeParse(data);

  if (!result.success) {
    throw new AppError("VALIDATION_ERROR", result.error.issues[0]?.message ?? "模块数据无效", 422);
  }

  return result.data as SectionDataByType[T];
}

export function safeParseSectionData<T extends SectionType>(type: T, data: unknown) {
  return schemaByType[type].safeParse(data);
}

export const SECTION_TYPE_LABELS: Record<SectionType, string> = {
  PROFILE: "基本信息",
  SUMMARY: "个人简介",
  EXPERIENCE: "工作经历",
  PROJECT: "项目经历",
  EDUCATION: "教育经历",
  SKILL: "技能",
  LANGUAGE: "语言能力",
  CERTIFICATE: "证书",
  LINKS: "链接",
  CUSTOM: "自定义模块",
};

export const SINGLE_INSTANCE_SECTION_TYPES: SectionType[] = [
  "PROFILE",
  "SUMMARY",
  "EXPERIENCE",
  "PROJECT",
  "EDUCATION",
  "SKILL",
  "LANGUAGE",
  "CERTIFICATE",
  "LINKS",
];
