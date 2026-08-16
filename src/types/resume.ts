export const SECTION_TYPES = [
  "PROFILE",
  "SUMMARY",
  "EXPERIENCE",
  "PROJECT",
  "EDUCATION",
  "SKILL",
  "LANGUAGE",
  "CERTIFICATE",
  "LINKS",
  "CUSTOM",
] as const;

export type SectionType = (typeof SECTION_TYPES)[number];

export type ResumeSection = {
  id: string;
  type: SectionType;
  schemaVersion: 1;
  visible: boolean;
  sortOrder: number;
  data: Record<string, unknown>;
};
