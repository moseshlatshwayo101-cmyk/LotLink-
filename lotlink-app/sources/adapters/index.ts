import type { SourceAdapter } from "./base.js";
import { govDealsAdapter } from "./govdeals.js";
import { gsaFleetAdapter } from "./gsa-fleet.js";
import { publicSurplusAdapter } from "./public-surplus.js";
import { usTreasuryAdapter } from "./us-treasury.js";

const adapters: SourceAdapter[] = [
  govDealsAdapter,
  gsaFleetAdapter,
  publicSurplusAdapter,
  usTreasuryAdapter,
];

export function getAdapter(sourceId: string): SourceAdapter | undefined {
  return adapters.find((a) => a.source.id === sourceId);
}

export function listAdapters(): SourceAdapter[] {
  return [...adapters];
}

export {
  govDealsAdapter,
  gsaFleetAdapter,
  publicSurplusAdapter,
  usTreasuryAdapter,
};
