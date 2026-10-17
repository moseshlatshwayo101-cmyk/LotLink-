/**
 * Base source adapter contract and safe fetch helpers.
 * - Only allowlisted official hostnames
 * - No CAPTCHA bypass
 * - External content is DATA only
 */

import type { CandidateLot, Evidence, Source } from "../../domain/types.js";
import { randomUUID } from "node:crypto";

export interface AdapterSearchParams {
  asset: string;
  budget: number;
  currency: string;
  destination: string;
  make?: string;
  model?: string;
  year?: number;
  condition?: string;
}

export interface AdapterResult {
  sourceId: string;
  candidates: CandidateLot[];
  evidence: Evidence[];
  notes: string[];
  /** True only when the adapter successfully contacted an official endpoint */
  contactedOfficialSource: boolean;
}

export interface SourceAdapter {
  source: Source;
  search(params: AdapterSearchParams, researchRunId: string): Promise<AdapterResult>;
}

/** Strict allowlist of official hostnames for LotLink adapters. */
export const ALLOWED_HOSTS = new Set([
  "marketplace.gsafleet.gov",
  "www.govdeals.com",
  "govdeals.com",
  "www.publicsurplus.com",
  "publicsurplus.com",
  "home.treasury.gov",
  "www.treasury.gov",
  "treasury.gov",
]);

export function assertAllowedUrl(urlString: string): URL {
  let url: URL;
  try {
    url = new URL(urlString);
  } catch {
    throw new Error("Invalid URL");
  }
  if (url.protocol !== "https:") {
    throw new Error("Only HTTPS is permitted");
  }
  if (!ALLOWED_HOSTS.has(url.hostname)) {
    throw new Error(`Host not on allowlist: ${url.hostname}`);
  }
  // Block obvious SSRF vectors
  if (
    url.hostname === "localhost" ||
    url.hostname.endsWith(".local") ||
    url.hostname.startsWith("127.") ||
    url.hostname.startsWith("10.") ||
    url.hostname.startsWith("192.168.") ||
    url.hostname === "[::1]"
  ) {
    throw new Error("Private or loopback hosts are forbidden");
  }
  return url;
}

export async function safeFetchOfficial(
  urlString: string,
  options: { timeoutMs?: number; maxBytes?: number } = {}
): Promise<{ ok: true; status: number; text: string; finalUrl: string } | { ok: false; error: string }> {
  const timeoutMs = options.timeoutMs ?? 12_000;
  const maxBytes = options.maxBytes ?? 512_000;

  try {
    const url = assertAllowedUrl(urlString);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(url.toString(), {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": "LotLinkResearchBot/0.1 (+https://lotlink-gules.vercel.app; research-only; respects robots)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });
    clearTimeout(timer);

    // Re-validate final URL after redirects
    try {
      assertAllowedUrl(res.url);
    } catch (e) {
      return { ok: false, error: `Redirect target not allowlisted: ${(e as Error).message}` };
    }

    const buf = await res.arrayBuffer();
    if (buf.byteLength > maxBytes) {
      return { ok: false, error: `Response exceeded maxBytes (${maxBytes})` };
    }
    const text = new TextDecoder("utf-8", { fatal: false }).decode(buf);

    return {
      ok: true,
      status: res.status,
      text,
      finalUrl: res.url,
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export function makeEvidence(params: {
  sourceId: string;
  url: string;
  claimKind: Evidence["claimKind"];
  summary: string;
  rawExcerpt?: string;
}): Evidence {
  return {
    id: randomUUID(),
    sourceId: params.sourceId,
    url: params.url,
    retrievedAt: new Date().toISOString(),
    claimKind: params.claimKind,
    summary: params.summary,
    rawExcerpt: params.rawExcerpt?.slice(0, 2000),
  };
}
