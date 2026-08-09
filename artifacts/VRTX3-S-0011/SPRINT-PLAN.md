# Sprint Plan — VRTX3-S-0011

**Title:** Three Independent Health Check Endpoints (528856326)
**Idea:** VRTX3-I-0019 — `[smoke-178624221710620] 3 independent endpoints (528856326)` (enhancement)
**Planning ticket:** VRTX3-T-0068
**Created:** 2026-08-09

---

## Goal

Ship three standalone Nitro health probes — `GET /api/healthz-smoke-528856326-a`, `-b` and `-c` — each answering with `Content-Type: application/json` and a body deep-equal to `{ "ok": true, "variant": "528856326" }`.

The endpoints are the visible deliverable. The _point_ of the sprint is the second-order one stated in the idea's success metrics: three unrelated units of work get picked up, built, tested and merged **in parallel**, with file-ownership maps that do not intersect at a single line. Nothing shared, nothing to coordinate, nothing to conflict.

---

## Codebase findings (Stage 0)

Read: `routes/api/` (all 90 files), `vite.config.ts`, `vitest.config.ts`, `package.json`, `middleware/auth.ts`, `server.ts`, `.github/workflows/ci.yml`, and the four root docs.

**The pattern already exists 44 times over.** `routes/api/healthz-smoke-302960562-a.ts` is the whole shape:

```ts
import { defineHandler } from "nitro/h3";

export default defineHandler(() => {
  return {
    ok: true,
    variant: "302960562",
  };
});
```

Eight lines, one import, no `event` parameter, no method guard. `routes/api/` holds 45 handlers + 45 tests; 44 of the handlers are `healthz-smoke-*` probes. The only non-probe routes are `hello.ts` and `users/`.

**Nothing named `528856326` exists yet.** `grep -rn "528856326" routes/ src/ db/ middleware/` returns nothing, so there is no collision and the change is purely additive.

**Routing needs no registration.** `vite.config.ts` sets `nitro({ serverDir: "./", ignore: ["**/*.test.ts"] })`. Files under `routes/api/` become `/api/*` by filename alone — so a filename typo is a wrong URL with no other symptom — and `*.test.ts` is kept out of the server bundle. Neither config file needs to change; a change to either would silently break these routes.

**The test harness is already wired.** `vitest.config.ts` defines two projects: `client` (jsdom, excludes `routes/**`) and `server` (`environment: "node"`, `include: ["routes/**/*.test.ts"]`). The split exists because `routes/**` tests can reach `db/client.ts`, which imports the Bun builtin `bun:sqlite` that jsdom cannot externalize. `routes/api/healthz-smoke-126862920-c.test.ts` is the exact idiom to copy: construct `new H3Event(new Request(url))`, invoke the default export, assert on the returned object.

**CI is already correct.** `.github/workflows/ci.yml` triggers on `push` **and** `pull_request` to `["vortex/**", dev, main]` and runs, under `oven-sh/setup-bun`: install → typecheck → lint → test → build. It needs no change for this sprint.

**`middleware/auth.ts` still runs.** It executes before _every_ handler and sets `event.context.user`. "No auth" in this idea means the handlers must not _read_ it (unlike `routes/api/hello.ts`, which does) — not that the middleware is bypassed. Assumption: that stub stays permissive; if it is ever replaced with real rejecting auth, all 47 probes start failing without any of their own files changing.

**Two root-doc facts were stale and are corrected this sprint** (measured from `package.json`): lint is **ESLint 10** (`^10.7.0`), documented as 9 in AGENT.md, PRODUCT.md and ARCHITECTURE.md; and Playwright is pinned to **`~1.60.0`**, documented as `~1.50.0` in ARCHITECTURE.md's Key Decisions.

---

## Target state of the root docs

Brought to target state on the planning ticket branch (VRTX3-T-0068), before any TASK exists:

- **AGENT.md** — new `## Conventions → Health Probe Routes` subsection promoting the probe recipe and the _don't factor out a shared handler_ rule out of the changelog, where four sprints' worth of it had accumulated, into the place an agent reads before writing code. The method-agnostic gotcha now also says what to do when an idea's ACs contradict it. ESLint 9 → 10.
- **PRODUCT.md** — new `## Features` section making the probe family a first-class feature with user stories and per-probe acceptance criteria matching the tickets, instead of 7 changelog entries describing it. ESLint 9 → 10.
- **ARCHITECTURE.md** — new `### Health probe route contract` under Routing (handler shape, filename-is-the-URL, `.output/server/_routes/api/` build-output naming); new Key Decisions row recording _why_ the duplication is kept; concrete stack versions listed once; Playwright `~1.50.0` → `~1.60.0`, ESLint 9 → 10.
- **DESIGN.md** — changelog only; the sprint is backend-only and touches nothing in `src/`.

---

## Implementation phases

One phase = one TASK candidate. Phases 1–3 are the sprint's only tickets; phases 4 and 5 are mandatory plan phases that resolve to _no ticket_ because the work is already done in the repo — recorded here so the next planner does not re-derive them.

### Phase 1 — `GET /api/healthz-smoke-528856326-a` → **VRTX3-T-0071**

Create `routes/api/healthz-smoke-528856326-a.ts` (copy `healthz-smoke-302960562-a.ts`, change the variant string) and `routes/api/healthz-smoke-528856326-a.test.ts` (copy `healthz-smoke-126862920-c.test.ts`, minus its timing assertion). Two new files, nothing modified.

