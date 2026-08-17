import { describe, expect, it } from "vitest";
import { AppError } from "@/lib/errors";
import {
  allocateUniqueSlug,
  duplicateSlugBase,
  numberedSlug,
  slugFromEmail,
  slugifyCandidate,
} from "./slug";

describe("slugifyCandidate", () => {
  it("keeps a valid local part", () => {
    expect(slugifyCandidate("Tyrion-Xu")).toBe("tyrion-xu");
  });

  it("falls back when reserved or too short", () => {
    expect(slugifyCandidate("dashboard")).toBe("resume");
    expect(slugifyCandidate("ab")).toBe("resume");
  });
});

describe("slugFromEmail", () => {
  it("uses the email local part", () => {
    expect(slugFromEmail("ming@openstar.ltd")).toBe("ming");
  });
});

describe("numberedSlug", () => {
  it("returns the base then increments", () => {
    expect(numberedSlug("ming", 1)).toBe("ming");
    expect(numberedSlug("ming", 2)).toBe("ming-2");
  });
});

describe("duplicateSlugBase", () => {
  it("appends -copy", () => {
    expect(duplicateSlugBase("ming")).toBe("ming-copy");
  });
});

describe("allocateUniqueSlug", () => {
  it("increments until a free slug is found", async () => {
    const taken = new Set(["ming", "ming-2"]);
    await expect(allocateUniqueSlug("ming", async (slug) => taken.has(slug))).resolves.toBe("ming-3");
  });

  it("throws when every candidate is taken", async () => {
    try {
      await allocateUniqueSlug("ming", async () => true, 3);
      throw new Error("expected failure");
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).code).toBe("RESUME_SLUG_TAKEN");
    }
  });
});
