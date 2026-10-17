/**
 * Human-review queue and gate.
 * Only a human can produce LotLink Verified status.
 */

import { randomUUID } from "node:crypto";
import type {
  CandidateLot,
  HumanReview,
  ResearchRun,
  ResearchStatus,
  CandidateStatus,
} from "../domain/types.js";

export interface ReviewQueueItem {
  researchRun: ResearchRun;
  candidates: CandidateLot[];
  submittedAt: string;
}

/** In-memory queue for scaffolding. Replace with durable store later. */
const queue: ReviewQueueItem[] = [];
const reviews: HumanReview[] = [];

export function submitForHumanReview(
  researchRun: ResearchRun,
  candidates: CandidateLot[]
): ReviewQueueItem {
  const item: ReviewQueueItem = {
    researchRun: { ...researchRun, status: "HUMAN_REVIEW" },
    candidates: candidates.map((c) => ({
      ...c,
      status: "NEEDS_HUMAN_REVIEW" as CandidateStatus,
    })),
    submittedAt: new Date().toISOString(),
  };
  queue.push(item);
  return item;
}

export function listPendingReviews(): ReviewQueueItem[] {
  return [...queue];
}

export function recordHumanDecision(params: {
  researchRunId: string;
  candidateIds: string[];
  decision: HumanReview["decision"];
  notes: string;
  reviewerId?: string;
  conflicts?: string[];
  missingInformation?: string[];
  risks?: string[];
  assumptions?: string[];
}): HumanReview {
  const review: HumanReview = {
    id: randomUUID(),
    researchRunId: params.researchRunId,
    candidateIds: params.candidateIds,
    reviewerId: params.reviewerId,
    decision: params.decision,
    notes: params.notes,
    conflicts: params.conflicts,
    missingInformation: params.missingInformation,
    risks: params.risks,
    assumptions: params.assumptions,
    reviewedAt: new Date().toISOString(),
  };
  reviews.push(review);

  // Remove from pending queue when decision is final
  if (params.decision === "APPROVE" || params.decision === "REJECT") {
    const idx = queue.findIndex((q) => q.researchRun.id === params.researchRunId);
    if (idx >= 0) queue.splice(idx, 1);
  }

  return review;
}

/**
 * Only after an APPROVE decision may candidates be marked LOTLINK_VERIFIED.
 * This function is the single gate.
 */
export function applyVerificationGate(
  candidates: CandidateLot[],
  review: HumanReview
): CandidateLot[] {
  if (review.decision !== "APPROVE") {
    return candidates.map((c) => ({
      ...c,
      status: "REJECTED" as CandidateStatus,
    }));
  }

  const approvedIds = new Set(review.candidateIds);
  return candidates.map((c) => {
    if (approvedIds.has(c.id)) {
      return { ...c, status: "LOTLINK_VERIFIED" as CandidateStatus };
    }
    return { ...c, status: "REJECTED" as CandidateStatus };
  });
}

export function getReviewHistory(): HumanReview[] {
  return [...reviews];
}
