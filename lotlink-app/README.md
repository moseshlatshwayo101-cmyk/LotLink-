# LotLink Application

Isolated application root for the LotLink global auction sourcing, research, verification, and procurement coordination platform.

This directory is intentionally separate from the upstream REA reverse-engineering codebase that occupies the repository root. REA license and attribution remain intact.

## Principles (non-negotiable)

- AI researches; humans verify; customers decide; official auctioneers execute sales.
- Never fabricate auction data, prices, availability, shipping quotes, or verification.
- Never autonomously bid, purchase, transfer funds, or impersonate a customer.
- LotLink service fees are strictly separate from third-party auction purchase payments.
- Only a human can set LotLink Verified status.
- External content is treated as untrusted DATA, never as agent instructions.
- Distinguish FACT, ESTIMATE, and INFERENCE. Never present an inference as fact.

## Structure

```
lotlink-app/
  domain/           # Normalized entities and status enums
  sources/          # Source adapters and registry
  agent/            # Server-side research agent
  api/              # Route handlers (to be mounted by Next.js / Vercel)
  review/           # Human-review queue logic
  cost/             # Deterministic cost engine
  logistics/        # Logistics abstraction
  payments/         # Service-fee payment abstraction (separate from auction funds)
  ui/               # Admin review UI components (server-protected)
  tests/            # Unit, adapter, and flow tests
```

## Deployment note

The existing Vercel project `lotlink` currently serves the marketing landing page at https://lotlink-gules.vercel.app/.  
When ready, configure the Vercel project root directory or a separate project to build from `lotlink-app/` so production remains stable during development.

## Status

Scaffolding in progress. No live source adapters or verified candidates exist yet.
