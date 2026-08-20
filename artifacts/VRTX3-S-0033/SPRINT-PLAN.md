---
artifact: sprint-plan
spec: 1
status: complete
author_role: planning
sprint: VRTX3-S-0033
idea: VRTX3-I-0040
branch: vortex/sprint/vrtx3-s-0033-c609ec83
downstream:
  [
    artifacts/VRTX3-S-0033/VRTX3-T-0216/PLAN.md,
    artifacts/VRTX3-S-0033/VRTX3-T-0217/PLAN.md,
    artifacts/VRTX3-S-0033/VRTX3-T-0218/PLAN.md,
  ]
---

# Sprint plan — VRTX3-S-0033

**Title:** Three Independent Health Check Endpoints (189360772)
**Idea:** VRTX3-I-0040 — `[smoke-178726801722424] 3 independent endpoints (189360772)` (enhancement, doc v15, frozen)
**Planning ticket:** VRTX3-T-0213
**Created:** 2026-08-20

---

## Goal

Ship three standalone Nitro health probes — `GET /api/healthz-smoke-189360772-a`, `-b` and `-c` — each answering with `Content-Type: application/json` and a body deep-equal to `{ "ok": true, "variant": "189360772" }` (VRTX3-I-0040, AC-1 … AC-9).

The three URLs are the visible deliverable. The point of the sprint is the second-order property the idea states in its own success metrics: three unrelated units of work get picked up, built, tested and merged **in parallel**, with file-ownership maps that do not intersect at a single line. Nothing shared, nothing to coordinate, nothing to conflict.

---

## Codebase findings (Stage 0)

Read this sprint: `routes/api/` (197 files), `vite.config.ts`, `vitest.config.ts`, `.github/workflows/ci.yml`, `README.md`, and the four root docs. Everything below is measured against this working tree, not carried forward from a prior plan.

### The pattern already exists 97 times over

Measured from the filesystem, not incremented from the last plan:

| Count | What                                                                                                                                        |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 97    | `healthz-smoke-*` handlers under `routes/api/`                                                                                              |
| 97    | colocated `healthz-smoke-*.test.ts` files                                                                                                   |
| 197   | total files under `routes/api/` (the 194 probe files, `hello.ts`, `hello.post.ts`, `hello.test.ts`, and the `users/` dynamic-route example) |

The count that goes into the root docs is **97 → 100**, re-derived from the tree.

`routes/api/healthz-smoke-528856326-a.ts` is the whole shape, verbatim:

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

### Nothing named `189360772` exists yet

A repo-wide `grep -rn "189360772"` across `.ts`, `.tsx` and `.md` (excluding `node_modules`) returned zero matches. These are never-written files, not typo'd filenames — the change is purely additive.

### The SPA-fallback baseline, re-measured live

Taken against `bun run dev` in this container, which bound port **5000** (read from the Vite banner — see R3):

| Path                                       | Status | `Content-Type`                   | Size  | Body                                |
| ------------------------------------------ | ------ | -------------------------------- | ----- | ----------------------------------- |
| `/api/healthz-smoke-189360772-a`           | `200`  | `text/html; charset=utf-8`       | 949 B | `<!doctype html>…` (SPA shell)      |
| `/api/healthz-smoke-189360772-b`           | `200`  | `text/html; charset=utf-8`       | 949 B | `<!doctype html>…` (SPA shell)      |
| `/api/healthz-smoke-189360772-c`           | `200`  | `text/html; charset=utf-8`       | 949 B | `<!doctype html>…` (SPA shell)      |
| `/api/healthz-smoke-528856326-a` (control) | `200`  | `application/json;charset=UTF-8` | 33 B  | `{"ok":true,"variant":"528856326"}` |

