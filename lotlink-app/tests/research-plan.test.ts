import { describe, it, expect } from "vitest";
import { normalizeResearchRequest } from "../agent/normalize.js";
import { createResearchPlan } from "../agent/research-plan.js";

describe("createResearchPlan", () => {
  it("includes approved sources and human-review step", () => {
    const norm = normalizeResearchRequest({
      asset: "diesel generator",
      budget: 8000,
      currency: "USD",
      destination: "Botswana",
    });
    expect(norm.ok).toBe(true);
    if (!norm.ok) return;

    const plan = createResearchPlan(norm.request);
    expect(plan.sourcesToCheck.length).toBeGreaterThan(0);
    expect(plan.steps.some((s) => s.toLowerCase().includes("human"))).toBe(true);
    expect(plan.notes.some((n) => n.includes("Human gate"))).toBe(true);
  });
});
