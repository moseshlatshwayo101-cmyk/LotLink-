import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { isAdminAuthorized, getAdminToken } from "../api/admin-auth.js";

describe("admin auth", () => {
  const original = process.env.ADMIN_TOKEN;

  beforeEach(() => {
    process.env.ADMIN_TOKEN = "test-admin-token-32chars-minimum!!";
  });

  afterEach(() => {
    if (original === undefined) delete process.env.ADMIN_TOKEN;
    else process.env.ADMIN_TOKEN = original;
  });

  it("reads configured token", () => {
    expect(getAdminToken()?.length).toBeGreaterThanOrEqual(16);
  });

  it("accepts matching header", () => {
    const req = new Request("https://example.com/api/admin/reviews", {
      headers: { "X-LotLink-Admin-Token": "test-admin-token-32chars-minimum!!" },
    });
    expect(isAdminAuthorized(req)).toBe(true);
  });

  it("rejects missing or wrong token", () => {
    const req = new Request("https://example.com/api/admin/reviews");
    expect(isAdminAuthorized(req)).toBe(false);

    const bad = new Request("https://example.com/api/admin/reviews", {
      headers: { "X-LotLink-Admin-Token": "wrong" },
    });
    expect(isAdminAuthorized(bad)).toBe(false);
  });

  it("fails closed when ADMIN_TOKEN unset", () => {
    delete process.env.ADMIN_TOKEN;
    const req = new Request("https://example.com/api/admin/reviews", {
      headers: { "X-LotLink-Admin-Token": "anything" },
    });
    expect(isAdminAuthorized(req)).toBe(false);
  });
});
