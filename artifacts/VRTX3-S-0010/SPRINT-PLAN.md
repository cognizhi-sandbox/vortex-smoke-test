# Sprint Plan — VRTX3-S-0010

**Title:** Three Independent Health Check Endpoints (46132092)

**Idea:** VRTX3-I-0018 — [smoke-178623971489113] 3 independent endpoints (46132092)

**Planning ticket:** VRTX3-T-0061

**Created:** 2026-08-09

---

## Goal

Ship three completely independent health-check endpoints — `/api/healthz-smoke-46132092-a`,
`-b` and `-c` — each returning exactly `{ ok: true, variant: "46132092" }`, as **three
file-disjoint units of work that can be built in parallel with zero merge conflicts and zero
cross-task coordination**.

The endpoints themselves are trivial. The thing this sprint is actually measuring is the
parallelism: three engineers, three worktrees, six new files, no shared module, no rebase.

---

## Codebase findings

Everything below was read or measured directly in the repository on 2026-08-09, not carried
over from a previous sprint's notes.

### The routing is already wired — nothing to build

`vite.config.ts:29` runs:

```ts
nitro({ serverDir: "./", ignore: ["**/*.test.ts"] }),
```

`serverDir: "./"` makes Nitro scan `routes/` and `middleware/` at the project root, so **any
file dropped into `routes/api/` is registered automatically**. `ignore` keeps `*.test.ts` out
of the production bundle. No config change is required by this sprint, and none is permitted.

### The endpoint shape already exists 45 times over

`routes/api/` currently holds **91 files — 45 handlers and 46 tests**. The exemplar to copy,
`routes/api/healthz-smoke-913793173-a.ts`, is eight lines end to end:

```ts
import { defineHandler } from "nitro/h3";

export default defineHandler(() => {
  return {
    ok: true,
    variant: "913793173",
  };
});
```

Nitro serialises the returned object, sets `Content-Type: application/json` and returns 200 —
the handler declares none of that itself.

### The test harness already exists

`routes/api/healthz-smoke-913793173-a.test.ts` constructs a real `H3Event` around a `Request`,
calls the handler directly, and asserts the exact body. `vitest.config.ts` splits tests into a
`client` project (jsdom, excludes `routes/**`) and a **`server` project (`environment: "node"`,
`include: ["routes/**/\*.test.ts"]`)\*\*. A test placed anywhere else would run under jsdom and
fail differently.

### The names are free

`grep -rl "46132092"` across the repository (excluding `node_modules`/`.git`) returns **no
hits**. `-46132092-a`, `-b` and `-c` are unused.

### Measured wiring behaviour — the trap, re-confirmed by direct measurement

Against `bun run dev` on port 5000, 2026-08-09:

| Path                             | Status | Content-Type                     | Body                                |
| -------------------------------- | ------ | -------------------------------- | ----------------------------------- |
| `/api/healthz-smoke-46132092-a`  | `200`  | `text/html; charset=utf-8`       | `<!doctype html>…` — the SPA shell  |
| `/api/healthz-smoke-46132092-b`  | `200`  | `text/html; charset=utf-8`       | `<!doctype html>…` — the SPA shell  |
| `/api/healthz-smoke-46132092-c`  | `200`  | `text/html; charset=utf-8`       | `<!doctype html>…` — the SPA shell  |
| `/api/healthz-smoke-913793173-a` | `200`  | `application/json;charset=UTF-8` | `{"ok":true,"variant":"913793173"}` |

**A missing `/api/*` route answers `200 text/html`, not `404`.** Status code alone cannot
distinguish a working endpoint from a missing one, so every verification step in this sprint
asserts on **body + `Content-Type`**. This is the fifth consecutive sprint to confirm it
(VRTX3-S-0001, -0007, -0008, -0009 preceded); it is documented at `AGENT.md` § Gotchas.

Also measured: `POST` to the control route returns the same `200 application/json` body as
`GET`. The handlers are **method-agnostic by design** — no `405` guard is added here, or the
three new routes would be inconsistent with the other 45.

