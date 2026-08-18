import type { SectionType } from "@/types/resume";
import { createItemId } from "./schemas/sections/shared";

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

export function createEmptyExperienceItem() {
  return {
    id: createItemId(),
    company: "",
    position: "",
    location: "",
    startDate: "",
    endDate: null as string | null,
    current: false,
    description: "",
    highlights: [] as string[],
  };
}

export function createEmptyProjectItem() {
  return {
    id: createItemId(),
    name: "",
    role: "",
    url: "",
    startDate: "",
    endDate: "",
    description: "",
    highlights: [] as string[],
    assetIds: [] as string[],
  };
}

export function createEmptyEducationItem() {
  return {
    id: createItemId(),
    school: "",
    degree: "",
    field: "",
    location: "",
    startDate: "",
    endDate: null as string | null,
    current: false,
    description: "",
  };
}

export function createEmptySkillItem() {
  return { id: createItemId(), name: "", level: "", category: "" };
}

export function createEmptyLanguageItem() {
  return { id: createItemId(), name: "", proficiency: "" };
}

export function createEmptyCertificateItem() {
  return { id: createItemId(), name: "", issuer: "", date: "", url: "" };
}

export function createEmptyLinksItem() {
  return { id: createItemId(), label: "", url: "" };
}

export function createEmptyCustomItem() {
  return { id: createItemId(), title: "", content: "" };
}

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
    case "EXPERIENCE":
      return { items: [] };
    case "PROJECT":
      return { items: [] };
    case "EDUCATION":
      return { items: [] };
    case "SKILL":
      return { items: [] };
    case "LANGUAGE":
      return { items: [] };
    case "CERTIFICATE":
      return { items: [] };
    case "LINKS":
      return { items: [] };
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

export function createEmptyItemForType(type: SectionType) {
  switch (type) {
    case "EXPERIENCE":
      return createEmptyExperienceItem();
    case "PROJECT":
      return createEmptyProjectItem();
    case "EDUCATION":
      return createEmptyEducationItem();
    case "SKILL":
      return createEmptySkillItem();
    case "LANGUAGE":
      return createEmptyLanguageItem();
    case "CERTIFICATE":
      return createEmptyCertificateItem();
    case "LINKS":
      return createEmptyLinksItem();
    case "CUSTOM":
      return createEmptyCustomItem();
    default:
      return null;
  }
}
