# Sprint Plan — VRTX3-S-0022

**Title:** Three Independent Health Check Endpoints (600965021)
**Idea:** VRTX3-I-0031 — `[smoke-178649096516451] 3 independent endpoints (600965021)` (enhancement)
**Planning ticket:** VRTX3-T-0151
**Created:** 2026-08-11

---

## Goal

Ship three standalone Nitro health probes — `GET /api/healthz-smoke-600965021-a`, `-b` and `-c` — each answering with `Content-Type: application/json` and a body deep-equal to `{ "ok": true, "variant": "600965021" }`.

The endpoints are the visible deliverable. The _point_ of the sprint is the second-order one the idea states in its success metrics: three unrelated units of work get picked up, built, tested and merged **in parallel**, with file-ownership maps that do not intersect at a single line. Nothing shared, nothing to coordinate, nothing to conflict.

---

## Codebase findings (Stage 0)

Read this sprint: `routes/api/` (156 `.ts` files), `vite.config.ts`, `vitest.config.ts`, `.github/workflows/ci.yml`, and the four root docs. Everything below is measured against this working tree, not carried forward from a prior plan.

**The pattern already exists 77 times over.** Measured: `ls routes/api/healthz-smoke-*.ts | grep -v '\.test\.ts$' | wc -l` → **77** handlers, plus 77 colocated tests (154 of the 156 files under `routes/api/`, the remainder being `hello.ts`/`hello.test.ts` and the `users/` dynamic-route example). `routes/api/healthz-smoke-528856326-a.ts` is the whole shape, verbatim:

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

**Nothing named `600965021` exists yet.** A repo-wide `grep -rn 600965021` (excluding `node_modules` and `.git`, across `.ts`/`.tsx`/`.md`/`.json`) returned zero matches — the change is purely additive: six new files, zero modified source files. These are never-written files, not typo'd filenames.

**The SPA-fallback baseline was re-measured on a live dev server this sprint, not cited.** Against `bun run dev`, which bound port **5002** in this container (the banner printed `Port 5000 is in use, trying another one...` then `Port 5001 is in use, trying another one...` — read the banner, never assume the port):

| Path                                | Status | `Content-Type`                   | Size  | Body                                |
| ----------------------------------- | ------ | -------------------------------- | ----- | ----------------------------------- |
| `/api/healthz-smoke-600965021-a`    | `200`  | `text/html; charset=utf-8`       | 949 B | `<!doctype html>…` (the SPA shell)  |
| `/api/healthz-smoke-600965021-b`    | `200`  | `text/html; charset=utf-8`       | 949 B | `<!doctype html>…`                  |
| `/api/healthz-smoke-600965021-c`    | `200`  | `text/html; charset=utf-8`       | 949 B | `<!doctype html>…`                  |
| `/api/healthz-smoke-528856326-a` ✅ | `200`  | `application/json;charset=UTF-8` | 33 B  | `{"ok":true,"variant":"528856326"}` |

