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
└── package.json
```

## Routing

**Frontend**: `src/pages/**/*.tsx` → routes (`about.tsx` → `/about`, `[id].tsx` → `/:id`, `[...all].tsx` → catch-all). `*.test.tsx` excluded via `Pages({ exclude })` in `vite.config.ts`.

**Backend**: `routes/api/*.ts` → `/api/*`, `middleware/*.ts` runs first and can set `event.context`. Requires `nitro({ serverDir: "./" })` in `vite.config.ts` — default is `false` (no scanning). `*.test.ts` excluded via `nitro({ ignore })`.

### Health probe route contract

`routes/api/healthz-smoke-*.ts` (109 files) each export a single default `defineHandler` from `nitro/h3` that takes no parameters and returns a literal `{ ok: true, variant: "<id>" }`. No `event` access, no imports beyond `nitro/h3`, no method guard — so every HTTP verb gets the same body (see [AGENTS.md](./AGENTS.md#gotchas)). The filename **is** the URL contract: `routes/api/x.ts` → `/api/x`, with no registration step, so a filename typo is a wrong URL with no other symptom.

`bun run build` emits one module per route under `.output/server/_routes/api/`, dashes converted to underscores — `/api/healthz-smoke-189360772-a` → `.output/server/_routes/api/healthz_smoke_189360772_a.mjs`. That output is how you confirm a route compiled into the production server; the colocated `*.test.ts` files are excluded from it by `nitro({ ignore })`.

## Data Flow Example

`GET /api/hello`: `middleware/auth.ts` sets `event.context.user` → `routes/api/hello.ts` reads it and responds. `routes/api/users/[id].ts` shows the dynamic-route + `createError()` 404 pattern, backed by a real query against `db/client.ts`'s Drizzle instance.

## Database

`db/schema.ts` defines Drizzle tables; `db/client.ts` opens the SQLite connection, runs pending migrations from `drizzle/`, and seeds two demo users if the table is empty. Routes import `db` and the table objects directly (see `routes/api/users/`) — no repository layer.

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

| Decision                                | Rationale                                                                                                                                                                                                                                                                                                                                                                                                                    |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **React 19**                            | Latest stable, ESM-first, better hooks ergonomics, Suspense for data fetching                                                                                                                                                                                                                                                                                                                                                |
| **Vite 8**                              | Industry-standard bundler, HMR speed, first-class TypeScript support, ESM-native config                                                                                                                                                                                                                                                                                                                                      |
| **Nitro 3**                             | Full-stack with React SPA in same repo, zero-config routing, H3 middleware system                                                                                                                                                                                                                                                                                                                                            |
| **SQLite + Drizzle**                    | SQLite needs no separate database server (file-local), Drizzle provides type-safe ORM without runtime overhead, migrations committed alongside code                                                                                                                                                                                                                                                                          |
| **Bun runtime**                         | `bun:sqlite` is the Bun native driver; Bun's speed and TypeScript support reduce dev/prod friction. Requirement: dev, test, and production must all run under Bun.                                                                                                                                                                                                                                                           |
| **Tailwind CSS v4**                     | CSS-first design (no JS config file), performance, design tokens via custom properties, ecosystem of plugins                                                                                                                                                                                                                                                                                                                 |
| **shadcn-style primitives**             | Radix + CVA patterns decouple styled primitives from app logic, supports composition + polymorphism, smaller bundle than full component library                                                                                                                                                                                                                                                                              |
| **Playwright**                          | Cross-browser E2E, pinned to `~1.60.0` to match QA container Chromium, snapshot testing support, fast iteration                                                                                                                                                                                                                                                                                                              |
| **Health probes duplicate, on purpose** | Each `routes/api/healthz-smoke-*.ts` repeats ~8 lines rather than sharing a factory. A shared helper would make every probe a shared-file edit, which is exactly what the probes exist to disprove — they are the repo's standing evidence that independent units of work merge in parallel without conflict. Cost is bounded (the file never changes after it lands); benefit is a zero-overlap ownership map every sprint. |

---

## Changelog

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
