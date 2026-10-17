/**
 * Simple path-based router for LotLink API handlers.
 */

import { handleHealth } from "./health.js";
import { handleResearch } from "./research.js";
import { handleSources } from "./sources.js";
import { handleAdminListReviews, handleAdminDecide } from "./admin-reviews.js";
import { jsonResponse } from "./types.js";

export async function lotlinkApiRouter(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, "") || "/";
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

  if (normalized === "/admin/reviews") {
    return handleAdminListReviews(request);
  }

  if (normalized === "/admin/reviews/decide") {
    return handleAdminDecide(request);
  }

  return jsonResponse(
    {
      ok: false,
      error: "Not found",
      available: [
        "GET /api/health",
        "GET /api/sources",
        "POST /api/research",
        "GET /api/admin/reviews",
        "POST /api/admin/reviews/decide",
      ],
    },
    404
  );
}
