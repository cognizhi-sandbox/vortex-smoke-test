# Sprint Plan — VRTX3-S-0017

**Title:** Three Independent Health Check Endpoints (238855431)
**Idea:** VRTX3-I-0026 — `[smoke-178640410236175] 3 independent endpoints (238855431)` (enhancement)
**Planning ticket:** VRTX3-T-0115
**Created:** 2026-08-10

---

## Goal

Ship three standalone Nitro health probes — `GET /api/healthz-smoke-238855431-a`, `-b` and `-c` — each answering with `Content-Type: application/json` and a body deep-equal to `{ "ok": true, "variant": "238855431" }`.

The endpoints are the visible deliverable. The _point_ of the sprint is the second-order one the idea states in its success metrics: three unrelated units of work get picked up, built, tested and merged **in parallel**, with file-ownership maps that do not intersect at a single line. Nothing shared, nothing to coordinate, nothing to conflict.

---

## Codebase findings (Stage 0)

Read this sprint: `routes/api/` (125 files), `vite.config.ts`, `vitest.config.ts`, `package.json`, `.github/workflows/ci.yml`, and the four root docs. Everything below is measured against the working tree, not carried forward from a prior plan.

**The pattern already exists 62 times over.** Measured: `ls routes/api/healthz-smoke-*.ts | grep -v '\.test\.ts$' | wc -l` → **62** handlers, plus 62 colocated tests. `routes/api/` holds 63 non-test route files in total; the only non-probe route at the top level is `hello.ts` (`routes/api/users/` holds the dynamic-route example). `routes/api/healthz-smoke-528856326-a.ts` is the whole shape, verbatim:

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

**Nothing named `238855431` exists yet.** `ls routes/api | grep 238855431` returns nothing — the change is purely additive: six new files, zero modified source files.

**The SPA-fallback baseline was re-measured on a live dev server this sprint, not cited.** Against `bun run dev` (which bound to port 5005 in this container, 5000 being taken):

| Path                                | Status | `Content-Type`                   | Body                                |
| ----------------------------------- | ------ | -------------------------------- | ----------------------------------- |
| `/api/healthz-smoke-238855431-a`    | `200`  | `text/html; charset=utf-8`       | `<!doctype html>…` (the SPA shell)  |
| `/api/healthz-smoke-238855431-b`    | `200`  | `text/html; charset=utf-8`       | `<!doctype html>…`                  |
| `/api/healthz-smoke-238855431-c`    | `200`  | `text/html; charset=utf-8`       | `<!doctype html>…`                  |
| `/api/healthz-smoke-528856326-a` ✅ | `200`  | `application/json;charset=UTF-8` | `{"ok":true,"variant":"528856326"}` |

Ninth consecutive sprint to confirm it, and the second on an enhancement with no incoming `404` claim to debunk. A missing `/api/*` path is **indistinguishable from a working one by status code** — so every verification in this sprint asserts on the body and `Content-Type`, never on a status code or a `404 → 200` transition. The idea canvas states this correctly rather than asserting a `404`, so there is nothing to correct upstream this time.

**The idea's named test copy-source is the wrong one — this is the one real correction this sprint.** The canvas says to model the tests on `routes/api/healthz-smoke-126862920-c.test.ts`. That file carries a **second `expect(elapsed).toBeLessThan(100)` case**, measured directly:

```ts
it("responds in under 100ms", async () => { … expect(elapsed).toBeLessThan(100); });
```

47 of the 62 probe tests still carry it; it is machine-dependent, a known CI-flake source, and was deliberately dropped in VRTX3-S-0011. `AGENT.md` § Health Probe Routes names the **`528856326` pair** as the sanctioned copy source with an explicit note not to propagate the timing case — a pointer that has now held for four sprints. The idea's own Risks section agrees ("Prefer body assertions; keep any timing assertion generous or omit it"), and its acceptance criterion asks for a test "asserting the exact response body" — which the single-assertion shape satisfies exactly. **Planned to `528856326-a.test.ts`; the timing case is omitted.** This is the first time an idea canvas has pointed at a timing-assertion test, so each TASK's PLAN.md pins the copy source by filename rather than repeating the canvas pointer.

**Routing needs no registration.** `vite.config.ts` sets `nitro({ serverDir: "./", ignore: ["**/*.test.ts"] })`. Files under `routes/api/` become `/api/*` by filename alone — so a filename typo is a wrong URL with no other symptom — and `*.test.ts` is kept out of the server bundle. Neither config file changes this sprint; a change to either would silently break these routes and the other 62.

**The test harness is already wired.** `vitest.config.ts` defines two projects: `client` (jsdom, `exclude: [… "routes/**"]`) and `server` (`environment: "node"`, `include: ["routes/**/*.test.ts"]`). The split exists because `routes/**` tests can reach `db/client.ts`, which imports the Bun builtin `bun:sqlite` that jsdom cannot externalize. A new colocated `routes/api/*.test.ts` is collected with zero configuration.

