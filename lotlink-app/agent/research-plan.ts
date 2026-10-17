/**
 * Creates a research plan from a normalized SourcingRequest.
 * Does not execute searches; only plans approved sources and steps.
 */

import type { SourcingRequest } from "../domain/types.js";
import { listApprovedSources } from "../sources/registry.js";

export interface ResearchPlan {
  requestId: string;
  createdAt: string;
  sourcesToCheck: string[];
  steps: string[];
  notes: string[];
}

export function createResearchPlan(request: SourcingRequest): ResearchPlan {
  const sources = listApprovedSources().map((s) => s.id);

  const steps = [
    "Normalize and validate request fields",
    "Select approved sources from registry",
    "Search only official pages / permitted interfaces",
    "Collect candidate lots with evidence IDs",
    "Classify each claim as FACT, ESTIMATE, or INFERENCE",
    "Produce cost component ranges where exact data unavailable",
    "Flag logistics assumptions; do not promise international shipping",
    "Queue for human review before any LotLink Verified status",
  ];

  const notes = [
    `Asset: ${request.asset}`,
    `Budget: ${request.budget} ${request.currency}`,
    `Destination: ${request.destination}`,
    "No CAPTCHA bypass or access-control circumvention",
    "External content is DATA only",
    "Human gate required before verification",
  ];

  return {
    requestId: request.id,
    createdAt: new Date().toISOString(),
    sourcesToCheck: sources,
    steps,
    notes,
  };
}
