# Sprint Plan — VRTX3-S-0013

**Title:** Three Independent Health Check Endpoints (841017405)
**Idea:** VRTX3-I-0022 — `[smoke-178627709747600] 3 independent endpoints (841017405)` (enhancement)
**Planning ticket:** VRTX3-T-0083
**Created:** 2026-08-09

---

## Goal

Ship three standalone Nitro health probes — `GET /api/healthz-smoke-841017405-a`, `-b` and `-c` — each answering with `Content-Type: application/json` and a body deep-equal to `{ "ok": true, "variant": "841017405" }`.

The endpoints are the visible deliverable. The _point_ of the sprint is the second-order one the idea states in its success metrics: three unrelated units of work get picked up, built, tested and merged **in parallel**, with file-ownership maps that do not intersect at a single line. Nothing shared, nothing to coordinate, nothing to conflict.

---

## Codebase findings (Stage 0)

Read: `routes/api/` (103 files), `vite.config.ts`, `vitest.config.ts`, `package.json`, `middleware/auth.ts`, `.github/workflows/ci.yml`, and the four root docs.

**The pattern already exists 50 times over.** `routes/api/healthz-smoke-913793173-a.ts` is the whole shape:

```ts
import { defineHandler } from "nitro/h3";

export default defineHandler(() => {
  return {
    ok: true,
    variant: "913793173",
  };
});
```

Eight lines, one import, no `event` parameter, no method guard. `routes/api/` holds 51 top-level handlers plus their colocated tests; **50 of the 51 are `healthz-smoke-*` probes** (measured: `ls routes/api/healthz-smoke-*.ts | grep -v '\.test\.ts$' | wc -l` → 50). The only non-probe routes are `hello.ts` and `users/`.

**Nothing named `841017405` exists yet.** `grep -rn "841017405" routes/ src/ db/ middleware/ e2e/` returns no matches, so there is no collision and the change is purely additive — six new files, zero modified.

**Routing needs no registration.** `vite.config.ts` sets `nitro({ serverDir: "./", ignore: ["**/*.test.ts"] })`. Files under `routes/api/` become `/api/*` by filename alone — so a filename typo is a wrong URL with no other symptom — and `*.test.ts` is kept out of the server bundle. Neither config file needs to change; a change to either would silently break these routes and the other 50.

**The test harness is already wired.** `vitest.config.ts` defines two projects: `client` (jsdom, `exclude: [... "routes/**"]`) and `server` (`environment: "node"`, `include: ["routes/**/*.test.ts"]`). The split exists because `routes/**` tests can reach `db/client.ts`, which imports the Bun builtin `bun:sqlite` that jsdom cannot externalize. `routes/api/healthz-smoke-528856326-a.test.ts` is the exact idiom to copy: construct `new H3Event(new Request(url))`, invoke the default export, assert on the returned object.

**Two test idioms exist in the directory; copy the newer one.** The older probe tests (e.g. `healthz-smoke-913793173-a.test.ts`) carry a second `responds in under 100ms` case. That assertion is machine-dependent and a known CI-flake source; VRTX3-S-0011 dropped it, and `healthz-smoke-528856326-a.test.ts` is the resulting one-case shape. The idea's acceptance criteria ask only for the body assertion, so the new tests copy the `528856326` file, not the `913793173` one — a deliberate divergence from the file the idea's Solution section names.

**CI is already correct.** `.github/workflows/ci.yml` triggers on `push` **and** `pull_request` to `["vortex/**", dev, main]` and runs, under `oven-sh/setup-bun`: install → typecheck → lint → test → build. It needs no change for this sprint.

**`middleware/auth.ts` still runs.** It executes before _every_ handler and sets `event.context.user`. "No auth" in this idea means the handlers must not _read_ it (unlike `routes/api/hello.ts`, which does) — not that the middleware is bypassed. Assumption: that stub stays permissive; if it is ever replaced with real rejecting auth, all 53 probes start failing without any of their own files changing.

