# CloudLens — Cloud Cost Intelligence Platform

**Built for:** 22North Product Engineering Challenge 2026 — Challenge 5 (Cloud Cost Intelligence)
**Team size:** 2
**Stack:** PERN (PostgreSQL, Express, React, Node) + TypeScript
**Deadline:** Fri, 03-Jul-2026, 12:00 IST

> This document is the single source of truth for building this project end-to-end. Follow it in order: schema → API → recommendation engine → frontend. Do not add features outside the "Must have" scope until everything in scope is working and polished.

---

## 1. Problem statement (from the brief)

A rapidly growing SaaS company has no visibility into cloud utilisation or optimisation opportunities. We need a platform that analyses infrastructure usage and recommends actionable savings.

**Constraints given by the challenge:**
- 48-hour build window
- Sample/synthetic datasets may be assumed — no live AWS integration
- Focus on actionable insights over feature completeness

**What judges score (from the brief's evaluation criteria):** Working product/UX (30%), Innovation & product thinking (20%), Solution design & NFRs (15%), Business understanding (15%), Engineering quality (10%), Presentation (10%). **Translation: a small, polished, well-explained product beats a large half-finished one.**

---

## 2. Scope (MoSCoW)

**Must have (this is the demo):**
- Synthetic AWS-style cost & usage dataset, seeded into Postgres
- Cost overview dashboard: total spend, trend over time, breakdown by service/team
- Rules-based recommendation engine surfacing concrete savings opportunities with a dollar amount and a plain-English reason
- Recommendations list — sortable by impact, filterable by type, with Apply/Dismiss actions (simulated)
- Resource explorer — searchable table of resources with utilisation + cost + linked recommendations
- Team leaderboard — spend & efficiency by team (chargeback framing)

**Should have (do these once Must-have is demo-ready):**
- Resource detail view with a utilisation chart
- "Potential savings" headline stat as the dashboard's signature visual
- Cost trend filters (by service / by team / by date range)

**Could have (only if time remains):**
- Claude-powered natural-language monthly cost narrative ("what changed and why") — this is the AI tool to disclose in submission
- CSV export of recommendations

**Won't have (explicitly out of scope — state this in the assumptions doc):**
- Live AWS/GCP/Azure integration
- Real payment or billing integration
- Full RBAC / multi-tenant auth (use a single mocked org context)
- Automated resource remediation (Apply is simulated, not a real API call to a cloud provider)

---

## 3. Persona & customer journey

**Persona:** Priya, engineering manager at a 120-person SaaS company. She doesn't have a dedicated FinOps team. Once a month she needs to answer "why did our cloud bill go up" and "what can we safely cut" without spelunking through the AWS console.

**Journey (this is a required deliverable — keep this narrative in the solution doc):**
1. Priya opens CloudLens and immediately sees this month's spend, the trend vs. last month, and a headline "potential savings" number.
2. She scans the recommendations list, sorted by dollar impact — the biggest items are idle databases and unattached storage volumes nobody remembered to delete.
3. She opens a recommendation, sees which team owns the resource and why it was flagged (e.g. "3% average CPU over 14 days"), and marks it Applied or Dismissed.
4. She checks the team leaderboard to see which team is the least cost-efficient this month, so she knows who to talk to.
5. She drills into one resource to see its utilisation history before deciding.

---

## 4. Tech stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | React 18 + Vite + TypeScript | Fast dev loop, standard PERN choice |
| Styling | Tailwind CSS + shadcn/ui primitives, **fully re-themed** (see §9) | Speed of shadcn's accessible primitives, none of its default visual identity |
| Charts | Recharts | Easiest to restyle away from default gradients/rounded look |
| Data fetching | TanStack Query | Caching, loading/error states for free |
| Routing | React Router | Standard |
| Backend | Node.js + Express + TypeScript | PERN standard |
| ORM | Prisma | Type-safe schema + migrations + seed scripting, works cleanly with Postgres. (Deviates slightly from "raw pg" PERN tradition — call this out as an intentional tech choice in the assumptions doc.) |
| Database | PostgreSQL, hosted on **Neon** or **Supabase** free tier | Zero local Docker/Postgres setup, avoids infra friction, works immediately in any AI IDE sandbox |
| Validation | Zod (shared types between client/server where practical) | |
| Auth | Minimal mocked auth — a single hardcoded org context, no real login flow required for MVP | Judges care about the cost-intelligence product, not an auth system |
| AI (stretch only) | Google Gemini API (free tier) as primary, local **Ollama** model as automatic fallback | Free to run for the whole build/demo; Ollama fallback keeps the narrative feature working even if Gemini rate-limits or the demo venue has flaky internet. Must be disclosed in submission per the challenge's AI-tools-used rule |
| Deployment | Frontend → Vercel. Backend + DB → Render or Railway (or Neon's own serverless Postgres + Render for the API) | Fast to stand up, free tier is enough for a demo |
| Testing | Vitest for the recommendation-engine logic (this is the core IP — worth testing), skip exhaustive coverage elsewhere | |

---

## 5. System architecture

```
┌─────────────────────────────┐
│   Synthetic data generator   │  (Node/ts-node script, run once at seed time)
│   → mimics AWS CUR-style     │
│     usage & cost records     │
└──────────────┬───────────────┘
               │ seeds
               ▼
┌─────────────────────────────┐
│        PostgreSQL            │  resources, usage_metrics,
│     (Neon / Supabase)        │  cost_records, recommendations, teams
└──────────────┬───────────────┘
               │ reads
               ▼
┌─────────────────────────────┐        ┌──────────────────────────┐
│   Recommendation Engine      │◄──────►│  Gemini API (stretch)     │
│   (rules module, runs        │        │  narrative insights,      │
│   on-demand or at seed time) │        │  falls back to local      │
│                               │        │  Ollama model if unavailable│
└──────────────┬───────────────┘        └──────────────────────────┘
               ▼
┌─────────────────────────────┐
│   Express REST API           │  /api/costs, /api/resources,
│   (Node + TypeScript)        │  /api/recommendations, /api/teams
└──────────────┬───────────────┘
               ▼
┌─────────────────────────────┐
│   React SPA (Vite)           │  Dashboard · Recommendations ·
│   Tailwind + shadcn (re-themed)│ Resource explorer · Leaderboard
└─────────────────────────────┘
```

For the actual submission, render this as an image (draw.io, Excalidraw, or any diagram tool) — don't submit ASCII art as the architecture diagram deliverable.

---

## 6. Database schema

```sql
CREATE TABLE teams (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  monthly_budget NUMERIC(12,2),
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE resources (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_uid  TEXT NOT NULL,          -- fake cloud resource id, e.g. i-0a1b2c3d
  team_id       UUID REFERENCES teams(id),
  service       TEXT NOT NULL,          -- EC2 | RDS | EBS | S3 | Lambda | ElasticIP | Snapshot
  region        TEXT NOT NULL,
  instance_type TEXT,
  status        TEXT NOT NULL,          -- running | stopped | unattached | idle
  tags          JSONB DEFAULT '{}',     -- { "owner": "...", "env": "..." }
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE usage_metrics (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id   UUID REFERENCES resources(id),
  date          DATE NOT NULL,
  avg_cpu_util  NUMERIC(5,2),
  avg_mem_util  NUMERIC(5,2),
  network_in_gb NUMERIC(10,2),
  network_out_gb NUMERIC(10,2)
);

CREATE TABLE cost_records (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id   UUID REFERENCES resources(id),
  date          DATE NOT NULL,
  usage_quantity NUMERIC(12,4),
  unblended_cost NUMERIC(12,4) NOT NULL,
  currency      TEXT DEFAULT 'USD'
);

CREATE TABLE recommendations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id   UUID REFERENCES resources(id),
  type          TEXT NOT NULL,   -- idle_termination | rightsizing | unattached_storage
                                  -- | stale_snapshot | reserved_instance | untagged | unused_ip
  title         TEXT NOT NULL,
  rationale     TEXT NOT NULL,
  estimated_monthly_savings NUMERIC(12,2) NOT NULL,
  confidence    TEXT NOT NULL,   -- high | medium | low
  status        TEXT DEFAULT 'open',  -- open | applied | dismissed
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- Indexes for query speed
CREATE INDEX idx_cost_records_resource_date ON cost_records(resource_id, date);
CREATE INDEX idx_usage_metrics_resource_date ON usage_metrics(resource_id, date);
CREATE INDEX idx_resources_team ON resources(team_id);
CREATE INDEX idx_recommendations_status ON recommendations(status);
```

---

## 7. Synthetic data generation

Write a seed script (`scripts/seed.ts`) that generates ~60–90 days of data for ~40–60 resources across 4–6 teams. Guidelines:

- Create 4–6 teams (e.g. Platform, Growth, Data, Mobile).
- Create a realistic mix of services: EC2 (60%), RDS (15%), EBS (10%), S3 (5%), Lambda (5%), Snapshot (5%).
- Deliberately plant the scenarios the recommendation engine should catch: a handful of idle EC2/RDS instances (low CPU for 14+ days), a few unattached EBS volumes, some stale snapshots (>90 days old), a couple of long-running on-demand instances with no reserved coverage, and 2-3 untagged resources.
- Generate daily cost records with realistic noise (don't make every day identical — trend should feel real).
- Print a summary at the end (total resources, total monthly spend, number of planted issues) so you can sanity-check the demo data.

---

## 8. Recommendation rules engine

Keep this as a standalone, testable module (`src/services/recommendationEngine.ts`) — this is the product's core IP and the easiest place to demonstrate engineering judgement to judges.

| Rule | Condition | Recommendation | Estimated savings |
|---|---|---|---|
| Idle compute | `service in (EC2, RDS)` AND `avg_cpu_util < 5%` over trailing 14 days AND `status = running` | Terminate idle resource | 100% of current monthly cost |
| Rightsizing | `avg_cpu_util` between 5–20% over trailing 14 days | Downsize to a smaller instance type | ~40% of current monthly cost (heuristic) |
| Unattached storage | `service = EBS` AND `status = unattached` for > 7 days | Delete unattached volume | 100% of volume cost |
| Stale snapshot | `service = Snapshot` AND age > 90 days | Delete stale snapshot | 100% of snapshot storage cost |
| No commitment coverage | `service in (EC2, RDS)` AND continuously running > 30 days AND on-demand pricing | Purchase reserved instance / savings plan | ~30% of annualized cost |
| Unused Elastic IP | `service = ElasticIP` AND not attached to a running instance | Release the IP | Fixed unused-IP hourly charge |
| Untagged resource | `tags` missing `owner` or `team` key | Flag for tagging / governance | No direct $ — flag only, don't count toward savings total |

Document these thresholds explicitly as **assumptions** in the submission — real thresholds would come from the customer's actual workload patterns.

---

## 9. API design

Base path: `/api`

| Method | Route | Purpose |
|---|---|---|
| GET | `/health` | Liveness check |
| GET | `/teams` | List teams |
| GET | `/teams/leaderboard` | Teams ranked by cost efficiency |
| GET | `/costs/summary?range=30d&groupBy=service\|team\|region` | Aggregated spend for the dashboard |
| GET | `/costs/trend?range=90d&interval=daily\|weekly` | Time series for the trend chart |
| GET | `/resources?team=&service=&status=&search=` | Paginated resource list |
| GET | `/resources/:id` | Resource detail |
| GET | `/resources/:id/usage` | Usage history for the detail chart |
| GET | `/recommendations?status=open&type=&sort=savings` | Recommendation list |
| GET | `/recommendations/summary` | Total open recommendations + total potential savings (drives the dashboard's headline stat) |
| POST | `/recommendations/:id/apply` | Mark applied (simulated — no real cloud call) |
| POST | `/recommendations/:id/dismiss` | Mark dismissed |
| GET | `/insights/narrative` | *(stretch)* Plain-English monthly summary — Gemini API primary, local Ollama model fallback |
| POST | `/dev/seed` | Dev-only: regenerate synthetic dataset |

Every list endpoint should support pagination (`?page=&limit=`) even if the frontend doesn't paginate in the MVP — cheap to add now, expected by judges under "scalability."

**Gemini/Ollama fallback pattern for `/insights/narrative`:** wrap the call in a small `aiProvider` service — try the Gemini API first (`gemini-1.5-flash` or similar free-tier model) with a short timeout (~8s); on error, timeout, or 429, fall back to a local Ollama instance (`http://localhost:11434/api/generate`, e.g. `llama3` or `phi3`). Both providers should be given the same prompt template so output stays consistent regardless of which one answers. Log which provider actually served the response — useful during the demo to show the fallback working live if asked.

---

## 10. Frontend pages

1. **Dashboard (`/`)** — headline "potential savings this month" stat (the signature visual, see §11), total spend + trend sparkline, top 3 cost drivers by service, top 3 recommendations preview.
2. **Recommendations (`/recommendations`)** — full list, filter by type/confidence, sort by savings, Apply/Dismiss actions.
3. **Resources (`/resources`)** — searchable/filterable table (team, service, status), row click → detail view.
4. **Resource detail (`/resources/:id`)** — utilisation chart, cost history, linked recommendations for that resource.
5. **Leaderboard (`/teams`)** — team-by-team spend and efficiency ranking, chargeback framing.
6. *(Stretch)* **Insights (`/insights`)** — Gemini-generated (Ollama fallback) narrative digest, styled as an editorial "report" rather than a dashboard card.

---

## 11. Design system — read this section carefully

**The single biggest evaluation risk for this project is looking like generic AI-generated SaaS boilerplate.** The reference screenshots (attached) show the direction to take: a hard-edged, high-contrast, "neubrutalist" style — thick black borders, flat solid colors, offset hard shadows (no blur), sharp typography, a dot-grid background, and tilted badge elements used as accents. Follow this direction precisely; do not soften it into a generic shadcn theme.

### Do NOT use (these are the default AI-generated patterns to actively avoid)
- No gradients anywhere — not on buttons, not on backgrounds, not on cards, not on text
- No glassmorphism / frosted blur / translucent cards
- No soft, blurred drop shadows — shadows must be hard-edged offset shapes with zero blur
- No fully-rounded ("pill") shapes as the default — sharp or lightly-rounded (2–8px) corners are the norm; only use full pill shapes deliberately, as an accent, the way the reference screenshot uses it for one hero CTA
- No default unmodified shadcn theme (soft gray borders, subtle shadows, `rounded-lg` everywhere) — every component must be re-themed per the tokens below
- No generic centered hero with floating abstract blobs/orbs
- No stock illustration people (undraw-style) or emoji used as icons
- No "trusted by" logo strips or other templated SaaS-marketing-site filler
- No motion for motion's sake — a hover press-effect on buttons is enough; skip scroll-triggered fade-ins and parallax

### Color tokens

Flat, functional, mapped to meaning (this also gives cost data real semantic value, not just decoration):

| Token | Hex | Use |
|---|---|---|
| `--ink` | `#0A0A0A` | All borders, all body text, primary buttons |
| `--surface` | `#FFFFFF` | Page background |
| `--surface-muted` | `#FAFAF7` | Card backgrounds, alternating table rows |
| `--savings` | `#1E8E3E` | Positive/savings values, "Applied" state, efficient teams |
| `--alert` | `#D93025` | Overspend, critical recommendations, "Dismissed" state |
| `--warning` | `#F2B705` | Medium-confidence flags, the signature tilted savings badge |
| `--info` | `#1A73E8` | Neutral data highlights, links, filters |
| `--text-muted` | `#5F6368` | Secondary/caption text |

Background: a faint dot-grid (`radial-gradient` is the one exception — a 1px dot repeated on a 24px grid at ~6% opacity of `--ink` is not a "gradient" in the banned sense, it's a pattern; use `background-image: radial-gradient(circle, var(--ink) 1px, transparent 1px); background-size: 24px 24px; opacity: .06`).

### Typography

- **Display / headings:** a heavy grotesk — Space Grotesk (700–900) or Archivo Black. Used with restraint: page titles and the one headline stat only.
- **Body:** Inter or Manrope, regular/medium weight.
- **Data / numeric values (table cells, cost figures):** a monospace face — IBM Plex Mono or JetBrains Mono. This gives cost tables a "data terminal" feel and is the kind of deliberate, subject-specific typography choice that reads as designed rather than templated — numbers in a cost tool should look like numbers you can trust.

### Structural rules

- Borders: `2px solid var(--ink)` on all cards, nav, table containers. `3px` on the primary hero elements (the savings badge, main nav bar).
- Shadows: hard offset only — `box-shadow: 4px 4px 0px var(--ink)` on cards and buttons. On button press/hover, animate to `2px 2px 0px` with a `translate(2px, 2px)` on the element itself, so it visually "presses down" — a tactile, non-generic interaction.
- Corners: 4–8px radius as the default (not 0, not full-round). Reserve fully-rounded pill shapes for exactly one or two elements, the way the reference site uses a black pill for its primary CTA.
- Badges/tags (team names, recommendation types, status pills): solid color background from the semantic tokens above, `2px solid var(--ink)` border, bold dark text in the same hue family — never plain black text on a colored badge, and never white text on a light badge.

### Signature element

Build one unmistakable, memorable piece: **"the savings ticket"** — a large card on the dashboard, rotated slightly (`transform: rotate(-2deg)`), solid `--warning` yellow background, thick black border, hard offset shadow, showing "You could save $X this month" in the display face. This mirrors the tilted "THINKING BEYOND BORDERS" badge in the reference screenshots and doubles as the dashboard's hero stat — solving both the "avoid a generic gradient hero" problem and the "what's this page's one memorable thing" problem at once.

Optional secondary signature (if time allows): an "idle resource graveyard" — a small, dryly funny section listing terminated/idle resources with a tombstone-style card treatment (still flat colors, no gradients) — a good example of product thinking that goes beyond the literal brief.

### Component approach

Install shadcn/ui for its accessible primitives (Button, Card, Table, Tabs, Badge, Dialog) but replace the generated theme file entirely — set border-radius, border-width, shadow, and color CSS variables to the tokens above. Do not keep shadcn's default look for a single component; every element should carry the black border + hard shadow language.

Charts (Recharts): flat solid fills per the color tokens (no gradient fills on bars/areas), black axis lines, tooltips styled with the same `2px solid` border + hard shadow as cards.

---

## 12. Folder structure

```
cloudlens/
├── apps/
│   ├── api/
│   │   ├── src/
│   │   │   ├── routes/           # one file per resource: costs.ts, resources.ts, recommendations.ts, teams.ts
│   │   │   ├── services/
│   │   │   │   └── recommendationEngine.ts
│   │   │   ├── prisma/
│   │   │   │   └── schema.prisma
│   │   │   ├── middleware/       # error handler, validation
│   │   │   └── index.ts
│   │   ├── scripts/
│   │   │   └── seed.ts
│   │   └── package.json
│   └── web/
│       ├── src/
│       │   ├── pages/            # Dashboard, Recommendations, Resources, ResourceDetail, Leaderboard
│       │   ├── components/       # SavingsTicket, RecommendationCard, CostTrendChart, ResourceTable, TeamLeaderboard
│       │   ├── lib/               # api client, query hooks
│       │   ├── styles/            # tailwind.config, theme tokens
│       │   └── App.tsx
│       └── package.json
├── docs/
│   ├── architecture-diagram.png
│   ├── solution-document.md
│   └── assumptions.md
├── README.md
└── plan.md   (this file)
```

---

## 13. Non-functional requirements

- **Security:** parameterized queries via Prisma (no raw string interpolation), `helmet` + configured CORS on Express, env-based secrets (`.env`, never committed), Zod validation on every request body/query param.
- **Scalability:** stateless API (horizontally scalable), pagination on all list endpoints, indexes on the hot query paths (see §6), DB is the eventual bottleneck — note read-replica as a future enhancement.
- **Performance:** aggregate cost summaries with SQL `GROUP BY` rather than in application code; consider a materialized `daily_cost_summary` view if the trend chart feels slow with the full dataset.
- **Deployment:** frontend on Vercel (zero-config for Vite), API + Postgres on Render/Railway/Neon. Document exact env vars needed in the README.
- **Observability:** basic request logging (`morgan` or `pino`), a `/health` endpoint for uptime checks.

---

## 14. Assumptions & trade-offs (document these explicitly in the submission)

- No live cloud provider integration — all data is synthetic but modeled on real AWS Cost & Usage Report structure.
- Recommendation savings estimates use heuristic thresholds (see §8), not workload-specific analysis — a real system would tune these per customer.
- Auth is mocked to a single organization context — multi-tenant auth is a real requirement we deferred to focus on the core cost-intelligence product.
- "Apply" on a recommendation updates its status in our database only; it does not call a real cloud API to terminate/resize a resource.
- Prisma was chosen over raw `pg` for schema safety and speed of iteration within the time box.
- The narrative insights feature (stretch) calls the Gemini API first (free tier) and automatically falls back to a local Ollama model if the Gemini call fails, times out, or is rate-limited — chosen to keep the live demo resilient without depending on paid credits or guaranteed venue internet.

## 15. Future enhancements (for the "what would you do with more time" slide)

- Real AWS Cost Explorer / CUR ingestion via S3 + scheduled ETL
- Workload-aware savings estimates (per-instance-family pricing tables instead of flat heuristics)
- Slack/email digest of new recommendations
- Real reserved-instance/savings-plan purchase recommendations tied to actual AWS pricing API
- Multi-tenant auth + role-based access (org admin vs. team viewer)
- One-click real remediation (terminate/resize) behind an approval workflow

---

## 16. Team plan (2 people, ~40 working hours)

- **Person A — backend & data:** schema, seed script, recommendation engine, API routes, backend deployment.
- **Person B — frontend & design system:** Tailwind/shadcn re-theme, all pages, charts, API integration, frontend deployment.
- Sync twice a day at fixed checkpoints (after schema/API contract is locked; after first end-to-end integration).
- **Rough timeline:**
  - Block 1 — schema, seed script, project scaffolding, design tokens locked (both agree on §11 before either writes UI code)
  - Block 2 — recommendation engine + core API routes // dashboard + recommendations page UI (parallel)
  - Block 3 — resource explorer + leaderboard // full API integration + polish pass against §11's "do not use" list
  - Block 4 — README, architecture diagram image, solution document, assumptions doc, 10-slide deck, demo video, submit

---

## 17. Deliverables checklist (map directly to the challenge brief)

- [ ] Working MVP deployed and reachable via a public URL
- [ ] Source code in a public (or shared) GitHub repo
- [ ] README: team name, members, college, build & run instructions, tech stack
- [ ] Architecture diagram (actual image, not ASCII — render §5)
- [ ] API documentation (can be generated from the table in §9, or a Postman collection)
- [ ] Database schema (§6, or `prisma/schema.prisma` itself)
- [ ] Solution document: architecture, design, assumptions (§14)
- [ ] Customer journey (§3)
- [ ] Presentation deck — max 10 slides
- [ ] 5-minute demo video (recommended)
- [ ] Disclosure of AI tools used (Claude/ChatGPT/Copilot/etc. — required by the rules, and specifically the Gemini API + local Ollama fallback if the narrative-insights stretch feature is built)
- [ ] Email submission to campusconnect@phonon.io before Fri 03-Jul-2026, 12:00 IST, subject line: `22North Product Engineering Challenge 2026 | Team <Team Name> | <Project Name>`
