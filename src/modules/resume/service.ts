import { AppError } from "@/lib/errors";
import type { TemplateRecord } from "@/modules/template";
import { getDefaultTemplate, getDefaultTemplateId, getTemplateById } from "@/modules/template";
import type { SectionType } from "@/types/resume";
import { emptySectionData, buildDefaultSections } from "./defaults";
import { parseSectionData, SINGLE_INSTANCE_SECTION_TYPES } from "./schemas/sections";
import { assertOwned } from "./owned";
import { allocateUniqueSlug, duplicateSlugBase, slugFromEmail } from "./slug";
import {
  createDrizzleResumeStore,
  isUniqueViolation,
  type ResumeRecord,
  type ResumeStore,
  type SectionRecord,
} from "./store";

const DEFAULT_TITLE = "未命名简历";
const drizzleStore = createDrizzleResumeStore();

export type ResumeSummary = {
  id: string;
  title: string;
  slug: string;
  status: string;
  updatedAt: string;
};

export type OwnedResume = ResumeSummary & {
  contentVersion: number;
  templateId: string | null;
  template: TemplateRecord | null;
  publishedVersionId: string | null;
  publishedAt: string | null;
  sections: Array<{
    id: string;
    type: string;
    schemaVersion: number;
    sortOrder: number;
    isVisible: boolean;
    data: Record<string, unknown>;
  }>;
};

export type DraftSaveResult = {
  contentVersion: number;
  section?: OwnedResume["sections"][number];
};

export function createResumeService(store: ResumeStore, resolveDefaultTemplateId = getDefaultTemplateId) {
  async function listMine(userId: string): Promise<ResumeSummary[]> {
    const rows = await store.listActiveByUser(userId);
    return rows.map(toSummary);
  }

  async function getOwned(userId: string, resumeId: string): Promise<OwnedResume> {
    const resume = assertOwned(await store.findOwned(userId, resumeId));
    const sections = await store.listSections(resume.id);
    const template = resume.templateId
      ? (await getTemplateById(resume.templateId)) ?? (await getDefaultTemplate())
      : await getDefaultTemplate();
    return toOwned(resume, sections, template);
  }

  async function create(userId: string, email: string): Promise<OwnedResume> {
    const slug = await allocateUniqueSlug(slugFromEmail(email), (candidate) => store.slugExists(candidate));
    const templateId = await resolveDefaultTemplateId();

    try {
      return await store.transaction(async (tx) => {
        const resume = await tx.insertResume({
          userId,
          title: DEFAULT_TITLE,
          slug,
          templateId,
        });
        const sections = await tx.insertSections(
          buildDefaultSections().map((section) => ({
            resumeId: resume.id,
            type: section.type,
            schemaVersion: section.schemaVersion,
            sortOrder: section.sortOrder,
            isVisible: section.isVisible,
            data: section.data,
          })),
        );

        const template = await getDefaultTemplate();
        return toOwned(resume, sections, template);
      });
    } catch (error) {
      throw uniqueOrInternal(error, "创建简历失败");
    }
  }

  async function duplicate(userId: string, resumeId: string): Promise<OwnedResume> {
    const source = await getOwned(userId, resumeId);
    const slug = await allocateUniqueSlug(duplicateSlugBase(source.slug), (candidate) =>
      store.slugExists(candidate),
    );

    try {
      return await store.transaction(async (tx) => {
        const resume = await tx.insertResume({
          userId,
          title: duplicateTitle(source.title),
          slug,
          status: "DRAFT",
          templateId: source.templateId ?? (await resolveDefaultTemplateId()),
          publishedVersionId: null,
          publishedAt: null,
          contentVersion: 1,
        });
        const sections = await tx.insertSections(
          source.sections.map((section) => ({
            resumeId: resume.id,
            type: section.type,
            schemaVersion: section.schemaVersion,
            sortOrder: section.sortOrder,
            isVisible: section.isVisible,
            data: section.data,
          })),
        );

        const template = source.template ?? (await getDefaultTemplate());
        return toOwned(resume, sections, template);
      });
    } catch (error) {
      throw uniqueOrInternal(error, "复制简历失败");
    }
  }

  async function updateMeta(
    userId: string,
    resumeId: string,
    input: { title: string; slug: string },
  ): Promise<ResumeSummary> {
    const current = assertOwned(await store.findOwned(userId, resumeId));

    if (input.slug !== current.slug && (await store.slugExists(input.slug, resumeId))) {
      throw new AppError("RESUME_SLUG_TAKEN", "该地址已被占用", 409);
    }

    try {
      const updated = assertOwned(
        await store.updateMeta(userId, resumeId, {
          title: input.title,
          slug: input.slug,
          updatedAt: new Date(),
        }),
      );
      return toSummary(updated);
    } catch (error) {
      throw uniqueOrInternal(error, "更新简历失败");
    }
  }

  async function softDelete(userId: string, resumeId: string) {
    assertOwned(await store.softDelete(userId, resumeId, new Date()));
  }

  async function saveSectionDraft(
    userId: string,
    resumeId: string,
    sectionId: string,
    expectedVersion: number,
    data: Record<string, unknown>,
  ): Promise<DraftSaveResult> {
    const section = await store.findSection(resumeId, sectionId);
    if (!section) {
      throw new AppError("RESOURCE_NOT_FOUND", "模块不存在", 404);
    }

    const parsed = parseSectionData(section.type as SectionType, data);
    const result = await store.updateSectionDraft(
      userId,
      resumeId,
      sectionId,
      { data: parsed as Record<string, unknown> },
      expectedVersion,
    );

    return assertDraftResult(result);
  }

  async function setSectionVisibility(
    userId: string,
    resumeId: string,
    sectionId: string,
    expectedVersion: number,
    isVisible: boolean,
  ): Promise<DraftSaveResult> {
    const section = await store.findSection(resumeId, sectionId);
    if (!section) {
      throw new AppError("RESOURCE_NOT_FOUND", "模块不存在", 404);
    }

    const result = await store.updateSectionDraft(
      userId,
      resumeId,
      sectionId,
      { isVisible },
      expectedVersion,
    );

    return assertDraftResult(result);
  }

  async function reorderSections(
    userId: string,
    resumeId: string,
    expectedVersion: number,
    orderedSectionIds: string[],
  ): Promise<DraftSaveResult> {
    assertOwned(await store.findOwned(userId, resumeId));
    const result = await store.reorderSections(userId, resumeId, orderedSectionIds, expectedVersion);
    if (!result) {
      throwVersionConflict();
    }
    return { contentVersion: result.contentVersion };
  }

  async function addSection(
    userId: string,
    resumeId: string,
    expectedVersion: number,
    type: SectionType,
  ): Promise<DraftSaveResult> {
    assertOwned(await store.findOwned(userId, resumeId));

    if (SINGLE_INSTANCE_SECTION_TYPES.includes(type)) {
      const exists = await store.sectionTypeExists(resumeId, type);
      if (exists) {
        throw new AppError("VALIDATION_ERROR", "该模块已存在", 422);
      }
    }

    const sections = await store.listSections(resumeId);
    const maxSort = sections.reduce((max, section) => Math.max(max, section.sortOrder), -1);
    const parsed = parseSectionData(type, emptySectionData(type));

    const result = await store.addSectionWithVersion(
      userId,
      resumeId,
      {
        resumeId,
        type,
        schemaVersion: 1,
        sortOrder: maxSort + 1,
        isVisible: true,
        data: parsed as Record<string, unknown>,
      },
      expectedVersion,
    );

    const saved = assertDraftResult(result);
    return {
      contentVersion: saved.contentVersion,
      section: saved.section
        ? {
            id: saved.section.id,
            type: saved.section.type,
            schemaVersion: saved.section.schemaVersion,
            sortOrder: saved.section.sortOrder,
            isVisible: saved.section.isVisible,
            data: saved.section.data,
          }
        : undefined,
    };
  }

  return {
    listMine,
    getOwned,
    create,
    duplicate,
    updateMeta,
    softDelete,
    saveSectionDraft,
    setSectionVisibility,
    reorderSections,
    addSection,
  };
}

