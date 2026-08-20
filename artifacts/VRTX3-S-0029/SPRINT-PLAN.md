---
artifact: sprint-plan
spec: 1
status: complete
author_role: planning
sprint: VRTX3-S-0029
idea: Not Provided
branch: vortex/sprint/vrtx3-s-0029-877b7fd5
downstream:
  [artifacts/VRTX3-S-0029/VRTX3-T-0203/PLAN.md, artifacts/VRTX3-S-0029/VRTX3-T-0204/PLAN.md]
---

# Sprint plan — VRTX3-S-0029

Bugfix sprint. This file is an **index**; each defect's RCA and fix plan live in exactly one place —
that defect's own `PLAN.md`, linked below.

`idea: Not Provided` is literal: neither committed DEFECT carries an idea link, so
`a2a_get_idea_canvas` and `a2a_get_idea` both returned "not linked to an idea". Every claim below
was measured against this repository, not inherited.

## Goal

Serve the two missing health probes, each answering `GET` with HTTP 200,
`Content-Type: application/json` and a body deep-equal to `{ "ok": true, "variant": "<id>" }`
(VRTX3-T-0203, VRTX3-T-0204 as committed).

## Defects

| Ticket       | Path                                      | Root cause (one line)                                                                   | Plan                                          |
| ------------ | ----------------------------------------- | --------------------------------------------------------------------------------------- | --------------------------------------------- |
| VRTX3-T-0203 | `/api/healthz-smoke-bugfix-ha-971401638`  | Handler file was never written; Nitro registers by filename, so the path never existed. | `artifacts/VRTX3-S-0029/VRTX3-T-0203/PLAN.md` |
| VRTX3-T-0204 | `/api/healthz-smoke-bugfix-ha2-649579386` | Same — never-written file, not a regression and not a typo'd filename.                  | `artifacts/VRTX3-S-0029/VRTX3-T-0204/PLAN.md` |

## Cross-cutting notes

