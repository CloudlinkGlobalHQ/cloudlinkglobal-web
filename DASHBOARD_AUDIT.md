# Dashboard audit (Phase 1, report only)

Date: 2026-10-25. Branch: `dashboard-audit`. No application code changed.

## Method

- Backend reference: `CloudlinkGlobalHQ/cloudlink-agents` @ `c4f53bd` (`api/app.py`, read-only).
- Built a production bundle (`next build` + `next start`) in a scratch copy with `@clerk/nextjs` aliased to a local stub (no Clerk keys were available), and mocked the backend with Playwright `page.route()` using responses shaped like `api/app.py`.
- States per route: success, empty (new tenant), 401, 403, 404, 500, 20 s delay, never-responding. Desktop 1440 px for all states; mobile 390 px for the empty state.
- Also clicked every enabled button in `<main>` on every route (112 buttons) with success data, with approve/retry/run_once/autostop/ttl-evaluate returning the backend's read-only 403.
- **Not verified:** the API URL in the production bundle, and live backend responses. This session's network policy blocks both `cloudlinkglobal.com` and `cloudlink-agents.onrender.com`. Self-serve API key storage and team invites live in `cloudlink-core`, which was not available.

Screenshots of every route in the empty state: `docs/dashboard-audit/before/desktop-1440/` and `docs/dashboard-audit/before/mobile-390/`. `dashboard--e500.jpg` shows Overview on a 500.

## Top issues by severity

### Critical

1. **No auth token on the first requests of every full page load.** `ClerkApiProvider` sets the token getter in a `useEffect`, and React runs child effects before parent effects. On a hard load every page's first requests are therefore sent with `Authorization: ""`, and the backend's `_require_tenant` returns 401. Client-side navigation afterwards is fine. Confirmed in the harness: on hard load all 6 Overview calls had an empty header; after clicking "Scans", `/scans` had the token.
2. **Overview almost always shows "Welcome to Cloudlink / Connect your AWS account".** It reads `total_cost`, `by_service`, `daily_costs` and `open_issues`, which the backend never returns (`/cost-summary` returns `total_mtd_usd` and `top_services`). Even with scanned data it shows "Total cloud spend $0.00". Every 401/403/404/500 also falls through to the onboarding screen. Cost Explorer has the same field-name mismatch ("$0.00", "Top service: Unknown"), and every error there shows "No cost data yet – Connect AWS".
3. **Stuck loading forever.** `request()` has no timeout. With a never-responding backend, 22 of 31 routes keep a skeleton, spinner or "Loading…" indefinitely (see table). With a 20 s delay they recover at about 22 s, with no indication that the backend may be waking up.

### High

4. **Silent `catch {}` blocks make errors look like "no data yet".** Affected: `app/dashboard/page.tsx` (`getStats`), layout `refreshStats`, Regressions, Budgets, Deploys, Cost Explorer, Autostop, TTL, Virtual Tags and API Keys. Other pages print the raw backend `detail` above an empty-state message ("Internal Server Error … No credentials yet"), with no Retry.
5. **Kubernetes, Savings Plans, Virtual Tags and TTL never send the token.** They use their own `fetch` without `Authorization`, so they would always get 401 in production. Kubernetes shows the raw JSON `{"detail":...}`.
6. **Backend data gaps** (all confirmed in `cloudlink-agents`):
   - Scans call `store.ingest_event()` directly, not `EventIngestor`, so the `hourly_snapshots` from the cost scan are never saved. As a result regressions, budgets (current spend), forecast, savings report, unit economics, savings plans, virtual tags and cost estimate are always empty or $0 for real tenants.
   - Drift checks call `boto3.client(...)` with the backend's own credentials, not the customer's assumed role.
   - `/savings-report` estimates "$5 per completed action". That figure is invented.
   - The GitHub webhook writes deploys to a synthetic tenant `gh_<repo>`.
   - `/api-keys` guards storage with `hasattr(...)`, so a key can be returned but never saved (unverified; the store is in `cloudlink-core`).
7. **Read-only dead ends.**
   - Autostop "Run now" gets a 403 and the button turns into "Error" with no message.
   - Approve shows the 403 text in a browser `alert()`.
   - Reject is **not** guarded by read-only mode in the backend and silently marks the action FAILED.
   - Overview's regression row "Fix/View" button has no handler.

### Medium

8. **AWS-only violations.** The header has an AWS/Azure/GCP switcher with `?cloud=` handling. The Resources page has provider pills. The Settings card says "Connect AWS, Azure, or GCP". The API docs list GCP/Azure ingest examples.
9. **Header controls** (see table below).
10. **Honesty and branding.**
    - The "Free Plan" badge is hard-coded.
    - Overview shows "Cloudlink fee 15%" and "Net savings", and Billing says "Performance billing — 15%", while the fall 2026 pilot is free (`/pilot`, `/pricing`).
    - The onboarding screen promises "AutoStop idle environments" and "deploy-linked regressions".
    - The sidebar uses the lucide `Zap` icon instead of `/logo-mark.png`.
