import type { SectionType } from "@/types/resume";

export const DEFAULT_SECTION_TYPES = [
  "PROFILE",
  "SUMMARY",
  "EXPERIENCE",
  "EDUCATION",
  "SKILL",
  "LINKS",
] as const satisfies readonly SectionType[];

export type DefaultSectionInput = {
  type: SectionType;
  schemaVersion: 1;
  sortOrder: number;
  isVisible: true;
  data: Record<string, unknown>;
};

export function emptySectionData(type: SectionType): Record<string, unknown> {
  switch (type) {
    case "PROFILE":
      return {
        fullName: "",
        headline: "",
        email: "",
        phone: "",
        location: "",
        avatarAssetId: null,
        website: "",
        links: [],
      };
    case "SUMMARY":
      return { content: "" };
    case "LINKS":
    case "SKILL":
    case "LANGUAGE":
    case "CERTIFICATE":
    case "EXPERIENCE":
    case "PROJECT":
    case "EDUCATION":
    case "CUSTOM":
      return { items: [] };
    default:
      return {};
  }
}

export function buildDefaultSections(): DefaultSectionInput[] {
  return DEFAULT_SECTION_TYPES.map((type, index) => ({
    type,
    schemaVersion: 1,
    sortOrder: index,
    isVisible: true,
    data: emptySectionData(type),
  }));
}
