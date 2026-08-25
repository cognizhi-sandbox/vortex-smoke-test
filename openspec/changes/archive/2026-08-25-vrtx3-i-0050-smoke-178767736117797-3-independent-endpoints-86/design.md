# Design — three independent health probes for variant 865643533

## Context

Read from the working tree at planning time, on `vortex/sprint/vrtx3-s-0041-9e5df666` at
`5288369`.

- `routes/api/` holds **257 entries**: 127 `healthz-smoke-*` handlers, 127 colocated tests,
  `hello.ts`, `hello.test.ts`, and a `users/` directory (one entry, four files). Counted from the
  filesystem, not incremented from the previous sprint.
- **Nothing matching `865643533` exists.** `grep -rl 865643533` across the repo (excluding
  `node_modules`, `.git`) returns no matches, so there is no name collision on any of the three
  paths.
- Pre-sprint test-file count, for the Integration QA baseline:
  `git ls-tree -r --name-only HEAD | grep -cE '^(src|routes).*\.test\.(ts|tsx)$'` → **134**.
  Adding three probe tests makes the expected post-sprint total **137**.
- Routing needs no wiring: `nitro({ serverDir: "./", ignore: ["**/*.test.ts"] })` in
  `vite.config.ts:29` registers a route by filename, and the Vitest `server` project
  (`environment: "node"`, `include: ["routes/**/*.test.ts"]`) already collects the colocated tests.
- CI (`.github/workflows/ci.yml`) runs on `vortex/**`, `dev` and `main` and needs no change — new
  route files are picked up by glob.

### Measured — the filename-is-the-URL contract, thirty-first consecutive confirmation

The dev server bound **`:5001`** in this container (read from the Vite banner —
`Port 5000 is in use, trying another one...`; the port is per-container, so no other agent's
number is reusable).

| Path                                       | Status | Content-Type                     | Body              |
| ------------------------------------------ | ------ | -------------------------------- | ----------------- |
| `/api/healthz-smoke-865643533-a`           | 200    | `text/html; charset=utf-8`       | SPA shell         |
| `/api/healthz-smoke-865643533-b`           | 200    | `text/html; charset=utf-8`       | SPA shell         |
| `/api/healthz-smoke-865643533-c`           | 200    | `text/html; charset=utf-8`       | SPA shell         |
| `/api/healthz-smoke-528856326-a` (control) | 200    | `application/json;charset=UTF-8` | `{"ok":true,...}` |

An unrouted `/api/*` path answers `200 text/html`, so **the status code cannot distinguish a
working endpoint from a missing one**. Every scenario in the delta spec therefore asserts on the
body and content type.

VRTX3-I-0050 is the **quiet form** of the canvas for the third sprint running (after VRTX3-I-0047
and VRTX3-I-0048): it makes no status-code claim anywhere, stating only that none of the three
paths exists today, "checked `routes/api/` for `865643533`". That is true and independently
reproducible, and it is also silent on what a request to those paths returns. The measurement was
taken anyway, because the question it answers — does the file exist in _this_ working tree — is not
something a canvas observes. Three consecutive quiet canvases is the longest such run in the
series and predicts nothing about the next one; the wrong `404` arrives through defect capture and
through careful enhancement authors alike, not as a function of canvas quality.

## Decisions

### D1 — Three tickets, not one

Each probe is one handler plus one test, and the three ownership sets are disjoint, so there is no
`depends_on` edge between any pair. Merging them independently and in any order **is** the product
property this family exists to demonstrate (`ARCHITECTURE.md` § Key Decisions, "Health probes
duplicate, on purpose"). Collapsing them into one ticket would deliver the same six files and
demonstrate nothing.

### D2 — Copy the pinned `healthz-smoke-528856326-a` pair, and nothing else

47 of the 127 probe tests carry `expect(elapsed).toBeLessThan(100)`. They are indistinguishable
from safe siblings by filename. `AGENTS.md` § Health Probe Routes pins the `528856326` pair as the
copy source; both halves were read at planning and are clean — a single body assertion, no timing
case.

VRTX3-I-0050 names `routes/api/healthz-smoke-189360772-a.test.ts` instead. That file was diffed
here: it postdates VRTX3-S-0011, carries no timing case, and is shape-identical to the pinned pair,
so this is the **seventh harmless instance** against three harmful ones. Two things about it are
worth keeping. It is the **third** canvas to name that same file (after VRTX3-I-0043 and
VRTX3-I-0047), which is what a directory-sampling heuristic looks like when it repeats — the file
is neither more nor less safe for having been named twice before, it is simply a plausible
neighbour. And the substitution again cost nothing, which is the form of this drift that teaches
least: the check that confirms a safe pointer is the same one diff that catches an unsafe one, so
reading the named file never becomes skippable. The governing number is the 47 legacy tests, now
47 of 127, which are never rewritten.

A wall-clock assertion is rejected on its merits as well as by the pin: these handlers perform no
I/O by construction (single import `nitro/h3`, no `db/`, no `event.context` read), so a timing case
measures the runtime, not the code. The delta spec states the no-I/O property as an import-and-body
inspection scenario instead.

### D3 — No root document is updated, and that is now the steady state

None of the three triggers fires. `PRODUCT.md` already carries the `health-probes` capability line
and describes the family without counting it; `ARCHITECTURE.md` § Routing states the
filename-is-the-URL contract and pins its build-output example to the never-rotating `528856326`
copy source; `DESIGN.md` covers the design system, which an API route does not touch. Adding a
127th, 128th and 129th instance of a documented contract moves none of them.

This is the first probe sprint in which "leave the root docs alone" required no edit to make true,
and it is the intended consequence of the correction made one sprint earlier — see the
`vrtx3-i-0049-smoke-178767328680848-3-independent-endpoints-50` change design § D3, promoted to
`ARCHITECTURE.md` § Key Decisions as "Root docs carry no per-sprint counts". Nothing new is
promoted this sprint: the decision is already recorded, and a second copy is a copy nobody
maintains.

### D4 — Requirements are per probe, not one shared requirement

Three requirements, one per path, each with its own scenarios. A shared "all probes" requirement
would make any single ticket's QA verdict depend on its siblings, which contradicts D1. This also
keeps the delta additive: three `## ADDED Requirements` blocks, restating none of the 127
requirements already in `openspec/specs/health-probes/spec.md`.

## Test-harness phase

No harness work. The tiers that cover this change already exist and need no configuration change:

- **Unit (server project).** `vitest.config.ts` collects `routes/**/*.test.ts` under
  `environment: "node"`. Each new `.test.ts` constructs a real `H3Event` and calls the module's
  default export — no live server. Expected file count moves 134 → 137.
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
missing. This change edits no markdown outside `openspec/changes/` and `artifacts/`, and adds no
new relative link to a root document.

## Risks

- **Stale variant string.** The most likely defect is a copied file still returning `528856326`.
  Each colocated test asserts the exact body, so it fails in the unit tier rather than shipping.
- **Wrong-file edit.** `routes/api/` holds 257 entries and the names differ by digits. Each ticket's
  ownership map lists exactly two paths, both new, and its Definition of Done includes adding
  exactly two files and modifying none.
- **Legacy copy source.** Covered by D2.
