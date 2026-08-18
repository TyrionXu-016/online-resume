import { describe, expect, it } from "vitest";
import { AppError } from "@/lib/errors";
import { parseSectionData, safeParseSectionData } from "./index";

describe("parseSectionData", () => {
  it("parses PROFILE with defaults for missing fields", () => {
    const data = parseSectionData("PROFILE", { fullName: "张三" });
    expect(data.fullName).toBe("张三");
    expect(data.headline).toBe("");
    expect(data.avatarAssetId).toBeNull();
  });

  it("parses SUMMARY and rejects content over 300 chars", () => {
    const valid = parseSectionData("SUMMARY", { content: "简介" });
    expect(valid.content).toBe("简介");

    expect(() => parseSectionData("SUMMARY", { content: "x".repeat(301) })).toThrow(AppError);
    try {
      parseSectionData("SUMMARY", { content: "x".repeat(301) });
    } catch (error) {
      expect((error as AppError).code).toBe("VALIDATION_ERROR");
    }
  });

  it("parses EXPERIENCE items with date format", () => {
    const data = parseSectionData("EXPERIENCE", {
      items: [
        {
          id: "11111111-1111-4111-8111-111111111111",
          company: "Example",
          position: "Engineer",
          location: "Shanghai",
          startDate: "2025-01",
          endDate: null,
          current: true,
          description: "",
          highlights: [],
        },
      ],
    });
    expect(data.items).toHaveLength(1);
    expect(data.items[0]?.startDate).toBe("2025-01");
  });

  it("rejects invalid EXPERIENCE date format", () => {
    const result = safeParseSectionData("EXPERIENCE", {
      items: [
        {
          id: "11111111-1111-4111-8111-111111111111",
          company: "",
          position: "",
          location: "",
          startDate: "2025/01",
          endDate: null,
          current: false,
          description: "",
          highlights: [],
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("parses all item-based section types", () => {
    const id = "11111111-1111-4111-8111-111111111111";
    expect(parseSectionData("PROJECT", { items: [] }).items).toEqual([]);
    expect(parseSectionData("EDUCATION", { items: [] }).items).toEqual([]);
    expect(parseSectionData("SKILL", { items: [{ id, name: "React" }] }).items[0]?.name).toBe("React");
    expect(parseSectionData("LANGUAGE", { items: [{ id, name: "英语", proficiency: "流利" }] }).items).toHaveLength(1);
    expect(parseSectionData("CERTIFICATE", { items: [] }).items).toEqual([]);
    expect(parseSectionData("LINKS", { items: [{ id, label: "GitHub", url: "https://github.com" }] }).items).toHaveLength(1);
    expect(parseSectionData("CUSTOM", { items: [{ id, title: "奖项", content: "一等奖" }] }).items[0]?.title).toBe("奖项");
  });
});
