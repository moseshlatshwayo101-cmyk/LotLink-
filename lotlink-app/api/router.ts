/**
 * Simple path-based router for LotLink API handlers.
 * Suitable for mounting behind a Vercel serverless function or Edge handler.
 */

import { handleHealth } from "./health.js";
import { handleResearch } from "./research.js";
import { handleSources } from "./sources.js";
import { jsonResponse } from "./types.js";

export async function lotlinkApiRouter(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, "") || "/";

  // Support both /api/... and bare paths when mounted at root of a function
  const normalized = path.replace(/^\/api/, "") || "/";

  if (normalized === "/health" || normalized === "/ready") {
    return handleHealth();
  }

  if (normalized === "/sources") {
    if (request.method !== "GET") {
      return jsonResponse({ ok: false, error: "Method not allowed" }, 405);
    }
    return handleSources();
  }

  if (normalized === "/research") {
    return handleResearch(request);
  }

  return jsonResponse(
    {
      ok: false,
      error: "Not found",
      available: ["GET /api/health", "GET /api/sources", "POST /api/research"],
    },
    404
  );
}
