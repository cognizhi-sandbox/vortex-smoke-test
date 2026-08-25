# Design — three independent health probes for variant 613529736

## Context

Read from the working tree at planning time, on `vortex/sprint/vrtx3-s-0042-8239c37c` at
`e281ced`.

- `routes/api/` holds **263 entries / 266 `.ts` files**: 130 `healthz-smoke-*` handlers, 130
  colocated tests, `hello.ts`, `hello.test.ts`, and a `users/` directory (one entry, four files).
  Counted from the filesystem, not incremented from the previous sprint. Both figures are given
  because they differ and previous sprints used them interchangeably: 130 + 130 + 2 + 1 = 263
  entries, and the same set counted recursively = 266 files.
- **Nothing matching `613529736` exists.** `grep -rl 613529736` across the repo (excluding
  `node_modules`, `.git`, `artifacts`) returns no matches, so there is no name collision on any of
  the three paths.
- Pre-sprint test-file count, for the Integration QA baseline:
  `git ls-tree -r --name-only HEAD | grep -cE '^(src|routes).*\.test\.(ts|tsx)$'` → **137**.
  Adding three probe tests makes the expected post-sprint total **140**.
- Routing needs no wiring: `nitro({ serverDir: "./", ignore: ["**/*.test.ts"] })` in
  `vite.config.ts:29` registers a route by filename, and the Vitest `server` project
  (`environment: "node"`, `include: ["routes/**/*.test.ts"]`) already collects the colocated tests.
- CI (`.github/workflows/ci.yml`) runs on `vortex/**`, `dev` and `main` and needs no change — new
  route files are picked up by glob.

### Measured — the filename-is-the-URL contract, thirty-second consecutive confirmation

