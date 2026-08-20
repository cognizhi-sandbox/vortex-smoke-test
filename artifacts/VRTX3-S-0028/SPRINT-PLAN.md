---
artifact: sprint-plan
spec: 1
status: complete
author_role: planning
sprint: VRTX3-S-0028
idea: VRTX3-I-0037
branch: vortex/sprint/vrtx3-s-0028-2cacd19c
downstream:
  [
    artifacts/VRTX3-S-0028/VRTX3-T-0197/PLAN.md,
    artifacts/VRTX3-S-0028/VRTX3-T-0198/PLAN.md,
    artifacts/VRTX3-S-0028/VRTX3-T-0199/PLAN.md,
    artifacts/VRTX3-S-0028/qa-test-report.md,
  ]
---

# Sprint plan — VRTX3-S-0028

**Title:** Three Independent Health Check Endpoints (458730798)
**Idea:** VRTX3-I-0037 — `[smoke-178723947083735] 3 independent endpoints (458730798)` (enhancement, doc v15, frozen)
**Planning ticket:** VRTX3-T-0194
**Created:** 2026-08-20

---

## Goal

Ship three standalone Nitro health probes — `GET /api/healthz-smoke-458730798-a`, `-b` and `-c` — each answering with `Content-Type: application/json` and a body deep-equal to `{ "ok": true, "variant": "458730798" }` (VRTX3-I-0037, AC-1 … AC-9).

The three URLs are the visible deliverable. The point of the sprint is the second-order property the idea states in its own success metrics: three unrelated units of work get picked up, built, tested and merged **in parallel**, with file-ownership maps that do not intersect at a single line. Nothing shared, nothing to coordinate, nothing to conflict.

---

## Codebase findings (Stage 0)

Read this sprint: `routes/api/` (187 files), `vite.config.ts`, `vitest.config.ts`, `.github/workflows/ci.yml`, and the four root docs. Everything below is measured against this working tree, not carried forward from a prior plan.

### The pattern already exists 92 times over

Measured from the filesystem, not incremented from the last plan:

| Count | What                                                                                                                                        |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 92    | `healthz-smoke-*` handlers under `routes/api/`                                                                                              |
| 92    | colocated `healthz-smoke-*.test.ts` files                                                                                                   |
| 1     | non-probe handler at this level (`routes/api/hello.ts`)                                                                                     |
| 187   | total files under `routes/api/` (the 184 probe files, `hello.ts`, `hello.post.ts`, `hello.test.ts`, and the `users/` dynamic-route example) |

**The idea canvas's own counts are off, and the plan uses the measured ones.** VRTX3-I-0037 says "the project already serves 186 endpoints of exactly this shape" and "`routes/api/` already holds 187 files". The 187 is right but it counts _files_, not endpoints; the endpoint figure is **92**, because every probe handler has a colocated test that is not a route. This changes nothing about the work — it is three new probes either way — but the root docs carry a probe count that must be right, so the number that goes into them is 92 → 95, re-derived from the tree.

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

### Nothing named `458730798` exists yet

A repo-wide `grep -rn "458730798"` across `.ts`, `.tsx` and `.md` (excluding `node_modules`) returned zero matches. These are never-written files, not typo'd filenames — the change is purely additive.

### The SPA-fallback baseline, re-measured live

Taken against `bun run dev` in this container, which bound port **5000** (read from the Vite banner — see the port note under Risks):

| Path                                       | Status | `Content-Type`                   | Size  | Body                                |
| ------------------------------------------ | ------ | -------------------------------- | ----- | ----------------------------------- |
| `/api/healthz-smoke-458730798-a`           | `200`  | `text/html; charset=utf-8`       | 949 B | `<!doctype html>…` (SPA shell)      |
| `/api/healthz-smoke-458730798-b`           | `200`  | `text/html; charset=utf-8`       | 949 B | `<!doctype html>…` (SPA shell)      |
| `/api/healthz-smoke-458730798-c`           | `200`  | `text/html; charset=utf-8`       | 949 B | `<!doctype html>…` (SPA shell)      |
| `/api/healthz-smoke-528856326-a` (control) | `200`  | `application/json;charset=UTF-8` | 33 B  | `{"ok":true,"variant":"528856326"}` |

