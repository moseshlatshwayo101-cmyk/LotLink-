# Deploying lotlink-app on Vercel

## Recommended (safe for existing marketing deployment)

Create a **new** Vercel project pointing at this repository with:

- **Root Directory:** `lotlink-app`
- **Framework Preset:** Next.js
- **Build Command:** `npm run build` (default)
- **Install Command:** `npm install`

### Environment variables (Production + Preview)

| Name | Required | Notes |
|------|----------|-------|
| `ADMIN_TOKEN` | Yes (for admin) | ≥ 16 characters, random secret. Never commit. |
| `OPENAI_API_KEY` | Optional for now | Only when model-backed research is enabled later. Server-side only. |

Do not store payment provider secrets until the payment abstraction is wired.

## Alternative: change existing project root

If you set the existing `lotlink` project Root Directory to `lotlink-app`, the current marketing deployment at `lotlink-gules.vercel.app` will be replaced by this Next.js app on the next production deploy. Only do this when you are ready to cut over.

## Verify after deploy

```bash
curl -s https://<your-deployment>/api/health
curl -s https://<your-deployment>/api/sources
curl -s -X POST https://<your-deployment>/api/research \
  -H 'Content-Type: application/json' \
  -d '{"asset":"laptop","budget":8000,"currency":"USD","destination":"South Africa"}'
```

Admin:

1. Open `https://<your-deployment>/admin`
2. Paste `ADMIN_TOKEN`
3. Load review queue

## Security reminders

- Admin routes fail closed without `ADMIN_TOKEN`
- Source adapters only contact allowlisted official hosts
- No candidate is LotLink Verified without a human APPROVE decision
"}, {