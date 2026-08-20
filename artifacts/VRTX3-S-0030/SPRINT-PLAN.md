---
artifact: sprint-plan
spec: 1
status: complete
author_role: planning
sprint: VRTX3-S-0030
idea: none-linked
branch: vortex/sprint/vrtx3-s-0030-e2c3a0d0
downstream:
  [artifacts/VRTX3-S-0030/VRTX3-T-0206/PLAN.md, artifacts/VRTX3-S-0030/VRTX3-T-0207/PLAN.md]
---

# Sprint plan — VRTX3-S-0030

Bugfix sprint. This file is an **index**; each defect's RCA and fix plan live in exactly one place —
that defect's own `PLAN.md`, linked below.

## Goal

Serve the two missing health probes, each answering `GET` with HTTP 200,
`Content-Type: application/json` and a body deep-equal to `{ "ok": true, "variant": "<id>" }`
(VRTX3-T-0206 and VRTX3-T-0207 as committed).

## Defects

| Ticket       | Path                                      | Root cause (one line)                                                                   | Plan                                          |
| ------------ | ----------------------------------------- | --------------------------------------------------------------------------------------- | --------------------------------------------- |
| VRTX3-T-0206 | `/api/healthz-smoke-bugfix-ha-853006542`  | Handler file was never written; Nitro registers by filename, so the path never existed. | `artifacts/VRTX3-S-0030/VRTX3-T-0206/PLAN.md` |
| VRTX3-T-0207 | `/api/healthz-smoke-bugfix-ha2-165600260` | Same — never-written file, not a regression and not a typo'd filename.                  | `artifacts/VRTX3-S-0030/VRTX3-T-0207/PLAN.md` |

## Cross-cutting notes

**1. The reported `404` is wrong on both — re-measured, not cited.** A live dev server was run
during planning; the Vite banner reported `:5002` (`5000` and `5001` were both in use — read the
banner, do not assume). Measured:

```
/api/healthz-smoke-bugfix-ha-853006542    200 text/html; charset=utf-8       949b   (SPA shell)
/api/healthz-smoke-bugfix-ha2-165600260   200 text/html; charset=utf-8       949b   (SPA shell)
/api/healthz-smoke-528856326-a            200 application/json;charset=UTF-8   33b   {"ok":true,"variant":"528856326"}   ← control
```

Twentieth consecutive confirmation of the SPA-fallback trap (`AGENT.md` § Gotchas). **Status code
cannot distinguish a missing probe from a working one** — verify on body and `Content-Type`. Neither
ticket has an idea linked, so nothing upstream sanity-checked the code; both assert `404` unchecked.

**2. Both ticket paths omit the `/api/` prefix — a labelling slip, not a second defect.** The
tickets write `/healthz-smoke-bugfix-ha-853006542` and `/healthz-smoke-bugfix-ha2-165600260`. All 95
existing probes live under `routes/api/` and serve at `/api/…`. Measured in the same session, the
working control served without the prefix (`/healthz-smoke-528856326-a`) also returns the 949-byte
SPA shell — so the prefix is required, and both fixes land under `routes/api/`.

**3. Repo-wide grep for `853006542` and `165600260` returned zero matches** (excluding
`node_modules`/`.git`) — never-written files, not misnamed ones.

**4. The `-ha` / `-ha2` infix is new to this family.** Zero existing filenames carry it, so there is
no neighbour to pattern-match against and no risk of colliding with an existing route. Copy the
variant id and the infix from the ticket title exactly; `-ha-` and `-ha2-` are distinct routes, not
a typo for one another.

**5. Ownership maps are fully disjoint — no `depends_on`, both run in parallel.** Each ticket owns
exactly two new files under `routes/api/` and modifies nothing existing. This is the "Health probes
duplicate, on purpose" decision in `ARCHITECTURE.md` § Key Decisions working as designed. **Do not
factor out a shared handler, factory, constants file or barrel export.**

**6. Copy the `528856326` pair — not an older probe, not one a report names.** 47 of the 95 existing
probe tests carry a flaky wall-clock `responds in under 100ms` case; the current shape is a single
body assertion (`AGENT.md` § Health Probe Routes). Neither ticket names a template, so there is
nothing to substitute this sprint — but the pinned pair is the source regardless.

**7. Root docs are already at target state on this branch — no ticket touches them.** The probe
family count is re-derived from the filesystem and bumped 95 → 97 in `AGENT.md`, `ARCHITECTURE.md`
and `PRODUCT.md`, with dated changelog entries, as part of this planning ticket. `DESIGN.md` is
unchanged: no user-visible surface moves.

**8. No method guard, and no test-harness or CI change.** No `healthz-smoke-*` handler declares one;
adding a `405` to one route alone would make it inconsistent with 95 siblings.
`nitro({ serverDir: "./" })` registers a new `routes/api/*.ts` by filename alone, the Vitest
`server` project collects a colocated `*.test.ts` with no configuration, and
`.github/workflows/ci.yml` already triggers on `push`/`pull_request` to `vortex/**`.

## Design reference

_No design reference._ Neither committed ticket is linked to an idea, so there is no canvas and no
design manifest to export; the sprint touches no user-visible surface.

## Risks & assumptions

- **A green unit test proves nothing on its own.** The colocated test imports the handler module
  directly, so it passes even if Nitro never registered the path — a filename typo would ship as a
  passing test and a dead URL. Only a live request against a running server catches it; each plan's
  test plan requires one, with the control route alongside it.
- **Connection errors look like broken routes.** Measure on the port from the Vite banner; the
  control route distinguishes a dead server from a missing route.
- _Assumption:_ the two variant ids and the `-ha` / `-ha2` infixes are exactly as written in the
  ticket titles. Verified — each appears identically in its ticket title and description. No idea
  canvas exists to cross-check against.

## Follow-ups / out of scope

- **None.** Root-causing surfaced no defect beyond the two committed tickets. The stale-doc-count
  drift that bit VRTX3-S-0015 was checked for and is not present: `AGENT.md`, `ARCHITECTURE.md` and
  `PRODUCT.md` all read 95 pre-sprint, matching the filesystem (95 probe handlers, 95 colocated
  tests, plus `hello.ts`, `hello.test.ts` and the `users/` example).
