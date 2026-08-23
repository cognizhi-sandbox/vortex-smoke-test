---
artifact: sprint-plan
spec: 1
status: complete
author_role: planning
sprint: VRTX3-S-0036
idea: VRTX3-I-0043
branch: vortex/sprint/vrtx3-s-0036-30380777
downstream:
  [
    artifacts/VRTX3-S-0036/VRTX3-T-0238/PLAN.md,
    artifacts/VRTX3-S-0036/VRTX3-T-0239/PLAN.md,
    artifacts/VRTX3-S-0036/VRTX3-T-0240/PLAN.md,
  ]
---

# Sprint plan — VRTX3-S-0036

**Title:** Three Independent Health Check Endpoints (450228657)
**Idea:** VRTX3-I-0043 — `[smoke-178750448740726] 3 independent endpoints (450228657)` (enhancement, doc v16, frozen)
**Planning ticket:** VRTX3-T-0235
**Created:** 2026-08-23

---

## Goal

Ship three standalone Nitro health probes — `GET /api/healthz-smoke-450228657-a`, `-b` and `-c` — each answering with `Content-Type: application/json` and a body deep-equal to `{ "ok": true, "variant": "450228657" }` (VRTX3-I-0043, AC-1 … AC-8).

The three URLs are the visible deliverable. The property the sprint exists to demonstrate is the one the idea states in its own success metrics: three unrelated units of work get picked up, built, tested and merged **in parallel**, with file-ownership maps that do not intersect at a single line.

---

## Codebase findings (Stage 0)

Read this sprint: `routes/api/` (227 entries), `vite.config.ts`, `vitest.config.ts`, `.github/workflows/ci.yml`, `README.md`, and the four root docs. Every number below is measured against this working tree, not carried forward from a prior plan.

### The pattern already exists 112 times over

| Count | What                                                                                           |
| ----- | ---------------------------------------------------------------------------------------------- |
| 112   | `healthz-smoke-*` handlers under `routes/api/`                                                 |
| 112   | colocated `healthz-smoke-*.test.ts` files                                                      |
| 227   | total entries under `routes/api/` — the 224 probe files, `hello.ts`, `hello.test.ts`, `users/` |

The count that goes into the root docs is **112 → 115**, re-derived from the tree rather than incremented from the last plan.

One correction to the VRTX3-S-0035 plan while re-deriving it: that plan's file breakdown listed `hello.post.ts` and "three `users/` examples". Neither is on disk. `routes/api/` holds exactly `hello.ts`, `hello.test.ts` and a `users/` directory of four files (`[id].ts`, `[id].test.ts`, `index.get.ts`, `index.get.test.ts`). `hello.post.ts` appears in [AGENTS.md § Conventions](../../AGENTS.md#conventions) as an illustration of the method-suffix routing rule, not as a claim that the file exists — the previous plan read it as inventory. Nothing downstream depended on the breakdown, and the probe count itself was right.

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

### Nothing named `450228657` exists yet

A repo-wide `grep -rn "450228657"` across `.ts`, `.tsx` and `.md` (excluding `node_modules` and `artifacts/`) returned zero matches. These are never-written files, not typo'd filenames — the change is purely additive.

### The SPA-fallback baseline, re-measured live

Taken against `bun run dev` in this container, which bound port **5001** (`Port 5000 is in use, trying another one...`, read from the Vite banner — see R3):

| Path                                       | Status | `Content-Type`                   | Size  | Body                                |
| ------------------------------------------ | ------ | -------------------------------- | ----- | ----------------------------------- |
| `/api/healthz-smoke-450228657-a`           | `200`  | `text/html; charset=utf-8`       | 949 B | `<!doctype html>…` (SPA shell)      |
| `/api/healthz-smoke-450228657-b`           | `200`  | `text/html; charset=utf-8`       | 949 B | `<!doctype html>…` (SPA shell)      |
| `/api/healthz-smoke-450228657-c`           | `200`  | `text/html; charset=utf-8`       | 949 B | `<!doctype html>…` (SPA shell)      |
| `/api/healthz-smoke-528856326-a` (control) | `200`  | `application/json;charset=UTF-8` | 33 B  | `{"ok":true,"variant":"528856326"}` |

