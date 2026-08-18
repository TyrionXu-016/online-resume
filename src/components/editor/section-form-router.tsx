"use client";

import { safeParseSectionData } from "@/modules/resume/schemas/sections";
import type { ProfileData } from "@/modules/resume/schemas/sections/profile";
import type { SummaryData } from "@/modules/resume/schemas/sections/summary";
import type { SectionType } from "@/types/resume";
import { useEditorStore, type EditorSection } from "@/stores/editor-store";
import { ItemsSectionFormRouter } from "./section-forms/items-section-form";
import { ProfileForm } from "./section-forms/profile-form";
import { SummaryForm } from "./section-forms/summary-form";

export function SectionFormRouter({ section }: { section: EditorSection }) {
  const parsed = safeParseSectionData(section.type, section.data);
  if (!parsed.success) {
    return <p className="text-[13px] text-muted">模块数据无效，请刷新页面。</p>;
  }

  const data = parsed.data;

  switch (section.type) {
    case "PROFILE":
      return <ProfileForm sectionId={section.id} data={data as ProfileData} />;
    case "SUMMARY":
      return <SummaryForm sectionId={section.id} data={data as SummaryData} />;
    case "EXPERIENCE":
    case "PROJECT":
    case "EDUCATION":
    case "SKILL":
    case "LANGUAGE":
    case "CERTIFICATE":
    case "LINKS":
    case "CUSTOM":
      return (
        <ItemsSectionFormRouter
          sectionId={section.id}
          type={section.type as SectionType}
          data={data as { items: Array<Record<string, unknown> & { id: string }> }}
        />
      );
    default:
      return null;
  }
}

export function ActiveSectionForm() {
  const sections = useEditorStore((state) => state.sections);
  const selectedSectionId = useEditorStore((state) => state.selectedSectionId);
  const section = sections.find((item) => item.id === selectedSectionId);

  if (!section) {
    return <p className="text-[13px] text-muted">请选择左侧模块开始编辑。</p>;
  }

  return <SectionFormRouter section={section} />;
}