### Phase 2 — `GET /api/healthz-smoke-528856326-b` → **VRTX3-T-0072**

Identical, for `-b`. Two new files, nothing modified.

### Phase 3 — `GET /api/healthz-smoke-528856326-c` → **VRTX3-T-0073**

Identical, for `-c`. Two new files, nothing modified.

### Phase 4 — Test harness (mandatory phase) — **no ticket; folded into phases 1–3**

The harness already exists and needs no extension: the `server` Vitest project (`environment: "node"`, `include: ["routes/**/*.test.ts"]`) picks up a new colocated `routes/api/*.test.ts` with zero configuration, and `nitro({ ignore: ["**/*.test.ts"] })` keeps it out of the production bundle. No fixture, helper or setup file is needed — a probe test imports its own handler and nothing else. Each ticket's test is therefore an acceptance criterion of the ticket that implements the handler, not separate work.

One deliberate deviation from the sibling tests: `healthz-smoke-126862920-c.test.ts` asserts `elapsed < 100ms`. That is machine-dependent and a known CI-flake source, and the idea explicitly left it out of its acceptance criteria (Open Question 1). The new tests omit it.

### Phase 5 — CI (mandatory phase) — **no ticket; no change required**

`.github/workflows/ci.yml` already triggers on `push` and `pull_request` to `["vortex/**", dev, main]`, so this sprint's ticket branches, the sprint branch and the mini-PRs all get check runs. It already runs typecheck, lint, test and build under `oven-sh/setup-bun`. Adding a probe adds one more file to a scan that is already wired — there is nothing to change, and no ticket is created. Branch protection with required status checks on `vortex/sprint/*` and `vortex/feat/*` remains a human-configured, unclaimed hardening step.

---

## Ticket map

| Phase | Ticket       | Type            | Owns                                                   |
| ----- | ------------ | --------------- | ------------------------------------------------------ |
| —     | VRTX3-T-0069 | EPIC            | container — closes by rollup                           |
| —     | VRTX3-T-0070 | STORY           | container — closes by rollup                           |
| 1     | VRTX3-T-0071 | TASK (engineer) | `routes/api/healthz-smoke-528856326-a.ts` + `.test.ts` |
| 2     | VRTX3-T-0072 | TASK (engineer) | `routes/api/healthz-smoke-528856326-b.ts` + `.test.ts` |
| 3     | VRTX3-T-0073 | TASK (engineer) | `routes/api/healthz-smoke-528856326-c.ts` + `.test.ts` |
| 4     | —            | —               | folded into 1–3                                        |
| 5     | —            | —               | no change required                                     |

**No `depends_on` between any of the three.** Their ownership maps are disjoint — six files, each owned by exactly one ticket, no shared file anywhere in the repo. Sequencing them would defeat the sprint's stated purpose.

### Why three tickets and not one

A single agent could plainly write six files in one session, and the minimum-viable-backlog instinct is to merge. Not here: the idea's third user story ("As an engineer picking up one of the three, I want my endpoint to share no code with the other two, so that I can build, test and merge it without waiting for or conflicting with the other two units of work") and its second success metric ("Parallelism actually held: the three units of work were picked up and completed independently") make the three-way independence _the deliverable_. Merging into one ticket would ship the endpoints and drop the thing being tested. Every prior sprint of this shape (SPRINT-0019, VRTX3-S-0004, VRTX3-S-0006) decomposed the same way — those used one STORY per endpoint too; this plan merges those three STORYs into one, since they deliver a single demoable behavior.

---

## Risks & assumptions

- **Low risk overall.** Six new files, zero modified, no dependency added, no schema or migration, nothing in `src/`, no contract change for any existing consumer.
- **A missing route is invisible by status code.** An unmatched `/api/*` path returns `200 text/html` (the SPA `index.html` shell), in dev and in the production build alike — nginx does not change this. Four consecutive sprints (VRTX3-S-0001, -0007, -0008, -0009) each acted on a bug report claiming `404` before re-measuring. Compounding it: a probe's unit test imports the handler module _directly_, so it passes even if Nitro never registered the path. Only a live request that checks the **body and `Content-Type`** proves the route is wired — which is why every TASK carries that as an explicit criterion.
- **The idea's "unsupported methods" edge case is factually wrong for this stack, and is not planned to.** It states that `POST`/`PUT`/`DELETE` "does not return the 200 success body". These handlers declare no method guard, so every verb returns the same 200 JSON body — measured in VRTX3-S-0008 against a control route. The idea's own next sentence ("Behaviour is whatever Nitro's file-based router already does... this idea does not add custom method handling") and its Out of Scope ("No non-GET methods") are the authoritative reading, so the TASKs require only that no method guard be added. Adding a 405 to three routes would leave them inconsistent with the other 44.
- **Assumption:** `variant` is the string `"528856326"`, matching every sibling, not a number.
- **Assumption:** `middleware/auth.ts` stays a permissive stub. Real rejecting auth would break all 47 probes without any probe file changing.
- **Standing risk:** with 47 near-identical probes committed, an engineer will eventually be tempted to factor out a shared handler. That would convert every future probe from a zero-overlap ticket into a shared-file edit — the exact thing these probes exist to disprove. Recorded in ARCHITECTURE.md Key Decisions so it stops being re-litigated.
- **Retention is unanswered** (idea Open Question 2). No probe has ever been retired; the family grows ~3 per sprint. Not a blocker; raised as a backlog improvement rather than decided here.
