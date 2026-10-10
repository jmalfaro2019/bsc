import { describe, expect, it } from "vitest";
import {
  createUserSchema,
  progressUpdateSchema,
  updateUserSchema,
} from "../src/index";

describe("createUserSchema", () => {
  it("accepts valid input", () => {
    const result = createUserSchema.safeParse({
      username: "maria",
      password: "secret123",
      role: "lector",
    });
    expect(result.success).toBe(true);
  });

  it("rejects unknown roles", () => {
    const result = createUserSchema.safeParse({
      username: "maria",
      password: "secret123",
      role: "superadmin",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short passwords", () => {
    const result = createUserSchema.safeParse({
      username: "maria",
      password: "123",
      role: "admin",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short usernames", () => {
    const result = createUserSchema.safeParse({
      username: "ab",
      password: "secret123",
      role: "admin",
    });
    expect(result.success).toBe(false);
  });
});

describe("updateUserSchema", () => {
  it("accepts an empty object", () => {
    expect(updateUserSchema.safeParse({}).success).toBe(true);
  });

  it("accepts partial updates", () => {
    expect(updateUserSchema.safeParse({ role: "admin" }).success).toBe(true);
  });

  it("rejects invalid roles", () => {
    expect(updateUserSchema.safeParse({ role: "root" }).success).toBe(false);
  });
});

describe("progressUpdateSchema", () => {
  it("accepts values within 0-100", () => {
    expect(progressUpdateSchema.safeParse({ progress: 0 }).success).toBe(true);
    expect(progressUpdateSchema.safeParse({ progress: 100 }).success).toBe(true);
    expect(progressUpdateSchema.safeParse({ progress: 42.5 }).success).toBe(true);
  });

  it("rejects out-of-range values", () => {
    expect(progressUpdateSchema.safeParse({ progress: -1 }).success).toBe(false);
    expect(progressUpdateSchema.safeParse({ progress: 101 }).success).toBe(false);
  });
});