const defaultService = createResumeService(drizzleStore);

export const listMine = defaultService.listMine;
export const getOwned = defaultService.getOwned;
export const createResume = defaultService.create;
export const duplicateResume = defaultService.duplicate;
export const updateResumeMeta = defaultService.updateMeta;
export const softDeleteResume = defaultService.softDelete;
export const saveSectionDraft = defaultService.saveSectionDraft;
export const setSectionVisibility = defaultService.setSectionVisibility;
export const reorderSections = defaultService.reorderSections;
export const addSection = defaultService.addSection;

function toOwned(
  row: ResumeRecord,
  sections: SectionRecord[],
  template: TemplateRecord | null,
): OwnedResume {
  return {
    ...toSummary(row),
    contentVersion: row.contentVersion,
    templateId: row.templateId,
    template,
    publishedVersionId: row.publishedVersionId,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    sections: sections.map((section) => ({
      id: section.id,
      type: section.type,
      schemaVersion: section.schemaVersion,
      sortOrder: section.sortOrder,
      isVisible: section.isVisible,
      data: section.data,
    })),
  };
}

function assertDraftResult(result: { contentVersion: number; section?: SectionRecord } | null) {
  if (!result) {
    throwVersionConflict();
  }
  return {
    contentVersion: result.contentVersion,
    section: result.section
      ? {
          id: result.section.id,
          type: result.section.type,
          schemaVersion: result.section.schemaVersion,
          sortOrder: result.section.sortOrder,
          isVisible: result.section.isVisible,
          data: result.section.data,
        }
      : undefined,
  };
}

function throwVersionConflict(): never {
  throw new AppError("RESUME_VERSION_CONFLICT", "内容已在其他窗口更新，请刷新后继续", 409);
}

function toSummary(row: ResumeRecord): ResumeSummary {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    status: row.status,
    updatedAt: row.updatedAt.toISOString(),
  };
}

function duplicateTitle(title: string) {
  const suffix = " 副本";
  const max = 160 - suffix.length;
  const base = title.length > max ? title.slice(0, max) : title;
  return `${base}${suffix}`;
}

function uniqueOrInternal(error: unknown, fallback: string): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (isUniqueViolation(error)) {
    return new AppError("RESUME_SLUG_TAKEN", "该地址已被占用", 409);
  }

  return new AppError("INTERNAL_ERROR", fallback, 500);
}
