# CloudBalance

A full-stack cloud cost optimization platform that helps teams monitor cloud spending, identify idle resources, and reduce infrastructure costs with intelligent recommendations.

## Setup

1. Install dependencies from the repository root:

   npm install

2. Set up environment files:
   - Copy `apps/api/.env.example` to `apps/api/.env` and set `DATABASE_URL` to your local Postgres connection string.
   - Copy `apps/web/.env.example` to `apps/web/.env` if you want a shared API base URL for the frontend.

3. Start both apps from the repository root:

   npm run dev

4. If you only want one service, run:

   npm run dev:api

   npm run dev:web

The API runs on port 5000 by default. The web app starts with Vite on its standard local dev port.

## What You Can Test

### API endpoints

- `GET /api/health` - quick liveness check.
- `GET /api/costs/summary?range=30d&groupBy=service|team|region` - cost aggregation.
- `GET /api/costs/trend?range=90d&interval=daily|weekly` - cost trend data.
- `POST /api/costs` - create a cost record.
- `GET /api/costs/:id` - fetch one cost record.
- `PATCH /api/costs/:id` - update a cost record.
- `DELETE /api/costs/:id` - delete a cost record.
- `GET /api/resources?team=&service=&status=&search=&page=&limit=` - list resources with filters.
- `GET /api/resources/:id` - fetch one resource.
- `GET /api/resources/:id/usage` - fetch usage history for a resource.
- `POST /api/resources` - create a resource.
- `PATCH /api/resources/:id` - update a resource.
- `DELETE /api/resources/:id` - delete a resource.
- `POST /api/resources/:id/usage` - create a usage metric.
- `GET /api/resources/:id/usage/:usageId` - fetch one usage metric.
- `PATCH /api/resources/:id/usage/:usageId` - update a usage metric.
- `DELETE /api/resources/:id/usage/:usageId` - delete a usage metric.
- `GET /api/recommendations?status=open&type=&sort=savings&page=&limit=` - list recommendations.
- `GET /api/recommendations/summary` - summary of open recommendations.
- `POST /api/recommendations` - create a recommendation.
- `GET /api/recommendations/:id` - fetch one recommendation.
- `PATCH /api/recommendations/:id` - update a recommendation.
- `DELETE /api/recommendations/:id` - delete a recommendation.
- `POST /api/recommendations/:id/apply` - mark a recommendation as applied and update related resource status when applicable.
- `POST /api/recommendations/:id/dismiss` - mark a recommendation as dismissed.
- `POST /api/recommendations/:id/reopen` - move a recommendation back to open.
- `GET /api/teams` - list teams.
- `GET /api/teams/leaderboard` - compute the team efficiency leaderboard.
- `POST /api/teams` - create a team.
- `GET /api/teams/:id` - fetch one team.
- `PATCH /api/teams/:id` - update a team.
- `DELETE /api/teams/:id` - delete a team.
- `POST /api/dev/seed` - reseed the database with demo data.

### What is writable right now

- Teams, resources, cost records, usage metrics, and recommendations now support full CRUD.
- Recommendation apply, dismiss, and reopen are extra workflow actions.
- Database reseeding is still available through the dev seed endpoint.

### Database checks

- Use Prisma Studio from `apps/api` with `npx prisma studio` to inspect teams, resources, costs, usage metrics, and recommendations.
- Use `npx prisma migrate dev` from `apps/api` after schema changes.
- Use `npx prisma generate` from `apps/api` after schema changes or new migrations.

### Suggested test flow

1. Start the API and web app.
2. Open `http://localhost:5000/api/health` and confirm the service is up.
3. Call `POST /api/dev/seed` to populate the database with demo data.
4. Open Prisma Studio and verify the seeded rows in `Team`, `Resource`, `CostRecord`, `UsageMetric`, and `Recommendation`.
5. Hit `GET /api/resources` and `GET /api/recommendations` to confirm the API returns seeded data.
6. Open the web app and test search, filters, and the Apply/Dismiss actions.
7. Re-open Prisma Studio or re-run the GET endpoints to confirm status changes after writes.
