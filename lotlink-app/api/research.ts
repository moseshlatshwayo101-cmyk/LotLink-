/**
 * POST /api/research
 * Accepts a sourcing request, runs the agent + available adapters,
 * and queues results for human review.
 */

import { randomUUID } from "node:crypto";
import type { CandidateLot, Evidence, ResearchRun } from "../domain/types.js";
import { normalizeResearchRequest } from "../agent/normalize.js";
import { createResearchPlan } from "../agent/research-plan.js";
import { submitForHumanReview } from "../review/human-review.js";
import { listAdapters } from "../sources/adapters/index.js";
import { jsonResponse, type ApiResponse } from "./types.js";

const MAX_BODY_BYTES = 32_768;

export async function handleResearch(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return jsonResponse({ ok: false, error: "Method not allowed" }, 405);
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return jsonResponse({ ok: false, error: "Content-Type must be application/json" }, 415);
  }

  let rawText: string;
  try {
    rawText = await request.text();
  } catch {
    return jsonResponse({ ok: false, error: "Unable to read body" }, 400);
  }
  if (rawText.length > MAX_BODY_BYTES) {
    return jsonResponse({ ok: false, error: "Request body too large" }, 413);
  }

  let body: unknown;
  try {
    body = JSON.parse(rawText);
  } catch {
    return jsonResponse({ ok: false, error: "Invalid JSON" }, 400);
  }

  const normalized = normalizeResearchRequest(body as Record<string, unknown>);
  if (!normalized.ok) {
    return jsonResponse(
      { ok: false, error: "Validation failed", details: normalized.errors },
      400
    );
  }

  const sourcingRequest = normalized.request;
  const plan = createResearchPlan(sourcingRequest);

  const researchRun: ResearchRun = {
    id: randomUUID(),
    requestId: sourcingRequest.id,
    startedAt: new Date().toISOString(),
    sourcesChecked: [],
    planSummary: plan.steps.join(" → "),
    status: "RESEARCHING",
  };

  const allCandidates: CandidateLot[] = [];
  const allEvidence: Evidence[] = [];
  const adapterNotes: string[] = [];

  const adapters = listAdapters();
  for (const adapter of adapters) {
    try {
      const result = await adapter.search(
        {
          asset: sourcingRequest.asset,
          budget: sourcingRequest.budget,
          currency: sourcingRequest.currency,
          destination: sourcingRequest.destination,
          make: sourcingRequest.make,
          model: sourcingRequest.model,
          year: sourcingRequest.year,
          condition: sourcingRequest.condition,
        },
        researchRun.id
      );
      researchRun.sourcesChecked.push(result.sourceId);
      allCandidates.push(...result.candidates);
      allEvidence.push(...result.evidence);
      adapterNotes.push(...result.notes.map((n) => `[${result.sourceId}] ${n}`));
    } catch (e) {
      adapterNotes.push(
        `[${adapter.source.id}] adapter error: ${e instanceof Error ? e.message : String(e)}`
      );
    }
  }

  researchRun.completedAt = new Date().toISOString();
  researchRun.status = "HUMAN_REVIEW";

  submitForHumanReview(researchRun, allCandidates);

  const responseBody: ApiResponse<{
    requestId: string;
    researchRunId: string;
    status: string;
    sourcesChecked: string[];
    candidateCount: number;
    evidenceCount: number;
    plan: typeof plan;
    notes: string[];
    message: string;
  }> = {
    ok: true,
    data: {
      requestId: sourcingRequest.id,
      researchRunId: researchRun.id,
      status: researchRun.status,
      sourcesChecked: researchRun.sourcesChecked,
      candidateCount: allCandidates.length,
      evidenceCount: allEvidence.length,
      plan,
      notes: adapterNotes,
      message:
        allCandidates.length === 0
          ? "No evidence-backed candidates were returned by current adapters. Nothing is LotLink Verified. Queued for human review."
          : "Candidates collected and queued for human review. Nothing is LotLink Verified until a human approves.",
    },
  };

  return jsonResponse(responseBody, 200);
}
