import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import bcrypt from "bcrypt";
import app, { prisma } from "../src/app";

const lectorUsername = `lector_test_${Date.now()}`;
const lectorPassword = "lector123";
let adminToken = "";
let lectorToken = "";

beforeAll(async () => {
  const hashed = await bcrypt.hash(lectorPassword, 10);
  await prisma.user.create({
    data: { username: lectorUsername, password: hashed, role: "lector" },
  });

  const adminLogin = await request(app)
    .post("/api/auth/login")
    .send({ username: "admin", password: "admin123" });
  adminToken = adminLogin.body.token;

  const lectorLogin = await request(app)
    .post("/api/auth/login")
    .send({ username: lectorUsername, password: lectorPassword });
  lectorToken = lectorLogin.body.token;
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { username: lectorUsername } });
  await prisma.$disconnect();
});

describe("POST /api/auth/login", () => {
  it("returns token and role for valid credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ username: "admin", password: "admin123" });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
    expect(res.body.refreshToken).toBeTruthy();
    expect(res.body.role).toBe("admin");
  });

  it("rejects invalid credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ username: "admin", password: "wrong-password" });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Invalid credentials");
  });

  it("rejects malformed payload", async () => {
    const res = await request(app).post("/api/auth/login").send({});
    expect(res.status).toBe(400);
  });
});

describe("auth middleware", () => {
  it("rejects requests without token", async () => {
    const res = await request(app).get("/api/perspectives");
    expect(res.status).toBe(401);
  });

  it("rejects requests with invalid token", async () => {
    const res = await request(app)
      .get("/api/perspectives")
      .set("Authorization", "Bearer invalid-token");
    expect(res.status).toBe(401);
  });
});

describe("RBAC", () => {
  it("allows admin to read perspectives", async () => {
    const res = await request(app)
      .get("/api/perspectives")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("forbids lector from mutating progress", async () => {
    const res = await request(app)
      .patch("/api/perspectives/batch-progress")
      .set("Authorization", `Bearer ${lectorToken}`)
      .send({ updates: [{ activityId: "nope", progress: 10 }] });

    expect(res.status).toBe(403);
  });

  it("forbids lector from deleting resources", async () => {
    const res = await request(app)
      .delete("/api/perspectives/does-not-exist")
      .set("Authorization", `Bearer ${lectorToken}`);

    expect(res.status).toBe(403);
  });

  it("maps missing records to 404 for admin (P2025)", async () => {
    const res = await request(app)
      .delete("/api/perspectives/does-not-exist")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
  });
});
