import { describe, expect, it } from "vitest";
import { getAuthCallbackUrl, safeNextPath } from "./app-url";

describe("safeNextPath", () => {
  it("allows a relative path", () => {
    expect(safeNextPath("/resumes")).toBe("/resumes");
  });

  it("rejects open redirects", () => {
    expect(safeNextPath("//evil.example")).toBe("/dashboard");
    expect(safeNextPath("https://evil.example")).toBe("/dashboard");
    expect(safeNextPath("\\evil")).toBe("/dashboard");
  });
});

describe("getAuthCallbackUrl", () => {
  it("appends a next query when provided", () => {
    expect(getAuthCallbackUrl("/dashboard")).toContain("/auth/callback?next=%2Fdashboard");
  });
});
