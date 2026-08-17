import { describe, expect, it } from "vitest";
import { AppError } from "@/lib/errors";
import {
  assertAuthenticated,
  isEmailVerified,
  normalizeEmail,
  profileFromAuthUser,
} from "./profile";

describe("normalizeEmail", () => {
  it("trims and lowercases", () => {
    expect(normalizeEmail("  Foo.Bar@Example.COM ")).toBe("foo.bar@example.com");
  });
});

describe("assertAuthenticated", () => {
  it("throws AUTH_REQUIRED when session is missing", () => {
    expect(() => assertAuthenticated(null)).toThrow(AppError);
    try {
      assertAuthenticated(undefined);
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).code).toBe("AUTH_REQUIRED");
      expect((error as AppError).status).toBe(401);
    }
  });

  it("passes through an authenticated value", () => {
    const user = { id: "usr_1" };
    assertAuthenticated(user);
    expect(user.id).toBe("usr_1");
  });
});

describe("profileFromAuthUser", () => {
  it("maps auth identity onto a business user profile", () => {
    expect(
      profileFromAuthUser({
        id: "11111111-1111-4111-8111-111111111111",
        email: "  Ming@OpenStar.ltd ",
        displayName: " 张明 ",
      }),
    ).toEqual({
      id: "11111111-1111-4111-8111-111111111111",
      email: "ming@openstar.ltd",
      displayName: "张明",
    });
  });

  it("falls back to the email local part when display name is missing", () => {
    expect(
      profileFromAuthUser({
        id: "11111111-1111-4111-8111-111111111111",
        email: "ming@openstar.ltd",
      }),
    ).toMatchObject({
      email: "ming@openstar.ltd",
      displayName: "ming",
    });
  });

  it("rejects an identity without email", () => {
    expect(() =>
      profileFromAuthUser({
        id: "11111111-1111-4111-8111-111111111111",
        email: "   ",
      }),
    ).toThrow(AppError);
  });
});

describe("isEmailVerified", () => {
  it("is true only when confirmation timestamp exists", () => {
    expect(isEmailVerified("2026-08-17T00:00:00Z")).toBe(true);
    expect(isEmailVerified(null)).toBe(false);
  });
});
