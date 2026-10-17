/**
 * Vercel serverless entry (Node.js runtime).
 * Deploy by pointing a Vercel function or project root appropriately,
 * or import lotlinkApiRouter from a Next.js route handler.
 */

import { lotlinkApiRouter } from "./router.js";

export default async function handler(request: Request): Promise<Response> {
  return lotlinkApiRouter(request);
}

// Also export named handlers for flexibility
export { handleHealth } from "./health.js";
export { handleResearch } from "./research.js";
export { handleSources } from "./sources.js";
export { lotlinkApiRouter } from "./router.js";
