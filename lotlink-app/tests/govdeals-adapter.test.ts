import { describe, it, expect } from "vitest";
import { govDealsAdapter } from "../sources/adapters/govdeals.js";
import { assertAllowedUrl } from "../sources/adapters/base.js";

describe("assertAllowedUrl", () => {
  it("allows official GovDeals host", () => {
    expect(() => assertAllowedUrl("https://www.govdeals.com/")).not.toThrow();
  });

  it("rejects non-allowlisted hosts", () => {
    expect(() => assertAllowedUrl("https://evil.example.com/")).toThrow();
  });

  it("rejects non-HTTPS", () => {
    expect(() => assertAllowedUrl("http://www.govdeals.com/")).toThrow();
  });
});

describe("govDealsAdapter", () => {
  it("returns zero candidates and does not fabricate lots", async () => {
    const result = await govDealsAdapter.search(
      {
        asset: "laptop",
        budget: 8000,
        currency: "USD",
        destination: "South Africa",
      },
      "test-run-id"
    );

    expect(result.sourceId).toBe("govdeals");
    expect(result.candidates).toEqual([]);
    expect(result.notes.some((n) => n.includes("Candidates returned: 0"))).toBe(true);
    // Evidence should always be present (success or failure of fetch)
    expect(result.evidence.length).toBeGreaterThan(0);
  }, 20_000);
});
