# Architecture

See [PRODUCT.md](./PRODUCT.md) for what this is, [DESIGN.md](./DESIGN.md) for the visual system, and [AGENTS.md](./AGENTS.md) for the operating manual.

## Stack

- **Framework**: Vite 8 running a React 19 SPA + a Nitro 3 server together
- **Language**: TypeScript 5 (strict)
- **Frontend routing**: `vite-plugin-pages` (file-based) + `react-router` 8
- **Backend routing**: Nitro 3 / H3 2 (file-based)
- **Database**: SQLite via Bun's built-in `bun:sqlite` + Drizzle ORM — schema/client in `db/`, migrations in `drizzle/`. Requires the Bun runtime (dev, test, and production — see Deployment below)
- **Styling**: Tailwind CSS v4 (CSS-first, no `tailwind.config.ts`) + `tw-animate-css`
- **UI primitives**: shadcn/ui-style — Radix Slot, `class-variance-authority`, `cn()`
- **Icons**: `lucide-react`, `@heroicons/react`
- **Auto-imports**: `unplugin-auto-import` — `react` + `react-router` need no import
- **Fonts**: `unplugin-fonts` (config in `configs/fonts.config.ts`)
- **Tests**: Vitest + Testing Library (unit/integration/UI), Playwright (E2E/smoke)
- **Lint/format**: ESLint 10 + typescript-eslint, Prettier, Husky + lint-staged

Concrete versions are read from `package.json`: React 19.2, Vite 8.1, Nitro 3.0 (`^3.0.260610-beta`), TypeScript 5.9, Drizzle ORM 0.45 + drizzle-kit 0.31, Tailwind CSS 4.3, Vitest 4.1, Playwright `~1.60.0`, ESLint 10.7, react-router 8.2.

## Directory Structure

```
.
├── src/
│   ├── components/ui/   # shadcn/ui-style primitives (+ *.test.tsx)
│   ├── pages/            # Frontend routes, file-based (+ *.test.tsx)
│   ├── hooks/, utils/, types/, constants/, data/, store/
│   ├── test/              # Vitest setup
│   ├── index.css           # Tailwind v4 + design tokens
│   └── main.tsx
├── routes/api/            # Backend routes, file-based (+ *.test.ts)
├── middleware/             # Runs before every route handler
├── db/                      # Drizzle schema.ts + client.ts (sqlite connection, migrate, seed)
├── drizzle/                  # Generated SQL migrations (drizzle-kit generate), committed
├── e2e/                     # Playwright specs + global-setup.ts
├── configs/, scripts/
├── .github/workflows/       # GitHub Actions CI
├── server.ts                # Nitro server entry
├── vite.config.ts, vitest.config.ts, playwright.config.ts, drizzle.config.ts
├── tsconfig.json             # src
├── tsconfig.node.json          # server/config/test files
├── artifacts/               # Sprint plans and per-ticket docs
├── openspec/                 # Spec-driven change proposals and the spec of record
└── package.json
```

## Specifications

`openspec/` holds the behaviour contract as versioned specs rather than prose.

- `openspec/changes/<change-id>/` — one directory per in-flight change, authored during planning:
  `proposal.md` (why / what / impact), `design.md` (the technical decisions), `tasks.md`
  (checkbox work items, each tagged with the ticket key that will do it), and
  `specs/<capability>/spec.md` carrying **deltas only** — `## ADDED` / `## MODIFIED` /
  `## REMOVED` / `## RENAMED Requirements`. Every requirement is stated in RFC-2119 terms and
  carries at least one GIVEN/WHEN/THEN scenario.
- `openspec/specs/` — the merged spec of record. Written by the platform at sprint close, not by
  hand.
- `openspec/config.yaml` and `openspec/schemas/` — operator-owned configuration and the artifact
  templates.

A ticket's acceptance criteria derive one-for-one from the scenarios of its requirement, so a QA
verdict traces to a named behaviour rather than to a paragraph. A change validates under the
OpenSpec CLI's strict mode before its planning ticket closes.

## Routing

**Frontend**: `src/pages/**/*.tsx` → routes (`about.tsx` → `/about`, `[id].tsx` → `/:id`, `[...all].tsx` → catch-all). `*.test.tsx` excluded via `Pages({ exclude })` in `vite.config.ts`.

**Backend**: `routes/api/*.ts` → `/api/*`, `middleware/*.ts` runs first and can set `event.context`. Requires `nitro({ serverDir: "./" })` in `vite.config.ts` — default is `false` (no scanning). `*.test.ts` excluded via `nitro({ ignore })`.

### Health probe route contract

