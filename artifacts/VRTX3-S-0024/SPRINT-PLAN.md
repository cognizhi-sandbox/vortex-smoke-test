---
artifact: sprint-plan
spec: 1
status: complete
author_role: planning
sprint: VRTX3-S-0024
idea: VRTX3-I-0033
branch: vortex/sprint/vrtx3-s-0024-e6a9735d
downstream:
  [
    artifacts/VRTX3-S-0024/VRTX3-T-0167/PLAN.md,
    artifacts/VRTX3-S-0024/VRTX3-T-0168/PLAN.md,
    artifacts/VRTX3-S-0024/VRTX3-T-0169/PLAN.md,
  ]
---

# Sprint plan — VRTX3-S-0024

Bugfix sprint. This file is an **index**; each defect's RCA and fix plan live in exactly one place —
that defect's own `PLAN.md`, linked below.

## Goal

Serve the three missing health probes, each answering `GET` with HTTP 200,
`Content-Type: application/json` and a body deep-equal to `{ "ok": true, "variant": "<id>" }`
(VRTX3-I-0033 Fix Acceptance Criteria; VRTX3-T-0167/-0168/-0169 as committed).

## Defects

| Ticket       | Path                                   | Root cause (one line)                                                                   | Plan                                          |
| ------------ | -------------------------------------- | --------------------------------------------------------------------------------------- | --------------------------------------------- |
| VRTX3-T-0167 | `/api/healthz-smoke-bugfix-27681476`   | Handler file was never written; Nitro registers by filename, so the path never existed. | `artifacts/VRTX3-S-0024/VRTX3-T-0167/PLAN.md` |
| VRTX3-T-0168 | `/api/healthz-smoke-bugfix2-107364458` | Same — never-written file, not a regression and not a typo'd filename.                  | `artifacts/VRTX3-S-0024/VRTX3-T-0168/PLAN.md` |
| VRTX3-T-0169 | `/api/healthz-smoke-bugfix3-351014898` | Same — never-written file; the only ticket of the three with an idea canvas behind it.  | `artifacts/VRTX3-S-0024/VRTX3-T-0169/PLAN.md` |

## Cross-cutting notes

**1. The reported `404` is wrong on all three — re-measured, not cited.** A live dev server was run
during planning (Vite banner: `:5000` this sprint — read the banner, do not assume). Measured:

```
/api/healthz-smoke-bugfix-27681476     200 text/html; charset=utf-8        949b   (SPA shell)
/api/healthz-smoke-bugfix2-107364458   200 text/html; charset=utf-8        949b   (SPA shell)
/api/healthz-smoke-bugfix3-351014898   200 text/html; charset=utf-8        949b   (SPA shell)
/api/healthz-smoke-528856326-a         200 application/json;charset=UTF-8   33b   {"ok":true,"variant":"528856326"}   ← control
```

Sixteenth consecutive confirmation of the SPA-fallback trap (`AGENT.md` § Gotchas). **Status code
cannot distinguish a missing probe from a working one** — verify on body and `Content-Type`. The
defects are real; only their stated symptom is not. Note the uneven capture again: only
VRTX3-T-0169 has an idea (VRTX3-I-0033, which correctly predicted the fallback but could not measure
it); -0167 and -0168 assert `404` unchecked.

**2. Repo-wide grep for `27681476`, `107364458` and `351014898` returned zero matches**
(excluding `node_modules`/`.git`) — never-written files, not misnamed ones.

**3. Ownership maps are fully disjoint — no `depends_on`, all three run in parallel.** Each ticket
owns exactly two new files under `routes/api/` and modifies nothing existing. This is the
"Health probes duplicate, on purpose" decision in `ARCHITECTURE.md` § Key Decisions working as
designed. **Do not factor out a shared handler, factory, constants file or barrel export.**

**4. Copy the `528856326` pair — not an older probe, not one a report names.** 47 of the 83 existing
probe tests carry a flaky wall-clock `responds in under 100ms` case; the current shape is a single
body assertion (`AGENT.md` § Health Probe Routes). VRTX3-I-0033 names the `528856326` pair itself,
so there is no substitution to make this sprint.

**5. Root docs are already at target state on this branch — no ticket touches them.** The probe
family count is re-derived from the filesystem and bumped 83 → 86 in `AGENT.md`, `ARCHITECTURE.md`
and `PRODUCT.md`, with dated changelog entries, as part of this planning ticket. `DESIGN.md` is
unchanged: no user-visible surface moves. VRTX3-I-0033's AC-6 asks the implementing ticket to bump
these counts — that is planning-owned work and has been dropped from every ticket's criteria.

**6. No method guard, and no test-harness or CI phase.** No `healthz-smoke-*` handler declares one;
adding a `405` to one route alone would make it inconsistent with 83 siblings, and VRTX3-I-0033 puts
non-`GET` handling out of scope. `nitro({ serverDir: "./" })` registers a new `routes/api/*.ts` by
filename alone, the Vitest `server` project collects a colocated `*.test.ts` with no configuration,
and `.github/workflows/ci.yml` already triggers on `push`/`pull_request` to `vortex/**`.

## Design reference

_No design reference on this idea._ VRTX3-I-0033's design manifest returned zero blocks; the sprint
touches no user-visible surface.

## Risks & assumptions

- **A green unit test proves nothing on its own.** The colocated test imports the handler module
  directly, so it passes even if Nitro never registered the path — a filename typo would ship as a
  passing test and a dead URL. Only a live request against a running server catches it; each plan's
  test plan requires one, with the control route alongside it.
- **Connection errors look like broken routes.** Measure on the port from the Vite banner; the
  control route distinguishes a dead server from a missing route.
- _Assumption:_ the three variant ids are exactly as written in the ticket titles. Verified — each
  appears identically in its ticket title, description and (for -0169) the canvas.

## Follow-ups / out of scope

- **None.** Root-causing surfaced no defect beyond the three committed tickets. The stale-doc-count
  drift that bit VRTX3-S-0015 was checked for and is not present: `AGENT.md`, `ARCHITECTURE.md` and
  `PRODUCT.md` all read 83 pre-sprint, matching the filesystem.
