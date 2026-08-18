"use client";

import type { ReactNode } from "react";
import type { TemplateConfig } from "@/modules/template";
import type { SectionType } from "@/types/resume";
import { safeParseSectionData, SECTION_TYPE_LABELS } from "@/modules/resume/schemas/sections";
import type { ProfileData } from "@/modules/resume/schemas/sections/profile";
import type { SummaryData } from "@/modules/resume/schemas/sections/summary";
import type { ExperienceData } from "@/modules/resume/schemas/sections/experience";
import type { ProjectData } from "@/modules/resume/schemas/sections/project";
import type { EducationData } from "@/modules/resume/schemas/sections/education";
import type { SkillData } from "@/modules/resume/schemas/sections/skill";
import type { LanguageData } from "@/modules/resume/schemas/sections/language";
import type { CertificateData } from "@/modules/resume/schemas/sections/certificate";
import type { LinksData } from "@/modules/resume/schemas/sections/links";
import type { CustomData } from "@/modules/resume/schemas/sections/custom";

export type PreviewSection = {
  id: string;
  type: SectionType;
  sortOrder: number;
  isVisible: boolean;
  data: Record<string, unknown>;
};

function sectionLabel(type: SectionType, config: TemplateConfig) {
  return config.sectionLabels[type] ?? SECTION_TYPE_LABELS[type];
}

function formatDateRange(start: string, end: string | null, current?: boolean) {
  if (!start && !end) {
    return "";
  }
  const endLabel = current ? "至今" : end || "";
  return [start, endLabel].filter(Boolean).join(" – ");
}