**CI is already correct.** `.github/workflows/ci.yml` triggers on `push` **and** `pull_request` to `["vortex/**", dev, main]` and runs, under `oven-sh/setup-bun`: `bun install` → `bun run typecheck` → `bun run lint` → `bun run test` → `bun run build`. It needs no change for this sprint.

**`middleware/auth.ts` still runs.** It executes before _every_ handler and sets `event.context.user`. "No auth" in this idea means the handlers must not _read_ it (unlike `routes/api/hello.ts`, which does) — not that the middleware is bypassed.

**Root doc counts are consistent at 62** across `AGENT.md` § Health Probe Routes (line 155), `ARCHITECTURE.md` § Routing (line 56) and `PRODUCT.md` § Features (line 55), each verified against the filesystem this sprint. The stale-count drift that VRTX3-S-0015 corrected has not recurred.

---

## Target state of the root docs

Brought to target state on the planning ticket branch (VRTX3-T-0115), before any TASK exists. Per the team contract these are the planner's exclusive responsibility and appear in **no** TASK's scope.

- **AGENT.md** — probe-family count 62 → 65 under `## Conventions → Health Probe Routes`; the `528856326` copy-source pointer is strengthened to say that an idea canvas may name an older, timing-assertion test and the pointer outranks it. `## Gotchas` records the ninth SPA-fallback confirmation. Changelog entry.
- **PRODUCT.md** — `## Features → Health probe endpoints`: count 62 → 65 and the "most recent set" pointer moved to the `238855431` family. Scope, user stories and per-probe acceptance criteria unchanged — this sprint adds instances of an existing feature, not a new feature. Changelog entry.
- **ARCHITECTURE.md** — `## Routing → Health probe route contract`: count 62 → 65; build-output naming example refreshed to a route from this sprint. `## Key Decisions` unchanged (the no-shared-helper decision already governs). Changelog entry.
- **DESIGN.md** — Changelog entry only; the sprint is backend-only and touches nothing in `src/`.

All three counts were re-derived from the filesystem (62 measured + 3 added = 65), not incremented blind.

---

## Implementation phases

One phase = one TASK candidate. Phases 1–3 are the sprint's only tickets; phases 4 and 5 are the mandatory harness and CI phases, which resolve to _no ticket_ because the work already exists in the repo — recorded here so the next planner does not re-derive them.

### Phase 1 — `GET /api/healthz-smoke-238855431-a`

Create `routes/api/healthz-smoke-238855431-a.ts` (copy `healthz-smoke-528856326-a.ts`, change the variant string) and `routes/api/healthz-smoke-238855431-a.test.ts` (copy `healthz-smoke-528856326-a.test.ts`, change the import path, imported binding, `describe` title, request URL and expected variant). Two new files, nothing modified.

### Phase 2 — `GET /api/healthz-smoke-238855431-b`

Identical, for `-b`. Two new files, nothing modified.

### Phase 3 — `GET /api/healthz-smoke-238855431-c`

Identical, for `-c`. Two new files, nothing modified.

### Phase 4 — Test harness (mandatory phase) — **no ticket; folded into phases 1–3**

The harness already exists and needs no extension: the `server` Vitest project (`environment: "node"`, `include: ["routes/**/*.test.ts"]`) picks up a new colocated `routes/api/*.test.ts` with zero configuration, and `nitro({ ignore: ["**/*.test.ts"] })` keeps it out of the production bundle. No fixture, helper or setup file is needed — a probe test imports its own handler and nothing else. Each ticket's test is therefore an acceptance criterion of the ticket that implements the handler, not separate work.

The one harness-shaped decision this sprint carries: the new tests use the **single-assertion** shape (body only) from `healthz-smoke-528856326-a.test.ts`, **not** the two-case shape in the canvas-named `healthz-smoke-126862920-c.test.ts`, which adds `expect(elapsed).toBeLessThan(100)`. Wall-clock assertions on a shared CI runner are flaky and prove nothing about the contract. See Codebase findings for the full reasoning; each PLAN.md pins the source file by name so the canvas pointer cannot leak in.

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
| —     | VRTX3-T-0116 | EPIC                  | container — closes by rollup                           |
| —     | VRTX3-T-0117 | STORY                 | container — closes by rollup                           |
| 1     | VRTX3-T-0118 | TASK (implementation) | `routes/api/healthz-smoke-238855431-a.ts` + `.test.ts` |
| 2     | VRTX3-T-0119 | TASK (implementation) | `routes/api/healthz-smoke-238855431-b.ts` + `.test.ts` |
| 3     | VRTX3-T-0120 | TASK (implementation) | `routes/api/healthz-smoke-238855431-c.ts` + `.test.ts` |
| 4     | —            | —                     | folded into 1–3                                        |
| 5     | —            | —                     | no change required                                     |

