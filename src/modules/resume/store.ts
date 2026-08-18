import { and, desc, eq, isNull, ne } from "drizzle-orm";
import { requireDb } from "@/db/client";
import { resumeSections, resumes } from "@/db/schema";

export type ResumeRecord = {
  id: string;
  userId: string;
  title: string;
  slug: string;
  status: string;
  visibility: string;
  templateId: string | null;
  contentVersion: number;
  publishedVersionId: string | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type SectionRecord = {
  id: string;
  resumeId: string;
  type: string;
  schemaVersion: number;
  sortOrder: number;
  isVisible: boolean;
  data: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
};

export type NewResumeInput = {
  userId: string;
  title: string;
  slug: string;
  status?: string;
  visibility?: string;
  templateId?: string | null;
  contentVersion?: number;
  publishedVersionId?: string | null;
  publishedAt?: Date | null;
};

export type NewSectionInput = {
  resumeId: string;
  type: string;
  schemaVersion: number;
  sortOrder: number;
  isVisible: boolean;
  data: Record<string, unknown>;
};

export type SectionDraftPatch = {
  data?: Record<string, unknown>;
  isVisible?: boolean;
};

export type DraftMutationResult = {
  contentVersion: number;
  section?: SectionRecord;
};

export type ResumeStore = {
  listActiveByUser(userId: string): Promise<ResumeRecord[]>;
  findOwned(userId: string, id: string): Promise<ResumeRecord | null>;
  listSections(resumeId: string): Promise<SectionRecord[]>;
  findSection(resumeId: string, sectionId: string): Promise<SectionRecord | null>;
  slugExists(slug: string, excludeId?: string): Promise<boolean>;
  sectionTypeExists(resumeId: string, type: string): Promise<boolean>;
  insertResume(input: NewResumeInput): Promise<ResumeRecord>;
  insertSections(input: NewSectionInput[]): Promise<SectionRecord[]>;
  insertSection(input: NewSectionInput): Promise<SectionRecord>;
  updateMeta(
    userId: string,
    id: string,
    patch: { title: string; slug: string; updatedAt: Date },
  ): Promise<ResumeRecord | null>;
  updateSectionDraft(
    userId: string,
    resumeId: string,
    sectionId: string,
    patch: SectionDraftPatch,
    expectedVersion: number,
  ): Promise<DraftMutationResult | null>;
  reorderSections(
    userId: string,
    resumeId: string,
    orderedSectionIds: string[],
    expectedVersion: number,
  ): Promise<DraftMutationResult | null>;
  addSectionWithVersion(
    userId: string,
    resumeId: string,
    input: NewSectionInput,
    expectedVersion: number,
  ): Promise<DraftMutationResult | null>;
  softDelete(userId: string, id: string, deletedAt: Date): Promise<ResumeRecord | null>;
  transaction<T>(fn: (store: ResumeStore) => Promise<T>): Promise<T>;
};

function asSection(row: typeof resumeSections.$inferSelect): SectionRecord {
  return {
    ...row,
    data: (row.data ?? {}) as Record<string, unknown>,
  };
}

async function bumpContentVersion(
  db: ReturnType<typeof requireDb>,
  userId: string,
  resumeId: string,
  expectedVersion: number,
): Promise<number | null> {
  const [row] = await db
    .update(resumes)
    .set({
      contentVersion: expectedVersion + 1,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(resumes.id, resumeId),
        eq(resumes.userId, userId),
        eq(resumes.contentVersion, expectedVersion),
        isNull(resumes.deletedAt),
      ),
    )
    .returning({ contentVersion: resumes.contentVersion });

  return row?.contentVersion ?? null;
}

function createDrizzleStore(db: ReturnType<typeof requireDb>): ResumeStore {
  const store: ResumeStore = {
    async listActiveByUser(userId) {
      return db
        .select()
        .from(resumes)
        .where(and(eq(resumes.userId, userId), isNull(resumes.deletedAt)))
        .orderBy(desc(resumes.updatedAt));
    },

    async findOwned(userId, id) {
      const [row] = await db
        .select()
        .from(resumes)
        .where(and(eq(resumes.id, id), eq(resumes.userId, userId), isNull(resumes.deletedAt)))
        .limit(1);
      return row ?? null;
    },

    async listSections(resumeId) {
      const rows = await db
        .select()
        .from(resumeSections)
        .where(eq(resumeSections.resumeId, resumeId))
        .orderBy(resumeSections.sortOrder);
      return rows.map(asSection);
    },

    async findSection(resumeId, sectionId) {
      const [row] = await db
        .select()
        .from(resumeSections)
        .where(and(eq(resumeSections.resumeId, resumeId), eq(resumeSections.id, sectionId)))
        .limit(1);
      return row ? asSection(row) : null;
    },

    async slugExists(slug, excludeId) {
      const [row] = await db
        .select({ id: resumes.id })
        .from(resumes)
        .where(excludeId ? and(eq(resumes.slug, slug), ne(resumes.id, excludeId)) : eq(resumes.slug, slug))
        .limit(1);
      return Boolean(row);
    },

    async sectionTypeExists(resumeId, type) {
      const [row] = await db
        .select({ id: resumeSections.id })
        .from(resumeSections)
        .where(and(eq(resumeSections.resumeId, resumeId), eq(resumeSections.type, type)))
        .limit(1);
      return Boolean(row);
    },

    async insertResume(input) {
      const [row] = await db
        .insert(resumes)
        .values({
          userId: input.userId,
          title: input.title,
          slug: input.slug,
          status: input.status ?? "DRAFT",
          visibility: input.visibility ?? "public",
          templateId: input.templateId ?? null,
          contentVersion: input.contentVersion ?? 1,
          publishedVersionId: input.publishedVersionId ?? null,
          publishedAt: input.publishedAt ?? null,
        })
        .returning();

      if (!row) {
        throw new Error("无法创建简历");
      }

      return row;
    },

    async insertSections(input) {
      if (input.length === 0) {
        return [];
      }

      const rows = await db.insert(resumeSections).values(input).returning();
      return rows.map(asSection);
    },

    async insertSection(input) {
      const [row] = await db.insert(resumeSections).values(input).returning();
      if (!row) {
        throw new Error("无法创建模块");
      }
      return asSection(row);
    },

    async updateSectionDraft(userId, resumeId, sectionId, patch, expectedVersion) {
      const owned = await store.findOwned(userId, resumeId);
      if (!owned || owned.contentVersion !== expectedVersion) {
        return null;
      }

      const section = await store.findSection(resumeId, sectionId);
      if (!section) {
        return null;
      }

      const nextVersion = await bumpContentVersion(db, userId, resumeId, expectedVersion);
      if (nextVersion === null) {
        return null;
      }

      const [updated] = await db
        .update(resumeSections)
        .set({
          ...(patch.data !== undefined ? { data: patch.data } : {}),
          ...(patch.isVisible !== undefined ? { isVisible: patch.isVisible } : {}),
          updatedAt: new Date(),
        })
        .where(and(eq(resumeSections.id, sectionId), eq(resumeSections.resumeId, resumeId)))
        .returning();

      return {
        contentVersion: nextVersion,
        section: updated ? asSection(updated) : section,
      };
    },

    async reorderSections(userId, resumeId, orderedSectionIds, expectedVersion) {
      const owned = await store.findOwned(userId, resumeId);
      if (!owned || owned.contentVersion !== expectedVersion) {
        return null;
      }

      const current = await store.listSections(resumeId);
      if (current.length !== orderedSectionIds.length) {
        return null;
      }

      const currentIds = new Set(current.map((section) => section.id));
      if (!orderedSectionIds.every((id) => currentIds.has(id))) {
        return null;
      }

      const nextVersion = await bumpContentVersion(db, userId, resumeId, expectedVersion);
      if (nextVersion === null) {
        return null;
      }

      await Promise.all(
        orderedSectionIds.map((sectionId, index) =>
          db
            .update(resumeSections)
            .set({ sortOrder: index, updatedAt: new Date() })
            .where(and(eq(resumeSections.id, sectionId), eq(resumeSections.resumeId, resumeId))),
        ),
      );

      return { contentVersion: nextVersion };
    },

    async addSectionWithVersion(userId, resumeId, input, expectedVersion) {
      const owned = await store.findOwned(userId, resumeId);
      if (!owned || owned.contentVersion !== expectedVersion) {
        return null;
      }

      const nextVersion = await bumpContentVersion(db, userId, resumeId, expectedVersion);
      if (nextVersion === null) {
        return null;
      }

      const section = await store.insertSection(input);
      return { contentVersion: nextVersion, section };
    },

    async updateMeta(userId, id, patch) {
      const [row] = await db
        .update(resumes)
        .set({
          title: patch.title,
          slug: patch.slug,
          updatedAt: patch.updatedAt,
        })
        .where(and(eq(resumes.id, id), eq(resumes.userId, userId), isNull(resumes.deletedAt)))
        .returning();
      return row ?? null;
    },

    async softDelete(userId, id, deletedAt) {
      const [row] = await db
        .update(resumes)
        .set({ deletedAt, updatedAt: deletedAt })
        .where(and(eq(resumes.id, id), eq(resumes.userId, userId), isNull(resumes.deletedAt)))
        .returning();
      return row ?? null;
    },

    async transaction(fn) {
      return db.transaction(async (tx) => fn(createDrizzleStore(tx as unknown as ReturnType<typeof requireDb>)));
    },
  };

  return store;
}

export function createDrizzleResumeStore(): ResumeStore {
  return {
    listActiveByUser(userId) {
      return createDrizzleStore(requireDb()).listActiveByUser(userId);
    },
    findOwned(userId, id) {
      return createDrizzleStore(requireDb()).findOwned(userId, id);
    },
    listSections(resumeId) {
      return createDrizzleStore(requireDb()).listSections(resumeId);
    },
    findSection(resumeId, sectionId) {
      return createDrizzleStore(requireDb()).findSection(resumeId, sectionId);
    },
    slugExists(slug, excludeId) {
      return createDrizzleStore(requireDb()).slugExists(slug, excludeId);
    },
    sectionTypeExists(resumeId, type) {
      return createDrizzleStore(requireDb()).sectionTypeExists(resumeId, type);
    },
    insertResume(input) {
      return createDrizzleStore(requireDb()).insertResume(input);
    },
    insertSections(input) {
      return createDrizzleStore(requireDb()).insertSections(input);
    },
    insertSection(input) {
      return createDrizzleStore(requireDb()).insertSection(input);
    },
    updateSectionDraft(userId, resumeId, sectionId, patch, expectedVersion) {
      return createDrizzleStore(requireDb()).updateSectionDraft(
        userId,
        resumeId,
        sectionId,
        patch,
        expectedVersion,
      );
    },
    reorderSections(userId, resumeId, orderedSectionIds, expectedVersion) {
      return createDrizzleStore(requireDb()).reorderSections(
        userId,
        resumeId,
        orderedSectionIds,
        expectedVersion,
      );
    },
    addSectionWithVersion(userId, resumeId, input, expectedVersion) {
      return createDrizzleStore(requireDb()).addSectionWithVersion(
        userId,
        resumeId,
        input,
        expectedVersion,
      );
    },
    updateMeta(userId, id, patch) {
      return createDrizzleStore(requireDb()).updateMeta(userId, id, patch);
    },
    softDelete(userId, id, deletedAt) {
      return createDrizzleStore(requireDb()).softDelete(userId, id, deletedAt);
    },
    transaction(fn) {
      return createDrizzleStore(requireDb()).transaction(fn);
    },
  };
}

export function isUniqueViolation(error: unknown) {
  let current = error;

  for (let i = 0; i < 5; i += 1) {
    if (!current || typeof current !== "object") {
      return false;
    }

    if ("code" in current && current.code === "23505") {
      return true;
    }

    current = "cause" in current ? current.cause : null;
  }

  return false;
}
