# Sprint Summary — VRTX3-S-0009

**Goal:** `[smoke] Bugfix sprint smoke-bugfix-178623656361405`
**Type:** Bugfix · **Outcome:** PASS — closed with zero defects and no rework cycle
**Dates:** planned and delivered 2026-08-09

## What shipped

Three previously-missing health-check endpoints, each returning `200` with
`Content-Type: application/json;charset=UTF-8` and the exact body `{ ok: true, variant: "<id>" }`:

| Ticket       | Endpoint                               | Variant     | Commit    |
| ------------ | -------------------------------------- | ----------- | --------- |
| VRTX3-T-0055 | `/api/healthz-smoke-bugfix-755467473`  | `755467473` | `f467b24` |
| VRTX3-T-0056 | `/api/healthz-smoke-bugfix2-192341379` | `192341379` | `394d6a6` |
| VRTX3-T-0057 | `/api/healthz-smoke-bugfix3-993514120` | `993514120` | `9c3f053` |

Supporting tickets: VRTX3-T-0058 (bugfix plan, `fd6bbad`), VRTX3-T-0059 (integration QA, `8457b40`),
VRTX3-T-0060 (this close bundle).

## What changed

Purely additive. **6 new source files, 0 existing source files modified.** Each fix is one
`defineHandler` route file plus a co-located H3Event integration test; the three ownership maps
were disjoint, so all three ran in parallel with no `depends_on` and no merge contention.

- `routes/api/healthz-smoke-bugfix-755467473.{ts,test.ts}`
- `routes/api/healthz-smoke-bugfix2-192341379.{ts,test.ts}`
- `routes/api/healthz-smoke-bugfix3-993514120.{ts,test.ts}`

No database, schema, migration, auth, middleware, config, or frontend change. No shared helper was
introduced — consistent with the 41 pre-existing siblings, which deliberately share zero code.

**Root cause, identical in all three cases:** Nitro routes purely by filename
(`vite.config.ts:29` — `nitro({ serverDir: "./", ignore: ["**/*.test.ts"] })`). The handler files
had never been created, so no route was registered. No bug existed in any shipped code.

### Root docs

`AGENT.md` was brought to target state during planning (`fd6bbad`): a dated VRTX3-S-0009 changelog
entry, plus the SPA-fallback gotcha and the method-agnostic-handler behaviour promoted out of buried
changelog prose into `## Gotchas`. No REWORK occurred this sprint and no observable behavior changed
after that point, so no further doc update was required at close. `PRODUCT.md` / `ARCHITECTURE.md` /
`DESIGN.md` are unchanged, matching the convention of the five prior bugfix sprints.

## Verification

QA (VRTX3-T-0059) reported **PASS, no defects**: lint clean, typecheck clean, 108/108 tests across
51 files, build succeeded with all three route chunks emitted under `.output/server/_routes/api/`,
and 5/5 Playwright specs green. QA additionally curled each new route against the **built production
server** for both `GET` and `POST`, with working siblings and a nonexistent path as controls.

Re-confirmed independently at close on a live `bun run dev`:

```
/api/healthz-smoke-bugfix-755467473    200 application/json;charset=UTF-8  {"ok":true,"variant":"755467473"}
/api/healthz-smoke-bugfix2-192341379   200 application/json;charset=UTF-8  {"ok":true,"variant":"192341379"}
/api/healthz-smoke-bugfix3-993514120   200 application/json;charset=UTF-8  {"ok":true,"variant":"993514120"}
/api/healthz-smoke-nope-000            200 text/html; charset=utf-8        <!doctype html>…   ← negative control
```

The negative control is the point: it still returns `200`, so it proves the check discriminates a
real route from the SPA fallback rather than just observing a green status code.

## Known Issues

**None.** The sprint closed with all three committed tickets DONE, QA passing on the first
integration pass, and no defect tickets filed or left open.

## Retrospective

### What went well

- **Planning measured the defect instead of trusting the report.** All three tickets claimed
  "Actual: 404". Every one was wrong — the paths returned `200 text/html` (the SPA shell). Because
  the status code is `200` both before _and_ after the fix, the obvious `404 → 200` check would have
  proven nothing. Catching this at planning time meant every acceptance criterion asserted on
  `Content-Type` + body, and every downstream role inherited a check that actually works.
- **The correction propagated cleanly.** Each engineer's fix note independently repeats the
  Content-Type reasoning and each ran a negative control; QA did the same against the production
  build. The fix was right the first time in all three cases.
- **QA didn't stop at a green suite.** The Playwright run passed, but QA recognised it exercises only
  the SPA shell and `/api/hello` — not this sprint's routes — and closed the gap by verifying the
  built production server directly, with controls. That is the difference between "the suite is
  green" and "the acceptance criteria are met".
- **Genuine parallelism.** Disjoint ownership maps meant no `depends_on` was chained; three
  one-file fixes ran concurrently and integrated without conflict. Zero rework cycles.

### What could improve

- **The `404` misreport is now a four-sprint pattern** (VRTX3-S-0001, -0007, -0008, -0009). It is
  not a code defect — the fix is unchanged either way — but the ticket generator keeps emitting an
  unverified symptom, and each sprint pays to re-discover it. This needs correcting at the
  generator, which is outside this repo. Mitigated locally this sprint by promoting the gotcha into
  `AGENT.md` → `## Gotchas`, where an agent will actually find it.
- **Still no E2E spec covering any `healthz-smoke-*` route** — five sprints running. QA has now
  closed this gap manually each time by curling the production server, but manual verification does
  not persist into the suite. The structural problem is that these routes' unit tests import the
  handler module directly, so they pass even if Nitro never registers the path; only a live request
  proves the route is wired. One Playwright spec asserting `application/json` on a single health
  route would convert a repeated manual step into a permanent regression guard.
- **The `healthz-smoke-*` family has reached 44 near-identical route files** (41 before this sprint)
  with deliberately zero code sharing. That is correct for smoke-test fixtures and should not be
  refactored into a shared helper — but the set is growing every sprint with nothing pruning it.
  Worth an explicit decision at some point about retention, rather than letting it accrete by default.
- **A stale sibling count propagated unchallenged through the whole sprint.** The idea canvas stated
  "44 `healthz-smoke-*` handlers"; that figure was carried verbatim into the sprint plan, all three
  ticket contracts, and the QA report. The true pre-sprint count was 41 — 44 is the count _after_
  this sprint. Harmless here (the number appears only in prose, never in an assertion), but it is a
  reminder that an unverified detail travels just as far as a verified one when nobody re-counts.

## Follow-ups carried forward

Neither item is a defect and neither blocks the close; both are recorded in
`artifacts/VRTX3-S-0009/SPRINT-PLAN.md` under "Follow-ups / out of scope":

1. Correct the unverified `404` boilerplate at the ticket generator (outside this repo).
2. Add one E2E spec asserting `Content-Type: application/json` on a `healthz-smoke-*` route.
