import { describe, it, expect } from "vitest";
import { normalizeResearchRequest } from "../agent/normalize.js";

describe("normalizeResearchRequest", () => {
  it("accepts a valid minimal request", () => {
    const result = normalizeResearchRequest({
      asset: "laptop",
      budget: 8000,
      currency: "USD",
      destination: "South Africa",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.request.asset).toBe("laptop");
      expect(result.request.budget).toBe(8000);
      expect(result.request.currency).toBe("USD");
      expect(result.request.destination).toBe("South Africa");
      expect(result.request.status).toBe("NEW");
      expect(result.request.id).toBeTruthy();
    }
  });

  it("rejects missing required fields", () => {
    const result = normalizeResearchRequest({
      asset: "laptop",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.length).toBeGreaterThan(0);
    }
  });

  it("rejects non-positive budget", () => {
    const result = normalizeResearchRequest({
      asset: "4x4 pickup",
      budget: 0,
      currency: "USD",
      destination: "Namibia",
    });
    expect(result.ok).toBe(false);
  });
});
