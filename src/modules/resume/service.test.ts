import { describe, expect, it } from "vitest";
import { AppError } from "@/lib/errors";
import { CLASSIC_TEMPLATE_ID } from "@/modules/template";
import { buildDefaultSections } from "./defaults";
import { assertOwned } from "./owned";
import { createResumeService } from "./service";
import type { NewResumeInput, NewSectionInput, ResumeRecord, ResumeStore, SectionRecord } from "./store";

function createMemoryStore(): ResumeStore {
  const resumes = new Map<string, ResumeRecord>();
  const sections = new Map<string, SectionRecord[]>();

  async function bumpVersion(userId: string, resumeId: string, expectedVersion: number) {
    const current = await store.findOwned(userId, resumeId);
    if (!current || current.contentVersion !== expectedVersion) {
      return null;
    }
    const next = { ...current, contentVersion: expectedVersion + 1, updatedAt: new Date() };
    resumes.set(resumeId, next);
    return next.contentVersion;
  }

  const store: ResumeStore = {
    async listActiveByUser(userId) {
      return [...resumes.values()]
        .filter((row) => row.userId === userId && row.deletedAt === null)
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    },
    async findOwned(userId, id) {
      const row = resumes.get(id);
      if (!row || row.userId !== userId || row.deletedAt) {
        return null;
      }
      return row;
    },
    async listSections(resumeId) {
      return [...(sections.get(resumeId) ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);
    },
    async findSection(resumeId, sectionId) {
      return (sections.get(resumeId) ?? []).find((section) => section.id === sectionId) ?? null;
    },
    async slugExists(slug, excludeId) {
      return [...resumes.values()].some((row) => row.slug === slug && row.id !== excludeId);
    },
    async sectionTypeExists(resumeId, type) {
      return (sections.get(resumeId) ?? []).some((section) => section.type === type);
    },
    async insertResume(input: NewResumeInput) {
      if ([...resumes.values()].some((row) => row.slug === input.slug)) {
        throw Object.assign(new Error("duplicate"), { code: "23505" });
      }

      const now = new Date("2026-08-17T12:00:00.000Z");
      const row: ResumeRecord = {
        id: crypto.randomUUID(),
        userId: input.userId,
        title: input.title,
        slug: input.slug,
        status: input.status ?? "DRAFT",
        visibility: input.visibility ?? "public",
        templateId: input.templateId ?? null,
        contentVersion: input.contentVersion ?? 1,
        publishedVersionId: input.publishedVersionId ?? null,
        publishedAt: input.publishedAt ?? null,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      };
      resumes.set(row.id, row);
      return row;
    },
    async insertSections(input: NewSectionInput[]) {
      const now = new Date("2026-08-17T12:00:00.000Z");
      const created = input.map((item) => ({
        id: crypto.randomUUID(),
        resumeId: item.resumeId,
        type: item.type,
        schemaVersion: item.schemaVersion,
        sortOrder: item.sortOrder,
        isVisible: item.isVisible,
        data: item.data,
        createdAt: now,
        updatedAt: now,
      }));

      for (const section of created) {
        const current = sections.get(section.resumeId) ?? [];
        current.push(section);
        sections.set(section.resumeId, current);
      }

      return created;
    },
    async insertSection(input) {
      const now = new Date("2026-08-17T12:00:00.000Z");
      const section: SectionRecord = {
        id: crypto.randomUUID(),
        resumeId: input.resumeId,
        type: input.type,
        schemaVersion: input.schemaVersion,
        sortOrder: input.sortOrder,
        isVisible: input.isVisible,
        data: input.data,
        createdAt: now,
        updatedAt: now,
      };
      const current = sections.get(input.resumeId) ?? [];
      current.push(section);
      sections.set(input.resumeId, current);
      return section;
    },
    async updateSectionDraft(userId, resumeId, sectionId, patch, expectedVersion) {
      const nextVersion = await bumpVersion(userId, resumeId, expectedVersion);
      if (nextVersion === null) {
        return null;
      }

      const list = sections.get(resumeId) ?? [];
      const index = list.findIndex((section) => section.id === sectionId);
      if (index < 0) {
        return null;
      }

      const current = list[index]!;
      const updated: SectionRecord = {
        ...current,
        ...(patch.data !== undefined ? { data: patch.data } : {}),
        ...(patch.isVisible !== undefined ? { isVisible: patch.isVisible } : {}),
        updatedAt: new Date(),
      };
      list[index] = updated;
      sections.set(resumeId, list);
      return { contentVersion: nextVersion, section: updated };
    },
    async reorderSections(userId, resumeId, orderedSectionIds, expectedVersion) {
      const nextVersion = await bumpVersion(userId, resumeId, expectedVersion);
      if (nextVersion === null) {
        return null;
      }

      const list = sections.get(resumeId) ?? [];
      if (list.length !== orderedSectionIds.length) {
        return null;
      }

      const byId = new Map(list.map((section) => [section.id, section]));
      if (!orderedSectionIds.every((id) => byId.has(id))) {
        return null;
      }

      const reordered = orderedSectionIds.map((id, index) => ({
        ...byId.get(id)!,
        sortOrder: index,
        updatedAt: new Date(),
      }));
      sections.set(resumeId, reordered);
      return { contentVersion: nextVersion };
    },
    async addSectionWithVersion(userId, resumeId, input, expectedVersion) {
      const nextVersion = await bumpVersion(userId, resumeId, expectedVersion);
      if (nextVersion === null) {
        return null;
      }
      const section = await store.insertSection(input);
      return { contentVersion: nextVersion, section };
    },
    async updateMeta(userId, id, patch) {
      const current = await store.findOwned(userId, id);
      if (!current) {
        return null;
      }
      if ([...resumes.values()].some((row) => row.slug === patch.slug && row.id !== id)) {
        throw Object.assign(new Error("duplicate"), { code: "23505" });
      }
      const next = { ...current, ...patch };
      resumes.set(id, next);
      return next;
    },
    async softDelete(userId, id, deletedAt) {
      const current = await store.findOwned(userId, id);
      if (!current) {
        return null;
      }
      const next = { ...current, deletedAt, updatedAt: deletedAt };
      resumes.set(id, next);
      return next;
    },
    async transaction(fn) {
      return fn(store);
    },
  };

  return store;
}

const defaultTemplateId = async () => CLASSIC_TEMPLATE_ID;

describe("buildDefaultSections", () => {
  it("creates six empty MVP modules including PROFILE fields", () => {
    const sections = buildDefaultSections();
    expect(sections.map((section) => section.type)).toEqual([
      "PROFILE",
      "SUMMARY",
      "EXPERIENCE",
      "EDUCATION",
      "SKILL",
      "LINKS",
    ]);
    expect(sections[0]?.data).toMatchObject({
      fullName: "",
      headline: "",
      avatarAssetId: null,
      links: [],
    });
  });
});

describe("assertOwned", () => {
  it("throws RESUME_NOT_FOUND when the row is missing", () => {
    expect(() => assertOwned(null)).toThrow(AppError);
    try {
      assertOwned(undefined);
    } catch (error) {
      expect((error as AppError).code).toBe("RESUME_NOT_FOUND");
      expect((error as AppError).status).toBe(404);
    }
  });
});

describe("createResumeService", () => {
  const userId = "11111111-1111-4111-8111-111111111111";
  const otherUserId = "22222222-2222-4222-8222-222222222222";

  it("creates a draft with six default sections", async () => {
    const service = createResumeService(createMemoryStore(), defaultTemplateId);
    const resume = await service.create(userId, "ming@openstar.ltd");

    expect(resume.title).toBe("未命名简历");
    expect(resume.slug).toBe("ming");
    expect(resume.status).toBe("DRAFT");
    expect(resume.sections).toHaveLength(6);
    expect(resume.templateId).toBe(CLASSIC_TEMPLATE_ID);
    expect(resume.publishedVersionId).toBeNull();
  });

  it("increments slug when the email local part is taken", async () => {
    const service = createResumeService(createMemoryStore(), defaultTemplateId);
    const first = await service.create(userId, "ming@openstar.ltd");
    const second = await service.create(userId, "ming@openstar.ltd");

    expect(first.slug).toBe("ming");
    expect(second.slug).toBe("ming-2");
  });

  it("duplicates draft sections with a new slug and unpublished state", async () => {
    const service = createResumeService(createMemoryStore(), defaultTemplateId);
    const source = await service.create(userId, "ming@openstar.ltd");
    await service.updateMeta(userId, source.id, { title: "全栈简历", slug: "ming" });

    const copy = await service.duplicate(userId, source.id);

    expect(copy.id).not.toBe(source.id);
    expect(copy.title).toBe("全栈简历 副本");
    expect(copy.slug).toBe("ming-copy");
    expect(copy.status).toBe("DRAFT");
    expect(copy.publishedVersionId).toBeNull();
    expect(copy.sections).toHaveLength(source.sections.length);
    expect(copy.sections.map((section) => section.id)).not.toEqual(source.sections.map((section) => section.id));
  });

  it("hides a resume after soft delete", async () => {
    const service = createResumeService(createMemoryStore(), defaultTemplateId);
    const resume = await service.create(userId, "ming@openstar.ltd");

    await service.softDelete(userId, resume.id);

    await expect(service.listMine(userId)).resolves.toEqual([]);
    await expect(service.getOwned(userId, resume.id)).rejects.toMatchObject({ code: "RESUME_NOT_FOUND" });
  });

  it("rejects another user's resume as not found", async () => {
    const service = createResumeService(createMemoryStore(), defaultTemplateId);
    const resume = await service.create(userId, "ming@openstar.ltd");

    await expect(service.getOwned(otherUserId, resume.id)).rejects.toMatchObject({
      code: "RESUME_NOT_FOUND",
    });
  });

  it("rejects a taken slug when the user edits metadata", async () => {
    const service = createResumeService(createMemoryStore(), defaultTemplateId);
    const first = await service.create(userId, "ming@openstar.ltd");
    const second = await service.create(userId, "li@openstar.ltd");

    await expect(
      service.updateMeta(userId, second.id, { title: second.title, slug: first.slug }),
    ).rejects.toMatchObject({ code: "RESUME_SLUG_TAKEN" });
  });

  it("saves section draft and bumps content version", async () => {
    const service = createResumeService(createMemoryStore(), defaultTemplateId);
    const resume = await service.create(userId, "ming@openstar.ltd");
    const profile = resume.sections.find((section) => section.type === "PROFILE")!;

    const result = await service.saveSectionDraft(userId, resume.id, profile.id, resume.contentVersion, {
      fullName: "张三",
      headline: "",
      email: "",
      phone: "",
      location: "",
      avatarAssetId: null,
      website: "",
      links: [],
    });

    expect(result.contentVersion).toBe(2);
    const updated = await service.getOwned(userId, resume.id);
    expect(updated.contentVersion).toBe(2);
    expect(updated.sections.find((section) => section.id === profile.id)?.data.fullName).toBe("张三");
  });

  it("returns version conflict when expectedVersion is stale", async () => {
    const service = createResumeService(createMemoryStore(), defaultTemplateId);
    const resume = await service.create(userId, "ming@openstar.ltd");
    const profile = resume.sections.find((section) => section.type === "PROFILE")!;

    await service.saveSectionDraft(userId, resume.id, profile.id, resume.contentVersion, {
      fullName: "张三",
      headline: "",
      email: "",
      phone: "",
      location: "",
      avatarAssetId: null,
      website: "",
      links: [],
    });

    await expect(
      service.saveSectionDraft(userId, resume.id, profile.id, resume.contentVersion, {
        fullName: "李四",
        headline: "",
        email: "",
        phone: "",
        location: "",
        avatarAssetId: null,
        website: "",
        links: [],
      }),
    ).rejects.toMatchObject({ code: "RESUME_VERSION_CONFLICT" });
  });

  it("reorders sections and bumps version", async () => {
    const service = createResumeService(createMemoryStore(), defaultTemplateId);
    const resume = await service.create(userId, "ming@openstar.ltd");
    const reversed = [...resume.sections].reverse().map((section) => section.id);

    const result = await service.reorderSections(userId, resume.id, resume.contentVersion, reversed);
    expect(result.contentVersion).toBe(2);

    const updated = await service.getOwned(userId, resume.id);
    expect(updated.sections.map((section) => section.id)).toEqual(reversed);
  });

  it("adds a new section and rejects duplicate PROFILE", async () => {
    const service = createResumeService(createMemoryStore(), defaultTemplateId);
    const resume = await service.create(userId, "ming@openstar.ltd");

    const added = await service.addSection(userId, resume.id, resume.contentVersion, "PROJECT");
    expect(added.section?.type).toBe("PROJECT");
    expect(added.contentVersion).toBe(2);

    await expect(
      service.addSection(userId, resume.id, added.contentVersion, "PROFILE"),
    ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
  });
});
