# LotLink Admin Review UI

Server-protected human review interface.

## Protection

- All `/api/admin/*` routes require a valid `ADMIN_TOKEN`.
- Pass the token via header `X-LotLink-Admin-Token` or `Authorization: Bearer <token>`.
- The browser UI stores the token only in `sessionStorage` for the current tab session.
- If `ADMIN_TOKEN` is unset or shorter than 16 characters, admin routes return 503 (fail closed).
- The token value is never included in API responses.

## Setup

1. In Vercel (Production and Preview), set environment variable:
   - `ADMIN_TOKEN` = a long random secret (≥ 16 characters)
2. Serve `ui/admin/index.html` as a static page (or behind the same origin as the API).
3. Open the page, paste the token, load the queue.

## Reviewer actions

| Decision | Effect |
|----------|--------|
| APPROVE | Selected candidate IDs may become `LOTLINK_VERIFIED` (only path to verification) |
| REJECT | Candidates marked rejected; run leaves pending queue |
| REQUEST_MORE_RESEARCH | Decision recorded; further research can be triggered later |
| EDIT | Recorded for audit; does not auto-verify |

Notes are mandatory for the audit trail.

## Checklist shown to reviewer

- Evidence and official URLs
- Conflicts across sources
- Missing information
- Risks (export, eligibility, logistics, payment separation)
- Assumptions (inferences must remain labelled)
