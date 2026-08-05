# Sprint Summary — VRTX3-S-0001

**Goal**: `[smoke] Bugfix sprint smoke-bugfix-1785889878831367` — restore three
missing `/api/healthz-smoke-*` endpoints so each returns its `{ok, variant}` JSON.

**Type**: Bugfix · **Idea**: VRTX3-I-0001
**Base**: `94f7504` → **sprint tip at close**: `af35b75`
**Dates**: planned, executed, QA'd and closed 2026-08-05
**Outcome**: **PASS** — all three committed defects fixed, zero defects logged, zero rework cycles.

---

## What shipped

| Ticket       | Endpoint                                   | Status  |
| ------------ | ------------------------------------------ | ------- |
| VRTX3-T-0001 | `GET /api/healthz-smoke-bugfix-868175391`  | ✅ Done |
| VRTX3-T-0002 | `GET /api/healthz-smoke-bugfix2-101584827` | ✅ Done |
| VRTX3-T-0003 | `GET /api/healthz-smoke-bugfix3-403022997` | ✅ Done |

Each now returns `200` / `application/json` with exactly `{"ok":true,"variant":"<id>"}`.

Supporting tickets: VRTX3-T-0004 (bugfix plan), VRTX3-T-0005 (integration QA),
VRTX3-T-0006 (this close bundle).

**Diff**: 6 new files, **0 existing files modified**.

```
routes/api/healthz-smoke-bugfix-868175391.ts   + .test.ts
routes/api/healthz-smoke-bugfix2-101584827.ts  + .test.ts
routes/api/healthz-smoke-bugfix3-403022997.ts  + .test.ts
```

Each handler is a self-contained `defineHandler` from `"nitro/h3"` returning a
static literal — no auth, no `event.context`, no `db/`, no shared helper. Each
test drives a real `H3Event` and asserts the exact body plus a <100ms bound.

## Root cause (common to all three)

Nitro 3 registers `/api/*` routes purely from files present on disk under
`routes/api/`. All three handler files were simply absent, so no route was ever
registered. The fix was additive in every case — the file's presence _is_ the
registration. No config, middleware or router change was needed.

## Verification at close

Re-run independently on the integrated sprint branch during this close ticket,
not taken on trust from the QA report:

- `bun run verify` — **exit 0**; 39 test files, 84 tests passed.
- `bun run build` — succeeded; all three routes registered in the compiled server.
- Live checks against the built server (`bun .output/server/index.mjs`): all
  three return `200` + `Content-Type: application/json` + the exact expected body.
- Playwright chromium suite (per QA): 5/5 passed, no regressions.

## Retrospective

**What went well**

- **Reproducing before planning caught a wrong premise.** All three tickets — and
  the VRTX3-I-0001 canvas, including its Fix-AC #1 and its Mermaid `404 Not Found`
  node — stated the endpoints "return 404". They did not. Unmatched `/api/*` paths
  are answered by the SPA `index.html` fallback with `200 text/html`, in dev _and_
  in the production build. Had planning trusted the ticket text, the ACs would
  have been written as a 404→200 status transition, which is **true before and
  after the fix** — every endpoint would have "passed" without being fixed. ACs
  were rewritten to assert response body and `Content-Type` instead.
- **QA re-verified rather than echoing.** QA independently reproduced the
  fallback behaviour against the built server and included a still-missing
  control route, confirming the correction instead of restating it.
- **Strict no-refactor discipline.** With ~33 near-identical healthz handlers,
  the temptation to parameterise was real; keeping three additive fixes additive
  held blast radius at zero and needed no rework.
- **Clean pipeline.** Three parallel fixes, no shared files, no `depends_on`
  chains, no rework cycles, first-pass QA PASS.

**What could improve**

- **Defect reports assert symptoms nobody measured.** The "404" claim propagated
  from the idea into the canvas into all three ticket descriptions unchallenged.
  Cheap guard: require the reporter to paste real `curl -D-` output (status _and_
  `Content-Type`) into the Repro Steps section.
- **The SPA fallback silently swallows API mistakes.** It converts "this endpoint
  does not exist" into "this endpoint returned an unparseable body" — the direct
  cause of the bad reports above, and it defeats any smoke test probing for 404.
  This remains open (see below).
- **Sprint-key reuse left landmines.** `artifacts/VRTX3-S-0001/` already held a
  previous sprint's artifacts under these same ticket keys but for _different_
  endpoint variants (`508914715`/`473664326`/`429794134`). They were deleted
  during planning to prevent engineers implementing the wrong variants, but a
  fresh key — or a namespaced artifacts path — would avoid the hazard entirely.
- **No coverage instrumentation.** Coverage is reported by file accounting
  (33/33 route handlers have a matching test) rather than measured lines.

## Carried-forward / open items

No defects were left open by this sprint, and QA logged no issues in scope.
Two out-of-scope items are carried forward so they are not lost with the sprint:

1. **Unmatched `/api/*` returns `200 text/html` instead of a JSON `404`.**
   Re-confirmed at close: `GET /api/healthz-smoke-does-not-exist-999` on the
   built server still yields `200` + `text/html`. A router/fallback-precedence
   issue affecting every mistyped or nonexistent API path. Suggested fix: an
   `/api/**` catch-all returning a real JSON `404` so the SPA fallback never
   claims API paths. Not filed as a ticket — product has no DEFECT-creation
   authority; recorded in `SPRINT-PLAN.md` Follow-ups and concurred by QA.
2. **~33 near-duplicated healthz handlers in `routes/api/`.** A parameterised
   route (e.g. `routes/api/healthz/[variant].ts`) would collapse them. A
   refactor, not a defect — deliberately excluded from a bugfix sprint.

## Artifacts

- `SPRINT-PLAN.md` — sprint index (goal, defect table, cross-cutting notes, follow-ups)
- `VRTX3-T-000{1,2,3}/PLAN.md` — per-defect RCA, fix, interface contract
- `VRTX3-T-000{1,2,3}/fix-note.md`, `tdd-test-result.md` — engineer execution records
- `qa-test-report.md`, `integration-test-result.md` — integration QA (VRTX3-T-0005)
- `sprint-summary.md`, `release-notes.md` — this close bundle (VRTX3-T-0006)
