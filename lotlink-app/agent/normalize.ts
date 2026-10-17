/**
 * Request normalizer for LotLink research agent.
 * Required: asset, budget, currency, destination.
 */

import type { SourcingRequest } from "../domain/types.js";
import { randomUUID } from "node:crypto";

export interface RawResearchInput {
  asset?: unknown;
  budget?: unknown;
  currency?: unknown;
  destination?: unknown;
  city?: unknown;
  quantity?: unknown;
  condition?: unknown;
  make?: unknown;
  model?: unknown;
  year?: unknown;
  deadline?: unknown;
  intendedUse?: unknown;
  constraints?: unknown;
  customerId?: unknown;
}

export interface NormalizeResult {
  ok: true;
  request: SourcingRequest;
}

export interface NormalizeError {
  ok: false;
  errors: string[];
}

function asString(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim().length > 0) return value.trim();
  return undefined;
}

function asNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

export function normalizeResearchRequest(input: RawResearchInput): NormalizeResult | NormalizeError {
  const errors: string[] = [];

  const asset = asString(input.asset);
  if (!asset) errors.push("asset is required");

  const budget = asNumber(input.budget);
  if (budget === undefined || budget <= 0) errors.push("budget must be a positive number");

  const currency = asString(input.currency)?.toUpperCase();
  if (!currency || currency.length !== 3) errors.push("currency must be a 3-letter ISO 4217 code");

  const destination = asString(input.destination);
  if (!destination) errors.push("destination is required");

  if (errors.length > 0) return { ok: false, errors };

  const now = new Date().toISOString();

  const request: SourcingRequest = {
    id: randomUUID(),
    customerId: asString(input.customerId),
    asset: asset!,
    budget: budget!,
    currency: currency!,
    destination: destination!,
    city: asString(input.city),
    quantity: asNumber(input.quantity),
    condition: asString(input.condition),
    make: asString(input.make),
    model: asString(input.model),
    year: asNumber(input.year),
    deadline: asString(input.deadline),
    intendedUse: asString(input.intendedUse),
    constraints: Array.isArray(input.constraints)
      ? input.constraints.filter((c): c is string => typeof c === "string")
      : undefined,
    createdAt: now,
    status: "NEW",
  };

  return { ok: true, request };
}
