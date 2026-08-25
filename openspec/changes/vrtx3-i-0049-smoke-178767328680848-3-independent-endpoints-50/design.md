# Design — three independent health probes for variant 503463873

## Context

Read from the working tree at planning time, on `vortex/sprint/vrtx3-s-0040-85be96ae` at
`7b4e033`.

- `routes/api/` holds **251 entries**: 124 `healthz-smoke-*` handlers, 124 colocated tests,
  `hello.ts`, `hello.test.ts`, and a `users/` directory (one entry, four files). Counted from the
  filesystem, not incremented from the previous sprint.
- **Nothing matching `503463873` exists.** `grep -rl 503463873` across the repo (excluding
  `node_modules`, `.git`) returns no matches.
- Pre-sprint test-file count, for the Integration QA baseline:
  `git ls-tree -r --name-only HEAD | grep -cE '^(src|routes).*\.test\.(ts|tsx)$'` → **131**.
  Adding three probe tests makes the expected post-sprint total **134**.
- Routing needs no wiring: `nitro({ serverDir: "./", ignore: ["**/*.test.ts"] })` in
  `vite.config.ts` registers a route by filename, and the Vitest `server` project already collects
  `routes/**/*.test.ts` under `environment: "node"`.
- CI (`.github/workflows/ci.yml`) runs on `vortex/**`, `dev` and `main` and needs no change — new
  route files are picked up by glob.

### Measured — the filename-is-the-URL contract, thirtieth consecutive confirmation

The dev server bound **`:5000`** in this container (read from the Vite banner; the port is
per-container, so no other agent's number is reusable).

| Path                                       | Status | Content-Type                     | Size              |
| ------------------------------------------ | ------ | -------------------------------- | ----------------- |
| `/api/healthz-smoke-503463873-a`           | 200    | `text/html; charset=utf-8`       | 949 B (SPA shell) |
| `/api/healthz-smoke-503463873-b`           | 200    | `text/html; charset=utf-8`       | 949 B (SPA shell) |
| `/api/healthz-smoke-503463873-c`           | 200    | `text/html; charset=utf-8`       | 949 B (SPA shell) |
| `/api/healthz-smoke-528856326-a` (control) | 200    | `application/json;charset=UTF-8` | 33 B              |

An unrouted `/api/*` path answers `200 text/html`, so **the status code cannot distinguish a
working endpoint from a missing one**. Every scenario in the delta spec therefore asserts on the
body and content type. VRTX3-I-0049 states this correctly in its own Solution section and says in
as many words that it could not measure it (no dev server was listening in its capture container);
the measurement was taken anyway, because what it answers — does the file exist in _this_ working
tree — is not something a canvas observes.

## Decisions

### D1 — Three tickets, not one

Each probe is one handler plus one test, and the three ownership sets are disjoint, so there is no
`depends_on` edge between any pair. Merging them independently and in any order **is** the product
property this family exists to demonstrate (`ARCHITECTURE.md` § Key Decisions, "Health probes
duplicate, on purpose"). Collapsing them into one ticket would deliver the same six files and
demonstrate nothing.

### D2 — Copy the pinned `healthz-smoke-528856326-a` pair, and nothing else

47 of the 124 probe tests carry `expect(elapsed).toBeLessThan(100)`. They are indistinguishable
from safe siblings by filename. `AGENTS.md` § Health Probe Routes pins the `528856326` pair as the
copy source; both halves were read at planning and are clean — a single body assertion, no timing
case.

VRTX3-I-0049 names that same pinned pair, which makes it the **third correct pointer** the family
has produced (after VRTX3-I-0040 and VRTX3-I-0044) against three that named a legacy file. The
pointer was still diffed. A correct pointer costs exactly the same one diff as a wrong one, so
reading the named file is not a step that becomes skippable when the canvas looks reliable — and
the 47 legacy tests are never rewritten, so the odds on the next canvas are unchanged by this one.

A wall-clock assertion is rejected on its merits as well as by the pin: these handlers perform no
I/O by construction (single import `nitro/h3`, no `db/`, no `event.context` read), so a timing case
measures the runtime, not the code. The delta spec states the no-I/O property as an import-and-body
inspection scenario instead.

### D3 — Remove the probe count from the root docs rather than increment it

`PRODUCT.md` carried "**Current probes:** 124 … the most recent being the three added in
VRTX3-S-0039" and `ARCHITECTURE.md` carried "`routes/api/healthz-smoke-*.ts` (124 files)". Both are
lines that must change every time one feature ships, which is exactly what a root doc must not
carry: they have been re-derived and rewritten in each of the last six sprints, and between sprints
they are a claim the documents make that is drifting toward false.

Both now describe the family without counting it, and `ARCHITECTURE.md`'s build-output example is
pinned to `528856326` — the copy source, which by construction never rotates — instead of naming
the newest variant. This is a one-time correction that makes "leave the root docs alone" the
correct outcome for every future probe sprint, and it removes the only file set the three tickets
could have collided on. Promoted to `ARCHITECTURE.md` § Key Decisions because it binds future
planning passes, not just this change.

### D4 — Requirements are per probe, not one shared requirement

Three requirements, one per path, each with its own scenarios. A shared "all probes" requirement
would make any single ticket's QA verdict depend on its siblings, which contradicts D1. This also
keeps the delta additive: three `## ADDED Requirements` blocks, restating none of the 124
requirements already in `openspec/specs/health-probes/spec.md`.

## Test-harness phase

No harness work. The tiers that cover this change already exist and need no configuration change:

- **Unit (server project).** `vitest.config.ts` collects `routes/**/*.test.ts` under
  `environment: "node"`. Each new `.test.ts` constructs a real `H3Event` and calls the module's
  default export — no live server. Expected file count moves 131 → 134.
- **Build.** The production route output under `.output/server/_routes/api/` is what proves a route
  compiled; dashes become underscores. Covered by a scenario on each requirement.
- **E2E.** Not extended. `e2e/smoke.spec.ts` covers the home page and `/api/hello`; a probe adds no
  browser-observable behaviour.

A route's unit test imports the handler module directly, so it passes even if Nitro never
registered the path. Only a live request proves the route is wired — which is why each requirement
carries both a live-response scenario and a build-output scenario.

## CI phase

No CI work. `.github/workflows/ci.yml` already triggers on `vortex/**`, `dev` and `main` and runs
doc-link check → typecheck → lint → test → build. New route files enter every one of those steps by
glob, so the three tickets inherit the gate without touching workflow configuration.

`scripts/check-doc-links.mjs` runs in CI and fails on a relative markdown link whose target is
missing — relevant here only because this change edits two root docs (D3); the edits add no new
links.

## Risks

- **Stale variant string.** The most likely defect is a copied file still returning `528856326`.
  Each colocated test asserts the exact body, so it fails in the unit tier rather than shipping.
- **Wrong-file edit.** `routes/api/` holds 251 entries and the names differ by digits. Each ticket's
  ownership map lists exactly two paths, both new, and its Definition of Done includes adding
  exactly two files and modifying none.
- **Legacy copy source.** Covered by D2.