**Fourteenth consecutive sprint to confirm it, and the fifth on an enhancement with no incoming `404` claim to debunk.** A missing `/api/*` path is **indistinguishable from a working one by status code** — so every verification in this sprint asserts on the body and `Content-Type`, never on a status code or a `404 → 200` transition. The idea canvas states the behaviour correctly in its own risk register rather than asserting a `404`, so there is nothing to correct upstream this time. The measurement was still taken, because a canvas getting this right is evidence about the canvas, not about the working tree — only a live request tells you whether the file exists today. See [AGENT.md § Gotchas](../../AGENT.md#gotchas).

**The idea names the correct test copy-source — the fifth time in a row.** The canvas points at `routes/api/healthz-smoke-528856326-a.test.ts` and reproduces the rule that the pointer outranks any file an idea names. Measured this sprint: **47 of the 77** probe tests still carry a second `expect(elapsed).toBeLessThan(100)` case — machine-dependent, a known CI-flake source, deliberately dropped in VRTX3-S-0011. So there is **no substitution to make this sprint**; each PLAN.md still pins the source file by name so the canonical shape cannot drift back.

The canonical test, verified from the checkout:

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

**Routing needs no registration.** `vite.config.ts` sets `nitro({ serverDir: "./", ignore: ["**/*.test.ts"] })`. Files under `routes/api/` become `/api/*` by filename alone — so a filename typo is a wrong URL with no other symptom — and `*.test.ts` is kept out of the server bundle. Neither config file changes this sprint; a change to either would silently break these routes and the other 77.

**The test harness is already wired.** `vitest.config.ts` defines two projects: `client` (jsdom, `exclude: [… "routes/**"]`) and `server` (`environment: "node"`, `include: ["routes/**/*.test.ts"]`). The split exists because `routes/**` tests can reach `db/client.ts`, which imports the Bun builtin `bun:sqlite` that jsdom cannot externalize. A new colocated `routes/api/*.test.ts` is collected with zero configuration.

**CI is already correct.** `.github/workflows/ci.yml` triggers on `push` **and** `pull_request` to `["vortex/**", dev, main]` and runs, under `oven-sh/setup-bun`: `bun install` → `bun run typecheck` → `bun run lint` → `bun run test` → `bun run build`. It needs no change for this sprint.

**`middleware/auth.ts` still runs.** It executes before _every_ handler and sets `event.context.user`. "No auth" in this idea means the handlers must not _read_ it (unlike `routes/api/hello.ts`, which does) — not that the middleware is bypassed.

**Root doc counts were consistent at 77** across `AGENT.md` § Health Probe Routes, `ARCHITECTURE.md` § Routing and `PRODUCT.md` § Features, each verified against the filesystem this sprint before being bumped. The stale-count drift that VRTX3-S-0015 corrected has not recurred.

---

## Target state of the root docs

Brought to target state on the planning ticket branch (VRTX3-T-0151), before any TASK exists. Per the team contract these are the planner's exclusive responsibility and appear in **no** TASK's scope — including the count bump, which the idea's success metrics leave unassigned but which the contract reserves to the planner.

- **AGENT.md** — probe-family count 77 → 80 under `## Conventions → Health Probe Routes`; the legacy-timing-test figure re-derived (47 of 80) and the copy-source note extended to VRTX3-I-0031. `## Gotchas` records the fourteenth SPA-fallback confirmation and appends `:5002` to the port-drift list. Changelog entry.
- **PRODUCT.md** — `## Features → Health probe endpoints`: count 77 → 80 and the "most recent set" pointer moved to the `600965021` family. Scope, user stories and per-probe acceptance criteria unchanged — this sprint adds instances of an existing feature, not a new feature. Changelog entry.
- **ARCHITECTURE.md** — `## Routing → Health probe route contract`: count 77 → 80; build-output naming example refreshed to a route from this sprint. `## Key Decisions` unchanged (the no-shared-helper decision already governs). Changelog entry.
- **DESIGN.md** — Changelog entry only; the sprint is backend-only and touches nothing in `src/`.

All three counts were re-derived from the filesystem (77 measured + 3 added = 80), not incremented blind.

---

## Implementation phases

One phase = one TASK candidate. Phases 1–3 are the sprint's only tickets; phases 4 and 5 are the mandatory harness and CI phases, which resolve to _no ticket_ because the work already exists in the repo — recorded here so the next planner does not re-derive them.

### Phase 1 — `GET /api/healthz-smoke-600965021-a`

Create `routes/api/healthz-smoke-600965021-a.ts` (copy `healthz-smoke-528856326-a.ts`, change the variant string) and `routes/api/healthz-smoke-600965021-a.test.ts` (copy `healthz-smoke-528856326-a.test.ts`, change the import path, imported binding, `describe` title, request URL and expected variant). Two new files, nothing modified.

### Phase 2 — `GET /api/healthz-smoke-600965021-b`

Identical, for `-b`. Two new files, nothing modified.

### Phase 3 — `GET /api/healthz-smoke-600965021-c`

Identical, for `-c`. Two new files, nothing modified.

### Phase 4 — Test harness (mandatory phase) — **no ticket; folded into phases 1–3**

The harness already exists and needs no extension: the `server` Vitest project (`environment: "node"`, `include: ["routes/**/*.test.ts"]`) picks up a new colocated `routes/api/*.test.ts` with zero configuration, and `nitro({ ignore: ["**/*.test.ts"] })` keeps it out of the production bundle. No fixture, helper or setup file is needed — a probe test imports its own handler and nothing else. Each ticket's test is therefore an acceptance criterion of the ticket that implements the handler, not separate work.

The one harness-shaped decision this sprint carries: the new tests use the **single-assertion** shape (body only) from `healthz-smoke-528856326-a.test.ts`. 47 of the 77 existing probe tests still carry `expect(elapsed).toBeLessThan(100)`; wall-clock assertions on a shared CI runner are flaky and prove nothing about the contract. The idea canvas names the correct source this time, so each PLAN.md simply pins it by filename rather than correcting a canvas pointer.

Playwright (`~1.60.0`) is present and wired for E2E, but this sprint adds **no** spec: the colocated Vitest integration test is the tier the entire probe family uses, and the idea puts E2E out of scope. The merged-branch E2E pass belongs to Validation at INTEGRATION_QA.

### Phase 5 — CI (mandatory phase) — **no ticket; no change required**

`.github/workflows/ci.yml` already triggers on `push` and `pull_request` to `["vortex/**", dev, main]`, so this sprint's three ticket branches, the sprint branch and the mini-PRs all get check runs:

```yaml
on:
  push:
    branches: ["vortex/**", dev, main]
  pull_request:
    branches: ["vortex/**", dev, main]
```

It runs, under `oven-sh/setup-bun`: `bun install` → `bun run typecheck` → `bun run lint` → `bun run test` → `bun run build` — building both the Vite SPA bundle and the Nitro `.output/` server. Adding a probe adds one more file to a scan that is already wired — there is nothing to change and no ticket is created.

Branch protection with required status checks on `vortex/sprint/*` and `vortex/feat/*` remains a human-configured, unclaimed hardening step.

---

## Ticket map

| Phase | Ticket       | Type                  | Owns                                                   |
| ----- | ------------ | --------------------- | ------------------------------------------------------ |
| —     | VRTX3-T-0152 | EPIC                  | container — closes by rollup                           |
| —     | VRTX3-T-0153 | STORY                 | container — closes by rollup                           |
| 1     | VRTX3-T-0154 | TASK (implementation) | `routes/api/healthz-smoke-600965021-a.ts` + `.test.ts` |
| 2     | VRTX3-T-0155 | TASK (implementation) | `routes/api/healthz-smoke-600965021-b.ts` + `.test.ts` |
| 3     | VRTX3-T-0156 | TASK (implementation) | `routes/api/healthz-smoke-600965021-c.ts` + `.test.ts` |
| 4     | —            | —                     | folded into 1–3                                        |
| 5     | —            | —                     | no change required                                     |

**No `depends_on` between any of the three.** Their ownership maps are disjoint — six files, each owned by exactly one ticket, no shared file anywhere in the repo. Sequencing them would defeat the sprint's stated purpose.

### Why three tickets and not one

A single agent could plainly write six files in one session, and the minimum-viable-backlog instinct is to merge. Not here. The idea's second user story ("As a **sprint owner**, I want each endpoint to be its own file with its own test and no shared code, so that three workers can implement them in parallel and merge in any order without conflicts") and its fourth success metric ("The three units merge in any order with **zero conflicts** — the operational proof that the independence requirement held") make the three-way independence _the deliverable_. Merging into one ticket would ship the endpoints and drop the thing being tested. Every prior sprint of this shape (SPRINT-0019, VRTX3-S-0004, VRTX3-S-0006, VRTX3-S-0011, VRTX3-S-0013, VRTX3-S-0016, VRTX3-S-0017, VRTX3-S-0019, VRTX3-S-0021) decomposed the same way.

### What was deliberately not ticketed

- **A test ticket** — the colocated test is an acceptance criterion of the TASK that writes the handler.
- **A CI or config ticket** — phase 5 requires no change; `vite.config.ts` and `vitest.config.ts` already cover new probe files.
- **A doc-count ticket** — the 77 → 80 bump lives in AGENT.md / ARCHITECTURE.md / PRODUCT.md, which are the planner's exclusive responsibility and were brought to target state on this planning ticket before any TASK existed.
- **A verification ticket** — the live body-and-`Content-Type` check is a criterion on each implementing TASK; the merged-branch E2E pass belongs to Validation at INTEGRATION_QA.
- **An `improvement` placeholder for probe retention** — see Risks; five have now been raised and cancelled unworked.

---

## Risks & assumptions

- **Low risk overall.** Six new files, zero modified source files, no dependency added, no schema or migration, nothing in `src/`, no contract change for any existing consumer.
- **A missing route is invisible by status code.** Re-measured live this sprint (table above): each of the three target paths currently returns `200 text/html` (949 B SPA shell), the control returns `200 application/json` (33 B). Compounding it: a probe's unit test imports the handler module _directly_, so it passes even if Nitro never registered the path. Only a live request that checks the **body and `Content-Type`** proves the route is wired — which is why every TASK carries that as an explicit criterion.
- **Dev-server port drift is real and has cost prior sprints time.** Vite bound `:5006`, `:5007`, `:5000`, `:5001` and now `:5002` across the last five sprints of this shape. There is no sequence to extrapolate — read the banner.
- **Copy-paste variant drift is the one realistic implementation failure.** The whole change is copied files; a stale `variant` value or a filename left over from the source is the mistake that actually happens. The per-endpoint body assertion catches it — provided the test is updated when copied, not just the handler.
- **Copying the wrong handler source is the second.** Copying `routes/api/hello.ts` instead of a probe would introduce an `event.context.user` read and break the probe when auth is unavailable. Pinned in each ticket's PLAN.md by naming the exact source file.
- **Copying the wrong _test_ source is the third**, and remains one paste away: 47 of the 77 probe tests carry the flaky timing case, so it is still a large minority shape in the directory. The idea names the correct pair this time, so the risk is purely a sampling accident; each PLAN.md names `healthz-smoke-528856326-a.test.ts` and states the omission explicitly.
- **The idea's method-agnostic line is correct and is planned to.** These handlers declare no method guard, so every verb returns the same 200 JSON body — measured in VRTX3-S-0008 against a control route. The idea records this under Out of Scope rather than misstating it, so the TASKs simply require that no method guard be added. Adding a 405 to three routes would leave them inconsistent with the other 77.
- **Assumption:** `variant` is the string `"600965021"` for all three, matching every sibling triple (`528856326`, `841017405`, `238855431`, `472035881`, `568557289`) — not a number, and not suffixed per letter. The idea confirms this explicitly in its Open Questions and Assumptions.
- **Assumption:** `middleware/auth.ts` stays a permissive stub. Real rejecting auth would break all 80 probes without any probe file changing.
- **Standing risk:** with 80 near-identical probes committed, an engineer will eventually be tempted to factor out a shared handler. That would convert every future probe from a zero-overlap ticket into a shared-file edit — the exact thing these probes exist to disprove. Recorded in ARCHITECTURE.md § Key Decisions so it stops being re-litigated.
- **Retention is still unanswered, and re-raising it has stopped being useful.** No probe has ever been retired; the family grows ~3 per sprint (77 → 80 this sprint), and `routes/api/` now holds 156 files, heading for 162. A retention-policy backlog TASK has been raised and **cancelled unworked three times** — VRTX3-T-0074 (VRTX3-S-0011), VRTX3-T-0089 (VRTX3-S-0013), VRTX3-T-0111 (VRTX3-S-0016) — alongside VRTX3-T-0104 (remove the flaky timing assertion from the 47 legacy tests) and VRTX3-T-0114, both likewise cancelled. Five cancelled placeholders is enough evidence: raising a sixth would add a paid dispatch and change nothing. VRTX3-S-0017 through -0021 all declined to, and this sprint does the same, recording the question here instead. It needs a human decision, not another ticket. The second-order cost stays visible in the findings above: because those 47 legacy tests were never cleaned up, they remain a large minority shape in the directory, which is why an idea canvas sampled one as its template in VRTX3-S-0017.
