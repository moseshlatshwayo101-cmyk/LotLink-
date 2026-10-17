/**
 * Health / readiness handler.
 * Does not expose secrets.
 */

import { listApprovedSources } from "../sources/registry.js";
import { listAdapters } from "../sources/adapters/index.js";
import { jsonResponse } from "./types.js";

export async function handleHealth(): Promise<Response> {
  const body = {
    ok: true,
    service: "lotlink-app",
    status: "ready",
    timestamp: new Date().toISOString(),
    sourcesRegistered: listApprovedSources().length,
    adaptersLoaded: listAdapters().map((a) => a.source.id),
    notes: [
      "Research agent is scaffolded",
      "Human review gate is enforced in code",
      "No secrets are returned by this endpoint",
    ],
  };
  return jsonResponse(body, 200);
}
