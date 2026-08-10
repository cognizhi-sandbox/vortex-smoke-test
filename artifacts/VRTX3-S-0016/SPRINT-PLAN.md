# Sprint Plan — VRTX3-S-0016

**Title:** Three Independent Health Check Endpoints (756246354)
**Idea:** VRTX3-I-0025 — `[smoke-178638048177502] 3 independent endpoints (756246354)` (enhancement)
**Planning ticket:** VRTX3-T-0105
**Created:** 2026-08-10

---

## Goal

Ship three standalone Nitro health probes — `GET /api/healthz-smoke-756246354-a`, `-b` and `-c` — each answering with `Content-Type: application/json` and a body deep-equal to `{ "ok": true, "variant": "756246354" }`.

The endpoints are the visible deliverable. The _point_ of the sprint is the second-order one the idea states in its success metrics: three unrelated units of work get picked up, built, tested and merged **in parallel**, with file-ownership maps that do not intersect at a single line. Nothing shared, nothing to coordinate, nothing to conflict.

---

## Codebase findings (Stage 0)

Read this sprint: `routes/api/` (119 files), `vite.config.ts`, `vitest.config.ts`, `package.json`, `.github/workflows/ci.yml`, and the four root docs. Everything below is measured, not carried forward.

**The pattern already exists 59 times over.** Measured: `ls routes/api/ | grep '^healthz-smoke.*\.ts$' | grep -v '\.test\.ts$' | wc -l` → **59** handlers, plus 59 colocated tests. `routes/api/` holds 60 non-test route files in total; the only non-probe route at the top level is `hello.ts` (`routes/api/users/` holds the dynamic-route example). `routes/api/healthz-smoke-528856326-a.ts` is the whole shape, verbatim:

```ts
import { defineHandler } from "nitro/h3";

export default defineHandler(() => {
  return {
    ok: true,
    variant: "528856326",
  };
});
```

Eight lines, one import, no `event` parameter, no method guard.

**Nothing named `756246354` exists yet.** `ls routes/api/ | grep 756246354` returns nothing — the change is purely additive: six new files, zero modified source files.

**The SPA-fallback baseline was re-measured on a live dev server this sprint, not cited.** Against `bun run dev` on port 5000:

| Path                                | Status | `Content-Type`                   | Body                                |
| ----------------------------------- | ------ | -------------------------------- | ----------------------------------- |
| `/api/healthz-smoke-756246354-a`    | `200`  | `text/html; charset=utf-8`       | `<!doctype html>…` (the SPA shell)  |
| `/api/healthz-smoke-756246354-b`    | `200`  | `text/html; charset=utf-8`       | `<!doctype html>…`                  |
| `/api/healthz-smoke-756246354-c`    | `200`  | `text/html; charset=utf-8`       | `<!doctype html>…`                  |
| `/api/healthz-smoke-528856326-a` ✅ | `200`  | `application/json;charset=UTF-8` | `{"ok":true,"variant":"528856326"}` |

This is the eighth consecutive sprint to confirm it. A missing `/api/*` path is **indistinguishable from a working one by status code** — so every verification in this sprint asserts on the body and `Content-Type`, never on a status code or a `404 → 200` transition. The idea canvas states this correctly rather than asserting a `404`, so there is nothing to correct upstream this time.

**Routing needs no registration.** `vite.config.ts` sets `nitro({ serverDir: "./", ignore: ["**/*.test.ts"] })`. Files under `routes/api/` become `/api/*` by filename alone — so a filename typo is a wrong URL with no other symptom — and `*.test.ts` is kept out of the server bundle. Neither config file changes this sprint; a change to either would silently break these routes and the other 59.

**The test harness is already wired.** `vitest.config.ts` defines two projects: `client` (jsdom, `exclude: [… "routes/**"]`) and `server` (`environment: "node"`, `include: ["routes/**/*.test.ts"]`). The split exists because `routes/**` tests can reach `db/client.ts`, which imports the Bun builtin `bun:sqlite` that jsdom cannot externalize. A new colocated `routes/api/*.test.ts` is collected with zero configuration.

**Two test idioms exist in the directory; copy the newer one.** `routes/api/healthz-smoke-528856326-a.test.ts` is the current single-assertion shape:

```ts
import { H3Event } from "nitro/h3";
import { describe, expect, it } from "vitest";

import healthzA from "./healthz-smoke-528856326-a";

describe("GET /api/healthz-smoke-528856326-a", () => {
  it("returns HTTP 200 with correct response body", async () => {
    const event = new H3Event(new Request("http://localhost/api/healthz-smoke-528856326-a"));

    const result = await healthzA(event);

    expect(result).toEqual({ ok: true, variant: "528856326" });
  });
});
```