**1. The tickets report the paths WITHOUT the `/api/` prefix. Build them under `routes/api/`
anyway.** This is a new transcription drift — every prior bugfix ticket carried the prefix
(VRTX3-T-0167's title reads `/api/healthz-smoke-bugfix-27681476`). Resolved as a decision, on
evidence:

- `routes/` contains exactly one entry, `api/`; `find routes -name "*.ts" -not -path "routes/api/*"`
  returns nothing. No handler has ever lived at the URL root.
- `PRODUCT.md` § Features fixes the per-probe contract as `GET /api/<probe-name>`, "a single file
  under `routes/api/`"; `ARCHITECTURE.md` § Routing fixes `routes/api/x.ts` → `/api/x`.
- `AGENT.md`'s own changelog does the identical `/api`-dropping for the `cancel-*` probes
  (SPRINT-0004/-0005/-0007 name `/healthz-smoke-cancel-407995880`, whose file is
  `routes/api/healthz-smoke-cancel-407995880.ts`).

Serving the bare path instead would mean a root-level `routes/*.ts`, contradicting the probe
contract in two root docs to satisfy a field from the same capture channel that mis-states the
status code (note 2). Both spellings were measured and behave identically today, so the report is
not evidence either way.

**2. The reported `404` is wrong on both — re-measured, not cited.** A live dev server was run
during planning (Vite banner: `Port 5000 is in use, trying another one...` → `:5001` — read the
banner, do not assume). Measured:

```
/healthz-smoke-bugfix-ha-971401638       200 text/html; charset=utf-8       949B  (SPA shell)
/api/healthz-smoke-bugfix-ha-971401638   200 text/html; charset=utf-8       949B  (SPA shell)
/healthz-smoke-bugfix-ha2-649579386      200 text/html; charset=utf-8       949B  (SPA shell)
/api/healthz-smoke-bugfix-ha2-649579386  200 text/html; charset=utf-8       949B  (SPA shell)
/api/healthz-smoke-528856326-a           200 application/json;charset=UTF-8  33B  {"ok":true,"variant":"528856326"}   ← control
```

Twentieth consecutive confirmation of the SPA-fallback trap (`AGENT.md` § Gotchas). **Status code
cannot distinguish a missing probe from a working one** — verify on body and `Content-Type`. The
defects are real; only their stated symptom is not. Neither ticket has an idea behind it, so nothing
upstream sanity-checked either the status code or the path prefix.

**3. Repo-wide grep for `971401638`, `649579386` and `178724114989195` returned zero matches**
(excluding `node_modules`/`.git`) — never-written files, not misnamed ones.

**4. Ownership maps are fully disjoint — no `depends_on`, both run in parallel.** Each ticket owns
exactly two new files under `routes/api/` and modifies nothing existing. This is the "Health probes
duplicate, on purpose" decision in `ARCHITECTURE.md` § Key Decisions working as designed. **Do not
factor out a shared handler, factory, constants file or barrel export** — and note that `-ha`/`-ha2`
is a name, not a grouping: no file may be shared between these two tickets.

**5. Copy the `528856326` pair — not an older probe.** 47 of the 95 existing probe tests carry a
flaky wall-clock `responds in under 100ms` case; the current shape is a single body assertion
(`AGENT.md` § Health Probe Routes). Neither ticket names a template, so there was no substitution to
make this sprint — the pointer applies by default.

**6. Root docs are already at target state on this branch — no ticket touches them.** Two new
endpoints are an observable behavior change, so the probe family count is re-derived from the
filesystem and bumped 95 → 97 in `AGENT.md`, `ARCHITECTURE.md` and `PRODUCT.md`, with dated
changelog entries, as part of this planning ticket. `DESIGN.md` is unchanged: no user-visible
surface moves.

**7. No method guard, and no test-harness or CI phase.** No `healthz-smoke-*` handler declares one;
adding a `405` to one route alone would make it inconsistent with 95 siblings.
`nitro({ serverDir: "./" })` registers a new `routes/api/*.ts` by filename alone, the Vitest `server`
project collects a colocated `*.test.ts` with no configuration, and `.github/workflows/ci.yml`
already triggers on `push`/`pull_request` to `vortex/**`.

## Design reference

_No design reference on this idea._ Neither DEFECT is linked to an idea, so there is no design
manifest to fetch; the sprint touches no user-visible surface.

## Risks & assumptions

- **A green unit test proves nothing on its own.** The colocated test imports the handler module
  directly, so it passes even if Nitro never registered the path — a filename typo would ship as a
  passing test and a dead URL. Only a live request against a running server catches it; each plan's
  test plan requires one, with the control route alongside it.
- **Connection errors look like broken routes.** Measure on the port from the Vite banner; the
  control route distinguishes a dead server from a missing route.
- _Assumption (labelled, and the one thing a reviewer should challenge):_ the intended URLs carry
  the `/api/` prefix — see note 1. If that is wrong, the fix is a filename change in two tickets and
  nothing else; the handler bodies and tests are unaffected.
- _Assumption:_ the two variant ids are exactly as written in the ticket titles. Verified — each
  appears identically in its ticket title and description.

## Follow-ups / out of scope

- **Path-prefix transcription drift in defect capture (new this sprint).** Both tickets state the
  probe path without `/api/`, a field prior sprints always transcribed correctly. The status-code
  drift is already recorded in `AGENT.md` § Gotchas; the prefix drift is now recorded there too, so
  the next planner resolves it from the doc rather than re-deriving it. No ticket is filed —
  planning has no DEFECT-creation authority, and the origin is upstream of this repository.
- **Otherwise none.** Root-causing surfaced no defect beyond the two committed tickets. The
  stale-doc-count drift that bit VRTX3-S-0015 was checked for and is not present: `AGENT.md`,
  `ARCHITECTURE.md` and `PRODUCT.md` all read 95 pre-sprint, matching the filesystem (95 handlers,
  95 colocated tests, plus `hello.ts`, `hello.post.ts`, `hello.test.ts` and `users/` = 193 files).
