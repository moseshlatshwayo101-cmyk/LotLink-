import { describe, it, expect } from "vitest";
import { listAdapters } from "../sources/adapters/index.js";
import { gsaFleetAdapter } from "../sources/adapters/gsa-fleet.js";
import { publicSurplusAdapter } from "../sources/adapters/public-surplus.js";
import { usTreasuryAdapter } from "../sources/adapters/us-treasury.js";

describe("adapter registry", () => {
  it("loads all four approved adapters", () => {
    const ids = listAdapters().map((a) => a.source.id).sort();
    expect(ids).toEqual(["govdeals", "gsa-fleet", "public-surplus", "us-treasury"].sort());
  });
});

async function expectZeroCandidates(
  adapter: { search: Function; source: { id: string } },
  asset: string,
  destination: string
) {
  const result = await adapter.search(
    {
      asset,
      budget: 8000,
      currency: "USD",
      destination,
    },
    "test-run"
  );
  expect(result.sourceId).toBe(adapter.source.id);
  expect(result.candidates).toEqual([]);
  expect(result.notes.some((n: string) => n.includes("Candidates returned: 0"))).toBe(true);
  expect(result.evidence.length).toBeGreaterThan(0);
}

describe("remaining adapters return zero fabricated candidates", () => {
  it("GSA Fleet", async () => {
    await expectZeroCandidates(gsaFleetAdapter, "4x4 pickup", "Namibia");
  }, 20_000);

  it("Public Surplus", async () => {
    await expectZeroCandidates(publicSurplusAdapter, "diesel generator", "Botswana");
  }, 20_000);

  it("U.S. Treasury", async () => {
    await expectZeroCandidates(usTreasuryAdapter, "laptop", "South Africa");
  }, 20_000);
});