Pre-VRTX3-S-0011 probe tests (e.g. `healthz-smoke-913793173-a.test.ts`) carry a second `responds in under 100ms` case. It is machine-dependent, a known CI-flake source, and was deliberately dropped. `AGENT.md` § Health Probe Routes already names the `528856326` pair as the sanctioned copy source with an explicit note not to propagate the timing case — that pointer, added in VRTX3-S-0013, has now held for three sprints.

**CI is already correct.** `.github/workflows/ci.yml` triggers on `push` **and** `pull_request` to `["vortex/**", dev, main]` and runs, under `oven-sh/setup-bun`: `bun install` → `bun run typecheck` → `bun run lint` → `bun run test` → `bun run build`. It needs no change for this sprint.

**`middleware/auth.ts` still runs.** It executes before _every_ handler and sets `event.context.user`. "No auth" in this idea means the handlers must not _read_ it (unlike `routes/api/hello.ts`, which does) — not that the middleware is bypassed.

**Root doc counts are consistent at 59** across `AGENT.md` § Health Probe Routes (line 155), `ARCHITECTURE.md` § Routing (line 56) and `PRODUCT.md` § Features (line 55), each verified against the filesystem this sprint. The stale-count drift that VRTX3-S-0015 corrected has not recurred.

---

## Target state of the root docs

Brought to target state on the planning ticket branch (VRTX3-T-0105), before any TASK exists. Per the team contract these are the planner's exclusive responsibility and appear in **no** TASK's scope.

- **AGENT.md** — probe-family count 59 → 62 under `## Conventions → Health Probe Routes`; the `528856326` copy-source pointer and the no-shared-helper rule stand unchanged. `## Gotchas` records that the SPA-fallback baseline was re-measured for an _enhancement_ this sprint (no incoming `404` claim to debunk), so the trap is now confirmed for both sprint shapes. Changelog entry.
- **PRODUCT.md** — `## Features → Health probe endpoints`: count 59 → 62 and the "most recent set" pointer moved to the `756246354` family. Scope, user stories and per-probe acceptance criteria unchanged — this sprint adds instances of an existing feature, not a new feature. Changelog entry.
- **ARCHITECTURE.md** — `## Routing → Health probe route contract`: count 59 → 62; build-output naming example refreshed to a route from this sprint. `## Key Decisions` unchanged (the no-shared-helper decision already governs). Changelog entry.
- **DESIGN.md** — Changelog entry only; the sprint is backend-only and touches nothing in `src/`.

All three counts were re-derived from the filesystem (59 measured + 3 added = 62), not incremented blind.

---

## Implementation phases

One phase = one TASK candidate. Phases 1–3 are the sprint's only tickets; phases 4 and 5 are the mandatory harness and CI phases, which resolve to _no ticket_ because the work already exists in the repo — recorded here so the next planner does not re-derive them.

### Phase 1 — `GET /api/healthz-smoke-756246354-a`

Create `routes/api/healthz-smoke-756246354-a.ts` (copy `healthz-smoke-528856326-a.ts`, change the variant string) and `routes/api/healthz-smoke-756246354-a.test.ts` (copy `healthz-smoke-528856326-a.test.ts`, change the import path, imported binding, `describe` title, request URL and expected variant). Two new files, nothing modified.

### Phase 2 — `GET /api/healthz-smoke-756246354-b`

Identical, for `-b`. Two new files, nothing modified.

### Phase 3 — `GET /api/healthz-smoke-756246354-c`

Identical, for `-c`. Two new files, nothing modified.

### Phase 4 — Test harness (mandatory phase) — **no ticket; folded into phases 1–3**

The harness already exists and needs no extension: the `server` Vitest project (`environment: "node"`, `include: ["routes/**/*.test.ts"]`) picks up a new colocated `routes/api/*.test.ts` with zero configuration, and `nitro({ ignore: ["**/*.test.ts"] })` keeps it out of the production bundle. No fixture, helper or setup file is needed — a probe test imports its own handler and nothing else. Each ticket's test is therefore an acceptance criterion of the ticket that implements the handler, not separate work.

The one harness-shaped decision this sprint carries: the new tests use the **single-assertion** shape (body only), not the older two-case shape with `expect(elapsed).toBeLessThan(100)`. Wall-clock assertions on a shared CI runner are flaky and prove nothing about the contract.

### Phase 5 — CI (mandatory phase) — **no ticket; no change required**

`.github/workflows/ci.yml` already triggers on `push` and `pull_request` to `["vortex/**", dev, main]`, so this sprint's three ticket branches, the sprint branch and the mini-PRs all get check runs:

```yaml
on:
  push:
    branches: ["vortex/**", dev, main]
  pull_request:
    branches: ["vortex/**", dev, main]
```

It runs, under `oven-sh/setup-bun`: `bun install` → `bun run typecheck` → `bun run lint` → `bun run test` → `bun run build`. Those entry commands are recorded in AGENT.md `## Build & run` / `## Test & validate`. Adding a probe adds one more file to a scan that is already wired — there is nothing to change and no ticket is created.

