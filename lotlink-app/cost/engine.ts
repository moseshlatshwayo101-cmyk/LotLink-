/**
 * Deterministic cost engine.
 * Never fabricates a quote. Uses ranges when exact costs are unavailable.
 */

import { randomUUID } from "node:crypto";
import type { CandidateLot, CostEstimate, ClaimKind } from "../domain/types.js";

export interface CostInput {
  candidate: CandidateLot;
  destinationCountry: string;
  serviceFeeAmount?: number;
  serviceFeeCurrency?: string;
}

export function buildCostEstimate(input: CostInput): CostEstimate {
  const { candidate, destinationCountry, serviceFeeAmount, serviceFeeCurrency } = input;
  const currency = candidate.currency ?? "USD";
  const components: CostEstimate["components"] = [];

  // Bid / current price
  if (typeof candidate.price === "number") {
    components.push({
      label: "Current bid / price",
      amount: candidate.price,
      currency,
      kind: "FACT",
      notes: "Taken from listing evidence; subject to change until close",
    });
  } else {
    components.push({
      label: "Current bid / price",
      kind: "INFERENCE",
      notes: "Price not available from evidence; human must confirm on official page",
    });
  }

  // Buyer premium – typically percentage; unknown without source rules → range placeholder
  components.push({
    label: "Buyer premium",
    kind: "ESTIMATE",
    rangeLow: 0,
    rangeHigh: undefined,
    notes: "Exact premium depends on source and lot; verify on official terms",
  });

  // Taxes, documentation, storage, pickup – unknown without specific data
  const unknownLogisticsLabels = [
    "Taxes / VAT",
    "Documentation fees",
    "Storage fees",
    "Pickup / domestic transport",
    "Export logistics / freight",
    "Insurance",
    "Duties / brokerage / port fees",
    "Handling",
    "Currency conversion buffer",
  ];

  for (const label of unknownLogisticsLabels) {
    components.push({
      label,
      kind: "ESTIMATE",
      notes: `Not determined from available evidence for destination ${destinationCountry}. Obtain quote from licensed provider.`,
    });
  }

  // LotLink service fee (separate from auction funds)
  if (typeof serviceFeeAmount === "number" && serviceFeeAmount > 0) {
    components.push({
      label: "LotLink research / service fee",
      amount: serviceFeeAmount,
      currency: serviceFeeCurrency ?? currency,
      kind: "FACT",
      notes: "Charged by LotLink for research and verification service only. Does not include auction purchase funds.",
    });
  }

  return {
    id: randomUUID(),
    candidateId: candidate.id,
    components,
    currency,
    assumptions: [
      "No fabricated shipping or duty amounts",
      "International shipping is not promised solely because origin is USA",
      "All estimates require human and provider confirmation",
    ],
    createdAt: new Date().toISOString(),
  };
}