**Twenty-sixth consecutive confirmation of the trap in [AGENTS.md § Gotchas](../../AGENTS.md#gotchas), twelfth on an enhancement.** A missing `/api/*` path is answered by the SPA `index.html` shell with `200 text/html`, so status code alone cannot distinguish a working endpoint from a missing one.

VRTX3-I-0043 belongs to the quiet class: it makes **no status-code claim at all**. It says the three paths "do not exist yet — confirmed by listing `routes/api/`", which is true and independently reproducible, and never asserts what they currently return. That is the third canvas in the family to avoid the `404` mis-transcription by simply not stating a status code (VRTX3-I-0036 and VRTX3-I-0037 were the others), and it follows immediately after VRTX3-I-0042, which wrote the wrong `404` into an enhancement for the first time. There was nothing to debunk this sprint, and the measurement was taken anyway — which is the rule, because a canvas describes its own capture container, not this working tree.

### The copy-source pointer fires — fourth harmless instance

VRTX3-I-0043 names `routes/api/healthz-smoke-189360772-a.ts` and its `.test.ts` as the reference to copy, in its Solution, its AC-5 and its Current State sections. Diffed during planning: that pair is **shape-identical** to the pinned `528856326` pair — one `it()` case, a single body assertion, no `Date.now()` — because `189360772` landed in VRTX3-S-0033, long after the flaky wall-clock case was dropped in VRTX3-S-0011.

So the substitution costs nothing again. Four harmless instances (VRTX3-I-0036, -0005, -0006, -0043) now stand against three harmful (VRTX3-I-0037, -0041, -0042), and the substitution is made regardless: the ratio that governs the next sprint is **47 of 112 legacy tests**, unchanged, because those 47 files are never rewritten. Every PLAN.md below pins the `528856326` pair and every TASK carries a criterion forbidding the timing case.

Two details are worth recording rather than waving through. First, VRTX3-I-0043 sampled the **immediately preceding trio's** predecessor — `189360772` is VRTX3-S-0033's set, two sprints back — which is the same near-newest heuristic VRTX3-I-0006 used and which [AGENTS.md](../../AGENTS.md#health-probe-routes) already flags as the sampling most likely to look like grounds for skipping the check. Second, and unlike VRTX3-I-0037 and VRTX3-I-0041, this canvas explicitly **rejects** the timing assertion in its own Open Questions: _"a sub-100ms check on a constant-returning handler measures the runtime, not the code"_. That is the first canvas in the family to reach the pointer's conclusion independently while still naming a file it did not verify against it. It changes nothing procedurally — the reasoning and the pointer agree here, and when they disagree the pointer wins — but it does mean no acceptance criterion had to be dropped this sprint.

### One idea acceptance criterion is a command, not an outcome

VRTX3-I-0043's AC-7 reads `bun run verify (lint, typecheck, test) passes on the branch with all three endpoints and their tests added`.

A ticket carries the outcome; the command is fixed by the implementing role and its stack, not by a ticket. It is carried below as an outcome — each new test is collected by Vitest's `server` project and passes, and the production build emits the route module while excluding `*.test.ts` — which is what AC-7 was reaching for and is checkable without naming a script. The substance is preserved; only the imperative form is dropped.

VRTX3-I-0043's AC-8 (_"Removing or reverting any one of the three endpoints leaves the other two passing their tests unchanged"_) is the sprint's real point and is carried verbatim in substance, as the last criterion on each TASK.

### The idea's out-of-scope line on docs, and why the counts still move

VRTX3-I-0043's **Out of Scope** says: _"No OpenAPI/docs entry or monitoring integration."_

That governs implementation-owned documentation and is respected — no TASK touches any document, and no OpenAPI artifact is created (the repo has none). It does not govern the four root docs, which are planning-owned and brought to target state on VRTX3-T-0235 before any TASK exists. `AGENTS.md`, `ARCHITECTURE.md` and `PRODUCT.md` carry the probe-family count and it moves 112 → 115; `README.md` carries no probe count (`grep -niE "healthz|probe" README.md` returns nothing) and is untouched. Note that this idea, unlike its two predecessors, does **not** claim `README.md` carries the count — it makes no claim about it at all.

Consequence for the decomposition: no TASK touches any document. The three TASKs own exactly two new files each and nothing else.

### Harness and CI already cover this work

- `vite.config.ts` — `nitro({ serverDir: "./", ignore: ["**/*.test.ts"] })`. A new `routes/api/*.ts` is registered by filename alone; the colocated `*.test.ts` is kept out of the server bundle by the same line.
- `vitest.config.ts` — the `server` project (`environment: "node"`, `include: ["routes/**/*.test.ts"]`) collects a new probe test with no configuration. The `client` jsdom project excludes `routes/**`.
- `.github/workflows/ci.yml` — already triggers on `push` **and** `pull_request` to `vortex/**`, `dev` and `main`, so ticket mini-PRs and the sprint branch both get check runs. Steps: doc-links → typecheck → lint → test → build.

No harness or CI change is needed. Both phases below are verification-of-fit, folded into the implementing TASKs' criteria — neither earns a ticket.

---

## Target state

After this sprint the root docs say:

- **AGENTS.md** — probe family count 112 → 115; [Health Probe Routes](../../AGENTS.md#health-probe-routes) records the fourth harmless instance and the property that is new about it (a canvas that reaches the pointer's own conclusion in prose and still names an unverified neighbour); [Gotchas](../../AGENTS.md#gotchas) records the twenty-sixth SPA-fallback confirmation, the return of the no-status-code-claim canvas one sprint after the enhancement `404`, and Vite binding `:5001`.
- **PRODUCT.md** — probe count 112 → 115, most-recent-set pointer moves to this trio. Feature definition, user stories and per-probe acceptance criteria unchanged; the AC-7 command-to-outcome conversion recorded against the idea rather than the criteria.
- **ARCHITECTURE.md** — probe-family count under [Routing](../../ARCHITECTURE.md#routing) 112 → 115, build-output example moved to this sprint's route, and the `routes/api/` inventory corrected. `## Key Decisions` unchanged — "Health probes duplicate, on purpose" already governs, and this sprint's evidence bounds its cost rather than reopening it.
- **DESIGN.md** — no design-system change; changelog entry recording that the sprint is backend-only and that VRTX3-I-0043's design manifest is empty, so "unchanged" stays distinguishable from "not reviewed".

All four are brought to target state on the planning ticket, before any TASK exists. No TASK names a root doc.

---

## Implementation phases

Each phase is one TASK. Phases 1–3 are mutually independent — no shared file, no ordering relationship.

1. **Probe `-a`** — create `routes/api/healthz-smoke-450228657-a.ts` and its colocated `.test.ts`, copied from the `528856326` pair. Two new files.
2. **Probe `-b`** — same, for `-b`. Two new files.
3. **Probe `-c`** — same, for `-c`. Two new files.
4. **Test harness** _(mandatory phase — no ticket)_ — the Vitest `server` project already collects `routes/**/*.test.ts` in the node environment with no configuration, verified by reading `vitest.config.ts` this sprint. Each TASK carries the fit check as an acceptance criterion ("collected by Vitest's `server` project and passes, with no change to `vitest.config.ts`") rather than a separate verify-only ticket, per the standing rule that testing folds into the implementing TASK.
5. **CI** _(mandatory phase — no ticket)_ — `.github/workflows/ci.yml` already triggers on `push` **and** `pull_request` to `vortex/**`, `dev` and `main`:

   ```yaml
   on:
     push:
       branches: ["vortex/**", dev, main]
     pull_request:
       branches: ["vortex/**", dev, main]
   ```

   No change required. Local entry commands are recorded in [AGENTS.md § Test & Validate](../../AGENTS.md#test--validate).

---

## Ticket map

| Phase | Ticket               | Scope                                                      |
| ----- | -------------------- | ---------------------------------------------------------- |
| —     | VRTX3-T-0236 (EPIC)  | Health probe family 450228657                              |
| —     | VRTX3-T-0237 (STORY) | Three independent 450228657 health probes                  |
| 1     | VRTX3-T-0238         | `GET /api/healthz-smoke-450228657-a`                       |
| 2     | VRTX3-T-0239         | `GET /api/healthz-smoke-450228657-b`                       |
| 3     | VRTX3-T-0240         | `GET /api/healthz-smoke-450228657-c`                       |
| 4, 5  | —                    | Folded into 1–3's acceptance criteria; no ticket by design |

**No `depends_on` edge between VRTX3-T-0238, -0239 and -0240.** Their ownership maps are two files each and disjoint:

| Ticket                  | Owns                                                                                      |
| ----------------------- | ----------------------------------------------------------------------------------------- |
| VRTX3-T-0238            | `routes/api/healthz-smoke-450228657-a.ts`, `routes/api/healthz-smoke-450228657-a.test.ts` |
| VRTX3-T-0239            | `routes/api/healthz-smoke-450228657-b.ts`, `routes/api/healthz-smoke-450228657-b.test.ts` |
| VRTX3-T-0240            | `routes/api/healthz-smoke-450228657-c.ts`, `routes/api/healthz-smoke-450228657-c.test.ts` |
| VRTX3-T-0235 (planning) | `AGENTS.md`, `PRODUCT.md`, `ARCHITECTURE.md`, `DESIGN.md`, `artifacts/VRTX3-S-0036/**`    |

The one file set the three TASKs could have collided on — the three root docs carrying the probe count — is held exclusively by the planning ticket and moves 112 → 115 once for the sprint, not 112 → 113 three times. `README.md` is in no ticket's map, because it carries no probe count.

**Why three tickets and not one.** Three near-identical eight-line files would normally be one ticket under the minimum-viable-backlog rule. They are three here because the idea's second and third user stories, its success metrics and its AC-8 all name parallel independent delivery as the deliverable — merging them into one ticket would delete the property being demonstrated and leave nothing to observe. This is the same shape as VRTX3-S-0033 and -0035, and it is the exception the rule allows, not a lapse in it.

---

## Design reference

_No design reference on this idea._ `a2a_get_idea_design(ticket_key="VRTX3-T-0235")` returned `blocks: []` for VRTX3-I-0043, and the idea's own **Wireframes** section is empty. The sprint has no user-visible surface — nothing in `src/`, no page links to the new endpoints, and the idea puts UI explicitly out of scope ("No UI. Nothing is rendered, linked or navigable — this is API-only."). Nothing was exported to `artifacts/VRTX3-S-0036/design/`.

---

## Risks & assumptions

**R1 — the flaky timing assertion comes back by copy-paste.** _Likelihood: low this sprint, unchanged next._ VRTX3-I-0043 names `healthz-smoke-189360772-a`, which carries no timing case, so a literal copy of the named file would be safe. Mitigated anyway: each PLAN.md pins the `528856326` pair with the reason, and each TASK carries a criterion forbidding `Date.now()`, `toBeLessThan` and any "responds in under N ms" case. The property such an assertion reaches for — the handler does no I/O — is already guaranteed by the interface contract (only import is `nitro/h3`, no `db/`, no `event.context` read). The canvas agrees in its Open Questions, so no acceptance criterion is contradicted by leaving it out.

**R2 — a status-code-only check passes against a missing route.** _Likelihood: high if unguarded; twenty-six sprints running._ Mitigated by an acceptance criterion per TASK requiring the **body and `Content-Type`** from a live request, with the measured pre-state (949-byte `text/html` shell) named so the check has something to be different from, plus a second criterion on the built module under `.output/server/_routes/api/`. VRTX3-I-0043 makes no status-code claim, so there is nothing to debunk — but a route's unit test imports the handler module directly and passes even if Nitro never registered the path, so the live check is what proves the route is wired.

**R3 — the dev-server port is not `:5001` when an implementation agent looks.** _Likelihood: moderate._ It bound `:5001` during this planning run, after `:5000` for the previous four sprints. The full series is contention, not a trend, and is not extrapolable in either direction. Mitigation: every PLAN.md says to read the port from the Vite banner. Measuring against the wrong port yields connection errors that look like a broken route.

**R4 — a reviewer asks to factor out the duplication.** _Likelihood: low, bounded._ The three files repeat ~8 lines each. Factoring them into a shared helper would delete the property the sprint exists to demonstrate, and the idea rules it out in its own out-of-scope list ("Duplication across the three files is intentional"). Governed by [ARCHITECTURE.md § Key Decisions](../../ARCHITECTURE.md#key-decisions) — "Health probes duplicate, on purpose" — and restated as a fixed interface contract in each PLAN.md.

**R5 — an implementation agent reads the idea's out-of-scope line and edits, or declines to edit, a document.** _Likelihood: low._ VRTX3-I-0043 says "No OpenAPI/docs entry"; the root-doc counts move anyway, on the planning ticket. No TASK's ownership map includes any document, and each TASK carries an acceptance criterion that its diff is exactly two new files — so a documentation edit fails the ticket rather than passing silently.

**A1 — assumption:** file-based routing keeps mapping `routes/api/<name>.ts` → `/api/<name>`. Verified by reading `vite.config.ts` and by the control measurement above, not assumed from the canvas.

**A2 — assumption:** `middleware/auth.ts` runs on every request but only attaches a stub user and never rejects, so the probes are public with no change. Consistent with the 112 existing probes; the handlers ignore `event.context` entirely, so the assumption is not load-bearing for the deliverable. This is idea AC-6, satisfied structurally.

**A3 — assumption:** no method guard is wanted. Non-`GET` verbs return the same 200 body, as with every sibling probe. The idea puts method handling out of scope and states this edge case correctly in its own words ("This matches every existing healthz-smoke route and is accepted, not fixed"), so the plan follows the out-of-scope line.