**Twenty-first consecutive confirmation of the trap in [AGENT.md § Gotchas](../../AGENT.md#gotchas), tenth on an enhancement.** A missing `/api/*` path is answered by the SPA `index.html` shell with `200 text/html`, so status code alone cannot distinguish a working endpoint from a missing one. VRTX3-I-0040 gets this right in its own risk register — it states the fallback, quotes the 949-byte figure, and instructs that verification assert the JSON body or the built module rather than the status code. The measurement was taken anyway, which is the rule: a canvas being right is evidence about the canvas, not about the working tree.

### The copy-source pointer had nothing to substitute — and that is the normal case

VRTX3-I-0040 names the pinned pair `routes/api/healthz-smoke-528856326-a.ts` + `.test.ts` in both its **Solution** and **Affected Code** sections, and its risk register goes further than any prior canvas: it states in its own words _why_ sampling a directory neighbour is the failure mode, and that [AGENT.md § Health Probe Routes](../../AGENT.md#health-probe-routes) outranks any file named elsewhere. Nothing to substitute this sprint.

That is worth recording precisely because it is uneventful. 47 of the 97 existing probe tests still carry the flaky `expect(elapsed).toBeLessThan(100)` case, and those files are never rewritten — the ratio only dilutes (47 of 100 after this sprint) while the odds of a future canvas sampling one stay close to even. Two quiet sprints in a row (VRTX3-S-0030 had no canvas at all, so nothing named a template) is not evidence the risk has passed. Each TASK therefore still carries an explicit acceptance criterion forbidding `Date.now()`, `toBeLessThan` and any elapsed-time case, so the shape is checkable rather than trusted.

### The idea's AC-8 names a file that carries no probe count

VRTX3-I-0040's AC-8 reads: _"the only edits outside `routes/api/` are the probe-family counts in `README.md`, `ARCHITECTURE.md` and `AGENT.md`, re-counted from the filesystem (97 handlers -> 100)."_

`README.md` carries no probe count. `grep -niE "healthz|probe" README.md` returns nothing at all — the file has no reference to the probe family. The three documents that carry the count are `AGENT.md`, `ARCHITECTURE.md` and `PRODUCT.md`, verified by grep this sprint.

**Consequence for the decomposition.** All three are root docs, which are planning-owned and were brought to target state on VRTX3-T-0213 before any TASK existed. So the "edits outside `routes/api/`" that AC-8 anticipates are not on any implementation ticket at all: the three TASKs each own exactly two new files and nothing else, and `README.md` is not modified this sprint. The substantive intent of AC-8 — re-count from the filesystem rather than increment, and keep the doc edit off the parallel tickets — is satisfied; only its file list was wrong.

### Harness and CI already cover this work

- `vite.config.ts` — `nitro({ serverDir: "./", ignore: ["**/*.test.ts"] })`. A new `routes/api/*.ts` is registered by filename alone; the colocated `*.test.ts` is kept out of the server bundle by the same line. This satisfies idea AC-9 with no change.
- `vitest.config.ts` — the `server` project (`environment: "node"`, `include: ["routes/**/*.test.ts"]`) collects a new probe test with no configuration. The `client` jsdom project excludes `routes/**`.
- `.github/workflows/ci.yml` — already triggers on `push` **and** `pull_request` to `vortex/**`, `dev` and `main`, so ticket mini-PRs and the sprint branch both get check runs.

No harness or CI change is needed. Both phases below are verification-of-fit, folded into the implementing TASKs' criteria — neither earns a ticket.

---

## Target state

After this sprint the root docs say:

- **AGENT.md** — probe family count 97 → 100; [Health Probe Routes](../../AGENT.md#health-probe-routes) records that a sprint with nothing to substitute is the normal case rather than evidence the risk has passed, and that the 47/100 ratio dilutes without the per-sample odds improving; [Gotchas](../../AGENT.md#gotchas) records the twenty-first SPA-fallback confirmation and Vite binding `:5000`; the changelog records the `README.md` correction.
- **PRODUCT.md** — probe count 97 → 100, most-recent-set pointer moves to this trio. Feature definition, user stories and per-probe acceptance criteria unchanged; the `README.md` correction recorded against the idea rather than the criteria.
- **ARCHITECTURE.md** — probe-family count under [Routing](../../ARCHITECTURE.md#routing) 97 → 100, build-output example moved to this sprint's route. `## Key Decisions` unchanged — "Health probes duplicate, on purpose" already governs.
- **DESIGN.md** — no design-system change; changelog entry recording that the sprint is backend-only and that VRTX3-I-0040's design manifest is empty, so "unchanged" stays distinguishable from "not reviewed".

All four are brought to target state on the planning ticket, before any TASK exists. No TASK names a root doc.

---

## Implementation phases

Each phase is one TASK. Phases 1–3 are mutually independent — no shared file, no ordering relationship.

1. **Probe `-a`** — create `routes/api/healthz-smoke-189360772-a.ts` and its colocated `.test.ts`, copied from the `528856326` pair. Two new files.
2. **Probe `-b`** — same, for `-b`. Two new files.
3. **Probe `-c`** — same, for `-c`. Two new files.
4. **Test harness** _(mandatory phase — no ticket)_ — the Vitest `server` project already collects `routes/**/*.test.ts` in the node environment with no configuration. Verified by reading `vitest.config.ts` this sprint. Each TASK carries the fit check as an acceptance criterion ("collected by Vitest's `server` project and passes, with no change to `vitest.config.ts`") rather than a separate verify-only ticket, per the standing rule that testing folds into the implementing TASK.
5. **CI** _(mandatory phase — no ticket)_ — `.github/workflows/ci.yml` already triggers on `push` and `pull_request` to `vortex/**`, `dev` and `main`:

   ```yaml
   on:
     push:
       branches: ["vortex/**", dev, main]
     pull_request:
       branches: ["vortex/**", dev, main]
   ```

   No change required. Local entry commands are recorded in [AGENT.md § Test & Validate](../../AGENT.md#test--validate).

---

## Ticket map

| Phase | Ticket               | Scope                                                      |
| ----- | -------------------- | ---------------------------------------------------------- |
| —     | VRTX3-T-0214 (EPIC)  | Health probe family 189360772                              |
| —     | VRTX3-T-0215 (STORY) | Three independent 189360772 health probes                  |
| 1     | VRTX3-T-0216         | `GET /api/healthz-smoke-189360772-a`                       |
| 2     | VRTX3-T-0217         | `GET /api/healthz-smoke-189360772-b`                       |
| 3     | VRTX3-T-0218         | `GET /api/healthz-smoke-189360772-c`                       |
| 4, 5  | —                    | Folded into 1–3's acceptance criteria; no ticket by design |

**No `depends_on` edge between VRTX3-T-0216, -0217 and -0218.** Their ownership maps are two files each and disjoint:

| Ticket                  | Owns                                                                                      |
| ----------------------- | ----------------------------------------------------------------------------------------- |
| VRTX3-T-0216            | `routes/api/healthz-smoke-189360772-a.ts`, `routes/api/healthz-smoke-189360772-a.test.ts` |
| VRTX3-T-0217            | `routes/api/healthz-smoke-189360772-b.ts`, `routes/api/healthz-smoke-189360772-b.test.ts` |
| VRTX3-T-0218            | `routes/api/healthz-smoke-189360772-c.ts`, `routes/api/healthz-smoke-189360772-c.test.ts` |
| VRTX3-T-0213 (planning) | `AGENT.md`, `PRODUCT.md`, `ARCHITECTURE.md`, `DESIGN.md`, `artifacts/VRTX3-S-0033/**`     |

The one file set the three TASKs could have collided on — the three root docs carrying the probe count — is held exclusively by the planning ticket and moves 97 → 100 once for the sprint, not 97 → 98 three times. `README.md` is in no ticket's map, because it carries no probe count (see Stage 0).

---

## Design reference

_No design reference on this idea._ `a2a_get_idea_design(ticket_key="VRTX3-T-0213")` returned `blocks: []` for VRTX3-I-0040, and the idea says so itself: "this change adds no screen, page or flow — there is nothing visual to sketch." The sprint has no user-visible surface — nothing in `src/`, no page links to the new endpoints — so there is no mockup to build to. Nothing was exported to `artifacts/VRTX3-S-0033/design/`.

---

## Risks & assumptions

**R1 — the flaky timing assertion comes back by copy-paste.** _Likelihood: latent, not active this sprint._ VRTX3-I-0040 names the pinned `528856326` pair and explains the rule, so there is nothing to substitute. But 47 of the 97 existing probe tests still carry `expect(elapsed).toBeLessThan(100)` and are never rewritten, so a directory neighbour remains close to a coin flip for the next canvas. Mitigated by each TASK's PLAN.md naming the `528856326` pair explicitly and each TASK carrying an acceptance criterion that forbids `Date.now()`, `toBeLessThan` and any "responds in under N ms" case.

**R2 — a status-code-only check passes against a missing route.** _Likelihood: high if unguarded; twenty-one sprints running._ Mitigated by an acceptance criterion per TASK requiring the **body and `Content-Type`** from a live request, with the measured pre-state (949-byte `text/html` shell) named so the check has something to be different from, plus a second criterion on the built module under `.output/server/_routes/api/`.

**R3 — the dev-server port is not `:5000` when an implementation agent looks.** _Likelihood: moderate._ It bound `:5000` during this planning run, but the last twelve sprints produced `:5005`, `:5006`, `:5007`, `:5000`, `:5001`, `:5002`, `:5000`, `:5000`, `:5000`, `:5000`, `:5000` and `:5002` — contention, not a trend, and not extrapolable in either direction. Mitigation: every PLAN.md says to read the port from the Vite banner. Measuring against the wrong port yields connection errors that look like a broken route.

**R4 — a reviewer asks to factor out the duplication.** _Likelihood: low, bounded._ The three files repeat ~8 lines each. Factoring them into a shared helper would delete the property the sprint exists to demonstrate. Governed by [ARCHITECTURE.md § Key Decisions](../../ARCHITECTURE.md#key-decisions) — "Health probes duplicate, on purpose" — and restated as a fixed interface contract in each PLAN.md.

**R5 — an implementation agent follows AC-8 and edits `README.md`.** _Likelihood: low._ The idea names `README.md` as carrying a probe-family count; it does not carry one. No TASK's ownership map includes any document, and each TASK carries an acceptance criterion that its diff is exactly two new files, so an edit to `README.md` fails the ticket rather than passing silently.

**A1 — assumption:** file-based routing keeps mapping `routes/api/<name>.ts` → `/api/<name>`. Verified by reading `vite.config.ts` and by the control measurement above, not assumed from the canvas.

**A2 — assumption:** `middleware/auth.ts` runs on every request but only attaches a stub user and never rejects, so the probes are public with no change. Consistent with the 97 existing probes; the handlers ignore `event.context` entirely, so the assumption is not load-bearing for the deliverable.

**A3 — assumption:** no method guard is wanted. Non-`GET` verbs return the same 200 body, as with every sibling probe. The idea puts method handling out of scope, so the plan follows the out-of-scope line rather than specifying behaviour for it.
