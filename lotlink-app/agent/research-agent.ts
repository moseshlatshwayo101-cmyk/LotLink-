/**
 * Server-side LotLink research agent orchestrator.
 * Produces a plan and queues for human review.
 * Does not scrape or invent candidates in this scaffold.
 */

import { randomUUID } from "node:crypto";
import type { ResearchRun, SourcingRequest, CandidateLot } from "../domain/types.js";
import { normalizeResearchRequest, type RawResearchInput } from "./normalize.js";
import { createResearchPlan } from "./research-plan.js";
import { submitForHumanReview } from "../review/human-review.js";
import { listApprovedSources } from "../sources/registry.js";

export interface AgentResult {
  ok: true;
  request: SourcingRequest;
  researchRun: ResearchRun;
  plan: ReturnType<typeof createResearchPlan>;
  candidates: CandidateLot[];
  message: string;
}

export interface AgentError {
  ok: false;
  errors: string[];
}

/**
 * Entry point for a research request.
 * At scaffold stage: validates, plans, and immediately queues an empty candidate set
 * for human review with an explicit note that no live source search has run yet.
 * Real source adapters will be added later and must only return evidence-backed lots.
 */
export function runResearchAgent(raw: RawResearchInput): AgentResult | AgentError {
  const normalized = normalizeResearchRequest(raw);
  if (!normalized.ok) return normalized;

  const request = normalized.request;
  const plan = createResearchPlan(request);

  const researchRun: ResearchRun = {
    id: randomUUID(),
    requestId: request.id,
    startedAt: new Date().toISOString(),
    sourcesChecked: listApprovedSources().map((s) => s.id),
    planSummary: plan.steps.join(" → "),
    status: "RESEARCHING",
  };

  // Scaffold: no live candidates. Explicitly state none were verified.
  const candidates: CandidateLot[] = [];

  researchRun.completedAt = new Date().toISOString();
  researchRun.status = "HUMAN_REVIEW";

  submitForHumanReview(researchRun, candidates);

  return {
    ok: true,
    request,
    researchRun,
    plan,
    candidates,
    message:
      "Research plan created and queued for human review. " +
      "No live source adapters have returned candidates yet. " +
      "No opportunities are verified.",
  };
}