Branch protection with required status checks on `vortex/sprint/*` and `vortex/feat/*` remains a human-configured, unclaimed hardening step (noted in AGENT.md Gotchas).

---

## Ticket map

| Phase | Ticket       | Type                  | Owns                                                   |
| ----- | ------------ | --------------------- | ------------------------------------------------------ |
| —     | VRTX3-T-0106 | EPIC                  | container — closes by rollup                           |
| —     | VRTX3-T-0107 | STORY                 | container — closes by rollup                           |
| 1     | VRTX3-T-0108 | TASK (implementation) | `routes/api/healthz-smoke-756246354-a.ts` + `.test.ts` |
| 2     | VRTX3-T-0109 | TASK (implementation) | `routes/api/healthz-smoke-756246354-b.ts` + `.test.ts` |
| 3     | VRTX3-T-0110 | TASK (implementation) | `routes/api/healthz-smoke-756246354-c.ts` + `.test.ts` |
| 4     | —            | —                     | folded into 1–3                                        |
| 5     | —            | —                     | no change required                                     |

**No `depends_on` between any of the three.** Their ownership maps are disjoint — six files, each owned by exactly one ticket, no shared file anywhere in the repo. Sequencing them would defeat the sprint's stated purpose.

### Why three tickets and not one

A single agent could plainly write six files in one session, and the minimum-viable-backlog instinct is to merge. Not here. The idea's third user story ("As an **engineer picking up one probe**, I want it to share no code with its siblings, so I can build, test and merge it without waiting on or conflicting with anyone else") and its third success metric ("**Zero merge conflicts between the three tickets** — the parallel-independence property this probe family exists to demonstrate") make the three-way independence _the deliverable_. Merging into one ticket would ship the endpoints and drop the thing being tested. Every prior sprint of this shape (SPRINT-0019, VRTX3-S-0004, VRTX3-S-0006, VRTX3-S-0011, VRTX3-S-0013) decomposed the same way.

### What was deliberately not ticketed

- **A test ticket** — the colocated test is an acceptance criterion of the TASK that writes the handler.
- **A CI or config ticket** — phase 5 requires no change; `vite.config.ts` and `vitest.config.ts` already cover new probe files.
- **A doc-count ticket** — the 59 → 62 bump lives in AGENT.md / ARCHITECTURE.md / PRODUCT.md, which are the planner's exclusive responsibility and were brought to target state on this planning ticket before any TASK existed.
- **A verification ticket** — the live body-and-`Content-Type` check is a criterion on each implementing TASK; the merged-branch E2E pass belongs to Validation at INTEGRATION_QA.

---

## Risks & assumptions

- **Low risk overall.** Six new files, zero modified source files, no dependency added, no schema or migration, nothing in `src/`, no contract change for any existing consumer.
- **A missing route is invisible by status code.** Re-measured live this sprint (table above): each of the three target paths currently returns `200 text/html`, the control returns `200 application/json`. Compounding it: a probe's unit test imports the handler module _directly_, so it passes even if Nitro never registered the path. Only a live request that checks the **body and `Content-Type`** proves the route is wired — which is why every TASK carries that as an explicit criterion.
- **Copy-paste variant drift is the one realistic failure.** The whole change is copied files; a stale `variant` value or a filename left over from the source is the mistake that actually happens. The per-endpoint body assertion catches it — provided the test is updated when copied, not just the handler.
- **Copying the wrong source file is the second.** Copying `routes/api/hello.ts` instead of a probe would introduce an `event.context.user` read and break the probe when auth is unavailable; copying a pre-VRTX3-S-0011 probe test drags in the flaky timing assertion. Both are pinned in each ticket's PLAN.md by naming the exact source file.
- **The idea's method-agnostic line is correct and is planned to.** These handlers declare no method guard, so every verb returns the same 200 JSON body — measured in VRTX3-S-0008 against a control route. The idea records this under Out of Scope rather than misstating it, so the TASKs simply require that no method guard be added. Adding a 405 to three routes would leave them inconsistent with the other 59.
- **Assumption:** `variant` is the string `"756246354"` for all three, matching every sibling — not a number, and not per-suffix.
- **Assumption:** `middleware/auth.ts` stays a permissive stub. Real rejecting auth would break all 62 probes without any probe file changing.
- **Standing risk:** with 62 near-identical probes committed, an engineer will eventually be tempted to factor out a shared handler. That would convert every future probe from a zero-overlap ticket into a shared-file edit — the exact thing these probes exist to disprove. Recorded in ARCHITECTURE.md § Key Decisions so it stops being re-litigated.
- **Retention is still unanswered.** No probe has ever been retired; the family grows ~3 per sprint (59 → 62 this sprint), and `routes/api/` now holds 125 files. Not a blocker for this sprint; carried as an `improvement`-labelled backlog TASK rather than decided here.
