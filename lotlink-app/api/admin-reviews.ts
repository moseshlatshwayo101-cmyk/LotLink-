/**
 * GET /api/admin/reviews — list pending human-review items (admin only).
 * POST /api/admin/reviews/decide — record human decision (admin only).
 */

import {
  listPendingReviews,
  recordHumanDecision,
  applyVerificationGate,
  getReviewHistory,
} from "../review/human-review.js";
import {
  isAdminAuthorized,
  getAdminToken,
  unauthorizedResponse,
  adminNotConfiguredResponse,
} from "./admin-auth.js";
import { jsonResponse } from "./types.js";

export async function handleAdminListReviews(request: Request): Promise<Response> {
  if (request.method !== "GET") {
    return jsonResponse({ ok: false, error: "Method not allowed" }, 405);
  }
  if (!getAdminToken()) return adminNotConfiguredResponse();
  if (!isAdminAuthorized(request)) return unauthorizedResponse();

  const pending = listPendingReviews().map((item) => ({
    researchRunId: item.researchRun.id,
    requestId: item.researchRun.requestId,
    status: item.researchRun.status,
    startedAt: item.researchRun.startedAt,
    completedAt: item.researchRun.completedAt,
    sourcesChecked: item.researchRun.sourcesChecked,
    planSummary: item.researchRun.planSummary,
    submittedAt: item.submittedAt,
    candidates: item.candidates.map((c) => ({
      id: c.id,
      sourceId: c.sourceId,
      listingId: c.listingId,
      title: c.title,
      price: c.price,
      currency: c.currency,
      closingTime: c.closingTime,
      location: c.location,
      condition: c.condition,
      officialUrl: c.officialUrl,
      evidenceIds: c.evidenceIds,
      confidence: c.confidence,
      status: c.status,
      notes: c.notes,
    })),
    candidateCount: item.candidates.length,
    /** Reviewer must explicitly consider these */
    reviewChecklist: {
      evidence: "Inspect all evidence IDs and official URLs",
      conflicts: "Note any conflicting claims across sources",
      missingInformation: "List gaps that block verification",
      risks: "Export, eligibility, logistics, payment separation",
      assumptions: "Any inference still present must stay marked as such",
    },
  }));

  const history = getReviewHistory().slice(-20).reverse();

  return jsonResponse({
    ok: true,
    data: {
      pendingCount: pending.length,
      pending,
      recentDecisions: history,
    },
  });
}

export async function handleAdminDecide(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return jsonResponse({ ok: false, error: "Method not allowed" }, 405);
  }
  if (!getAdminToken()) return adminNotConfiguredResponse();
  if (!isAdminAuthorized(request)) return unauthorizedResponse();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ ok: false, error: "Invalid JSON" }, 400);
  }

  const b = body as Record<string, unknown>;
  const researchRunId = typeof b.researchRunId === "string" ? b.researchRunId : "";
  const decision = b.decision;
  const notes = typeof b.notes === "string" ? b.notes.trim() : "";
  const candidateIds = Array.isArray(b.candidateIds)
    ? b.candidateIds.filter((id): id is string => typeof id === "string")
    : [];
  const reviewerId = typeof b.reviewerId === "string" ? b.reviewerId : undefined;

  const allowed = ["APPROVE", "REJECT", "EDIT", "REQUEST_MORE_RESEARCH"] as const;
  if (!researchRunId || !allowed.includes(decision as (typeof allowed)[number])) {
    return jsonResponse(
      {
        ok: false,
        error: "Validation failed",
        details: ["researchRunId and decision (APPROVE|REJECT|EDIT|REQUEST_MORE_RESEARCH) are required"],
      },
      400
    );
  }
  if (!notes) {
    return jsonResponse({ ok: false, error: "notes are required for an audit trail" }, 400);
  }

  const pending = listPendingReviews().find((p) => p.researchRun.id === researchRunId);
  if (!pending && decision !== "REQUEST_MORE_RESEARCH") {
    // Still allow recording decision if run already left queue
  }

  const review = recordHumanDecision({
    researchRunId,
    candidateIds,
    decision: decision as "APPROVE" | "REJECT" | "EDIT" | "REQUEST_MORE_RESEARCH",
    notes,
    reviewerId,
    conflicts: Array.isArray(b.conflicts)
      ? b.conflicts.filter((x): x is string => typeof x === "string")
      : undefined,
    missingInformation: Array.isArray(b.missingInformation)
      ? b.missingInformation.filter((x): x is string => typeof x === "string")
      : undefined,
    risks: Array.isArray(b.risks) ? b.risks.filter((x): x is string => typeof x === "string") : undefined,
    assumptions: Array.isArray(b.assumptions)
      ? b.assumptions.filter((x): x is string => typeof x === "string")
      : undefined,
  });

  let verifiedCandidates = pending?.candidates ?? [];
  if (pending && (decision === "APPROVE" || decision === "REJECT")) {
    verifiedCandidates = applyVerificationGate(pending.candidates, review);
  }

  const verifiedCount = verifiedCandidates.filter((c) => c.status === "LOTLINK_VERIFIED").length;

  return jsonResponse({
    ok: true,
    data: {
      review,
      verifiedCount,
      message:
        decision === "APPROVE"
          ? verifiedCount > 0
            ? `${verifiedCount} candidate(s) marked LOTLINK_VERIFIED by human decision.`
            : "APPROVE recorded but no candidate IDs were selected for verification."
          : `Decision ${decision} recorded. No automatic verification applied.`,
    },
  });
}
