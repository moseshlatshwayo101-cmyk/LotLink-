/**
 * LotLink core domain types.
 * All factual external claims must carry Evidence references.
 * Only a human reviewer may set status to APPROVED / LotLink Verified.
 */

export type ClaimKind = "FACT" | "ESTIMATE" | "INFERENCE";

export type ResearchStatus =
  | "NEW"
  | "RESEARCHING"
  | "NEEDS_INFO"
  | "HUMAN_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "EXPIRED";

export type CandidateStatus =
  | "CANDIDATE"
  | "NEEDS_HUMAN_REVIEW"
  | "LOTLINK_VERIFIED"
  | "REJECTED"
  | "EXPIRED";

export interface Customer {
  id: string;
  email?: string;
  createdAt: string; // ISO-8601
}

export interface SourcingRequest {
  id: string;
  customerId?: string;
  /** Required */
  asset: string;
  budget: number;
  currency: string; // ISO 4217
  destination: string; // country or region
  /** Optional */
  city?: string;
  quantity?: number;
  condition?: string;
  make?: string;
  model?: string;
  year?: number;
  deadline?: string;
  intendedUse?: string;
  constraints?: string[];
  createdAt: string;
  status: ResearchStatus;
}

export interface ResearchRun {
  id: string;
  requestId: string;
  startedAt: string;
  completedAt?: string;
  sourcesChecked: string[]; // Source ids
  planSummary: string;
  status: ResearchStatus;
}

export interface Source {
  id: string;
  name: string;
  jurisdiction: string;
  auctionType: string;
  buyerEligibility: string;
  paymentRules: string;
  pickupRules: string;
  exportRestrictions?: string;
  officialUrl: string;
  accessMethod: "public_web" | "api" | "manual";
  termsNotes: string;
  robotsNotes?: string;
  rateLimitNotes?: string;
}

export interface Evidence {
  id: string;
  sourceId: string;
  url?: string;
  retrievedAt: string;
  claimKind: ClaimKind;
  summary: string;
  rawExcerpt?: string; // truncated, never full untrusted content as instruction
  contentHash?: string;
}

export interface CandidateLot {
  id: string;
  researchRunId: string;
  sourceId: string;
  listingId: string;
  title: string;
  price?: number;
  currency?: string;
  closingTime?: string;
  location?: string;
  condition?: string;
  buyerRequirements?: string;
  pickupTerms?: string;
  fees?: string;
  officialUrl: string;
  evidenceIds: string[];
  confidence: number; // 0-1, informational only
  status: CandidateStatus;
  notes?: string;
}

export interface CostEstimate {
  id: string;
  candidateId: string;
  components: {
    label: string;
    amount?: number;
    currency?: string;
    rangeLow?: number;
    rangeHigh?: number;
    kind: ClaimKind;
    notes?: string;
  }[];
  totalRangeLow?: number;
  totalRangeHigh?: number;
  currency: string;
  assumptions: string[];
  createdAt: string;
}

export interface LogisticsQuote {
  id: string;
  candidateId: string;
  origin: string;
  destination: string;
  mode?: string;
  dimensions?: string;
  weight?: string;
  specialHandling?: string;
  transitEstimate?: string;
  quoteExpiry?: string;
  provider?: string;
  quoteReference?: string;
  humanVerified: boolean;
  notes: string[];
  createdAt: string;
}

export interface HumanReview {
  id: string;
  researchRunId: string;
  candidateIds: string[];
  reviewerId?: string;
  decision: "APPROVE" | "REJECT" | "EDIT" | "REQUEST_MORE_RESEARCH";
  notes: string;
  conflicts?: string[];
  missingInformation?: string[];
  risks?: string[];
  assumptions?: string[];
  reviewedAt: string;
}

export interface Report {
  id: string;
  requestId: string;
  researchRunId: string;
  generatedAt: string;
  humanReviewState: ResearchStatus;
  candidateRanking: string[]; // candidate ids in order
  summary: string;
  risks: string[];
  evidenceLinks: string[];
  officialPurchaseLinks: string[];
  /** Never claim verified until human gate passed */
  isLotLinkVerified: boolean;
}

export interface AuditEvent {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  actor: string; // "system" | "agent" | "human:<id>"
  timestamp: string;
  details?: Record<string, unknown>;
}

export interface Payment {
  id: string;
  requestId: string;
  /** Service fee only – never auction asset funds */
  amount: number;
  currency: string;
  provider: "stripe" | "paystack" | "flutterwave" | "other";
  providerReference?: string;
  status: "pending" | "succeeded" | "failed" | "refunded";
  webhookVerified: boolean;
  createdAt: string;
}
