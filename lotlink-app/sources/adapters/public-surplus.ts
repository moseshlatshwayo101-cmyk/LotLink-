/**
 * Public Surplus source adapter.
 * Contacts official Public Surplus browse/home page only.
 * Does not invent lots, prices, or availability.
 */

import type { CandidateLot } from "../../domain/types.js";
import { getSourceById } from "../registry.js";
import {
  type SourceAdapter,
  type AdapterSearchParams,
  type AdapterResult,
  safeFetchOfficial,
  makeEvidence,
} from "./base.js";

const SOURCE_ID = "public-surplus";
const OFFICIAL_HOME = "https://www.publicsurplus.com/sms/browse/home";

export const publicSurplusAdapter: SourceAdapter = {
  get source() {
    const s = getSourceById(SOURCE_ID);
    if (!s) throw new Error("Public Surplus source missing from registry");
    return s;
  },

  async search(params: AdapterSearchParams, _researchRunId: string): Promise<AdapterResult> {
    const notes: string[] = [];
    const evidence = [];
    const candidates: CandidateLot[] = [];

    notes.push(
      `Search intent: asset="${params.asset}", budget=${params.budget} ${params.currency}, destination=${params.destination}`
    );
    notes.push("Adapter policy: official Public Surplus pages only; no CAPTCHA bypass; no fabricated inventory.");

    const fetchResult = await safeFetchOfficial(OFFICIAL_HOME, { timeoutMs: 15_000 });

    if (!fetchResult.ok) {
      notes.push(`Could not retrieve official Public Surplus page: ${fetchResult.error}`);
      evidence.push(
        makeEvidence({
          sourceId: SOURCE_ID,
          url: OFFICIAL_HOME,
          claimKind: "FACT",
          summary: `Fetch failure: ${fetchResult.error}`,
        })
      );
      return {
        sourceId: SOURCE_ID,
        candidates: [],
        evidence,
        notes,
        contactedOfficialSource: false,
      };
    }

    evidence.push(
      makeEvidence({
        sourceId: SOURCE_ID,
        url: fetchResult.finalUrl,
        claimKind: "FACT",
        summary: `Official page retrieved with HTTP ${fetchResult.status}`,
        rawExcerpt: fetchResult.text.slice(0, 500).replace(/\s+/g, " "),
      })
    );

    const lower = fetchResult.text.toLowerCase();
    const relevant =
      lower.includes("public surplus") ||
      lower.includes("auction") ||
      lower.includes("surplus") ||
      lower.includes("bid") ||
      lower.includes("lot");

    if (relevant) {
      notes.push(
        "Official Public Surplus page content appears related to auctions/surplus. " +
          "No individual lot records were extracted by this adapter version. " +
          "Human must use the official Public Surplus search for current listings matching the request."
      );
      evidence.push(
        makeEvidence({
          sourceId: SOURCE_ID,
          url: fetchResult.finalUrl,
          claimKind: "FACT",
          summary: "Page content contains surplus/auction related terms (browse/home only).",
        })
      );
    } else {
      notes.push(
        "Official page retrieved; expected keywords not strongly detected in sample. Human verification required."
      );
    }

    notes.push("Candidates returned: 0 (no structured lot data extracted; none verified).");

    return {
      sourceId: SOURCE_ID,
      candidates,
      evidence,
      notes,
      contactedOfficialSource: fetchResult.status >= 200 && fetchResult.status < 400,
    };
  },
};