The dev server bound **`:5002`** in this container (read from the Vite banner — `Port 5000 is in
use, trying another one...`, then the same for `:5001`; the port is per-container, so no other
agent's number is reusable).

| Path                                       | Status | Content-Type                     | Body              |
| ------------------------------------------ | ------ | -------------------------------- | ----------------- |
| `/api/healthz-smoke-613529736-a`           | 200    | `text/html; charset=utf-8`       | SPA shell         |
| `/api/healthz-smoke-613529736-b`           | 200    | `text/html; charset=utf-8`       | SPA shell         |
| `/api/healthz-smoke-613529736-c`           | 200    | `text/html; charset=utf-8`       | SPA shell         |
| `/api/healthz-smoke-528856326-a` (control) | 200    | `application/json;charset=UTF-8` | `{"ok":true,...}` |

An unrouted `/api/*` path answers `200 text/html`, so **the status code cannot distinguish a
working endpoint from a missing one**. Every scenario in the delta spec therefore asserts on the
body and content type.

VRTX3-I-0051 states this correctly and unprompted — "a missing `/api/*` path returns `200
text/html`, not `404`, so absence is invisible to a status-code check" — and its Technical
Approach shows the `%{content_type}` form of the check rather than a bare status assertion. The
measurement was taken anyway, because the question it answers — does the file exist in _this_
working tree — is not something a canvas observes.

## Decisions

### D1 — Three tickets, not one

Each probe is one handler plus one test, and the three ownership sets are disjoint, so there is no
`depends_on` edge between any pair. Merging them independently and in any order **is** the product
property this family exists to demonstrate (`ARCHITECTURE.md` § Key Decisions, "Health probes
duplicate, on purpose"). Collapsing them into one ticket would deliver the same six files and
demonstrate nothing.

### D2 — Copy the pinned `healthz-smoke-528856326-a` pair, and nothing else

47 of the 130 probe tests carry `expect(elapsed).toBeLessThan(100)`. They are indistinguishable
from safe siblings by filename. `AGENTS.md` § Health Probe Routes pins the `528856326` pair as the
copy source; both halves were read at planning and are clean — the handler is 7 lines, the test
carries a single body assertion and zero `toBeLessThan` calls.

VRTX3-I-0051 names that same pinned pair, in both its Solution and its Technical Approach, and
states that it diffed both halves while the canvas was written. That check was repeated here and
agrees. This is the **third fully correct pointer** (after VRTX3-I-0040 and VRTX3-I-0044) and the
first in which the canvas reports having diffed both halves itself rather than naming a file and
leaving the verification downstream. It does not make the check skippable: confirming a correct
pointer costs the same one diff per named file that catches a wrong one, and the governing number
is the 47 legacy tests — now 47 of 130 — which are never rewritten.

A wall-clock assertion is rejected on its merits as well as by the pin: these handlers perform no
I/O by construction (single import `nitro/h3`, no `db/`, no `event.context` read), so a timing case
measures the runtime, not the code. The delta spec states the no-I/O property as an import-and-body
inspection scenario instead.

### D3 — No root document is updated, and the canvas's contrary instruction is stale

None of the three triggers fires. `PRODUCT.md` already carries the `health-probes` capability line
and describes the family without counting it; `ARCHITECTURE.md` § Routing states the
filename-is-the-URL contract and pins its build-output example to the never-rotating `528856326`
copy source; `DESIGN.md` covers the design system, which an API route does not touch. Adding a
131st, 132nd and 133rd instance of a documented contract moves none of them.

VRTX3-I-0051's AC-8 says otherwise: "the only permitted modification anywhere is the probe-count
line in AGENTS.md and ARCHITECTURE.md, owned by the planning ticket", and its Affected Code section
names "`ARCHITECTURE.md` § Routing + Changelog" as a planning-owned edit. **There is no such line
to edit.** The count was removed from both `PRODUCT.md` and `ARCHITECTURE.md` two sprints ago and
the removal was promoted to `ARCHITECTURE.md` § Key Decisions as "Root docs carry no per-sprint
counts", citing change `vrtx3-i-0049-smoke-178767328680848-3-independent-endpoints-50`. The canvas
is describing a register that was retired after it was last written down.

This is a form of canvas drift the series has not recorded before, and it is worth separating from
the copy-source drift it sits beside. On the copy source VRTX3-I-0051 is _correct_ (D2) — the
staleness is not a quality signal about this canvas, it is a structural consequence of an idea
being authored against documentation that changed underneath it. The rule that follows is the same
one D2 reaches by a different route: verify each instruction against the working tree, because a
canvas reports the repository as it was when someone read it.

`AGENTS.md` § Health Probe Routes still opens "a family of 124 near-identical GET probes"; the
filesystem says 130. That file is human-authored and is never rewritten by an agent, so the
correction is recorded in `.vortex/agents-generated.md` instead. Nothing is promoted to
`ARCHITECTURE.md` § Key Decisions this sprint: the decision that governs the omission is already
recorded, and a second copy is a copy nobody maintains.

### D4 — Requirements are per probe, not one shared requirement

Three requirements, one per path, each with its own scenarios. A shared "all probes" requirement
would make any single ticket's QA verdict depend on its siblings, which contradicts D1. This also
keeps the delta additive: three `## ADDED Requirements` blocks, restating none of the 130
requirement sets already in `openspec/specs/health-probes/spec.md`.

## Test-harness phase

No harness work. The tiers that cover this change already exist and need no configuration change:

- **Unit (server project).** `vitest.config.ts` collects `routes/**/*.test.ts` under
  `environment: "node"`. Each new `.test.ts` constructs a real `H3Event` and calls the module's
  default export — no live server. Expected file count moves 137 → 140.
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
missing. This change edits no markdown outside `openspec/changes/`, `artifacts/` and
`.vortex/agents-generated.md`, and adds no new relative link to a root document.

## Risks

- **Stale variant string.** The most likely defect is a copied file still returning `528856326`.
  Each colocated test asserts the exact body, so it fails in the unit tier rather than shipping.
- **Wrong-file edit.** `routes/api/` holds 263 entries and the names differ by digits. Each ticket's
  ownership map lists exactly two paths, both new, and its Definition of Done includes adding
  exactly two files and modifying none.
- **Legacy copy source.** Covered by D2.
- **Acting on the canvas's root-doc instruction.** Covered by D3 — following AC-8 would mean
  editing a count that no longer exists in either document.
