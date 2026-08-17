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

export type ResumeStore = {
  listActiveByUser(userId: string): Promise<ResumeRecord[]>;
  findOwned(userId: string, id: string): Promise<ResumeRecord | null>;
  listSections(resumeId: string): Promise<SectionRecord[]>;
  slugExists(slug: string, excludeId?: string): Promise<boolean>;
  insertResume(input: NewResumeInput): Promise<ResumeRecord>;
  insertSections(input: NewSectionInput[]): Promise<SectionRecord[]>;
  updateMeta(
    userId: string,
    id: string,
    patch: { title: string; slug: string; updatedAt: Date },
  ): Promise<ResumeRecord | null>;
  softDelete(userId: string, id: string, deletedAt: Date): Promise<ResumeRecord | null>;
  transaction<T>(fn: (store: ResumeStore) => Promise<T>): Promise<T>;
};

function asSection(row: typeof resumeSections.$inferSelect): SectionRecord {
  return {
    ...row,
    data: (row.data ?? {}) as Record<string, unknown>,
  };
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

    async slugExists(slug, excludeId) {
      const [row] = await db
        .select({ id: resumes.id })
        .from(resumes)
        .where(excludeId ? and(eq(resumes.slug, slug), ne(resumes.id, excludeId)) : eq(resumes.slug, slug))
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
    slugExists(slug, excludeId) {
      return createDrizzleStore(requireDb()).slugExists(slug, excludeId);
    },
    insertResume(input) {
      return createDrizzleStore(requireDb()).insertResume(input);
    },
    insertSections(input) {
      return createDrizzleStore(requireDb()).insertSections(input);
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