`routes/api/healthz-smoke-*.ts` each export a single default `defineHandler` from `nitro/h3` that takes no parameters and returns a literal `{ ok: true, variant: "<id>" }`. No `event` access, no imports beyond `nitro/h3`, no method guard — so every HTTP verb gets the same body (see [AGENTS.md](./AGENTS.md#gotchas)). The filename **is** the URL contract: `routes/api/x.ts` → `/api/x`, with no registration step, so a filename typo is a wrong URL with no other symptom.

`bun run build` emits one module per route under `.output/server/_routes/api/`, dashes converted to underscores — `/api/healthz-smoke-528856326-a` → `.output/server/_routes/api/healthz_smoke_528856326_a.mjs`. That output is how you confirm a route compiled into the production server; the colocated `*.test.ts` files are excluded from it by `nitro({ ignore })`.

A filename may carry a method suffix — `login.post.ts` → `POST /api/auth/login`. The suffix genuinely restricts the method: another verb on the same path matches no route and therefore falls through to the SPA shell with `200 text/html`, rather than producing a `405`. That is the same fallback an unrouted path gets (see [AGENTS.md](./AGENTS.md#gotchas)), so a method restriction is observable in the response body and not in the status code.

Everything else under `routes/api/` is the worked-example set, and it is small: `hello.ts`, `hello.test.ts`, `auth/login.post.ts` with its colocated test, and a `users/` directory of four files (`[id].ts`, `[id].test.ts`, `index.get.ts`, `index.get.test.ts`). The `.post.ts` and `.get.ts` suffixes are documented in [AGENTS.md § Conventions](./AGENTS.md#conventions); `auth/login.post.ts` and `users/index.get.ts` are the worked examples of each. There is no `hello.post.ts`.

## Data Flow Example

`GET /api/hello`: `middleware/auth.ts` sets `event.context.user` → `routes/api/hello.ts` reads it and responds. `routes/api/users/[id].ts` shows the dynamic-route + `createError()` 404 pattern, backed by a real query against `db/client.ts`'s Drizzle instance.

## Identity

Two mechanisms, deliberately not connected to each other:

- **`middleware/auth.ts`** is a stub. It assigns a fixed `event.context.user` on every request and proves nothing about the caller. It exists so `routes/api/hello.ts` has a context to read.
- **`identity-user-auth`** verifies a credential. `POST /api/auth/login` looks a user up by email, verifies the supplied password against a stored argon2id hash, records the attempt, and returns the outcome. It issues no session, sets no cookie, and does not populate `event.context` — a caller that has proven a password is, on the next request, as anonymous as one that has not.

Closing that gap means introducing a session or token mechanism, which does not exist yet. Until it does, no route should treat `event.context.user` as an authenticated identity.

## Database

`db/schema.ts` defines Drizzle tables; `db/client.ts` opens the SQLite connection, runs pending migrations from `drizzle/`, and seeds demo data if the table is empty. Routes import `db` and the table objects directly (see `routes/api/users/`) — no repository layer.

Entities:

- **`users`** — `id`, `name`, `email` (unique). Public: `routes/api/users/` returns whole rows to unauthenticated callers, which is why nothing sensitive may be added to this table.
- **`user_credentials`** — keyed by user id, holds the argon2id password hash. Separate from `users` precisely because `users` rows are published; see Key Decisions.
- **`login_attempts`** — one row per evaluated login: the email tried, a nullable user id (an unknown email matches none), the outcome, and when. This is the capability's record of what happened, not a log line.

- `bun run db:generate` — after editing `db/schema.ts`, generates a new migration into `drizzle/` (via `drizzle-kit`, config in `drizzle.config.ts`)
- `bun run db:studio` — browse the db in Drizzle Studio
- The db file itself is `sqlite.db` at the project root (gitignored, created on first run); `drizzle/` migrations are committed
- Under Vitest (`VITEST=true`), `db/client.ts` swaps in an in-memory db instead, so tests never touch the dev database

## Testing

Four tiers, one worked example each. Commands and how to extend: [README.md](./README.md#testing), [AGENTS.md](./AGENTS.md).

## Deployment

- `ecosystem.config.js` (PM2) runs the real build: `.output/server/index.mjs`, under Bun (`interpreter: "bun"`) — required by `db/client.ts`'s `bun:sqlite` import. `nitro.service` (systemd) is the non-PM2 equivalent, same requirement.
- `Dockerfile`/`docker-compose.yml` build a static `dist/` served by nginx — don't rely on them for the Nitro/DB-backed API without fixing first (they never run `.output/server/index.mjs`)

---

## Key Decisions

| Decision                                 | Rationale                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **React 19**                             | Latest stable, ESM-first, better hooks ergonomics, Suspense for data fetching                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| **Vite 8**                               | Industry-standard bundler, HMR speed, first-class TypeScript support, ESM-native config                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| **Nitro 3**                              | Full-stack with React SPA in same repo, zero-config routing, H3 middleware system                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| **SQLite + Drizzle**                     | SQLite needs no separate database server (file-local), Drizzle provides type-safe ORM without runtime overhead, migrations committed alongside code                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| **Bun runtime**                          | `bun:sqlite` is the Bun native driver; Bun's speed and TypeScript support reduce dev/prod friction. Requirement: dev, test, and production must all run under Bun.                                                                                                                                                                                                                                                                                                                                                                                                                         |
| **Tailwind CSS v4**                      | CSS-first design (no JS config file), performance, design tokens via custom properties, ecosystem of plugins                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| **shadcn-style primitives**              | Radix + CVA patterns decouple styled primitives from app logic, supports composition + polymorphism, smaller bundle than full component library                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| **Playwright**                           | Cross-browser E2E, pinned to `~1.60.0` to match QA container Chromium, snapshot testing support, fast iteration                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| **Health probes duplicate, on purpose**  | Each `routes/api/healthz-smoke-*.ts` repeats ~8 lines rather than sharing a factory. A shared helper would make every probe a shared-file edit, which is exactly what the probes exist to disprove — they are the repo's standing evidence that independent units of work merge in parallel without conflict. Cost is bounded (the file never changes after it lands); benefit is a zero-overlap ownership map every sprint.                                                                                                                                                               |
| **Specs are deltas, not restatements**   | An `openspec/changes/*/specs/` file lists only the requirements a change ADDs, MODIFIEs, REMOVEs or RENAMEs; the merged spec of record under `openspec/specs/` is assembled by the platform at close. A one-corner change therefore never re-describes the whole system, which is what keeps a spec reviewable. The cost is that a `MODIFIED` block replaces its requirement wholesale, so it must carry every scenario that requirement still needs — an omitted scenario reads as a deletion.                                                                                            |
| **Credentials never live on `users`**    | Password material and anything like it (a reset token, a TOTP secret, a recovery code) goes in a credential-scoped table keyed by user id, never as a column on `users`. `routes/api/users/` selects whole `users` rows and returns them to unauthenticated callers, so a column added there is a column published there — the failure mode is a leak, not a broken test, and it happens silently. Cost is one join when a credential is needed; benefit is that no future column on `users` can become a disclosure. Authored in change `vrtx3-i-0059-the-identity-user-auth-capa` § D1.  |
| **One password hash, `Bun.password`**    | Password hashing is argon2id via the `Bun.password` builtin, and no npm hashing library enters the repo. Bun is already mandatory everywhere (`bun:sqlite` in `db/client.ts`, `bun --bun vitest`, `interpreter: "bun"` in deployment), so the builtin is available in dev, test and production alike with no native build step and no second hashing configuration to keep in agreement. Verify asynchronously in a request path — a synchronous argon2id verify costs tens of milliseconds and blocks the event loop. Authored in change `vrtx3-i-0059-the-identity-user-auth-capa` § D2. |
| **Root docs carry no per-sprint counts** | `PRODUCT.md` and this document describe the probe family without counting it, and the build-output example is pinned to the never-rotating copy source rather than the newest variant. A figure that must be re-derived every sprint is stale between sprints and makes the root docs a shared surface every parallel ticket could collide on. Inventory questions are answered from the filesystem and from `openspec/specs/`; see the `vrtx3-i-0049-smoke-178767328680848-3-independent-endpoints-50` change design § D3.                                                                |

---

## Changelog

### 2026-08-25 — Sprint VRTX3-S-0039: Three Independent Health Check Endpoints (812788042)

Added `routes/api/healthz-smoke-812788042-a.ts`, `-b.ts`, `-c.ts` and their colocated tests — 6 new files, 0 modified source files, no dependency change. Probe-family count under [Routing](#routing) updated 121 → 124, re-counted from the filesystem rather than incremented. Both figures the previous entry disambiguated still hold and still differ: `routes/api/` **lists 245 entries** at planning (251 once this sprint lands) but **holds 248 `.ts` files** (254 after), because `users/` is one entry and four files. Checked against the non-probe inventory both ways: 121 + 121 + `hello.ts` + `hello.test.ts` + `users/` = 245 entries, and the same set counted recursively = 248 files. The build-output example in the same section now names this sprint's route.

The [Specifications](#specifications) section needed no change, and that is the sprint's structural finding. VRTX3-S-0038 created both the section and the `health-probes` capability; this is the first change to **extend** an existing capability, and the delta model behaved as the "Specs are deltas, not restatements" decision says it should — the change file carries three `## ADDED Requirements` and reproduces none of the 121 requirements already in `openspec/specs/health-probes/spec.md`. For a repository that adds three instances of the same contract every sprint, the cost of the spec staying correct is therefore flat rather than proportional to the family size. The platform assembles the merged spec of record at close; nothing under `openspec/specs/` was written by hand.

`## Key Decisions` is unchanged, and the decomposition is again what the "Health probes duplicate, on purpose" entry predicts: three tasks, each owning two new files, no `depends_on` edge between any pair, and the only file set they could have collided on — the root docs carrying the probe count — held exclusively by the planning ticket and moved 121 → 124 once for the sprint.

The copy-source ambiguity recorded against that entry produced its sixth harmless instance, and this one is worth keeping for what it says about the two halves of a probe pair. VRTX3-I-0048 names a **handler** (`healthz-smoke-1065915107-a.ts`) and a **test** (`healthz-smoke-1065915107-c.test.ts`) from the same post-VRTX3-S-0011 triple. Only tests carry the wall-clock case, so citing a handler carries no risk at all and citing a test is the whole exposure — a distinction VRTX3-S-0037 first recorded and this sprint is the first to see exercised on both halves at once. Both were diffed and both are clean. The mitigation stays documentary and costs one diff per sprint by one planning agent, the same diff whether the pointer turns out right or wrong; factoring the family into a shared handler would instead convert every future probe into a shared-file edit, paid by every ticket in every sprint.

The filename-is-the-URL contract was re-measured live before implementation for the twenty-ninth consecutive sprint: all three unwritten paths returned `200 text/html` (the 949-byte SPA shell), while the control `/api/healthz-smoke-528856326-a` returned `200 application/json` (33 bytes). Confirm a route compiled by looking for its module under `.output/server/_routes/api/`.

### 2026-08-25 — Sprint VRTX3-S-0038: Three Independent Health Check Endpoints (992401223)

Added `routes/api/healthz-smoke-992401223-a.ts`, `-b.ts`, `-c.ts` and their colocated tests — 6 new files, 0 modified source files, no dependency change. Probe-family count under [Routing](#routing) updated 118 → 121, re-counted from the filesystem rather than incremented. The re-count also disambiguated two figures previous entries had been using interchangeably: `routes/api/` **lists 239 entries** at planning (245 once this sprint lands) but **holds 242 `.ts` files** (248 after), because `users/` is one entry and four files. Checked against the non-probe inventory both ways: 118 + 118 + `hello.ts` + `hello.test.ts` + `users/` = 239 entries, and the same set counted recursively = 242 files. The build-output example in the same section now names this sprint's route.

**New: a [Specifications](#specifications) section and a `## Key Decisions` entry, "Specs are deltas, not restatements".** This is the first spec-driven sprint in the repository — `openspec/` previously held only `config.yaml` and the artifact templates, with no `changes/` or `specs/` directory. The structural facts worth recording here rather than in a sprint plan: the change directory is authored during planning and validated under strict mode before the planning ticket closes; `openspec/specs/` is written by the platform at close and never by hand; and each `tasks.md` checkbox is tagged with the ticket key that will tick it, which is the mechanism, not a convention. The delta model is what makes this cheap for a repository shaped like this one — a change adding three probes describes three requirements, not the 118 that already exist.

The `health-probes` capability spec is therefore the first written statement of a contract this repository has shipped 118 times. It says nothing new: `GET` returns 200 with `application/json` and a literal body, the handler imports only `nitro/h3`, and the colocated test asserts the returned object. That it needed no reinterpretation to write down is the useful result — the [Routing](#routing) contract above was already precise enough to derive scenarios from.

`## Key Decisions` gains one entry and changes none. "Health probes duplicate, on purpose" governs this sprint as written, and the decomposition is what it predicts: three tasks, each owning two new files, no `depends_on` edge between any pair, and the only file set they could have collided on — the root docs carrying the probe count — held exclusively by the planning ticket and moved 118 → 121 once for the sprint.

The copy-source ambiguity recorded against that entry produced its fifth harmless instance, and its position in the sequence is the part worth keeping. VRTX3-I-0047 named `healthz-smoke-189360772-a`, the same file VRTX3-I-0043 named three sprints earlier, immediately after VRTX3-I-0044 became the first canvas to name both the pinned pair and a legacy neighbour correctly. Two consecutive safe sprints is the pattern most likely to be read as the risk retiring; it is not, because the 47 legacy tests are never rewritten and the odds are set by which neighbour a canvas happens to sample. The mitigation stays documentary and costs one diff per sprint by one planning agent, the same diff whether the pointer turns out right or wrong. Factoring the family into a shared handler would instead convert every future probe into a shared-file edit — the coupling the probes exist to disprove — paid by every ticket in every sprint.

The filename-is-the-URL contract was re-measured live before implementation for the twenty-eighth consecutive sprint: all three unwritten paths returned `200 text/html` (the 949-byte SPA shell), while the control `/api/healthz-smoke-528856326-a` returned `200 application/json` (33 bytes). Confirm a route compiled by looking for its module under `.output/server/_routes/api/`.

### 2026-08-23 — Sprint VRTX3-S-0037: Three Missing Health Probes Restored (bugfix 147016547 / 386341015 / 1025161533)

Added `routes/api/healthz-smoke-bugfix-147016547.ts`, `healthz-smoke-bugfix2-386341015.ts`, `healthz-smoke-bugfix3-1025161533.ts` and their colocated tests — 6 new files, 0 modified source files, no dependency change. Probe-family count under [Routing](#routing) updated 115 → 118, re-counted from the filesystem rather than incremented (232 entries under `routes/api/` at planning, 238 once this sprint lands), which agrees with the non-probe inventory added last sprint: 232 − 115 probe handlers − 115 probe tests = 6 worked-example files (`hello.ts`, `hello.test.ts`, four under `users/`). That is the first time the inventory has been used as the check it was written to be.

The filename-is-the-URL contract was re-measured live before implementation for the twenty-seventh consecutive sprint: all three unwritten paths returned `200 text/html` (the 949-byte SPA shell) rather than the reported `404`, while the control `/api/healthz-smoke-528856326-a` returned `200 application/json` (33 bytes). Confirm a route compiled by looking for its module under `.output/server/_routes/api/`.

`## Key Decisions` is unchanged, and the decomposition is again what the "Health probes duplicate, on purpose" entry predicts: three defects, each owning two new files, no `depends_on` edge between any pair, and the only file set they could have collided on — the root docs carrying the probe count — held exclusively by the planning ticket and moved 115 → 118 once for the sprint.

The copy-source ambiguity recorded against that entry produced its second fully correct instance (after VRTX3-I-0040), and this one refines what the mitigation has to cover. VRTX3-I-0044 named the pinned pair _and_ identified `healthz-smoke-bugfix3-196651982.test.ts` as a legacy file to avoid — the first upstream document to name a hazard rather than a template. It could do that because it quoted the corresponding **handler** as a shape example, and handlers are uniformly safe: the timing case lives only in tests, so the two halves of a probe pair carry different risk. That asymmetry is a property of the duplication this decision chose — 118 identical handlers and 118 tests of which 47 differ — and it means the documentary mitigation must be read as being about test files specifically, not about probe files in general. The lookup cost is unchanged at one documentation read per sprint by one planning agent, and it does not fall when a canvas gets it right: verifying VRTX3-I-0044's correct pointer took the same one diff that catches a wrong one. Factoring the family into a shared handler would instead convert every future probe into a shared-file edit — the coupling the probes exist to disprove — paid by every ticket in every sprint. The decision stands and the mitigation stays documentary.

### 2026-08-23 — Sprint VRTX3-S-0036: Three Independent Health Check Endpoints (450228657)

Added `routes/api/healthz-smoke-450228657-a.ts`, `-b.ts`, `-c.ts` and their colocated tests — 6 new files, 0 modified source files, no dependency change. Probe-family count under [Routing](#routing) updated 112 → 115, re-counted from the filesystem rather than incremented (227 entries under `routes/api/` at planning, 233 once this sprint lands). The build-output example in the same section now names this sprint's route.

The same section gained the non-probe inventory, because re-deriving the count this sprint turned up an error in the previous sprint plan's breakdown: it listed a `hello.post.ts` that does not exist and three `users/` files where there are four. `hello.post.ts` appears in [AGENTS.md § Conventions](./AGENTS.md#conventions) as an illustration of the `.post.ts` method-restriction rule, and was read as inventory. Naming the six real non-probe entries here gives the next re-count something to check against, in the document that already carries the probe number.

`## Key Decisions` is unchanged, and the decomposition is again what the "Health probes duplicate, on purpose" entry predicts: three tasks, each owning two new files, no `depends_on` edge between any pair, and the only file set they could have collided on — the root docs carrying the probe count — held exclusively by the planning ticket and moved 112 → 115 once for the sprint.

The copy-source ambiguity recorded against that entry produced its fourth harmless instance, and this one prices the mitigation more precisely than the harmful ones did. VRTX3-I-0043 named a post-VRTX3-S-0011 file, so nothing had to be corrected — but the same canvas argues independently that a wall-clock assertion on these handlers measures the runtime rather than the code, which is this decision's own reasoning, and still named a template it had not checked against it. The cost of 115 deliberately identical siblings is therefore not a comprehension cost that better authorship would remove; it is a lookup cost, one documentation read per sprint by one planning agent, and it stays flat as the family grows. Factoring the family into a shared handler would instead convert every future probe into a shared-file edit — the coupling the probes exist to disprove — paid by every ticket in every sprint. The decision stands and the mitigation stays documentary.

### 2026-08-23 — Sprint VRTX3-S-0035: Three Independent Health Check Endpoints (180848429)

Added `routes/api/healthz-smoke-180848429-a.ts`, `-b.ts`, `-c.ts` and their colocated tests — 6 new files, 0 modified source files, no dependency change. Probe-family count under [Routing](#routing) updated 109 → 112, re-counted from the filesystem rather than incremented (224 files under `routes/api/` at planning, 230 once this sprint lands). The build-output example in the same section now names this sprint's route.

`## Key Decisions` is unchanged, and the decomposition is again what the "Health probes duplicate, on purpose" entry predicts: three tasks, each owning two new files, no `depends_on` edge between any pair, and the only file set they could have collided on — the root docs carrying the probe count — held exclusively by the planning ticket and moved 109 → 112 once for the sprint.

The copy-source ambiguity recorded against that entry produced its third harmful instance, and this one bounds the mitigation's cost more precisely than the previous two. VRTX3-I-0042 named `healthz-smoke-913793173-a` and its test — a pre-VRTX3-S-0011 file carrying the wall-clock assertion — while its own risk register described, accurately, the hazard of copying the wrong file from a noisy directory. That rules out the cheapest fix anyone might propose for this decision's downside: it is not a matter of authors being careless, so no amount of care at the canvas end removes it. A 112-file directory of deliberately identical siblings gives a reader no in-band way to tell a safe neighbour from a legacy one; the check has to be a documentation lookup, paid once per sprint by one planning agent. Factoring the family into a shared handler would instead convert every future probe into a shared-file edit — the coupling the probes exist to disprove — paid by every ticket in every sprint. The decision stands and the mitigation stays documentary.

One clarification recorded against the idea rather than the decision: VRTX3-I-0042 puts "No README/ARCHITECTURE update" out of scope, on the grounds that the endpoints are throwaway. The endpoints are; the register that counts them is not. This document's probe count is planning-owned and moves with the filesystem, so it was updated here and named in no implementation ticket. `README.md` carries no probe count and was untouched — the second sprint running that an idea has assumed it does.

### 2026-08-23 — Sprint VRTX3-S-0034 (`smoke-bugfix-178747715613700`): Three Missing Health Probes

Added `routes/api/healthz-smoke-bugfix-839771954.ts`, `healthz-smoke-bugfix2-554747562.ts`, `healthz-smoke-bugfix3-238311955.ts` and their colocated tests — 6 new files, 0 modified source files, no dependency change. Probe-family count under [Routing](#routing) updated 106 → 109, re-counted from the filesystem rather than incremented (215 `.ts` files under `routes/api/` at planning, 221 once this sprint lands).

`## Key Decisions` is unchanged, and the decomposition is again what the "Health probes duplicate, on purpose" entry predicts: three defects, each owning two new files, no `depends_on` edge between any pair, and the only file set they could have collided on — the root docs carrying the probe count — held exclusively by the planning ticket and moved 106 → 109 once for the sprint.

The copy-source ambiguity recorded against that entry came due again, and this time it bit. VRTX3-I-0041 named `healthz-smoke-bugfix3-993514120` and its test, which carries the flaky wall-clock assertion, and propagated the shape into one of its own acceptance criteria — the second harmful instance after VRTX3-I-0037, against three harmless ones. What this adds to the entry is a bound on the mitigation rather than a reason to revisit the decision: the previous sprint's note predicted that a canvas reaching one directory entry past the newest file lands in the 47-of-109 legacy half, and the very next canvas did. It did so while being the most thorough canvas the family has produced, which locates the cost precisely — a 109-file directory of deliberately identical siblings gives a reader no way to tell a safe neighbour from a legacy one without reading [AGENTS.md](./AGENTS.md#health-probe-routes). That is a documentation-lookup cost paid per sprint by one planning agent. Factoring the family into a shared handler would instead convert every future probe into a shared-file edit — the coupling the probes exist to disprove — paid by every ticket in every sprint. The decision stands and the mitigation stays documentary.

Also repaired: the `AGENT.md` → `AGENTS.md` rename in `600b74f` left nine dead cross-references in this document. Paths only; no prose changed.

### 2026-08-21 — Sprint VRTX3-S-0003 (`smoke-bugfix-17873270732264355`): Three Missing Health Probes

Added `routes/api/healthz-smoke-bugfix-858873211.ts`, `healthz-smoke-bugfix2-664793322.ts`, `healthz-smoke-bugfix3-267063007.ts` and their colocated tests — 6 new files, 0 modified source files, no dependency change. Probe-family count under [Routing](#routing) updated 103 → 106, re-counted from the filesystem rather than incremented (209 `.ts` files under `routes/api/` at planning, 215 once this sprint lands).

`## Key Decisions` is unchanged, and the decomposition is again exactly what the "Health probes duplicate, on purpose" entry predicts: three defects, each owning two new files, no `depends_on` edge between any pair, and the only file set they could have collided on — the three root docs carrying the probe count — held exclusively by the planning ticket and moved 103 → 106 once for the sprint. The copy-source ambiguity recorded against that entry produced a third near-miss and the second consecutive harmless one: VRTX3-I-0006 named `healthz-smoke-bugfix3-834560860.test.ts`, the pair VRTX3-S-0002 added the day before, so it was shape-identical by construction. Worth stating precisely, because it bounds the decision rather than reopening it — the realized cost of the duplication is not that canvases sample badly, it is that a 106-file directory gives them no way to tell a safe neighbour from a legacy one without reading [AGENTS.md](./AGENTS.md#health-probe-routes). Naming the newest file is the best heuristic available to a sampler and it is still a heuristic; one entry further back is the 47-of-106 legacy half. A pinned pointer resolves that in one line of a plan, whereas factoring the family into a shared handler would convert every future probe into a shared-file edit — the coupling the probes exist to disprove, paid every sprint instead of occasionally.

The filename-is-the-URL contract was re-measured live before implementation for the twenty-third consecutive sprint: all three unwritten paths returned `200 text/html` (the 949-byte SPA shell), while the control `/api/healthz-smoke-528856326-a` returned `200 application/json` (33 bytes). VRTX3-I-0006 derives the same fix shape correctly from source and then asserts Nitro returns "its default 404" — the one claim of its many that re-verification broke. That is the contract working as designed (an unresolved path is handed to the SPA), and it means the route table cannot be probed by status code no matter how well-evidenced the report. Confirm a route compiled by looking for its module under `.output/server/_routes/api/`.

### 2026-08-21 — Sprint VRTX3-S-0002 (`smoke-bugfix-17873246012078034`): Three Missing Health Probes

Added `routes/api/healthz-smoke-bugfix-158202122.ts`, `healthz-smoke-bugfix2-142310404.ts`, `healthz-smoke-bugfix3-834560860.ts` and their colocated tests — 6 new files, 0 modified source files, no dependency change. Probe-family count under [Routing](#routing) updated 100 → 103, re-counted from the filesystem rather than incremented (206 `.ts` files under `routes/api/` at planning, 212 once this sprint lands).

`## Key Decisions` is unchanged. The "Health probes duplicate, on purpose" entry governs this sprint as written, and the decomposition is again what the entry predicts: three defects, each owning exactly two new files, no `depends_on` edge between any pair, and the one file set they could have collided on — the three root docs carrying the probe count — held exclusively by the planning ticket and moved 100 → 103 once for the sprint rather than 100 → 101 three times. The copy-source ambiguity recorded against the entry since VRTX3-S-0027 produced a second harmless near-miss: VRTX3-I-0005 named a directory neighbour (`healthz-smoke-bugfix3-351014898.test.ts`) rather than the pinned `528856326` pair, but the neighbour postdates VRTX3-S-0011 and is shape-identical, so the substitution cost nothing. The 47 legacy tests carrying the flaky wall-clock case are never rewritten, so the ratio dilutes (47 of 103) while the per-sample odds stay near even — the mitigation is working, not retiring.

One routing note re-confirmed by live measurement rather than inheritance: an unmatched `/api/*` path is answered by the SPA `index.html` shell with `200 text/html`, so the filename-is-the-URL contract has no negative signal. A route that does not exist and a route that does are indistinguishable by status code; only the response body and `Content-Type` separate them. See [AGENTS.md](./AGENTS.md#gotchas).

### 2026-08-20 — Sprint VRTX3-S-0033: Three Independent Health Check Endpoints (189360772)

Added `routes/api/healthz-smoke-189360772-a.ts`, `-b.ts`, `-c.ts` and their colocated tests — 6 new files, 0 modified source files, no dependency change. Probe-family count under [Routing](#routing) updated 97 → 100, re-counted from the filesystem rather than incremented. The build-output example under [Routing](#routing) now uses this sprint's route rather than VRTX3-S-0028's, so the illustration names a file that exists.

The filename-is-the-URL contract was re-measured live before implementation for the twenty-first consecutive sprint: all three unwritten paths returned `200 text/html` (the 949-byte SPA shell), while the control `/api/healthz-smoke-528856326-a` returned `200 application/json` (33 bytes). Nothing about routing, the Vitest projects or CI changed — `nitro({ serverDir: "./", ignore: ["**/*.test.ts"] })` registers each new handler by filename and keeps its colocated test out of the server bundle, and the `server` Vitest project collects `routes/**/*.test.ts` with no configuration.

`## Key Decisions` is unchanged: the "Health probes duplicate, on purpose" entry already governs this sprint, and at 100 probes (203 `.ts` files under `routes/api/` once this sprint lands, from 197 at planning) its cost/benefit reads the same — the files never change after they land, and the ownership map for each new probe still overlaps nothing. Two observations bound the entry rather than reopen it. First, the copy-source ambiguity recorded against it since VRTX3-S-0027 did not bite: VRTX3-I-0040 named the pinned `528856326` pair itself and restated the reasoning behind the pointer, which is the first time an upstream document has carried the rationale rather than the instruction. That is the mitigation working, not the risk retiring — the 47 legacy tests carrying the flaky wall-clock case are never rewritten, so the ratio dilutes (47 of 100) while the per-sample odds stay near even. Second, the decision's stated benefit is again what the decomposition was built on: three TASKs with two-file ownership maps, no `depends_on` edge between any pair, and the only file set they could have collided on — the three root docs carrying the probe count — held exclusively by the planning ticket and moved 97 → 100 once for the sprint rather than 97 → 98 three times.

### 2026-08-20 — Sprint VRTX3-S-0030: Bugfix Sprint – Two Missing Health Probes (`-ha` family)

Added `routes/api/healthz-smoke-bugfix-ha-853006542.ts`, `routes/api/healthz-smoke-bugfix-ha2-165600260.ts` and their colocated tests — 4 new files, 0 modified source files, no dependency change. Probe-family count under [Routing](#routing) updated 95 → 97, re-counted from the filesystem rather than incremented.

The filename-is-the-URL contract was re-measured live before implementation for the twentieth consecutive sprint: both unwritten paths returned `200 text/html` (the 949-byte SPA shell) rather than the reported `404`, while the control `/api/healthz-smoke-528856326-a` returned `200 application/json` (33 bytes). The same session established a second consequence of that contract, which the defect reports had blurred: the working control requested **without** its `/api/` prefix also returns the SPA shell. The prefix is part of the URL the filename produces (`routes/api/x.ts` → `/api/x`), so a prefix-less probe path is not a different route — it is no route. Both this sprint's reports named their paths without the prefix; that is report shorthand, not a routing defect and not a second route family to support.

`## Key Decisions` is unchanged: the "Health probes duplicate, on purpose" entry already governs this sprint, and at 97 probes (197 `.ts` files under `routes/api/` once this sprint lands, from 193 at planning) its cost/benefit reads the same — the files never change after they land, and the ownership map for each new probe still overlaps nothing. The copy-source ambiguity recorded against that entry for the last two sprints did not arise here for a structural reason worth noting: neither defect has an idea canvas behind it, so nothing named a template file and there was nothing to sample. The mitigation is documentary and it only binds when an upstream document points somewhere; where no document exists, the pinned pointer in [AGENTS.md](./AGENTS.md#health-probe-routes) is the sole source, which is the cheaper case, not a riskier one.

### 2026-08-20 — Sprint VRTX3-S-0028: Three Independent Health Check Endpoints (458730798)

Added `routes/api/healthz-smoke-458730798-a.ts`, `-b.ts`, `-c.ts` and their colocated tests — 6 new files, 0 modified source files, no dependency change. Probe-family count under [Routing](#routing) updated 92 → 95, re-counted from the filesystem rather than incremented. The build-output example under [Routing](#routing) now uses this sprint's route rather than VRTX3-S-0027's, so the illustration names a file that exists.

The filename-is-the-URL contract was re-measured live before implementation for the nineteenth consecutive sprint: all three unwritten paths returned `200 text/html` (the 949-byte SPA shell) rather than `404`, while the control `/api/healthz-smoke-528856326-a` returned `200 application/json` (33 bytes). That is the contract working as designed — an unresolved path is handed to the SPA — but it means the route table cannot be probed by status code. Confirm a route compiled by looking for its module under `.output/server/_routes/api/`.

`## Key Decisions` is unchanged: the "Health probes duplicate, on purpose" entry already governs this sprint, and at 95 probes (193 `.ts` files under `routes/api/` once this sprint lands, from 187 at planning) its cost/benefit reads the same — the files never change after they land, and the ownership map for each new probe still overlaps nothing. The consequence of family size recorded against that entry last sprint came due this sprint, which is worth noting because it bounds the decision rather than reopening it. VRTX3-S-0027 observed that a directory this large invites an idea canvas to sample a neighbour instead of the documented copy source, and that the sampled neighbour happened to be harmless; VRTX3-I-0037 sampled `healthz-smoke-302960562-a.test.ts`, which carries the flaky wall-clock assertion, and propagated it as far as one of its own acceptance criteria. The mitigation stays documentary (see [AGENTS.md](./AGENTS.md#health-probe-routes)) and the decision stands: the realized cost is a copy-source ambiguity that a pinned pointer resolves in one line of a plan, whereas factoring the family into a shared handler would convert every future probe into a shared-file edit — the exact coupling the probes exist to disprove, and a cost paid on every sprint rather than occasionally.

### 2026-08-19 — Sprint VRTX3-S-0027: Three Independent Health Check Endpoints (868033827)

Added `routes/api/healthz-smoke-868033827-a.ts`, `-b.ts`, `-c.ts` and their colocated tests — 6 new files, 0 modified source files, no dependency change. Probe-family count under [Routing](#routing) updated 89 → 92, re-counted from the filesystem rather than incremented. The build-output example under [Routing](#routing) now uses this sprint's route rather than VRTX3-S-0026's, so the illustration names a file that exists.

The filename-is-the-URL contract was re-measured live before implementation for the eighteenth consecutive sprint: all three unwritten paths returned `200 text/html` (the 949-byte SPA shell) rather than `404`, while the control `/api/healthz-smoke-528856326-a` returned `200 application/json` (33 bytes). That is the contract working as designed — an unresolved path is handed to the SPA — but it means the route table cannot be probed by status code. Confirm a route compiled by looking for its module under `.output/server/_routes/api/`.

`## Key Decisions` is unchanged: the "Health probes duplicate, on purpose" entry already governs this sprint, and at 92 probes (190 `.ts` files under `routes/api/` once this sprint lands, from 184 at planning) its cost/benefit reads the same — the files never change after they land, and the ownership map for each new probe still overlaps nothing. One consequence of the family's size showed up again this sprint and is worth recording against that entry: at 92 probes the directory is large enough that the idea canvas sampled a neighbour (`healthz-smoke-1065915107-c.test.ts`) instead of the documented copy source. That neighbour happened to be shape-identical, so the substitution cost nothing — but the sampling mechanism is the same one that pulled a flaky wall-clock assertion into VRTX3-S-0017's idea, and 47 of the 92 probe tests still carry it. The mitigation stays documentary (see [AGENTS.md](./AGENTS.md#health-probe-routes)) rather than structural, because shrinking the family by factoring out a shared handler would trade a copy-source ambiguity for the shared-file edits the probes exist to disprove.

### 2026-08-19 — Sprint VRTX3-S-0026: Three Independent Health Check Endpoints (888240601)

Added `routes/api/healthz-smoke-888240601-a.ts`, `-b.ts`, `-c.ts` and their colocated tests — 6 new files, 0 modified source files, no dependency change. Probe-family count under [Routing](#routing) updated 86 → 89, re-counted from the filesystem rather than incremented. The build-output example under [Routing](#routing) now uses this sprint's route rather than VRTX3-S-0023's, so the illustration names a file that exists.

The filename-is-the-URL contract was re-measured live before implementation for the seventeenth consecutive sprint: all three unwritten paths returned `200 text/html` (the 949-byte SPA shell) rather than `404`, while the control `/api/healthz-smoke-528856326-a` returned `200 application/json` (33 bytes). That is the contract working as designed — an unresolved path is handed to the SPA — but it means the route table cannot be probed by status code. Confirm a route compiled by looking for its module under `.output/server/_routes/api/`.

`## Key Decisions` is unchanged: the "Health probes duplicate, on purpose" entry already governs this sprint, and at 89 probes (184 `.ts` files under `routes/api/` once this sprint lands, from 178 at planning) its cost/benefit reads the same — the files never change after they land, and the ownership map for each new probe still overlaps nothing. Worth noting against that entry that the decision's stated benefit is what the sprint was decomposed around, not just a side effect: three TASKs with two-file ownership maps, no `depends_on` edge between any pair, and the one file set they could have collided on (the three root docs carrying the probe count) held exclusively by the planning ticket.

### 2026-08-16 — Sprint VRTX3-S-0024: Bugfix Sprint – Three Missing Health Probes

Added `routes/api/healthz-smoke-bugfix-27681476.ts`, `healthz-smoke-bugfix2-107364458.ts`, `healthz-smoke-bugfix3-351014898.ts` and their colocated tests — 6 new files, 0 modified source files, no dependency change. Probe-family count under [Routing](#routing) updated 83 → 86, re-counted from the filesystem rather than incremented.

The filename-is-the-URL contract was re-measured live before implementation for the sixteenth consecutive sprint: all three unwritten paths returned `200 text/html` (the 949-byte SPA shell) rather than `404`, while the control `/api/healthz-smoke-528856326-a` returned `200 application/json` (33 bytes). That is the contract working as designed — an unresolved path is handed to the SPA — but it means the route table cannot be probed by status code. Confirm a route compiled by looking for its module under `.output/server/_routes/api/`.

`## Key Decisions` is unchanged: the "Health probes duplicate, on purpose" entry already governs this sprint, and at 86 probes (174 `.ts` files under `routes/api/` once this sprint lands, from 168 at planning) its cost/benefit reads the same — the files never change after they land, and the ownership map for each new probe still overlaps nothing. This sprint is the cleanest illustration yet: three defects, three disjoint two-file ownership maps, no `depends_on` between any of them.

### 2026-08-14 — Sprint VRTX3-S-0023: Three Independent Health Check Endpoints (1065915107)

Added `routes/api/healthz-smoke-1065915107-a.ts`, `-b.ts`, `-c.ts` and their colocated tests — 6 new files, 0 modified source files, no dependency change. Probe-family count under [Routing](#routing) updated 80 → 83, re-counted from the filesystem rather than incremented, and the build-output naming example refreshed to a route from this sprint.

The filename-is-the-URL contract was re-measured live before implementation for the fifteenth consecutive sprint: all three unwritten paths returned `200 text/html` (the 949-byte SPA shell) rather than `404`, while the control `/api/healthz-smoke-528856326-a` returned `200 application/json` (33 bytes). That is the contract working as designed — an unresolved path is handed to the SPA — but it means the route table cannot be probed by status code. Confirm a route compiled by looking for its module under `.output/server/_routes/api/`.

`## Key Decisions` is unchanged: the "Health probes duplicate, on purpose" entry already governs this sprint, and at 83 probes (169 `.ts` files under `routes/api/` once this sprint lands, from 163 at planning) its cost/benefit reads the same — the files never change after they land, and the ownership map for each new probe still overlaps nothing.

### 2026-08-11 — Sprint VRTX3-S-0022: Three Independent Health Check Endpoints (600965021)

Added `routes/api/healthz-smoke-600965021-a.ts`, `-b.ts`, `-c.ts` and their colocated tests — 6 new files, 0 modified source files, no dependency change. Probe-family count under [Routing](#routing) updated 77 → 80, re-counted from the filesystem rather than incremented, and the build-output naming example refreshed to a route from this sprint.

The filename-is-the-URL contract was re-measured live before implementation for the fourteenth consecutive sprint: all three unwritten paths returned `200 text/html` (the 949-byte SPA shell) rather than `404`, while the control `/api/healthz-smoke-528856326-a` returned `200 application/json` (33 bytes). That is the contract working as designed — an unresolved path is handed to the SPA — but it means the route table cannot be probed by status code. Confirm a route compiled by looking for its module under `.output/server/_routes/api/`.

`## Key Decisions` is unchanged: the "Health probes duplicate, on purpose" entry already governs this sprint, and at 80 probes (162 `.ts` files under `routes/api/` once this sprint lands, from 156 at planning) its cost/benefit reads the same — the files never change after they land, and the ownership map for each new probe still overlaps nothing.

### 2026-08-11 — Sprint VRTX3-S-0021: Three Independent Health Check Endpoints (568557289)

Added `routes/api/healthz-smoke-568557289-a.ts`, `-b.ts`, `-c.ts` and their colocated tests — 6 new files, 0 modified source files, no dependency change. Probe-family count under [Routing](#routing) updated 74 → 77, re-counted from the filesystem rather than incremented, and the build-output naming example refreshed to a route from this sprint.

The filename-is-the-URL contract was re-measured live before implementation for the thirteenth consecutive sprint: all three unwritten paths returned `200 text/html` (the 949-byte SPA shell) rather than `404`, while the control `/api/healthz-smoke-528856326-a` returned `200 application/json` (33 bytes). That is the contract working as designed — an unresolved path is handed to the SPA — but it means the route table cannot be probed by status code. Confirm a route compiled by looking for its module under `.output/server/_routes/api/`.

`## Key Decisions` is unchanged: the "Health probes duplicate, on purpose" entry already governs this sprint, and at 77 probes (156 `.ts` files under `routes/api/`, counted at sprint close) its cost/benefit reads the same — the files never change after they land, and the ownership map for each new probe still overlaps nothing.

### 2026-08-11 — Sprint VRTX3-S-0020: Bugfix Sprint – Three Missing Health Probes

Added `routes/api/healthz-smoke-bugfix-1060413982.ts`, `healthz-smoke-bugfix2-521525844.ts`, `healthz-smoke-bugfix3-287868165.ts` and their colocated tests — 6 new files, 0 modified source files, no dependency change. Probe-family count under [Routing](#routing) updated 71 → 74, re-counted from the filesystem rather than incremented.

The filename-is-the-URL contract was re-measured live before implementation for the twelfth consecutive sprint: all three unwritten paths returned `200 text/html` (the SPA shell) rather than `404`, while a written control returned `200 application/json`. That is the contract working as designed — an unresolved path is handed to the SPA — but it means the route table cannot be probed by status code. Confirm a route compiled by looking for its module under `.output/server/_routes/api/`.

### 2026-08-11 — Sprint VRTX3-S-0019: Three Independent Health Check Endpoints (472035881)

Added `routes/api/healthz-smoke-472035881-a.ts`, `-b.ts`, `-c.ts` and their colocated tests — 6 new files, 0 modified source files, no dependency change. Probe-family count under [Routing](#routing) updated 68 → 71, re-counted from the filesystem rather than incremented, and the build-output naming example refreshed to a route from this sprint.

No architectural change. Nothing in the stack, data model, deployment path or [Key Decisions](#key-decisions) moved; the no-shared-helper decision recorded in VRTX3-S-0011 governs this sprint and was applied as written — three disjoint two-file ownership maps, no `depends_on` between them.

### 2026-08-10 — Sprint VRTX3-S-0018: Bugfix Sprint – Three Missing Health Probes

Added `routes/api/healthz-smoke-bugfix-699186705.ts`, `healthz-smoke-bugfix2-502272230.ts`, `healthz-smoke-bugfix3-850084489.ts` and their colocated tests — 6 new files, 0 modified source files, no dependency change. Probe-family count under [Routing](#routing) updated 65 → 68, re-counted from the filesystem rather than incremented.

No architectural change. Nothing in the stack, data model, deployment path or [Key Decisions](#key-decisions) moved; the no-shared-helper decision recorded in VRTX3-S-0011 governs this sprint and was applied as written — three disjoint two-file ownership maps, no `depends_on` between them. The filename-is-the-URL contract is also the root cause of all three defects: no registration step means a file that was never written is a path that was never registered, with the SPA fallback as the only symptom.

### 2026-08-10 — Sprint VRTX3-S-0017: Three Independent Health Check Endpoints (238855431)

Added `routes/api/healthz-smoke-238855431-a.ts`, `-b.ts`, `-c.ts` and their colocated tests — 6 new files, 0 modified source files, no dependency change. Probe-family count under [Routing](#routing) updated 62 → 65, re-counted from the filesystem rather than incremented, and the build-output naming example refreshed to a route from this sprint.

No architectural change. Nothing in the stack, data model, deployment path or [Key Decisions](#key-decisions) moved; the no-shared-helper decision recorded in VRTX3-S-0011 governs this sprint and was applied as written — three disjoint two-file ownership maps, no `depends_on` between them.

One consequence of that decision is now visible and worth recording against it: the family is large enough (65 handlers, 65 tests, 131 files in `routes/api/`) that **new work samples the directory instead of the documented template**. This sprint's idea named a pre-VRTX3-S-0011 test file, carrying a flaky wall-clock assertion, as the pattern to copy — a drift mechanism that arrives with scale, not with any individual mistake. The mitigation stays documentary rather than structural (see [AGENTS.md](./AGENTS.md#health-probe-routes)): factoring out a shared handler to shrink the family would trade a copy-source ambiguity for the shared-file edits the probes exist to disprove. Worth revisiting only if probe retention is ever decided.

### 2026-08-10 — Sprint VRTX3-S-0016: Three Independent Health Check Endpoints (756246354)

Added `routes/api/healthz-smoke-756246354-a.ts`, `-b.ts`, `-c.ts` and their colocated tests — 6 new files, 0 modified source files, no dependency change. Probe-family count under [Routing](#routing) updated 59 → 62, re-counted from the filesystem rather than incremented, and the build-output naming example refreshed to a route from this sprint.

No architectural change. Nothing in the stack, data model, deployment path or [Key Decisions](#key-decisions) moved; the no-shared-helper decision recorded in VRTX3-S-0011 governs this sprint and was applied as written — three disjoint two-file ownership maps, no `depends_on` between them.

Worth recording against the [Routing](#routing) contract: the filename-is-the-URL property was re-measured live before implementation, and all three unwritten paths returned `200 text/html` (the SPA shell) rather than `404`. That is the contract working as designed — Nitro resolves `/api/<name>` purely from the presence of `routes/api/<name>.ts`, and an unresolved path is handed to the SPA — but it means the route table cannot be probed by status code. Confirm a route compiled by looking for its module under `.output/server/_routes/api/`.

### 2026-08-10 — Sprint VRTX3-S-0015: Bugfix Sprint – Three Missing Health Probes

Added `routes/api/healthz-smoke-bugfix-406186407.ts`, `healthz-smoke-bugfix2-487405332.ts`, `healthz-smoke-bugfix3-418626414.ts` and their colocated tests — 6 new files, 0 modified, no dependency change.

**Corrected a stale count in [Routing](#routing):** the probe-family figure read 53 files while the tree held 56. VRTX3-S-0014 bumped the count in `AGENT.md` and `PRODUCT.md` but missed this doc, so the number had been wrong for a sprint. Re-counted from the filesystem rather than incremented from the previous value, and now reads 59 (56 existing + this sprint's 3).

No architectural change. Nothing in the stack, data model, deployment path or [Key Decisions](#key-decisions) moved; the no-shared-helper decision recorded in VRTX3-S-0011 governs this sprint and was applied as written — three disjoint two-file ownership maps, no `depends_on` between them.

### 2026-08-09 — Sprint VRTX3-S-0013: Three Independent Health Check Endpoints (841017405)

Added `routes/api/healthz-smoke-841017405-a.ts`, `-b.ts`, `-c.ts` and their colocated tests — 6 new files, 0 modified, no dependency change. Probe-family count under [Routing](#routing) updated 50 → 53, and the build-output naming example refreshed to a route from this sprint.

No architectural change. Nothing in the stack, data model, deployment path or [Key Decisions](#key-decisions) moved; the no-shared-helper decision recorded in VRTX3-S-0011 already governs this sprint and was applied as written. Versions were re-read from `package.json` rather than carried forward and match what is documented under [Stack](#stack) — ESLint 10.7, Playwright `~1.60.0`, Vitest 4.1, Nitro `^3.0.260610-beta`.

### 2026-08-09 — Sprint VRTX3-S-0012: Bugfix Sprint – Three Missing Health Probes

Added `routes/api/healthz-smoke-bugfix-6202295.ts`, `healthz-smoke-bugfix2-433928318.ts`, `healthz-smoke-bugfix3-196651982.ts` and their colocated tests — 6 new files, 0 modified, no dependency change. Probe-family count under [Routing](#routing) updated 47 → 50.

No architectural change. The three defects were all the same missing-artifact class: Nitro 3 resolves `/api/<name>` purely from the presence of `routes/api/<name>.ts`, so a file that was never written is a path that was never registered — which is exactly the filename-is-the-URL contract already recorded under [Routing](#routing), working as designed.

### 2026-08-09 — Sprint VRTX3-S-0011: Three Independent Health Check Endpoints (528856326)

Added `routes/api/healthz-smoke-528856326-a.ts`, `-b.ts`, `-c.ts` and their colocated tests — 6 new files, 0 modified, no dependency change. Documented the probe family as an explicit interface contract under [Routing](#routing) (handler shape, filename-is-the-URL, build-output naming), and recorded the deliberate no-shared-helper choice in [Key Decisions](#key-decisions) so it stops being re-litigated each sprint.

Version corrections measured from `package.json` rather than carried forward: ESLint is **10**, not 9; Playwright is pinned to **`~1.60.0`**, not `~1.50.0` as the Key Decisions table claimed. Concrete versions for the whole stack are now listed once under [Stack](#stack).

### 2026-08-05 — Sprint VRTX3-S-0006: Three Independent Health Check Endpoints

Added three completely independent health-check endpoints to `routes/api/`: `/healthz-smoke-913793173-a`, `/healthz-smoke-913793173-b`, `/healthz-smoke-913793173-c`. Each endpoint is a completely standalone file with matching integration tests, demonstrating parallel development without code sharing. Validates the pattern established in prior sprints (SPRINT-0004, SPRINT-0005, SPRINT-0007, SPRINT-0019, VRTX3-S-0002, VRTX3-S-0003, VRTX3-S-0001). Shows scalability of file-based routing for adding multiple independent features concurrently.

### 2026-08-02 — Sprint VRTX3-S-0004: Three Independent Health Check Endpoints

Added three independent health check endpoints to `routes/api/`: `/healthz-smoke-680958919-a`, `/healthz-smoke-680958919-b`, `/healthz-smoke-680958919-c`. Each endpoint is a completely standalone file with matching integration tests, demonstrating parallel development without code sharing. Validates the pattern established in SPRINT-0019 (SPRINT-0004, SPRINT-0005, SPRINT-0007) health check endpoints. Shows scalability of file-based routing for adding multiple independent features concurrently.

### 2026-07-26 — Sprint SPRINT-0019: Three Independent Health Check Endpoints

Added three independent health check endpoints to `routes/api/`: `/healthz-smoke-302960562-a`, `/healthz-smoke-302960562-b`, `/healthz-smoke-302960562-c`. Each endpoint is a completely standalone file with matching integration tests, demonstrating parallel development without code sharing. Validates the pattern established in SPRINT-0004, SPRINT-0005, SPRINT-0007 health check endpoints. Shows scalability of file-based routing for adding multiple independent features concurrently.

### 2026-07-26 — Sprint SPRINT-0007: Health Check Endpoint

Added `/healthz-smoke-cancel-569985850` endpoint to `routes/api/` with matching test in `routes/api/healthz-smoke-cancel-569985850.test.ts`. Demonstrates simple, self-contained GET endpoint pattern with no middleware or database dependencies. Third example of the health check pattern.

### 2026-07-26 — Sprint SPRINT-0005: Health Check Endpoint

Added `/healthz-smoke-cancel-158110053` endpoint to `routes/api/` with matching test in `routes/api/healthz-smoke-cancel-158110053.test.ts`. Demonstrates simple, self-contained GET endpoint pattern with no middleware or database dependencies. Second example of the health check pattern.

### 2026-07-26 — Sprint SPRINT-0004: Health Check Endpoint

Added `/healthz-smoke-cancel-407995880` endpoint to `routes/api/` with matching test in `routes/api/healthz-smoke-cancel-407995880.test.ts`. Demonstrates simple, self-contained GET endpoint pattern with no middleware or database dependencies.

### 2026-07-26 — Bootstrap sprint

Initial architecture documentation. Stack: React 19, Vite 8, Nitro 3, TypeScript 5, SQLite + Drizzle ORM, Tailwind CSS v4, shadcn-style primitives, Vitest + Playwright. File-based routing on frontend (vite-plugin-pages + react-router) and backend (Nitro H3). SQLite persistence in `db/`, migrations in `drizzle/`. Full test harness (unit, component, API integration, E2E smoke). GitHub Actions CI on `vortex/**` branches. Project requires Bun runtime for `bun:sqlite` support.
