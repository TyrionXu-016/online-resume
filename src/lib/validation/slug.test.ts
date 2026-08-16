import { describe, expect, it } from "vitest";
import { isReservedSlug, isValidSlug, normalizeSlug } from "./slug";

describe("slug validation", () => {
  it("normalizes case and whitespace", () => {
    expect(normalizeSlug(" ZhangMing ")).toBe("zhangming");
  });

  it("rejects reserved words", () => {
    expect(isReservedSlug("dashboard")).toBe(true);
    expect(isValidSlug("dashboard")).toBe(false);
  });

  it("accepts a public resume slug", () => {
    expect(isValidSlug("zhangming")).toBe(true);
  });
});