**Nineteenth consecutive confirmation of the trap in [AGENT.md § Gotchas](../../AGENT.md#gotchas), ninth on an enhancement.** A missing `/api/*` path is answered by the SPA `index.html` shell with `200 text/html`, so status code alone cannot distinguish a working endpoint from a missing one. VRTX3-I-0037 makes no `404` claim — there was nothing to debunk — and the measurement was taken anyway, which is the rule.

### The copy-source substitution is real this sprint

This is the finding that changes what gets written, so it is stated in full.

VRTX3-I-0037 names `routes/api/healthz-smoke-302960562-a.test.ts` as the test template, in two places: under **Technical Approach** ("mirrors `routes/api/healthz-smoke-302960562-a.test.ts` … plus the <100 ms timing assertion") and under **Affected Code** ("test shape, including the <100 ms assertion"). It then pins that shape into **AC-6**: _"Each handler returns in under 100 ms when invoked directly in its unit test."_

That file is one of the **47 pre-VRTX3-S-0011 probe tests that carry the flaky `expect(elapsed).toBeLessThan(100)` case** — verified by reading it this sprint. It is a wall-clock assertion on a shared CI runner: machine-dependent, a known flake source, and it proves nothing about the response contract. VRTX3-S-0011 deliberately dropped it and produced the single-assertion shape now pinned in [AGENT.md § Health Probe Routes](../../AGENT.md#health-probe-routes), which states that its `528856326` pointer **outranks any file an idea names**.

Nine of the last ten ideas named the documented `528856326` pair themselves, so the substitution was a no-op each time; VRTX3-I-0036 named a shape-identical neighbour, so it was a no-op again. **VRTX3-I-0037 is the first since VRTX3-I-0026 where following the pointer actually changes the file that gets written.** The three TASKs are held to the `528856326` shape — one `it()` case, one body assertion — and each carries an explicit acceptance criterion forbidding an elapsed-time assertion, so the substitution is checkable rather than trusted.

**Consequence for AC-6:** it is not carried into any ticket. It specifies an implementation detail (a timing assertion inside the unit test) that this repo's own guide forbids, and the property it is reaching for — the handler performs no I/O — is already guaranteed by the interface contract every TASK carries: the only import is `nitro/h3`, no `db/`, no `event.context` read. Nothing is lost by dropping it.

### Harness and CI already cover this work

- `vite.config.ts` — `nitro({ serverDir: "./", ignore: ["**/*.test.ts"] })`. A new `routes/api/*.ts` is registered by filename alone; the colocated `*.test.ts` is kept out of the server bundle by the same line. This satisfies idea AC-9 with no change.
- `vitest.config.ts` — the `server` project (`environment: "node"`, `include: ["routes/**/*.test.ts"]`) collects a new probe test with no configuration. The `client` jsdom project excludes `routes/**`.
- `.github/workflows/ci.yml` — already triggers on `push` **and** `pull_request` to `vortex/**`, `dev` and `main`, so ticket mini-PRs and the sprint branch both get check runs.

No harness or CI change is needed. Both phases below are verification-of-fit, folded into the implementing TASKs' criteria — neither earns a ticket.

---

## Target state

After this sprint the root docs say:

- **AGENT.md** — probe family count 92 → 95; a [Health Probe Routes](../../AGENT.md#health-probe-routes) note recording that the copy-source pointer changed a file for the first time in eleven sprints, and that the 47/95 flaky-test ratio is what makes it matter; [Gotchas](../../AGENT.md#gotchas) records the nineteenth SPA-fallback confirmation and Vite binding `:5000`.
- **PRODUCT.md** — probe count 92 → 95, most-recent-set pointer moves to this trio. Feature definition, user stories and per-probe acceptance criteria unchanged.
- **ARCHITECTURE.md** — probe-family count under [Routing](../../ARCHITECTURE.md#routing) 92 → 95, build-output example moved to this sprint's route. `## Key Decisions` unchanged — "Health probes duplicate, on purpose" already governs.
- **DESIGN.md** — no design-system change; changelog entry recording that the sprint is backend-only and that VRTX3-I-0037's design manifest is empty, so "unchanged" stays distinguishable from "not reviewed".

All four are brought to target state on the planning ticket, before any TASK exists. No TASK names a root doc.

---

## Implementation phases

Each phase is one TASK. Phases 1–3 are mutually independent — no shared file, no ordering relationship.

1. **Probe `-a`** — create `routes/api/healthz-smoke-458730798-a.ts` and its colocated `.test.ts`, copied from the `528856326` pair. Two new files.
2. **Probe `-b`** — same, for `-b`. Two new files.
3. **Probe `-c`** — same, for `-c`. Two new files.
4. **Test harness** _(mandatory phase — no ticket)_ — the Vitest `server` project already collects `routes/**/*.test.ts` in the node environment with no configuration. Verified by reading `vitest.config.ts`. Each TASK carries the fit check as an acceptance criterion ("collected and passes in Vitest's `server` project, with no change to `vitest.config.ts`") rather than a separate verify-only ticket, per the standing rule that testing folds into the implementing TASK.
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
| —     | VRTX3-T-0195 (EPIC)  | Health probe family 458730798                              |
| —     | VRTX3-T-0196 (STORY) | Three independent 458730798 health probes                  |
| 1     | VRTX3-T-0197         | `GET /api/healthz-smoke-458730798-a`                       |
| 2     | VRTX3-T-0198         | `GET /api/healthz-smoke-458730798-b`                       |
| 3     | VRTX3-T-0199         | `GET /api/healthz-smoke-458730798-c`                       |
| 4, 5  | —                    | Folded into 1–3's acceptance criteria; no ticket by design |

**No `depends_on` edge between VRTX3-T-0197, -0198 and -0199.** Their ownership maps are two files each and disjoint:

| Ticket                  | Owns                                                                                      |
| ----------------------- | ----------------------------------------------------------------------------------------- |
| VRTX3-T-0197            | `routes/api/healthz-smoke-458730798-a.ts`, `routes/api/healthz-smoke-458730798-a.test.ts` |
| VRTX3-T-0198            | `routes/api/healthz-smoke-458730798-b.ts`, `routes/api/healthz-smoke-458730798-b.test.ts` |
| VRTX3-T-0199            | `routes/api/healthz-smoke-458730798-c.ts`, `routes/api/healthz-smoke-458730798-c.test.ts` |
| VRTX3-T-0194 (planning) | `AGENT.md`, `PRODUCT.md`, `ARCHITECTURE.md`, `DESIGN.md`, `artifacts/VRTX3-S-0028/**`     |

The one file set the three TASKs could have collided on — the three root docs carrying the probe count — is held exclusively by the planning ticket and moves 92 → 95 once for the sprint, not 92 → 93 three times.

---

## Design reference

_No design reference on this idea._ `a2a_get_idea_design(ticket_key="VRTX3-T-0194")` returned `blocks: []` for VRTX3-I-0037. The sprint has no user-visible surface — nothing in `src/`, no page links to the new endpoints — so there is no mockup to build to. Nothing was exported to `artifacts/VRTX3-S-0028/design/`.

---

## Risks & assumptions

**R1 — the flaky timing assertion comes back by copy-paste.** _Likelihood: real this sprint, not hypothetical._ The idea names a template that carries it and an acceptance criterion that demands it. Mitigated three ways: the plan states the substitution above, each TASK's PLAN.md step 2 names the `528856326` pair explicitly, and each TASK carries an acceptance criterion that forbids `Date.now()` / `toBeLessThan` / any "responds in under Nms" case. 47 of the 92 existing probe tests still carry it, so a directory neighbour remains a coin flip.

**R2 — a status-code-only check passes against a missing route.** _Likelihood: high if unguarded; nineteen sprints running._ Mitigated by an acceptance criterion per TASK requiring the **body and `Content-Type`** from a live request, with the measured pre-state (949-byte `text/html` shell) named so the check has something to be different from.

**R3 — the dev-server port is not `:5000` when an implementation agent looks.** _Likelihood: moderate._ It bound `:5000` during this planning run, but the last ten sprints produced `:5005`, `:5006`, `:5007`, `:5000`, `:5001`, `:5002`, `:5000`, `:5000`, `:5000`, `:5000` — contention, not a trend, and not extrapolable in either direction. Mitigation: every PLAN.md says to read the port from the Vite banner. Measuring against the wrong port yields connection errors that look like a broken route.

**R4 — a reviewer asks to factor out the duplication.** _Likelihood: low, bounded._ The three files repeat ~8 lines each. Factoring them into a shared helper would delete the property the sprint exists to demonstrate. Governed by [ARCHITECTURE.md § Key Decisions](../../ARCHITECTURE.md#key-decisions) — "Health probes duplicate, on purpose" — and restated as a fixed interface contract in each PLAN.md.

**A1 — assumption:** file-based routing keeps mapping `routes/api/<name>.ts` → `/api/<name>`. Verified by reading `vite.config.ts` and by the control measurement above, not assumed from the canvas.

**A2 — assumption:** `middleware/auth.ts` runs on every request but only attaches a stub user and never rejects, so the probes are public with no change. Consistent with the 92 existing probes; the handlers ignore `event.context` entirely, so the assumption is not load-bearing for the deliverable.

**A3 — assumption:** no method guard is wanted. Non-`GET` verbs return the same 200 body, as with every sibling probe. The idea puts method handling out of scope, so the plan follows the out-of-scope line rather than specifying behaviour for it.