### A passing unit test does not prove the route is registered

The test imports the handler module directly, so it passes even if Nitro never mapped the
path. That is why a live-request check on body + `Content-Type` is a required acceptance
criterion on every TASK, not an optional extra.

---

## Target state

What the four root docs say after this sprint:

- **AGENT.md** — unchanged in structure. The SPA-fallback gotcha stays where it is (promoted
  out of the changelog in VRTX3-S-0009) and is re-confirmed by this sprint's own measurement.
  Two stale facts corrected against `package.json`: ESLint is **10**, not 9. A dated changelog
  entry is prepended.
- **PRODUCT.md** — the three endpoints appear in scope as delivered capability; a dated
  changelog entry is prepended. No change to problem, users or success criteria.
- **ARCHITECTURE.md** — records that the file-based backend routing pattern now carries 48
  handlers, and corrects two stale version facts against `package.json` (ESLint 10; Playwright
  pinned `~1.60.0`, not `~1.50.0`). Dated changelog entry prepended.
- **DESIGN.md** — no design-system change (backend-only). Dated changelog entry prepended
  recording that explicitly.

---

## Implementation phases

Five phases. Phases 1–3 are the three TASK candidates; phases 4 and 5 are folded into every
implementing TASK's acceptance criteria and get **no ticket of their own**.

### Phase 1 — Endpoint A (→ one TASK)

Create `routes/api/healthz-smoke-46132092-a.ts` returning `{ ok: true, variant: "46132092" }`,
plus its H3Event integration test at `routes/api/healthz-smoke-46132092-a.test.ts`. Purely
additive; two new files, no existing file touched.

### Phase 2 — Endpoint B (→ one TASK)

Identical to Phase 1 for `-b`. Owns only `routes/api/healthz-smoke-46132092-b.ts` and its test.

### Phase 3 — Endpoint C (→ one TASK)

Identical to Phase 1 for `-c`. Owns only `routes/api/healthz-smoke-46132092-c.ts` and its test.

Phases 1–3 have **disjoint file sets and no `depends_on` between them** — that is the entire
point of the sprint, not an oversight.

### Phase 4 — Test harness (MANDATORY; folded into phases 1–3, no ticket)

The harness already exists and **needs no extension for this sprint**:

- **Vitest 4** with the `server` project (`environment: "node"`, `include:
["routes/**/*.test.ts"]`) already picks up a new `routes/api/*.test.ts` with zero
  registration. Each TASK adds exactly one such file.
