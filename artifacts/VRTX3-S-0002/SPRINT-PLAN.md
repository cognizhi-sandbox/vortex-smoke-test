---
artifact: sprint-plan
spec: 1
status: complete
author_role: planning
sprint: VRTX3-S-0002
idea: VRTX3-I-0005 (VRTX3-T-0009 only; VRTX3-T-0007 and VRTX3-T-0008 have none linked)
branch: vortex/sprint/vrtx3-s-0002-4688bb08
downstream:
  [
    artifacts/VRTX3-S-0002/VRTX3-T-0007/PLAN.md,
    artifacts/VRTX3-S-0002/VRTX3-T-0008/PLAN.md,
    artifacts/VRTX3-S-0002/VRTX3-T-0009/PLAN.md,
  ]
---

# Sprint plan — VRTX3-S-0002

Bugfix sprint. This file is an **index**; each defect's RCA and fix plan live in exactly one place —
that defect's own `PLAN.md`, linked below.

## Goal

Serve the three missing health probes, each answering `GET` with HTTP 200,
`Content-Type: application/json` and a body deep-equal to `{ "ok": true, "variant": "<id>" }`
(VRTX3-T-0007, VRTX3-T-0008 and VRTX3-T-0009 as committed).

## Defects

| Ticket       | Path                                   | Root cause (one line)                                                                   | Plan                                          |
| ------------ | -------------------------------------- | --------------------------------------------------------------------------------------- | --------------------------------------------- |
| VRTX3-T-0007 | `/api/healthz-smoke-bugfix-158202122`  | Handler file was never written; Nitro registers by filename, so the path never existed. | `artifacts/VRTX3-S-0002/VRTX3-T-0007/PLAN.md` |
| VRTX3-T-0008 | `/api/healthz-smoke-bugfix2-142310404` | Same — never-written file, not a regression and not a typo'd filename.                  | `artifacts/VRTX3-S-0002/VRTX3-T-0008/PLAN.md` |
| VRTX3-T-0009 | `/api/healthz-smoke-bugfix3-834560860` | Same. VRTX3-I-0005 reached this from source; re-measured live and confirmed.            | `artifacts/VRTX3-S-0002/VRTX3-T-0009/PLAN.md` |

## Cross-cutting notes

**1. This sprint key and all three ticket keys are RECYCLED — the artifact directory already held a
different sprint's finished work.** `artifacts/VRTX3-S-0002/` was committed in `e167bb8` by an
earlier sprint that also ran as `VRTX3-S-0002` with tickets `VRTX3-T-0007/0008/0009`, for variants
`106285986`, `524723214`, `764107669` (see the 2026-08-02 entry in `AGENT.md` § Changelog). The four
files this planning ticket owns — this index and the three `PLAN.md` files — have been **overwritten**
and now describe the current defects. The rest of that directory is stale and was left in place,
because deleting another sprint's record is outside this ticket:
`{integration-test-result,qa-test-report,release-notes,sprint-summary}.md` at the sprint level, and
`{fix-note,tdd-test-result}.md` inside each per-ticket directory. **Implementation: ignore them.**
Each `fix-note.md` reports a _completed_ fix for a variant that is not yours, so a glance at your
ticket's directory reads as "already done". Read only the `PLAN.md`.

**2. The reported `404` is wrong on all three — re-measured, not cited.** A live dev server was run
during planning; the Vite banner reported `:5000` (read the banner, do not assume). Measured:

```
/api/healthz-smoke-bugfix-158202122     200 text/html; charset=utf-8       949b   (SPA shell)
/api/healthz-smoke-bugfix2-142310404    200 text/html; charset=utf-8       949b   (SPA shell)
/api/healthz-smoke-bugfix3-834560860    200 text/html; charset=utf-8       949b   (SPA shell)
/api/healthz-smoke-528856326-a          200 application/json;charset=UTF-8   33b   {"ok":true,"variant":"528856326"}   ← control
```

Twenty-second consecutive confirmation of the SPA-fallback trap (`AGENT.md` § Gotchas). **Status code
cannot distinguish a missing probe from a working one** — verify on body and `Content-Type`.

