"use client";

import {
  createEmptyCertificateItem,
  createEmptyCustomItem,
  createEmptyEducationItem,
  createEmptyExperienceItem,
  createEmptyLanguageItem,
  createEmptyLinksItem,
  createEmptyProjectItem,
  createEmptySkillItem,
} from "@/modules/resume/defaults";
import type { SectionType } from "@/types/resume";
import { useEditorStore } from "@/stores/editor-store";
import { FieldLabel, FormCard, FormGrid, TextAreaField, TextField } from "../form-fields";

type ItemRecord = Record<string, unknown> & { id: string };

function ItemsSectionForm({
  sectionId,
  title,
  items,
  fields,
  createItem,
}: {
  sectionId: string;
  title: string;
  items: ItemRecord[];
  fields: Array<{
    key: string;
    label: string;
    multiline?: boolean;
    span?: 2;
  }>;
  createItem: () => ItemRecord;
}) {
  const patchSectionData = useEditorStore((state) => state.patchSectionData);

  function updateItems(next: ItemRecord[]) {
    patchSectionData(sectionId, { items: next });
  }

  function updateItem(index: number, patch: Partial<ItemRecord>) {
    updateItems(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function removeItem(index: number) {
    updateItems(items.filter((_, i) => i !== index));
  }

  function addItem() {
    updateItems([...items, createItem()]);
  }

  return (
    <FormCard title={title}>
      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={item.id} className="rounded-[10px] border border-border p-3">
            <FormGrid>
              {fields.map((field) => (
                <div key={field.key} className={field.span === 2 ? "sm:col-span-2" : undefined}>
                  <FieldLabel>{field.label}</FieldLabel>
                  {field.multiline ? (
                    <TextAreaField
                      value={String(item[field.key] ?? "")}
                      onChange={(event) => updateItem(index, { [field.key]: event.target.value })}
                    />
                  ) : (
                    <TextField
                      value={String(item[field.key] ?? "")}
                      onChange={(event) => updateItem(index, { [field.key]: event.target.value })}
                    />
                  )}
                </div>
              ))}
            </FormGrid>
            <button
              type="button"
              className="mt-3 text-[12px] text-muted hover:text-ink"
              onClick={() => removeItem(index)}
            >
              删除条目
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        className="mt-4 rounded-[9px] border border-border px-3 py-2 text-[13px] text-ink"
        onClick={addItem}
      >
        添加条目
      </button>
    </FormCard>
  );
}

const itemFormConfig: Partial<
  Record<
    SectionType,
    {
      title: string;
      fields: Array<{ key: string; label: string; multiline?: boolean; span?: 2 }>;
      createItem: () => ItemRecord;
    }
  >
> = {
  EXPERIENCE: {
    title: "工作经历",
    createItem: createEmptyExperienceItem,
    fields: [
      { key: "company", label: "公司" },
      { key: "position", label: "职位" },
      { key: "location", label: "地点" },
      { key: "startDate", label: "开始日期 (YYYY-MM)" },
      { key: "endDate", label: "结束日期 (YYYY-MM)" },
      { key: "description", label: "描述", multiline: true, span: 2 },
    ],
  },
  PROJECT: {
    title: "项目经历",
    createItem: createEmptyProjectItem,
    fields: [
      { key: "name", label: "项目名称" },
      { key: "role", label: "角色" },
      { key: "url", label: "链接", span: 2 },
      { key: "startDate", label: "开始日期 (YYYY-MM)" },
      { key: "endDate", label: "结束日期 (YYYY-MM)" },
      { key: "description", label: "描述", multiline: true, span: 2 },
    ],
  },
  EDUCATION: {
    title: "教育经历",
    createItem: createEmptyEducationItem,
    fields: [
      { key: "school", label: "学校" },
      { key: "degree", label: "学位" },
      { key: "field", label: "专业" },
      { key: "location", label: "地点" },
      { key: "startDate", label: "开始日期 (YYYY-MM)" },
      { key: "endDate", label: "结束日期 (YYYY-MM)" },
      { key: "description", label: "描述", multiline: true, span: 2 },
    ],
  },
  SKILL: {
    title: "技能",
    createItem: createEmptySkillItem,
    fields: [
      { key: "name", label: "技能名称" },
      { key: "level", label: "熟练度" },
      { key: "category", label: "分类", span: 2 },
    ],
  },
  LANGUAGE: {
    title: "语言能力",
    createItem: createEmptyLanguageItem,
    fields: [
      { key: "name", label: "语言" },
      { key: "proficiency", label: "熟练度" },
    ],
  },
  CERTIFICATE: {
    title: "证书",
    createItem: createEmptyCertificateItem,
    fields: [
      { key: "name", label: "证书名称" },
      { key: "issuer", label: "颁发机构" },
      { key: "date", label: "日期 (YYYY-MM)" },
      { key: "url", label: "链接" },
    ],
  },
  LINKS: {
    title: "链接",
    createItem: createEmptyLinksItem,
    fields: [
      { key: "label", label: "名称" },
      { key: "url", label: "URL", span: 2 },
    ],
  },
  CUSTOM: {
    title: "自定义模块",
    createItem: createEmptyCustomItem,
    fields: [
      { key: "title", label: "标题" },
      { key: "content", label: "内容", multiline: true, span: 2 },
    ],
  },
};

export function ItemsSectionFormRouter({
  sectionId,
  type,
  data,
}: {
  sectionId: string;
  type: SectionType;
  data: { items: ItemRecord[] };
}) {
  const config = itemFormConfig[type];
  if (!config) {
    return null;
  }

  return (
    <ItemsSectionForm
      sectionId={sectionId}
      title={config.title}
      items={data.items ?? []}
      fields={config.fields}
      createItem={config.createItem}
    />
  );
}
