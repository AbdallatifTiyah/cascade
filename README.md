# Cascade — Real Estate Investment & Development

Cascade is a **demand-driven** real estate investment and development platform.
Instead of browsing listings, a customer tells Cascade what they need and what
they can afford; Cascade scores real development opportunities against that
plan and explains exactly why each one fits. On the admin side, every customer's
property profile becomes structured demand data used to decide where to buy
land, what to build, and whether a project has enough real demand to justify
developing it.

Core loop: **preferences → financial capacity → demand data → land opportunity
→ project feasibility → group participation → apartment allocation → payment
plan → construction tracking → handover.**

## Demo accounts

| Role     | Email               | Password    |
|----------|---------------------|-------------|
| Customer | demo@cascade.dev    | Demo1234!   |
| Admin    | admin@cascade.dev   | Admin123!   |

The demo customer already has a completed property profile, a live reservation
in *Modern Heights* (Ramallah), a partially-paid installment plan, and
construction/notification history — so you can see "My Project" and "Payments"
populated immediately. You can also sign up as a brand-new customer to walk the
full onboarding → matching → reservation flow from scratch (the "Build My
Property Plan" CTA).

## Architecture

**Single Next.js 14 (App Router) application**, chosen so the whole product —
web today, and a native shell later — shares one backend and one set of
business rules:

- **Framework:** Next.js 14 + React 18 + TypeScript, deployed as one app.
  Route Handlers under `src/app/api/**` form a conventional REST-ish API,
  so a future React Native/Expo app (or any other client) can call the exact
  same endpoints instead of duplicating logic — no separate "mobile backend"
  is needed later (spec's mobile-readiness requirement).
- **Business logic lives in `src/lib/`, not in components or routes.** The
  matching engine, feasibility calculator, financial utilities, and land
  scoring are plain, framework-agnostic TypeScript functions with no React or
  Prisma imports in their core (`src/lib/matching/engine.ts`,
  `src/lib/feasibility/engine.ts`, `src/lib/finance.ts`,
  `src/lib/land/scoring.ts`). UI code and API routes both call into these —
  the same function that scores a match on the customer's screen is what the
  admin "Matching" screen and demand-coverage reports use, so results are
  always consistent and independently testable.
- **Database:** PostgreSQL via Prisma (`prisma/schema.prisma`) — no
  native enums/arrays are used (enum-like fields are plain `String` validated
  with Zod), so the same schema runs unchanged against a local Postgres
  instance, Neon, Supabase, or RDS. This also matters for hosting: serverless
  platforms like Vercel and Cloudflare have no persistent disk, so a
  file-based database was never an option for anything beyond a throwaway
  local demo.
- **Auth:** Auth.js (NextAuth v5) with a Credentials provider — real bcrypt
  password hashing, JWT sessions, role-based middleware (`src/middleware.ts`,
  `src/auth.config.ts`). Email/SMS verification is simulated (the OTP is
  returned directly to the client and shown on-screen, clearly labeled as demo
  mode) since no SMS/email provider is configured — swap in a real provider by
  sending the code there instead in `src/app/api/auth/signup/route.ts`.
- **Styling:** Tailwind CSS with a small hand-rolled design-system layer in
  `src/components/ui/` (Button, Card, Badge, Table, Dialog, Toast, Tabs,
  Progress, Skeleton, empty/error states) — no external component library, so
  every visual token traces back to `globals.css` custom properties.
- **Charts:** Recharts, used only where a chart adds insight (demand and
  budget distributions, land-demand breakdowns).

### Why not microservices / a separate API server?

This is an MVP with one team and one database. A single deployable Next.js
app with a clean `lib/` boundary gets the "reusable business logic" and
"future mobile" requirements without the operational cost of running and
deploying multiple services for a problem this doesn't have yet.

## Project structure

```
prisma/schema.prisma       Data model (see below)
prisma/seed.ts             Realistic demo data generator
src/app/                   Routes (App Router) — customer, admin, and API
src/components/            UI, by feature area (onboarding, projects, admin, ui/)
src/lib/
  matching/                 Match scoring engine + weights + explanations
  feasibility/               Project feasibility calculator
  land/                      Land → demand scoring + product estimation
  demand/                     Demand segment aggregation + project coverage
  finance.ts                 Monthly payment / amortization schedule utilities
  currency.ts                 Centralized currency formatting
  constants.ts                 Shared vocabularies (locations, amenities, statuses…)
  validation/                  Zod schemas
```

## Data model

Key entities (see `prisma/schema.prisma` for the full picture, including
indexes and relations): `User`, `PropertyPreference` (+ `PreferenceLocation`),
`Location`, `Land`, `Project`, `Apartment`, `ProjectParticipant`,
`Reservation`, `PaymentPlan`/`Payment`, `ConstructionStage`, `ProjectUpdate`,
`Notification`, `DemandSegment`, `MatchingConfiguration`, `MatchingResult`,
`ProjectFeasibility`, `AuditLog`, `AnalyticsEvent`.

## How matching works

`src/lib/matching/engine.ts` — `calculateMatchScore(profile, project, weights)`
is a **pure, deterministic function**: the same profile + project + weights
always produce the same score (spec requirement — auditable, no randomness).

1. For apartment-level criteria (monthly payment, initial payment, size,
   bedrooms, payment duration), it finds whichever *available* apartment in
   the project best fits the customer — a project's overall score reflects
   the unit the customer would actually want, not a project-wide average.
2. Location, delivery timeline, and amenities are scored at the project
   level.
3. Each of the 8 criteria gets a 0–100 sub-score, a plain-English explanation
   (`src/lib/matching/explain.ts`), and a weight. The weighted sum is the
   overall match percentage shown to the customer, with a full breakdown
   ("Location: perfect match", "Monthly payment: within your budget", …) —
   never just a bare number.
4. Every computed result is persisted to `MatchingResult` with its weights
   snapshot and timestamp, so scores stay auditable even after weights change.
5. Weights are stored in `MatchingConfiguration` and editable from
   **Admin → Matching** (`/admin/matching`) — adjusting them re-scores every
   future match without a code change.

## How feasibility works

`src/lib/feasibility/engine.ts` — `calculateProjectFeasibility(input)` takes
land/construction/other costs, unit count, average unit price, and the number
of "highly matched" potential participants (score ≥ 70, computed by
`src/lib/demand/coverage.ts` from real demand data), and returns total cost,
total revenue, gross margin, cost/revenue per unit, and demand coverage — each
labeled **estimated**, never a guaranteed return. **Admin → Feasibility**
(`/admin/feasibility`) lets you load these inputs from an existing land or
project and adjust them live.

Land opportunities get a separate, explainable **Land → Demand Match** score
(`src/lib/land/scoring.ts`, shown on `/admin/lands/[id]`) — a weighted
composite of real demand coverage, location popularity, size fit, and
affordability fit against the actual seeded demand pool, not a black box.

## Getting started

You need a reachable PostgreSQL instance (a local one, or a free Neon/Supabase
project — see the deployment section below).

```bash
npm install
cp .env.example .env        # then set DATABASE_URL (and DIRECT_URL) to your Postgres instance
npm run db:push             # create the schema
npm run db:seed             # seed realistic demo data (120 users, 6 projects, 8 lands, reservations…)
npm run dev
```

Open http://localhost:3000. Log in with either demo account above, or sign up
as a new customer.

### Environment variables

See `.env.example`. `DATABASE_URL` must point at a real Postgres instance —
there is no zero-config fallback. `DIRECT_URL` is only relevant for
connection-pooled providers like Supabase (see below); for a plain Postgres
instance or Neon, set it to the exact same value as `DATABASE_URL` — Prisma
requires the variable to exist even when it's unused. Generate a real
`AUTH_SECRET` with `openssl rand -base64 32` for anything beyond a throwaway
local run.

### Resetting or re-seeding

`npm run db:seed` wipes and regenerates all demo data (safe to re-run anytime
during development). `npm run db:reset` does a full Prisma migration reset.

## Deploying to Vercel

The app is a standard Next.js app with no platform-specific code. This was
validated end-to-end in a sandboxed environment (full `next build` +
`next start` against a real Postgres instance, every customer and admin
screen exercised) but never deployed to a live URL from there, since that
environment had no hosting credentials — these are the exact steps to do it
from your own account.

**1. Create a free Postgres database — Neon or Supabase both work:**

*Neon:*
- https://neon.tech → sign in with GitHub → **New Project**.
- Copy the connection string it gives you and use it for **both**
  `DATABASE_URL` and `DIRECT_URL` below.

*Supabase:*
- https://supabase.com → sign in with GitHub → **New Project**.
- Go to **Project Settings → Database → Connection string**.
- Use the **"Transaction" pooler string** (port `6543`, includes
  `?pgbouncer=true`) for `DATABASE_URL` — required because serverless
  functions open many short-lived connections that would otherwise exhaust
  Postgres' direct connection limit.
- Use the **"Session" / direct string** (port `5432`, no `pgbouncer` param)
  for `DIRECT_URL` — Prisma needs an unpooled connection to run
  `db push`/migrations, since the transaction pooler doesn't support them.

**2. Import the project into Vercel** (the screen you're on):
- **Root Directory:** `./` (leave as-is).
- **Framework Preset:** change it from "Other" to **Next.js** — Vercel should
  then fill in the Build/Install/Output commands correctly on its own
  (`npm run build`, `npm install`, and no explicit output directory needed).
- **Branch to deploy:** whichever branch has this app on it (not an empty
  placeholder branch/commit, if this repo started from one).

**3. Environment variables** — add these under "Environments" before
deploying:

| Key | Value |
|---|---|
| `DATABASE_URL` | pooled connection string (Supabase) or your connection string (Neon) |
| `DIRECT_URL` | direct connection string (Supabase) or the same value as `DATABASE_URL` (Neon) |
| `AUTH_SECRET` | any long random string (e.g. generate one at https://generate-secret.vercel.app/32) |
| `NEXTAUTH_URL` | your Vercel URL, e.g. `https://cascade-yourname.vercel.app` (you can add/fix this after the first deploy once Vercel assigns the domain) |
| `NEXT_PUBLIC_DEFAULT_CURRENCY` | `USD` |

**4. Deploy.** Vercel will run `npm install` and `npm run build`. `prisma
generate` runs automatically as part of `npm install` (via the `postinstall`
script in `package.json`), so the client is always in sync with the schema.

**5. Create tables and seed demo data — one time, after the first deploy:**
run this from your own machine (with Vercel CLI: `vercel env pull` to get the
variables locally), or from any machine with Node — use the **direct**
connection string for both commands here, even on Supabase, since `db push`
needs it:

```bash
DATABASE_URL="<your direct connection string>" npx prisma db push
DATABASE_URL="<your direct connection string>" npx tsx prisma/seed.ts
```

After that, redeploying from Vercel (e.g. a new push to the branch) reuses
the same database — you don't need to reseed on every deploy.

## Future mobile strategy

Nothing in `src/lib/` (matching, feasibility, finance, land scoring, demand
aggregation) imports React or Next.js — those modules, plus the
`src/app/api/**` Route Handlers, are the reusable core. A React Native/Expo
app would reuse those same API endpoints and could share the pure `src/lib`
calculation modules directly (they're plain TypeScript). No backend rewrite is
needed to add iOS/Android — only new native UI screens calling the existing
API.

## What's simplified for this MVP

Being upfront about scope tradeoffs made to prioritize a complete, working
core journey over speculative breadth:

- **Payments** are a structured ledger (down payment + equal monthly
  installments), not a real payment gateway — architected so a provider
  (Stripe, a local processor) can be plugged into `src/lib/finance.ts` and the
  `Payment` model without changing the schema shape.
- **i18n** is structured (`src/lib/i18n/`) but only English strings are fully
  wired through the highest-traffic screens; adding Arabic means adding
  `ar.ts` with the same keys and flipping `dir="rtl"` — no component rewrites.
- **Property imagery** uses deterministic gradient covers instead of stock
  photography, since no image pipeline/CDN is configured for this demo.