- **React Testing Library** — not applicable; no UI surface in this sprint.
- **Playwright ~1.60.0** (matching the QA container's Chromium) — `e2e/smoke.spec.ts` keeps
  probing `/api/hello` only. Explicitly out of scope per the idea; the live-request check in
  each TASK's acceptance criteria covers wiring.
- No new fixture, helper or setup file. Introducing a shared test helper across the three new
  tests would break the independence this sprint exists to demonstrate.

Each test follows the exemplar exactly: construct `new H3Event(new Request(url))`, call the
default-exported handler, assert `toEqual({ ok: true, variant: "46132092" })`. The exemplar
also carries a `responds in under 100ms` case — carry it over for pattern consistency, but it
is deliberately **not** an acceptance criterion: a wall-clock assertion is load-dependent and
a known flake source.

### Phase 5 — CI (MANDATORY; folded into phases 1–3, no ticket)

`.github/workflows/ci.yml` is already correct and stays untouched. Verified in place:

```yaml
on:
  push:
    branches: ["vortex/**", dev, main]
  pull_request:
    branches: ["vortex/**", dev, main]
```

It runs under `oven-sh/setup-bun@v2` and executes typecheck → lint → test → build. Because it
triggers on **both** push and pull_request for `vortex/**`, the ticket mini-PRs and the sprint
branch each get check runs, and human-configured branch protection can enforce them. The three
new route files and three new tests are picked up by the existing steps automatically — no new
job, step or workflow file. The CI entry commands are recorded in AGENT.md § Build & run.

---

## Ticket map

| Phase | Ticket       | Type  | Owns                                                        |
| ----- | ------------ | ----- | ----------------------------------------------------------- |
| —     | VRTX3-T-0062 | EPIC  | container                                                   |
| —     | VRTX3-T-0063 | STORY | container                                                   |
| 1     | VRTX3-T-0064 | TASK  | `routes/api/healthz-smoke-46132092-a.ts` + `.test.ts`       |
| 2     | VRTX3-T-0065 | TASK  | `routes/api/healthz-smoke-46132092-b.ts` + `.test.ts`       |
| 3     | VRTX3-T-0066 | TASK  | `routes/api/healthz-smoke-46132092-c.ts` + `.test.ts`       |
| 4     | (folded)     | —     | no ticket — harness already exists, ACs fold into TASKs 1–3 |
| 5     | (folded)     | —     | no ticket — CI already correct, ACs fold into TASKs 1–3     |

**Backlog size rationale.** One EPIC + one STORY + three TASKs = five tickets. The comparable
prior sprint (VRTX3-S-0006) used seven — one STORY per endpoint. Three STORYs is over-
decomposition: "three variant-tagged health endpoints are live" is a _single_ demoable
behaviour, so one STORY carries all three. The three TASKs are **not** merged, despite each
being ~8 lines of handler, because the idea's primary user story and its headline success
metric are explicitly "three file-disjoint units handed out in parallel with zero merge
conflicts" — merging them into one TASK would deliver the endpoints but not the idea.

`depends_on`: **none between the three TASKs.** Their ownership maps are provably disjoint
(each owns two files bearing its own letter), so nothing to sequence.

---

## Risks & assumptions

| Risk / assumption                                                                                           | Handling                                                                                                                                  |
| ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| A passing unit test does **not** prove Nitro registered the path — the test imports the module directly     | Live-request check on body + `Content-Type` is a required AC on every TASK                                                                |
| A `404 → 200` style check would falsely pass; unmatched `/api/*` returns `200 text/html`                    | Measured again this sprint (table above). No AC anywhere in this sprint asserts on a status code alone                                    |
| Copy-paste drift: the exemplar test carries a load-dependent `under 100ms` timing assertion                 | Carried over for pattern consistency, deliberately **not** an acceptance criterion                                                        |
| Naming collision against the 45 existing `healthz-smoke-*` handlers                                         | `grep -rl "46132092"` returns nothing as of 2026-08-09; engineers re-check before creating files                                          |
| A shared helper/factory creeping in across the three endpoints                                              | Explicitly out of scope; each TASK's AC requires that none of its files import another of the six, and that no new shared module is added |
| Regression of `nitro({ serverDir: "./" })` would silently hide all three routes behind the SPA shell        | No TASK may touch `vite.config.ts`; the live-request AC would catch it immediately                                                        |
| **Assumption:** the variant string is exactly `"46132092"` for all three, body has exactly `ok` + `variant` | Fixed as an interface contract in all three TASK descriptions                                                                             |

### Out of scope

No shared code between the endpoints (no helper, factory, constants module or
`routes/api/_healthz/` directory); no refactor of the 45 existing `healthz-smoke-*` files; no
health-check registry or auto-scan; no auth, session or database; no method guard / 405; no
frontend or UI change; no config or infra change (`vite.config.ts`, `vitest.config.ts`,
`nginx.conf`, `Dockerfile`, `ecosystem.config.js`, `.github/workflows/ci.yml` all stay as-is);
no Playwright/e2e change; no observability work; no new dependency.

---

## Related documentation

- [PRODUCT.md](../../PRODUCT.md) — what this project is
- [ARCHITECTURE.md](../../ARCHITECTURE.md) — the stack and key decisions
- [DESIGN.md](../../DESIGN.md) — the visual system
- [AGENT.md](../../AGENT.md) — operating manual, conventions, gotchas
- Prior comparable sprints: VRTX3-S-0004, VRTX3-S-0006, SPRINT-0019 (independent endpoint
  triples); VRTX3-S-0001, -0007, -0008, -0009 (the SPA-fallback lesson)