**No `depends_on` between any of the three.** Their ownership maps are disjoint — six files, each owned by exactly one ticket, no shared file anywhere in the repo. Sequencing them would defeat the sprint's stated purpose.

### Why three tickets and not one

A single agent could plainly write six files in one session, and the minimum-viable-backlog instinct is to merge. Not here. The idea's second user story ("As an **engineer picking up a leaf task**, I want each endpoint to be entirely self-contained, so I can build and merge mine in parallel with the other two without a conflict or a rebase") and its third success metric ("delivered as three independent changes with **zero merge conflicts**") make the three-way independence _the deliverable_. Merging into one ticket would ship the endpoints and drop the thing being tested. Every prior sprint of this shape (SPRINT-0019, VRTX3-S-0004, VRTX3-S-0006, VRTX3-S-0011, VRTX3-S-0013, VRTX3-S-0016) decomposed the same way.

### What was deliberately not ticketed

- **A test ticket** — the colocated test is an acceptance criterion of the TASK that writes the handler.
- **A CI or config ticket** — phase 5 requires no change; `vite.config.ts` and `vitest.config.ts` already cover new probe files.
- **A doc-count ticket** — the 62 → 65 bump lives in AGENT.md / ARCHITECTURE.md / PRODUCT.md, which are the planner's exclusive responsibility and were brought to target state on this planning ticket before any TASK existed.
- **A verification ticket** — the live body-and-`Content-Type` check is a criterion on each implementing TASK; the merged-branch E2E pass belongs to Validation at INTEGRATION_QA.

---

## Risks & assumptions

- **Low risk overall.** Six new files, zero modified source files, no dependency added, no schema or migration, nothing in `src/`, no contract change for any existing consumer.
- **A missing route is invisible by status code.** Re-measured live this sprint (table above): each of the three target paths currently returns `200 text/html`, the control returns `200 application/json`. Compounding it: a probe's unit test imports the handler module _directly_, so it passes even if Nitro never registered the path. Only a live request that checks the **body and `Content-Type`** proves the route is wired — which is why every TASK carries that as an explicit criterion.
- **The canvas's test copy-source would reintroduce a known flake.** `healthz-smoke-126862920-c.test.ts`, named in the idea, carries `expect(elapsed).toBeLessThan(100)`. Each PLAN.md names `healthz-smoke-528856326-a.test.ts` instead and states the omission explicitly, so an engineer following the ticket cannot land the timing case by following the canvas.
- **Copy-paste variant drift is the one realistic implementation failure.** The whole change is copied files; a stale `variant` value or a filename left over from the source is the mistake that actually happens. The per-endpoint body assertion catches it — provided the test is updated when copied, not just the handler.
- **Copying the wrong handler source is the second.** Copying `routes/api/hello.ts` instead of a probe would introduce an `event.context.user` read and break the probe when auth is unavailable. Pinned in each ticket's PLAN.md by naming the exact source file.
- **The idea's method-agnostic line is correct and is planned to.** These handlers declare no method guard, so every verb returns the same 200 JSON body — measured in VRTX3-S-0008 against a control route. The idea records this under Out of Scope rather than misstating it, so the TASKs simply require that no method guard be added. Adding a 405 to three routes would leave them inconsistent with the other 62.
- **Assumption:** `variant` is the string `"238855431"` for all three, matching every sibling — not a number, and not per-suffix.
- **Assumption:** `middleware/auth.ts` stays a permissive stub. Real rejecting auth would break all 65 probes without any probe file changing.
- **Standing risk:** with 65 near-identical probes committed, an engineer will eventually be tempted to factor out a shared handler. That would convert every future probe from a zero-overlap ticket into a shared-file edit — the exact thing these probes exist to disprove. Recorded in ARCHITECTURE.md § Key Decisions so it stops being re-litigated.
- **Retention is still unanswered, and re-raising it has stopped being useful.** No probe has ever been retired; the family grows ~3 per sprint (62 → 65 this sprint), and `routes/api/` now holds 131 files. The idea's own Open Questions raise it as a non-blocking working assumption. A retention-policy backlog TASK has been raised **three times** — VRTX3-T-0074 (VRTX3-S-0011), VRTX3-T-0089 (VRTX3-S-0013), VRTX3-T-0111 (VRTX3-S-0016) — and **cancelled unworked every time**, as was VRTX3-T-0104, which proposed removing the flaky `responds in under 100ms` assertion from the 47 legacy probe tests. Raising a fourth identical placeholder would add a paid dispatch and change nothing, so this sprint deliberately raises **no** `improvement` ticket and records the question here instead. It needs a human decision, not another ticket. Note the second-order cost, now visible in this sprint's findings: because those 47 legacy tests were never cleaned up, they remain the majority shape in the directory, which is why an idea canvas sampled one as the template.