**Root docs are current.** VRTX3-S-0011 corrected the stale ESLint 9 → 10 and Playwright `~1.50.0` → `~1.60.0` facts and promoted the probe recipe into AGENT.md `## Conventions → Health Probe Routes`; VRTX3-S-0012 refreshed the counts. Re-checked against `package.json` this sprint: ESLint `^10.7.0`, Playwright `~1.60.0`, Vitest `^4.1.10`, Nitro `^3.0.260610-beta` — all as documented. This sprint's doc work is therefore count updates (50 → 53), the most-recent-set pointer, and Changelog entries — no correction needed.

---

## Target state of the root docs

Brought to target state on the planning ticket branch (VRTX3-T-0083), before any TASK exists:

- **AGENT.md** — probe-family count 50 → 53 under `## Conventions → Health Probe Routes`; the copy-source named there updated to a probe whose test carries only the body assertion, so the sanctioned recipe stops propagating the flaky timing case. Changelog entry.
- **PRODUCT.md** — `## Features → Health probe endpoints`: count 50 → 53 and the "most recent set" pointer moved to the `841017405` family. Scope and per-probe acceptance criteria unchanged. Changelog entry.
- **ARCHITECTURE.md** — `## Routing → Health probe route contract`: count 50 → 53; build-output naming example refreshed to a route from this sprint. Key Decisions unchanged (the no-shared-helper decision already stands). Changelog entry.
- **DESIGN.md** — Changelog entry only; the sprint is backend-only and touches nothing in `src/`.

---

## Implementation phases

One phase = one TASK candidate. Phases 1–3 are the sprint's only tickets; phases 4 and 5 are mandatory plan phases that resolve to _no ticket_ because the work already exists in the repo — recorded here so the next planner does not re-derive them.

### Phase 1 — `GET /api/healthz-smoke-841017405-a` → **VRTX3-T-0086**

Create `routes/api/healthz-smoke-841017405-a.ts` (copy `healthz-smoke-528856326-a.ts`, change the variant string) and `routes/api/healthz-smoke-841017405-a.test.ts` (copy `healthz-smoke-528856326-a.test.ts`, change the import, title, URL and expected variant). Two new files, nothing modified.

### Phase 2 — `GET /api/healthz-smoke-841017405-b` → **VRTX3-T-0087**

Identical, for `-b`. Two new files, nothing modified.

### Phase 3 — `GET /api/healthz-smoke-841017405-c` → **VRTX3-T-0088**

Identical, for `-c`. Two new files, nothing modified.

### Phase 4 — Test harness (mandatory phase) — **no ticket; folded into phases 1–3**

The harness already exists and needs no extension: the `server` Vitest project (`environment: "node"`, `include: ["routes/**/*.test.ts"]`) picks up a new colocated `routes/api/*.test.ts` with zero configuration, and `nitro({ ignore: ["**/*.test.ts"] })` keeps it out of the production bundle. No fixture, helper or setup file is needed — a probe test imports its own handler and nothing else. Each ticket's test is therefore an acceptance criterion of the ticket that implements the handler, not separate work.

The one harness-shaped decision this sprint carries: the new tests use the **single-assertion** shape (body only), not the older two-case shape with `expect(elapsed).toBeLessThan(100)`. Wall-clock assertions in a shared CI runner are flaky and prove nothing about the contract.

### Phase 5 — CI (mandatory phase) — **no ticket; no change required**

`.github/workflows/ci.yml` already triggers on `push` and `pull_request` to `["vortex/**", dev, main]`, so this sprint's three ticket branches, the sprint branch and the mini-PRs all get check runs. It already runs, under `oven-sh/setup-bun`: `bun install` → `bun run typecheck` → `bun run lint` → `bun run test` → `bun run build`. Those entry commands are recorded in AGENT.md `## Build & run` / `## Test & validate`. Adding a probe adds one more file to a scan that is already wired — there is nothing to change and no ticket is created.

Branch protection with required status checks on `vortex/sprint/*` and `vortex/feat/*` remains a human-configured, unclaimed hardening step (noted in AGENT.md Gotchas).

---

## Ticket map