function PreviewBlock({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  if (!children) {
    return null;
  }

  return (
    <section className="mt-5">
      <h2 className="border-b border-border pb-1 text-[13px] font-semibold uppercase tracking-wide text-ink">
        {title}
      </h2>
      <div className="mt-2 space-y-3 text-[12px] leading-6 text-ink">{children}</div>
    </section>
  );
}

function ProfilePreview({ data }: { data: ProfileData }) {
  const contact = [data.location, data.email, data.phone, data.website].filter(Boolean);
  const hasContent = data.fullName || data.headline || contact.length > 0;

  if (!hasContent) {
    return null;
  }

  return (
    <header className="border-b border-border pb-4">
      {data.fullName ? <h1 className="text-[22px] font-bold text-ink">{data.fullName}</h1> : null}
      {data.headline ? <p className="mt-1 text-[14px] text-muted">{data.headline}</p> : null}
      {contact.length > 0 ? (
        <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted">{contact.join(" · ")}</p>
      ) : null}
    </header>
  );
}

function SummaryPreview({ data }: { data: SummaryData }) {
  if (!data.content.trim()) {
    return null;
  }
  return (
    <PreviewBlock title="个人简介">
      <p className="whitespace-pre-wrap">{data.content}</p>
    </PreviewBlock>
  );
}

function ExperiencePreview({ data, title }: { data: ExperienceData; title: string }) {
  const items = data.items.filter((item) => item.company || item.position);
  if (items.length === 0) {
    return null;
  }

  return (
    <PreviewBlock title={title}>
      {items.map((item) => (
        <div key={item.id}>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-semibold">
              {item.position}
              {item.company ? ` · ${item.company}` : ""}
            </p>
            <span className="text-[11px] text-muted">
              {formatDateRange(item.startDate, item.endDate, item.current)}
            </span>
          </div>
          {item.location ? <p className="text-[11px] text-muted">{item.location}</p> : null}
          {item.description ? <p className="mt-1 whitespace-pre-wrap">{item.description}</p> : null}
          {item.highlights.length > 0 ? (
            <ul className="mt-1 list-disc pl-4">
              {item.highlights.filter(Boolean).map((line, index) => (
                <li key={`${item.id}-${index}`}>{line}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ))}
    </PreviewBlock>
  );
}

function ProjectPreview({ data, title }: { data: ProjectData; title: string }) {
  const items = data.items.filter((item) => item.name);
  if (items.length === 0) {
    return null;
  }

  return (
    <PreviewBlock title={title}>
      {items.map((item) => (
        <div key={item.id}>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-semibold">
              {item.name}
              {item.role ? ` · ${item.role}` : ""}
            </p>
            <span className="text-[11px] text-muted">{formatDateRange(item.startDate, item.endDate)}</span>
          </div>
          {item.url ? <p className="text-[11px] text-primary">{item.url}</p> : null}
          {item.description ? <p className="mt-1 whitespace-pre-wrap">{item.description}</p> : null}
        </div>
      ))}
    </PreviewBlock>
  );
}

function EducationPreview({ data, title }: { data: EducationData; title: string }) {
  const items = data.items.filter((item) => item.school);
  if (items.length === 0) {
    return null;
  }

  return (
    <PreviewBlock title={title}>
      {items.map((item) => (
        <div key={item.id}>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-semibold">
              {item.school}
              {item.degree ? ` · ${item.degree}` : ""}
            </p>
            <span className="text-[11px] text-muted">
              {formatDateRange(item.startDate, item.endDate, item.current)}
            </span>
          </div>
          {item.field ? <p className="text-[11px] text-muted">{item.field}</p> : null}
          {item.description ? <p className="mt-1 whitespace-pre-wrap">{item.description}</p> : null}
        </div>
      ))}
    </PreviewBlock>
  );
}

function SkillPreview({ data, title }: { data: SkillData; title: string }) {
  const items = data.items.filter((item) => item.name);
  if (items.length === 0) {
    return null;
  }

  return (
    <PreviewBlock title={title}>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item.id} className="rounded-full border border-border px-2 py-0.5 text-[11px]">
            {item.name}
            {item.level ? ` · ${item.level}` : ""}
          </span>
        ))}
      </div>
    </PreviewBlock>
  );
}

function LanguagePreview({ data, title }: { data: LanguageData; title: string }) {
  const items = data.items.filter((item) => item.name);
  if (items.length === 0) {
    return null;
  }

  return (
    <PreviewBlock title={title}>
      {items.map((item) => (
        <p key={item.id}>
          {item.name}
          {item.proficiency ? ` · ${item.proficiency}` : ""}
        </p>
      ))}
    </PreviewBlock>
  );
}

function CertificatePreview({ data, title }: { data: CertificateData; title: string }) {
  const items = data.items.filter((item) => item.name);
  if (items.length === 0) {
    return null;
  }

  return (
    <PreviewBlock title={title}>
      {items.map((item) => (
        <div key={item.id}>
          <p className="font-semibold">{item.name}</p>
          <p className="text-[11px] text-muted">
            {[item.issuer, item.date].filter(Boolean).join(" · ")}
          </p>
        </div>
      ))}
    </PreviewBlock>
  );
}

function LinksPreview({ data, title }: { data: LinksData; title: string }) {
  const items = data.items.filter((item) => item.label || item.url);
  if (items.length === 0) {
    return null;
  }

  return (
    <PreviewBlock title={title}>
      {items.map((item) => (
        <p key={item.id}>
          {item.label || item.url}
          {item.url && item.label ? ` · ${item.url}` : !item.label ? item.url : ""}
        </p>
      ))}
    </PreviewBlock>
  );
}

function CustomPreview({ data, title }: { data: CustomData; title: string }) {
  const items = data.items.filter((item) => item.title || item.content);
  if (items.length === 0) {
    return null;
  }

  return (
    <PreviewBlock title={title}>
      {items.map((item) => (
        <div key={item.id}>
          {item.title ? <p className="font-semibold">{item.title}</p> : null}
          {item.content ? <p className="whitespace-pre-wrap">{item.content}</p> : null}
        </div>
      ))}
    </PreviewBlock>
  );
}

function PreviewSectionBlock({
  section,
  config,
}: {
  section: PreviewSection;
  config: TemplateConfig;
}) {
  if (!section.isVisible) {
    return null;
  }

  const parsed = safeParseSectionData(section.type, section.data);
  if (!parsed.success) {
    return null;
  }

  const type = section.type;
  const title = sectionLabel(type, config);
  const data = parsed.data;

  switch (type) {
    case "PROFILE":
      return <ProfilePreview data={data as ProfileData} />;
    case "SUMMARY":
      return <SummaryPreview data={data as SummaryData} />;
    case "EXPERIENCE":
      return <ExperiencePreview data={data as ExperienceData} title={title} />;
    case "PROJECT":
      return <ProjectPreview data={data as ProjectData} title={title} />;
    case "EDUCATION":
      return <EducationPreview data={data as EducationData} title={title} />;
    case "SKILL":
      return <SkillPreview data={data as SkillData} title={title} />;
    case "LANGUAGE":
      return <LanguagePreview data={data as LanguageData} title={title} />;
    case "CERTIFICATE":
      return <CertificatePreview data={data as CertificateData} title={title} />;
    case "LINKS":
      return <LinksPreview data={data as LinksData} title={title} />;
    case "CUSTOM":
      return <CustomPreview data={data as CustomData} title={title} />;
    default:
      return null;
  }
}

export function LivePreview({
  sections,
  templateConfig,
}: {
  sections: PreviewSection[];
  templateConfig: TemplateConfig;
}) {
  const sorted = [...sections].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="flex h-full justify-center bg-canvas p-4">
      <article
        className="aspect-[210/297] w-full max-w-[520px] overflow-auto rounded-[12px] border border-border bg-white p-8 shadow-sm"
        aria-label="简历预览"
      >
        {sorted.map((section) => (
          <PreviewSectionBlock key={section.id} section={section} config={templateConfig} />
        ))}
      </article>
    </div>
  );
}
