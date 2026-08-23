---
artifact: sprint-plan
spec: 1
status: complete
author_role: planning
sprint: VRTX3-S-0035
idea: VRTX3-I-0042
branch: vortex/sprint/vrtx3-s-0035-b613a5d1
downstream:
  [
    artifacts/VRTX3-S-0035/VRTX3-T-0230/PLAN.md,
    artifacts/VRTX3-S-0035/VRTX3-T-0231/PLAN.md,
    artifacts/VRTX3-S-0035/VRTX3-T-0232/PLAN.md,
  ]
---

# Sprint plan — VRTX3-S-0035

**Title:** Three Independent Health Check Endpoints (180848429)
**Idea:** VRTX3-I-0042 — `[smoke-178750265936369] 3 independent endpoints (180848429)` (enhancement, doc v15, frozen)
**Planning ticket:** VRTX3-T-0227
**Created:** 2026-08-23

---

## Goal

Ship three standalone Nitro health probes — `GET /api/healthz-smoke-180848429-a`, `-b` and `-c` — each answering with `Content-Type: application/json` and a body deep-equal to `{ "ok": true, "variant": "180848429" }` (VRTX3-I-0042, AC-1 … AC-8).

The three URLs are the visible deliverable. The property the sprint exists to demonstrate is the second-order one the idea states in its own success metrics: three unrelated units of work get picked up, built, tested and merged **in parallel**, with file-ownership maps that do not intersect at a single line.

---

## Codebase findings (Stage 0)

Read this sprint: `routes/api/` (224 files), `vite.config.ts`, `vitest.config.ts`, `package.json`, `.github/workflows/ci.yml`, `README.md`, and the four root docs. Every number below is measured against this working tree, not carried forward from a prior plan.

### The pattern already exists 109 times over

| Count | What                                                                                                                                 |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------ |
| 109   | `healthz-smoke-*` handlers under `routes/api/`                                                                                       |
| 109   | colocated `healthz-smoke-*.test.ts` files                                                                                            |
| 224   | total files under `routes/api/` (the 218 probe files, `hello.ts`, `hello.post.ts`, `hello.test.ts`, and the three `users/` examples) |

The count that goes into the root docs is **109 → 112**, re-derived from the tree rather than incremented from the last plan.

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

### Nothing named `180848429` exists yet

A repo-wide `grep -rn "180848429"` across `.ts`, `.tsx` and `.md` (excluding `node_modules` and `artifacts/`) returned zero matches. These are never-written files, not typo'd filenames — the change is purely additive.

### The SPA-fallback baseline, re-measured live

Taken against `bun run dev` in this container, which bound port **5000** (read from the Vite banner — see R3):

| Path                                       | Status | `Content-Type`                   | Size  | Body                                |
| ------------------------------------------ | ------ | -------------------------------- | ----- | ----------------------------------- |
| `/api/healthz-smoke-180848429-a`           | `200`  | `text/html; charset=utf-8`       | 949 B | `<!doctype html>…` (SPA shell)      |
| `/api/healthz-smoke-180848429-b`           | `200`  | `text/html; charset=utf-8`       | 949 B | `<!doctype html>…` (SPA shell)      |
| `/api/healthz-smoke-180848429-c`           | `200`  | `text/html; charset=utf-8`       | 949 B | `<!doctype html>…` (SPA shell)      |
| `/api/healthz-smoke-528856326-a` (control) | `200`  | `application/json;charset=UTF-8` | 33 B  | `{"ok":true,"variant":"528856326"}` |

