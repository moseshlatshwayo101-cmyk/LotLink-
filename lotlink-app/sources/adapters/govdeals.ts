/**
 * GovDeals source adapter.
 * Contacts the official public site only.
 * Does not invent lots or prices.
 * If structured inventory cannot be safely extracted, returns zero candidates
 * and explicit evidence that the official page was reached (or the failure reason).
 */

import { randomUUID } from "node:crypto";
import type { CandidateLot } from "../../domain/types.js";
import { getSourceById } from "../registry.js";
import {
  type SourceAdapter,
  type AdapterSearchParams,
  type AdapterResult,
  safeFetchOfficial,
  makeEvidence,
} from "./base.js";

const SOURCE_ID = "govdeals";
const OFFICIAL_HOME = "https://www.govdeals.com/";

export const govDealsAdapter: SourceAdapter = {
  get source() {
    const s = getSourceById(SOURCE_ID);
    if (!s) throw new Error("GovDeals source missing from registry");
    return s;
  },

  async search(params: AdapterSearchParams, researchRunId: string): Promise<AdapterResult> {
    const notes: string[] = [];
    const evidence = [];
    const candidates: CandidateLot[] = [];

    notes.push(`Search intent: asset="${params.asset}", budget=${params.budget} ${params.currency}, destination=${params.destination}`);
    notes.push("Adapter policy: official pages only; no CAPTCHA bypass; no fabricated inventory.");

    const fetchResult = await safeFetchOfficial(OFFICIAL_HOME, { timeoutMs: 15_000 });

    if (!fetchResult.ok) {
      notes.push(`Could not retrieve official GovDeals home page: ${fetchResult.error}`);
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

    // Lightweight, non-authoritative signal only — never treat as inventory list
    const lower = fetchResult.text.toLowerCase();
    const mentionsAuctions =
      lower.includes("auction") || lower.includes("govdeals") || lower.includes("surplus");

    if (mentionsAuctions) {
      notes.push(
        "Official home page content references auction/surplus activity. " +
          "No individual lot records were extracted by this adapter version. " +
          "Human must open official search on GovDeals for current listings matching the request."
      );
      evidence.push(
        makeEvidence({
          sourceId: SOURCE_ID,
          url: fetchResult.finalUrl,
          claimKind: "FACT",
          summary: "Page content contains auction/surplus related terms (home page only).",
        })
      );
    } else {
      notes.push("Official page retrieved; no strong auction keywords detected in sample. Human verification required.");
    }

    // Explicit: this scaffold does not emit CandidateLot objects without structured, evidence-backed listing data.
    // Returning zero candidates is the correct, non-fabricating behaviour.
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
