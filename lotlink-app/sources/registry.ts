/**
 * Approved source registry.
 * Only official public / government auction sources are listed.
 * Adapters must respect robots, rate limits, terms, and never bypass access controls.
 */

import type { Source } from "../domain/types.js";

export const SOURCE_REGISTRY: Source[] = [
  {
    id: "gsa-fleet",
    name: "GSA Fleet",
    jurisdiction: "United States",
    auctionType: "Government surplus / fleet vehicles",
    buyerEligibility: "See official terms; registration required for bidding",
    paymentRules: "As published by GSA Fleet / Marketplace",
    pickupRules: "Buyer responsible; location-specific",
    exportRestrictions: "Export controls and destination restrictions may apply; check official notices",
    officialUrl: "https://marketplace.gsafleet.gov/sales/landing",
    accessMethod: "public_web",
    termsNotes: "Official U.S. government fleet surplus. Prefer first-party pages only.",
    robotsNotes: "Respect robots.txt and published rate guidance.",
  },
  {
    id: "govdeals",
    name: "GovDeals",
    jurisdiction: "United States (multiple agencies)",
    auctionType: "Government and public surplus",
    buyerEligibility: "Registration required; eligibility varies by seller",
    paymentRules: "As stated on each listing and platform terms",
    pickupRules: "Typically buyer pickup; storage fees may apply after close",
    exportRestrictions: "Buyer must verify export eligibility",
    officialUrl: "https://www.govdeals.com/",
    accessMethod: "public_web",
    termsNotes: "Public-sector surplus platform. Use only official listing URLs.",
  },
  {
    id: "public-surplus",
    name: "Public Surplus",
    jurisdiction: "United States (public institutions)",
    auctionType: "Public institution surplus",
    buyerEligibility: "Per seller and platform rules",
    paymentRules: "Platform and seller specific",
    pickupRules: "Buyer arranged; deadlines published per lot",
    officialUrl: "https://www.publicsurplus.com/sms/browse/home",
    accessMethod: "public_web",
    termsNotes: "Official public surplus listings only.",
  },
  {
    id: "us-treasury",
    name: "U.S. Treasury Auctions / Forfeited Property",
    jurisdiction: "United States / territories",
    auctionType: "Treasury and forfeited property",
    buyerEligibility: "As published by Treasury",
    paymentRules: "Official Treasury payment instructions",
    pickupRules: "As published per sale",
    officialUrl: "https://home.treasury.gov/services/treasury-auctions",
    accessMethod: "public_web",
    termsNotes: "Use only official Treasury auction information pages.",
  },
];

export function getSourceById(id: string): Source | undefined {
  return SOURCE_REGISTRY.find((s) => s.id === id);
}

export function listApprovedSources(): Source[] {
  return [...SOURCE_REGISTRY];
}