**Twenty-fifth consecutive confirmation of the trap in [AGENTS.md § Gotchas](../../AGENTS.md#gotchas), eleventh on an enhancement.** A missing `/api/*` path is answered by the SPA `index.html` shell with `200 text/html`, so status code alone cannot distinguish a working endpoint from a missing one.

VRTX3-I-0042 is a new variant of the input to this rule, worth naming precisely. It opens with _"all return 404 today … Nothing in `routes/api/` matches `180848429` (verified)"_ — the second half is right and was independently re-verified above; the first half is the same `404` mis-transcription the ten bugfix sprints kept hitting, arriving this time inside an **enhancement** canvas that has otherwise measured its own repository carefully. The `(verified)` parenthetical attaches to the grep, not to the status code, and the two claims came from different sources. The measurement was taken regardless, which is the rule.

### The copy-source pointer fires — third harmful instance, and the sharpest form of it yet

VRTX3-I-0042 names `routes/api/healthz-smoke-913793173-a.ts` and its `.test.ts` as the reference to copy, in three places: **Solution**, **Technical Approach**, and **Affected Code** ("Reference to copy"). That file is pre-VRTX3-S-0011 and carries the second case this repo stopped writing:

```ts
it("responds in under 100ms", async () => {
  const start = Date.now();
  await healthz(event);
  const elapsed = Date.now() - start;
  expect(elapsed).toBeLessThan(100);
});
```

It is also, verbatim, the first of the three files [AGENTS.md § Health Probe Routes](../../AGENTS.md#health-probe-routes) already lists as an example of the 47. **Substitute the `528856326` pair.** Every PLAN.md below pins it and every TASK carries a criterion forbidding the timing case.

What makes this the sharpest instance of the drift so far, and the reason it is recorded in AGENTS.md rather than just here: VRTX3-I-0042's own **Risks** section identifies this exact failure mode in its own words — _"`routes/api/` already holds ~200 `healthz-smoke-*` files; the directory is noisy, so an agent could copy the wrong reference file"_ — and then names a legacy file as the mitigation for it. The two prior harmful instances (VRTX3-I-0037, VRTX3-I-0041) drifted by sampling a neighbour without noticing the hazard; this one names the hazard and still lands on the wrong side of it. That is as strong a demonstration as the family is likely to produce that a canvas cannot self-correct here: the information needed to pick a safe neighbour is not in the directory, it is in AGENTS.md.

Two differences from VRTX3-I-0037 and VRTX3-I-0041 keep this cheaper to contain. The canvas does **not** pin the timing shape into an acceptance criterion of its own — its AC-5 asks only that the test assert the handler resolves to the object — so the drift would enter purely by copy, and dropping the extra `it()` block satisfies every AC as written. Three harmful instances now stand against three harmless (VRTX3-I-0036, VRTX3-I-0005, VRTX3-I-0006); the ratio that governs the next sprint is unchanged at **47 of 109**, because those 47 files are never rewritten.

### Two idea acceptance criteria are commands, not outcomes

VRTX3-I-0042's AC-6 and AC-7 read `bun run verify (eslint --max-warnings 0, tsc --build, vitest run) passes with the new files present` and `bun run build succeeds and all three routes respond from the built .output server`.

A ticket carries the outcome; the command is fixed by the implementing role and its stack, not by a ticket. Both are carried below as outcomes — the new test passes and the existing suite stays green; the production build emits `.output/server/_routes/api/healthz_smoke_180848429_<letter>.mjs` and no `*.test.ts` — which is what AC-6 and AC-7 were reaching for and is checkable without naming a script. The substance of both is preserved; only the imperative form is dropped.

### The idea's out-of-scope line on root docs, and why the counts still move

VRTX3-I-0042's **Out of Scope** says: _"No README/ARCHITECTURE update — these are throwaway probe endpoints."_

That line is respected where it governs and overridden where it does not:

- **`README.md` is not touched.** It carries no probe-family count — `grep -niE "healthz|probe" README.md` returns nothing at all — so there is nothing in it to go stale. This is the second sprint running that an idea has named `README.md` as carrying the count (VRTX3-I-0040 was the first); it does not.
- **`ARCHITECTURE.md`, `PRODUCT.md` and `AGENTS.md` do carry the count**, and it moves 109 → 112. These are root docs: planning-owned, brought to target state on VRTX3-T-0227 before any TASK exists, and never in an implementation ticket's scope. An idea cannot scope work off a document it does not own, and a stated count that is silently wrong is worse than a throwaway endpoint. The endpoints being disposable is an argument about the endpoints, not about the register that counts them.

Consequence for the decomposition: no TASK touches any document. The three TASKs own exactly two new files each and nothing else.

### Harness and CI already cover this work

- `vite.config.ts` — `nitro({ serverDir: "./", ignore: ["**/*.test.ts"] })`. A new `routes/api/*.ts` is registered by filename alone; the colocated `*.test.ts` is kept out of the server bundle by the same line. This satisfies idea AC-7's second clause with no change.
- `vitest.config.ts` — the `server` project (`environment: "node"`, `include: ["routes/**/*.test.ts"]`) collects a new probe test with no configuration. The `client` jsdom project excludes `routes/**`.
- `.github/workflows/ci.yml` — already triggers on `push` **and** `pull_request` to `vortex/**`, `dev` and `main`, so ticket mini-PRs and the sprint branch both get check runs. Steps: doc-links → typecheck → lint → test → build.

No harness or CI change is needed. Both phases below are verification-of-fit, folded into the implementing TASKs' criteria — neither earns a ticket.

---

## Target state

After this sprint the root docs say:

- **AGENTS.md** — probe family count 109 → 112; [Health Probe Routes](../../AGENTS.md#health-probe-routes) records the third harmful instance and its new property (a canvas that names the hazard and still names a legacy file); [Gotchas](../../AGENTS.md#gotchas) records the twenty-fifth SPA-fallback confirmation, the first `404` mis-transcription to arrive inside an enhancement canvas, and Vite binding `:5000`.
- **PRODUCT.md** — probe count 109 → 112, most-recent-set pointer moves to this trio. Feature definition, user stories and per-probe acceptance criteria unchanged; the `README.md` correction and the throwaway-endpoints out-of-scope line recorded against the idea rather than the criteria.
- **ARCHITECTURE.md** — probe-family count under [Routing](../../ARCHITECTURE.md#routing) 109 → 112, build-output example moved to this sprint's route. `## Key Decisions` unchanged — "Health probes duplicate, on purpose" already governs, and the new evidence bounds its cost rather than reopening it.
- **DESIGN.md** — no design-system change; changelog entry recording that the sprint is backend-only and that VRTX3-I-0042's design manifest is empty, so "unchanged" stays distinguishable from "not reviewed".

All four are brought to target state on the planning ticket, before any TASK exists. No TASK names a root doc.

---

## Implementation phases

Each phase is one TASK. Phases 1–3 are mutually independent — no shared file, no ordering relationship.

1. **Probe `-a`** — create `routes/api/healthz-smoke-180848429-a.ts` and its colocated `.test.ts`, copied from the `528856326` pair. Two new files.
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
| —     | VRTX3-T-0228 (EPIC)  | Health probe family 180848429                              |
| —     | VRTX3-T-0229 (STORY) | Three independent 180848429 health probes                  |
| 1     | VRTX3-T-0230         | `GET /api/healthz-smoke-180848429-a`                       |
| 2     | VRTX3-T-0231         | `GET /api/healthz-smoke-180848429-b`                       |
| 3     | VRTX3-T-0232         | `GET /api/healthz-smoke-180848429-c`                       |
| 4, 5  | —                    | Folded into 1–3's acceptance criteria; no ticket by design |

**No `depends_on` edge between VRTX3-T-0230, -0231 and -0232.** Their ownership maps are two files each and disjoint:

| Ticket                  | Owns                                                                                      |
| ----------------------- | ----------------------------------------------------------------------------------------- |
| VRTX3-T-0230            | `routes/api/healthz-smoke-180848429-a.ts`, `routes/api/healthz-smoke-180848429-a.test.ts` |
| VRTX3-T-0231            | `routes/api/healthz-smoke-180848429-b.ts`, `routes/api/healthz-smoke-180848429-b.test.ts` |
| VRTX3-T-0232            | `routes/api/healthz-smoke-180848429-c.ts`, `routes/api/healthz-smoke-180848429-c.test.ts` |
| VRTX3-T-0227 (planning) | `AGENTS.md`, `PRODUCT.md`, `ARCHITECTURE.md`, `DESIGN.md`, `artifacts/VRTX3-S-0035/**`    |

The one file set the three TASKs could have collided on — the three root docs carrying the probe count — is held exclusively by the planning ticket and moves 109 → 112 once for the sprint, not 109 → 110 three times. `README.md` is in no ticket's map, because it carries no probe count.

---

## Design reference

_No design reference on this idea._ `a2a_get_idea_design(ticket_key="VRTX3-T-0227")` returned `blocks: []` for VRTX3-I-0042, and the idea's own **Wireframes** section is empty. The sprint has no user-visible surface — nothing in `src/`, no page links to the new endpoints, and the idea puts UI explicitly out of scope. Nothing was exported to `artifacts/VRTX3-S-0035/design/`.

---

## Risks & assumptions

**R1 — the flaky timing assertion comes back by copy-paste.** _Likelihood: active this sprint._ VRTX3-I-0042 names `healthz-smoke-913793173-a.ts` / `.test.ts` three times, and that test carries `expect(elapsed).toBeLessThan(100)`. Mitigated by each PLAN.md pinning the `528856326` pair with the reason, and by each TASK carrying an acceptance criterion that forbids `Date.now()`, `toBeLessThan` and any "responds in under N ms" case. The property the assertion reaches for — the handler does no I/O — is already guaranteed by the interface contract (only import is `nitro/h3`, no `db/`, no `event.context` read), so nothing is lost by dropping it. Note the canvas's AC-5 does not require it, so no acceptance criterion is contradicted.

**R2 — a status-code-only check passes against a missing route.** _Likelihood: high if unguarded; twenty-five sprints running._ Mitigated by an acceptance criterion per TASK requiring the **body and `Content-Type`** from a live request, with the measured pre-state (949-byte `text/html` shell) named so the check has something to be different from, plus a second criterion on the built module under `.output/server/_routes/api/`. VRTX3-I-0042's opening `404` claim is the mis-transcription this rule exists for.

**R3 — the dev-server port is not `:5000` when an implementation agent looks.** _Likelihood: moderate._ It bound `:5000` during this planning run, but the last thirteen sprints produced `:5005`, `:5006`, `:5007`, `:5000`, `:5001`, `:5002`, `:5000`, `:5000`, `:5000`, `:5000`, `:5000`, `:5002` and `:5000` — contention, not a trend, and not extrapolable in either direction. Mitigation: every PLAN.md says to read the port from the Vite banner. Measuring against the wrong port yields connection errors that look like a broken route.

**R4 — a reviewer asks to factor out the duplication.** _Likelihood: low, bounded._ The three files repeat ~8 lines each. Factoring them into a shared helper would delete the property the sprint exists to demonstrate, and the idea rules it out in its own out-of-scope list. Governed by [ARCHITECTURE.md § Key Decisions](../../ARCHITECTURE.md#key-decisions) — "Health probes duplicate, on purpose" — and restated as a fixed interface contract in each PLAN.md.

**R5 — an implementation agent reads the idea's out-of-scope line and edits, or declines to edit, a document.** _Likelihood: low._ VRTX3-I-0042 says "No README/ARCHITECTURE update"; the root-doc counts move anyway, on the planning ticket, and `README.md` genuinely is not touched. No TASK's ownership map includes any document, and each TASK carries an acceptance criterion that its diff is exactly two new files — so a documentation edit fails the ticket rather than passing silently, and the absence of one is not something an implementation agent needs to reason about.

**A1 — assumption:** file-based routing keeps mapping `routes/api/<name>.ts` → `/api/<name>`. Verified by reading `vite.config.ts` and by the control measurement above, not assumed from the canvas.

**A2 — assumption:** `middleware/auth.ts` runs on every request but only attaches a stub user and never rejects, so the probes are public with no change. Consistent with the 109 existing probes; the handlers ignore `event.context` entirely, so the assumption is not load-bearing for the deliverable. This is idea AC-8, satisfied structurally.

**A3 — assumption:** no method guard is wanted. Non-`GET` verbs return the same 200 body, as with every sibling probe. The idea puts method handling out of scope, so the plan follows the out-of-scope line rather than specifying behaviour for it.
