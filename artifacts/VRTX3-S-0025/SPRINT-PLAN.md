---
artifact: sprint-plan
spec: 1
status: complete
author_role: planning
sprint: VRTX3-S-0025
idea: VRTX3-I-0034
branch: vortex/sprint/vrtx3-s-0025-c251997f
downstream:
  [
    artifacts/VRTX3-S-0025/VRTX3-T-0173/PLAN.md,
    artifacts/VRTX3-S-0025/VRTX3-T-0174/PLAN.md,
    artifacts/VRTX3-S-0025/VRTX3-T-0175/PLAN.md,
  ]
---

# Sprint plan — VRTX3-S-0025

Bugfix sprint. This file is an **index**; each defect's RCA and fix plan live in exactly one place —
that defect's own `PLAN.md`, linked below.

## Goal

Serve the three missing health probes, each answering `GET` with HTTP 200,
`Content-Type: application/json` and a body deep-equal to `{ "ok": true, "variant": "<id>" }`
(VRTX3-T-0173/-0174/-0175 as committed; VRTX3-I-0034 Fix Acceptance Criteria for the third).

## Defects

| Ticket       | Path                                   | Root cause (one line)                                                                   | Plan                                          |
| ------------ | -------------------------------------- | --------------------------------------------------------------------------------------- | --------------------------------------------- |
| VRTX3-T-0173 | `/api/healthz-smoke-bugfix-134576216`  | Handler file was never written; Nitro registers by filename, so the path never existed. | `artifacts/VRTX3-S-0025/VRTX3-T-0173/PLAN.md` |
| VRTX3-T-0174 | `/api/healthz-smoke-bugfix2-251329376` | Same — never-written file, not a regression and not a typo'd filename.                  | `artifacts/VRTX3-S-0025/VRTX3-T-0174/PLAN.md` |
| VRTX3-T-0175 | `/api/healthz-smoke-bugfix3-22079551`  | Same — never-written file; the only ticket of the three with an idea canvas behind it.  | `artifacts/VRTX3-S-0025/VRTX3-T-0175/PLAN.md` |

## Cross-cutting notes

**1. The reported `404` is wrong on all three — re-measured, not cited.** A live dev server was run
during planning. **Vite bound `:5001`** (`Port 5000 is in use, trying another one...` — read the
banner, do not assume, and do not extrapolate the drift either). Measured:

```
/api/healthz-smoke-bugfix-134576216    200 text/html; charset=utf-8        949b   (SPA shell)
/api/healthz-smoke-bugfix2-251329376   200 text/html; charset=utf-8        949b   (SPA shell)
/api/healthz-smoke-bugfix3-22079551    200 text/html; charset=utf-8        949b   (SPA shell)
/api/healthz-smoke-528856326-a         200 application/json;charset=UTF-8   33b   {"ok":true,"variant":"528856326"}   ← control
```

Seventeenth consecutive confirmation of the SPA-fallback trap (`AGENT.md` § Gotchas). **Status code
cannot distinguish a missing probe from a working one** — verify on body and `Content-Type`. The
defects are real; only their stated symptom is not.

**2. The uneven-capture split, for the fourth time** (after VRTX3-S-0018, -0020, -0024). Only
VRTX3-T-0175 has an idea (VRTX3-I-0034, which reasoned the fallback out correctly from `AGENT.md`,
labelled its own `404` a likely mis-transcription, and recorded that it could not measure — no
listener in its capture container). VRTX3-T-0173 and -0174 have **no idea linked at all**
(`a2a_get_idea` returns "not linked to an idea") and repeat the `404` verbatim. A ticket does not
tell you which kind you are holding; the measurement above is what licenses these plans.

**3. Repo-wide grep for `134576216`, `251329376` and `22079551` returned zero matches**
(excluding `node_modules`/`.git`), and none appears in `ls routes/api` — never-written files, not
misnamed ones serving some other URL.

**4. Ownership maps are fully disjoint — no `depends_on`, all three run in parallel.** Each ticket
owns exactly two new files under `routes/api/` and modifies nothing existing. This is the
"Health probes duplicate, on purpose" decision in `ARCHITECTURE.md` § Key Decisions working as
designed. **Do not factor out a shared handler, factory, constants file or barrel export.**

**5. Copy the `528856326` pair — not an older probe, not one a report names.** 47 of the 86 existing
probe tests carry a flaky wall-clock `responds in under 100ms` case; the current shape is a single
body assertion (`AGENT.md` § Health Probe Routes). VRTX3-I-0034 names the `528856326` pair itself —
the eighth idea in a row to name the documented template rather than sample the directory — so there
is no substitution to make this sprint.

**6. Root docs are already at target state on this branch — no ticket touches them.** The probe
family count is re-derived from the filesystem (86 non-test `healthz-smoke-*.ts` files pre-sprint)
and bumped 86 → 89 in `AGENT.md`, `ARCHITECTURE.md` and `PRODUCT.md`, with dated changelog entries,
as part of this planning ticket. `DESIGN.md` is unchanged: no user-visible surface moves.

**7. No method guard, and no test-harness or CI phase.** No `healthz-smoke-*` handler declares one;
adding a `405` to one route alone would make it inconsistent with 86 siblings, and VRTX3-I-0034 puts
non-`GET` handling out of scope. `nitro({ serverDir: "./" })` registers a new `routes/api/*.ts` by
filename alone, the Vitest `server` project collects a colocated `*.test.ts` with no configuration,
and `.github/workflows/ci.yml` already triggers on `push`/`pull_request` to `vortex/**`.

## Design reference

_No design reference on this idea._ VRTX3-I-0034's design manifest returned zero blocks; the sprint
touches no user-visible surface.

## Risks & assumptions

- **A green unit test proves nothing on its own.** The colocated test imports the handler module
  directly, so it passes even if Nitro never registered the path — a filename typo would ship as a
  passing test and a dead URL. Only a live request against a running server catches it; each plan's
  test plan requires one, with the control route alongside it.
- **Connection errors look like broken routes.** Measure on the port from the Vite banner; the
  control route distinguishes a dead server from a missing route.
- _Assumption:_ the three variant ids are exactly as written in the ticket titles. Verified — each
  appears identically in its ticket title, description and (for -0175) the canvas. Note that
  VRTX3-T-0175's id `22079551` is 8 digits where its siblings are 9; that is the id as captured, not
  a truncation to correct.

## Follow-ups / out of scope

- **None.** Root-causing surfaced no defect beyond the three committed tickets. The stale-doc-count
  drift that bit VRTX3-S-0015 was checked for and is not present: `AGENT.md`, `ARCHITECTURE.md` and
  `PRODUCT.md` all read 86 pre-sprint, matching the filesystem.
- One planning-side note carried forward: VRTX3-I-0034's Fix Acceptance Criteria name build/verify
  **commands**. Acceptance criteria state outcomes, not the commands that produce them, so those
  were rewritten as outcomes on the tickets. Its pre-fix re-measurement criterion was satisfied
  during planning (note 1) rather than delegated.
