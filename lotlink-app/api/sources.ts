/**
 * GET /api/sources — list approved sources (no secrets).
 */

import { listApprovedSources } from "../sources/registry.js";
import { listAdapters } from "../sources/adapters/index.js";
import { jsonResponse } from "./types.js";

export async function handleSources(): Promise<Response> {
  const sources = listApprovedSources().map((s) => ({
    id: s.id,
    name: s.name,
    jurisdiction: s.jurisdiction,
    auctionType: s.auctionType,
    officialUrl: s.officialUrl,
    accessMethod: s.accessMethod,
    hasAdapter: listAdapters().some((a) => a.source.id === s.id),
  }));

  return jsonResponse({ ok: true, data: { sources } }, 200);
}
