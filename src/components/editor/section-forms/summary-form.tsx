"use client";

import type { SummaryData } from "@/modules/resume/schemas/sections/summary";
import { useEditorStore } from "@/stores/editor-store";
import { FieldLabel, FormCard, TextAreaField } from "../form-fields";

export function SummaryForm({ sectionId, data }: { sectionId: string; data: SummaryData }) {
  const patchSectionData = useEditorStore((state) => state.patchSectionData);

  return (
    <FormCard title="个人简介">
      <FieldLabel>支持 300 字以内</FieldLabel>
      <TextAreaField
        value={data.content}
        maxLength={300}
        onChange={(event) => patchSectionData(sectionId, { content: event.target.value })}
      />
      <p className="text-right text-[11px] text-muted">{data.content.length}/300</p>
    </FormCard>
  );
}
