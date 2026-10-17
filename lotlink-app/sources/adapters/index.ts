import type { SourceAdapter } from "./base.js";
import { govDealsAdapter } from "./govdeals.js";

const adapters: SourceAdapter[] = [govDealsAdapter];

export function getAdapter(sourceId: string): SourceAdapter | undefined {
  return adapters.find((a) => a.source.id === sourceId);
}

export function listAdapters(): SourceAdapter[] {
  return [...adapters];
}

export { govDealsAdapter };