**3. The uneven-capture split, for the fourth time** (after VRTX3-S-0018, -0020 and -0024).
VRTX3-I-0005 sits behind VRTX3-T-0009 and predicted the `200 text/html` result correctly from source,
labelling its own `404` a likely mis-transcription and stating it could measure nothing (no dev
server in its capture container). VRTX3-T-0007 and VRTX3-T-0008 have no idea linked and repeat the
`404` unchecked. A ticket does not tell you which kind you hold — all three were measured.

**4. Repo-wide grep for `158202122`, `142310404` and `834560860` returned zero matches** (excluding
`node_modules`/`.git`) — never-written files, not misnamed ones.

**5. Ownership maps are fully disjoint — no `depends_on`, all three run in parallel.** Each ticket
owns exactly two new files under `routes/api/` and modifies nothing existing. This is the "Health
probes duplicate, on purpose" decision in `ARCHITECTURE.md` § Key Decisions working as designed.
**Do not factor out a shared handler, factory, constants file or barrel export.**

**6. Copy the `528856326` pair — VRTX3-I-0005 names a different template, and it was substituted.**
The canvas names `routes/api/healthz-smoke-bugfix3-351014898.test.ts`. Diffed during planning: it is
shape-identical to the pinned pair (single body assertion, no wall-clock case) because it postdates
VRTX3-S-0011, so the substitution costs nothing here. It is taken because 47 of the 100 existing
probe tests do carry `expect(elapsed).toBeLessThan(100)`, and the rule does not depend on which
neighbour a canvas sampled (`AGENT.md` § Health Probe Routes).

**7. Root docs are already at target state on this branch — no ticket touches them.** The probe
family count is re-derived from the filesystem and bumped 100 → 103 in `AGENT.md`, `ARCHITECTURE.md`
and `PRODUCT.md`, with dated changelog entries, on this planning ticket. VRTX3-I-0005's AC-6 agrees
the bump is planning-owned but reads it as 100 → 101 — that is the per-defect view; the sprint moves
the count once. `DESIGN.md` is unchanged: no user-visible surface moves.

**8. No method guard, and no test-harness or CI change.** No `healthz-smoke-*` handler declares one;
adding a `405` to one route alone would make it inconsistent with 100 siblings.
`nitro({ serverDir: "./" })` registers a new `routes/api/*.ts` by filename alone, the Vitest `server`
project collects a colocated `*.test.ts` with no configuration, and `.github/workflows/ci.yml`
already triggers on `push`/`pull_request` to `vortex/**`.

## Design reference

_No design reference._ The design manifest for VRTX3-I-0005 (doc v10, frozen) returned zero blocks,
and the other two tickets have no idea linked. Nothing was exported to
`artifacts/VRTX3-S-0002/design/`; the sprint touches no user-visible surface.

## Risks & assumptions

- **A green unit test proves nothing on its own.** The colocated test imports the handler module
  directly, so it passes even if Nitro never registered the path — a filename typo would ship as a
  passing test and a dead URL. Only a live request against a running server catches it; each plan's
  test plan requires one, with the control route alongside it.
- **The recycled artifact directory is the live hazard of this sprint** (note 1): stale `fix-note.md`
  files sit beside the current plans and read as evidence of completed work.
- **Connection errors look like broken routes.** Measure on the port from the Vite banner; the
  control route distinguishes a dead server from a missing route.
- _Assumption:_ the three variant ids and the `-bugfix` / `-bugfix2` / `-bugfix3` infixes are exactly
  as written in the ticket titles. Verified against each title, each description, and VRTX3-I-0005
  for VRTX3-T-0009. All three infixes already exist in the family, so a wrong one collides with
  nothing and fails silently.

## Follow-ups / out of scope

- **Stale artifacts from the recycled `VRTX3-S-0002` key remain on disk** (note 1): six execution and
  close files describing the 2026-08-02 sprint's variants. They are not a product defect and none of
  the three committed tickets covers them, so nothing is filed. A future sprint should either
  namespace recycled sprint keys or clear the directory before planning writes into it.
- Root-causing surfaced no other defect. The stale-doc-count drift that bit VRTX3-S-0015 was checked
  for and is not present: `AGENT.md`, `ARCHITECTURE.md` and `PRODUCT.md` all read 100 pre-sprint,
  matching the filesystem (100 probe handlers, 100 colocated tests, 206 `.ts` files under
  `routes/api/` in total).
