import { eq } from "drizzle-orm";
import { requireDb } from "@/db/client";
import { templates } from "@/db/schema";

export const CLASSIC_TEMPLATE_ID = "a0000000-0000-4000-8000-000000000001";
export const CLASSIC_TEMPLATE_SLUG = "classic";

export type TemplateConfig = {
  layout: string;
  sectionLabels: Record<string, string>;
};

export type TemplateRecord = {
  id: string;
  slug: string;
  name: string;
  category: string;
  version: number;
  config: TemplateConfig;
  isActive: boolean;
};

export const DEFAULT_TEMPLATE_CONFIG: TemplateConfig = {
  layout: "single-column",
  sectionLabels: {
    PROFILE: "基本信息",
    SUMMARY: "个人简介",
    EXPERIENCE: "工作经历",
    PROJECT: "项目经历",
    EDUCATION: "教育经历",
    SKILL: "技能",
    LANGUAGE: "语言能力",
    CERTIFICATE: "证书",
    LINKS: "链接",
    CUSTOM: "自定义",
  },
};

function asTemplate(row: typeof templates.$inferSelect): TemplateRecord {
  const config = (row.config ?? DEFAULT_TEMPLATE_CONFIG) as TemplateConfig;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    version: row.version,
    config: {
      layout: config.layout ?? "single-column",
      sectionLabels: { ...DEFAULT_TEMPLATE_CONFIG.sectionLabels, ...config.sectionLabels },
    },
    isActive: row.isActive,
  };
}

export async function getTemplateById(id: string | null): Promise<TemplateRecord | null> {
  if (!id) {
    return null;
  }

  if (id === CLASSIC_TEMPLATE_ID) {
    return getDefaultTemplate();
  }

  try {
    const db = requireDb();
    const [row] = await db.select().from(templates).where(eq(templates.id, id)).limit(1);
    return row ? asTemplate(row) : null;
  } catch {
    return null;
  }
}

export async function getTemplateBySlug(slug: string): Promise<TemplateRecord | null> {
  if (slug === CLASSIC_TEMPLATE_SLUG) {
    return getDefaultTemplate();
  }

  try {
    const db = requireDb();
    const [row] = await db.select().from(templates).where(eq(templates.slug, slug)).limit(1);
    return row ? asTemplate(row) : null;
  } catch {
    return null;
  }
}

export async function getDefaultTemplate(): Promise<TemplateRecord> {
  try {
    const db = requireDb();
    const [row] = await db.select().from(templates).where(eq(templates.slug, CLASSIC_TEMPLATE_SLUG)).limit(1);
    if (row) {
      return asTemplate(row);
    }
  } catch {
    // Tests and offline environments can fall back to the in-code default.
  }

  return {
    id: CLASSIC_TEMPLATE_ID,
    slug: CLASSIC_TEMPLATE_SLUG,
    name: "经典",
    category: "general",
    version: 1,
    config: DEFAULT_TEMPLATE_CONFIG,
    isActive: true,
  };
}

export async function getDefaultTemplateId(): Promise<string> {
  const template = await getDefaultTemplate();
  return template.id;
}