| Phase | Ticket       | Type            | Owns                                                   |
| ----- | ------------ | --------------- | ------------------------------------------------------ |
| —     | VRTX3-T-0084 | EPIC            | container — closes by rollup                           |
| —     | VRTX3-T-0085 | STORY           | container — closes by rollup                           |
| 1     | VRTX3-T-0086 | TASK (engineer) | `routes/api/healthz-smoke-841017405-a.ts` + `.test.ts` |
| 2     | VRTX3-T-0087 | TASK (engineer) | `routes/api/healthz-smoke-841017405-b.ts` + `.test.ts` |
| 3     | VRTX3-T-0088 | TASK (engineer) | `routes/api/healthz-smoke-841017405-c.ts` + `.test.ts` |
| 4     | —            | —               | folded into 1–3                                        |
| 5     | —            | —               | no change required                                     |

**No `depends_on` between any of the three.** Their ownership maps are disjoint — six files, each owned by exactly one ticket, no shared file anywhere in the repo. Sequencing them would defeat the sprint's stated purpose.

### Why three tickets and not one

A single agent could plainly write six files in one session, and the minimum-viable-backlog instinct is to merge. Not here: the idea's third user story ("As an engineer or agent implementing one of the three, I want the endpoint to follow the existing pattern exactly, so that I add two files and change nothing else") and its third success metric ("**Parallelism proven:** the three tasks are picked up and completed with zero cross-task coordination and zero merge conflicts — the point of the exercise is that independent leaf endpoints need no planning ceremony") make the three-way independence _the deliverable_. Merging into one ticket would ship the endpoints and drop the thing being tested. Every prior sprint of this shape (SPRINT-0019, VRTX3-S-0004, VRTX3-S-0006, VRTX3-S-0011) decomposed the same way.

---

## Risks & assumptions

- **Low risk overall.** Six new files, zero modified, no dependency added, no schema or migration, nothing in `src/`, no contract change for any existing consumer.
- **A missing route is invisible by status code.** An unmatched `/api/*` path returns `200 text/html` (the SPA `index.html` shell), in dev and in the production build alike — nginx does not change this. Five consecutive sprints (VRTX3-S-0001, -0007, -0008, -0009, -0012) each acted on a bug report claiming `404` before re-measuring. Compounding it: a probe's unit test imports the handler module _directly_, so it passes even if Nitro never registered the path. Only a live request that checks the **body and `Content-Type`** proves the route is wired — which is why every TASK carries that as an explicit criterion.
- **Copy-paste variant drift is the one realistic failure.** The whole change is copied files; a stale `variant` value or a filename left over from the source is the mistake that actually happens. The per-endpoint body assertion catches it — provided the test is updated when copied, not just the handler.
- **Copying the wrong source file is the second.** Copying `routes/api/hello.ts` instead of a probe would introduce an `event.context.user` read and break the probe when auth is unavailable; copying an older probe test drags in the flaky timing assertion. Both are pinned in each ticket's PLAN.md by naming the exact source file.
- **The idea's "no HTTP-method restriction" line is correct and is planned to.** These handlers declare no method guard, so every verb returns the same 200 JSON body — measured in VRTX3-S-0008 against a control route. The idea records this under Out of Scope rather than misstating it (unlike VRTX3-I-0019 last sprint), so the TASKs simply require that no method guard be added. Adding a 405 to three routes would leave them inconsistent with the other 50.
- **Assumption:** `variant` is the string `"841017405"`, matching every sibling, not a number.
- **Assumption:** `middleware/auth.ts` stays a permissive stub. Real rejecting auth would break all 53 probes without any probe file changing.
- **Standing risk:** with 53 near-identical probes committed, an engineer will eventually be tempted to factor out a shared handler. That would convert every future probe from a zero-overlap ticket into a shared-file edit — the exact thing these probes exist to disprove. Recorded in ARCHITECTURE.md Key Decisions so it stops being re-litigated.
- **Retention is still unanswered.** No probe has ever been retired; the family grows ~3 per sprint (50 → 53 this sprint). Not a blocker for this sprint; carried as a backlog improvement rather than decided here.