11. **Wasted polling.** The layout and `app/dashboard/page.tsx` each poll `/stats` every 15 s, and both discard the result (Overview ignores its `stats` prop).
12. **12 orphan routes** with no link anywhere: actions, api-docs, autostop, cost-estimate, drift, forecast, kubernetes, runs, savings-report, tags, ttl, virtual-tags.

### Low

- Icon-only buttons have no `aria-label`: the mobile hamburger, the desktop collapse button and the mobile drawer close X.
- No route overflows sideways at 390 px in the empty state (`scrollWidth` = 390 everywhere).
- Forecast logged `<path> attribute d: Expected number, "M 0 NaN"` with a one-point history mock. This may be specific to the mock.

## Route table

Endpoint check: all 87 calls in `app/lib/api.ts`, plus the direct `fetch` calls, map to a route that exists in `api/app.py`.

"RO 403" means the backend blocks the call when `CLOUDLINK_READ_ONLY` is on. "Data in prod" is what a real tenant gets given the backend gaps above.

Column key for the result columns:
- **Success**: success-shaped data.
- **Empty**: new tenant.
- **Error**: 401, 403, 404 and 500, which behaved the same.
- **Slow / hang**: 20 s delay / never responds.

| Route | Sidebar | Purpose | API calls | RO 403 | Data in prod | Success | Empty | Error | Slow / hang | Verdict | Proposed fix |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `/dashboard` | yes | Overview | stats, cost-summary, savings-report, regressions, autostop/events, autostop/savings | – | cost-summary yes; rest empty | **$0.00 spend** (field mismatch) | onboarding | **onboarding (error hidden)** | 22 s / **skeleton forever** | Fix | Read `total_mtd_usd`/`top_services`, show findings with $/mo, drop fee and autostop cards, real error state |
| cost-explorer | yes | MTD spend by service | cost-summary, stats, cost-snapshots, cost-snapshots/services | – | MTD + top services yes; daily chart no | **$0.00, top service "Unknown"** | "No cost data yet" | **"No cost data – connect AWS"** | 23 s / skeleton forever | Fix | Use `total_mtd_usd`/`top_services`; daily chart "Coming soon" |
| regressions | yes | Deploy-linked cost spikes | regressions, regression/run, deploy-risk, autofix | – | always empty (no snapshots) | list | "No regressions" | **looks empty (catch {})** | 23 s / skeleton forever | Coming soon | Label honestly; keep route |
| resources | yes | Scanned resources and issues | resources | – | yes | list | empty msg | raw detail + empty msg | 23 s / skeleton forever | Fix | Shared states; remove Azure/GCP pills |
| advisor | yes | AI chat over account data | `/api/advisor` (Next route → backend) | – | needs `ANTHROPIC_API_KEY` | idle chat | same | not tested (needs key) | n/a | Fix (unverified) | Error message on failure; founder to confirm key |
| budgets | yes | Spend limits | budgets, budgets/alerts, cost-snapshots/services | – | spend always $0 (no snapshots) | list | "No budgets yet" | **looks empty** | 23 s / **"Loading budgets…" forever** | Coming soon | Label: needs cost history |
| rightsizing | yes | EC2 downsizing from avg CPU | rightsizing | – | yes (scan CPU data) | list | zero-state | raw detail, no retry; 404 bare "Not Found" | 24 s / skeleton forever | Fix | Shared states |
| reserved-instances | yes | RI estimates from EC2 types | ri-recommendations | – | yes (approx. pricing) | list | zero-state | "Failed to load" + Retry | 24 s / skeleton forever | Fix | Shared states |
| savings-plans | yes | SP analyzer | savings-plans/analyze (no auth header) | – | 401 / 422 "No daily cost data" | form | form | n/a until click | n/a | Hide | – |
| unit-economics | yes | Cost per service/action | unit-economics | – | $0 (snapshots, actions) | data | zeros | "Failed to load" + Retry | 22 s / skeleton forever | Hide | – |
| deploys | yes | Deploy events | deploys, regression/run | – | empty (API keys broken, GitHub tenant placeholder) | list | "No deploys tracked" | **looks empty** | 23 s / **"Loading…" forever** | Coming soon | Label honestly |
| scans | yes | Scan history + scan now | scans, scan | – | yes | list | "No scans yet" | raw detail + empty msg | 23 s / **"Loading…" forever** | Fix | Shared states, scan progress |
| audit | yes (and bell) | Executed actions log | audit | – | always empty in read-only | empty msg | empty msg | raw detail + empty msg | 22 s / **"Loading…" forever** | Coming soon | Say read-only mode executes nothing |
| webhooks | yes | Webhooks + Slack | webhooks, settings/slack, webhooks/test | – | yes | form | form | "Error loading Slack settings: …" | 23 s / **"Loading…" forever** | Fix | Shared states |
| team | yes | Team members | team/members | – | stored; access grant unverified | list | "No team members yet" | raw detail | 22 s / skeleton forever | Fix (unverified) | Shared states; founder to confirm invites grant access |
| api-keys | yes | Self-serve API keys | api-keys | – | **broken** (earlier review) | example + list | same | **error hidden** | **spinner forever** | Hide | – |
| billing | yes | Plan and savings fee | `/api/savings/*`, `/api/stripe/*` | – | n/a | "15% performance billing" | same | savings cards silently vanish | page renders | Fix | "Free during the fall 2026 pilot" copy only; do not touch Stripe code |
| settings | yes | Links to settings pages | none | – | n/a | links | links | n/a | n/a | Fix | Remove "Azure, or GCP" |
| credentials | yes | Connect AWS role | credentials, credentials/verify, scan | – | yes | list | "No credentials yet" | raw detail + "No credentials yet" | 22 s / **"Loading…" forever** | Fix | Shared states |
| actions | no | Approve/reject AI actions | actions, approve, reject, retry, approval-policies | **approve, retry** | approve impossible | list | empty | raw detail | 22 s / **"Loading…" forever** | Hide | – |
| api-docs | no | Static API docs | none | – | n/a | static | static | n/a | n/a | Hide | Mentions GCP/Azure/K8s |
| autostop | no | Auto-stop rules | autostop/*, resources | **run, stop, start** | never runs | zeros | zeros | **looks empty** | 22 s / skeleton forever | Hide | – |
| cost-estimate | no | Pre-deploy estimate | cost-snapshots/services, cost-estimate | – | no history | form | form | form | n/a | Hide | – |
| drift | no | Drift baselines | drift/* | – | backend uses wrong creds | zeros | zeros | raw detail | 22 s / **"Loading…" forever** | Hide | – |
| forecast | no | Spend forecast | cost-forecast | – | "Need 3 days of data" forever | chart | message | detail + Retry | 23 s / skeleton forever | Hide | – |
| kubernetes | no | K8s costs | k8s/* (no auth header) | – | 401 always | zeros | zeros | raw JSON | 23 s / skeleton forever | Hide | – |
| runs | no | Executor run history | runs | – | empty in read-only | list | "No runs yet" | raw detail | 24 s / **"Loading…" forever** | Hide | – |
| savings-report | no | Monthly report | savings-report | – | $0; "$5/action" invented | data | zeros | bare detail; 404 shows only "Not Found" | 23 s / skeleton forever | Hide | – |
| tags | no | Cost by tag | tag-costs | – | $0 per tag (no per-resource cost) | data | empty | raw detail | 22 s / skeleton forever | Hide | – |
| ttl | no | Auto-destroy envs | ttl/rules (no auth header) | **evaluate** | 401 always; destructive | empty | empty | **looks empty** | 23 s / **"Loading TTL rules…" forever** | Hide | – |
| virtual-tags | no | Virtual tag allocation | virtual-tags/* (no auth header) | – | 401 always; snapshots | empty | empty | **error hidden** | 22 s / skeleton forever | Hide | – |

## Controls

| Control | Does it work? | Notes |
|---|---|---|
| AWS/Azure/GCP switcher | **No** | Sets `?cloud=` only; no requests, no page reacts except Resources pills. Product is AWS only. |
| Search box | Partly | Navigates to `/dashboard/resources?q=` and filters client-side. Placeholder promises "services, deploys". |
| 7d / 30d / 90d | **No** | Sets `?range=`; nothing reads it. |
| Notifications bell | **Misleading** | Links to Audit; the amber "unread" dot is always shown. |
| Run Scan | Partly | Success shows "N resources found". Queued response and no-credentials response both show "0 resources found". 429 shows "Error: " with no text. A hung request shows "Scanning..." forever (no timeout). |
| User menu | Not tested | Clerk `UserButton` was stubbed. |
| "Free Plan" badge | **Inaccurate** | Hard-coded; pilot is free. |
| Collapse button | Yes | 240 → 64 px; no `aria-label`. |
| Mobile hamburger / close | Yes | No `aria-label`. |
| Settings cards (6) | Yes | All link to real routes; Credentials copy mentions Azure/GCP. |
| Overview "Fix/View" | **Dead** | No handler. |
| Autostop "Run now" | **Dead end** | 403 → "Error", no message. |
| Actions Approve / Reject | Dead end / misleading | Approve: 403 via `alert()`. Reject: succeeds and marks FAILED. |

## Needs the founder

- Check Vercel → Settings → Environment Variables:
  - `NEXT_PUBLIC_API_URL` (must not be `api.cloudlinkglobal.com`, which is NXDOMAIN) and `CLOUDLINK_API_URL`.
  - `ANTHROPIC_API_KEY`, used by AI Advisor.
- Backend work in `cloudlink-agents`:
  - Save `hourly_snapshots` during scans (`_ingest_events`).
  - Fix self-serve API keys.
  - Map GitHub installations to tenants.
  - Use the customer's role for drift checks.
  - Guard `/actions/{id}/reject` in read-only mode.
  - Remove the "$5 per action" estimate.
