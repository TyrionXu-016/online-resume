import { AppError } from "@/lib/errors";
import { buildDefaultSections } from "./defaults";
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

export function createResumeService(store: ResumeStore) {
  async function listMine(userId: string): Promise<ResumeSummary[]> {
    const rows = await store.listActiveByUser(userId);
    return rows.map(toSummary);
  }

  async function getOwned(userId: string, resumeId: string): Promise<OwnedResume> {
    const resume = assertOwned(await store.findOwned(userId, resumeId));
    const sections = await store.listSections(resume.id);
    return toOwned(resume, sections);
  }

  async function create(userId: string, email: string): Promise<OwnedResume> {
    const slug = await allocateUniqueSlug(slugFromEmail(email), (candidate) => store.slugExists(candidate));

    try {
      return await store.transaction(async (tx) => {
        const resume = await tx.insertResume({
          userId,
          title: DEFAULT_TITLE,
          slug,
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

        return toOwned(resume, sections);
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

        return toOwned(resume, sections);
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

  return {
    listMine,
    getOwned,
    create,
    duplicate,
    updateMeta,
    softDelete,
  };
}

const defaultService = createResumeService(drizzleStore);

export const listMine = defaultService.listMine;
export const getOwned = defaultService.getOwned;
export const createResume = defaultService.create;
export const duplicateResume = defaultService.duplicate;
export const updateResumeMeta = defaultService.updateMeta;
export const softDeleteResume = defaultService.softDelete;

function toSummary(row: ResumeRecord): ResumeSummary {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    status: row.status,
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toOwned(row: ResumeRecord, sections: SectionRecord[]): OwnedResume {
  return {
    ...toSummary(row),
    contentVersion: row.contentVersion,
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
