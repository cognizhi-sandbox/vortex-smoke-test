# Sprint Summary — VRTX3-S-0012

- **Sprint goal:** [smoke] Bugfix sprint smoke-bugfix-178627381829942
- **Type:** BUGFIX · **Date:** 2026-08-09 · **Verdict:** PASS (no defects at integration QA)
- **Sprint branch:** `vortex/sprint/vrtx3-s-0012-266ab6d3` → landing on `dev`

## What shipped

Three missing `/api/healthz-smoke-*` probe routes, each returning HTTP 200,
`Content-Type: application/json`, and body `{ ok: true, variant: "<id>" }`:

| Ticket       | Route                                  | Variant       |
| ------------ | -------------------------------------- | ------------- |
| VRTX3-T-0077 | `/api/healthz-smoke-bugfix-6202295`    | `"6202295"`   |
| VRTX3-T-0078 | `/api/healthz-smoke-bugfix2-433928318` | `"433928318"` |
| VRTX3-T-0079 | `/api/healthz-smoke-bugfix3-196651982` | `"196651982"` |

Probe family: **47 → 50 handlers**. Purely additive — **6 new files, 0 existing files
modified**, no dependency change, nothing under `src/`, `db/`, `middleware/` or any config file.

## Tickets

| Ticket       | Type       | Outcome                                                                                |
| ------------ | ---------- | -------------------------------------------------------------------------------------- |
| VRTX3-T-0080 | Planning   | Bugfix plan: SPRINT-PLAN.md index, three per-defect PLAN.md, root docs to target state |
| VRTX3-T-0077 | Defect     | Done — handler + colocated test, merged `6ee8326` (#137)                               |
| VRTX3-T-0078 | Defect     | Done — handler + colocated test, merged `8cb8d05` (#136)                               |
| VRTX3-T-0079 | Defect     | Done — handler + colocated test, merged `9a5082d` (#135)                               |
| VRTX3-T-0081 | Validation | Integration QA — PASS, no defects, merged `2690af4` (#138)                             |
| VRTX3-T-0082 | Planning   | This close bundle                                                                      |

## Root cause (all three, identical)

The handler files were never created. Nitro 3 resolves `/api/<name>` purely from the presence
of `routes/api/<name>.ts` — no registry, no manifest, no import to update — so an unwritten file
is a path that was never registered. A repo-wide grep for each variant ID returned zero matches
before the fix, ruling out a filename typo. Not a regression, not a misconfiguration.

## Verification

Integration QA (`qa-test-report.md`, `integration-test-result.md`) verified against the **built
production server** (`bun run build` + `bun .output/server/index.mjs`), not the dev server and
not by static inspection:

- All three routes returned `200 application/json;charset=UTF-8` with the exact expected body,
  and were distinguishable from a genuinely-missing control route
  (`/api/healthz-smoke-doesnotexist-999` → `200 text/html`, the SPA shell).
- All three compiled modules present under `.output/server/_routes/api/`, proving Nitro
  registered the paths.
- Unit suite 117/117 (57 files), lint (`--max-warnings 0`) clean, typecheck clean, build
  succeeded, full Playwright E2E suite 5/5.

## Known Issues

**None.** Integration QA found no defects; `integration-defects-resolution.md` records an empty
defect table. This sprint was not conditionally approved and closes with nothing left open.

## Retrospective

### What went well

- **The plan's parallelism claim held in practice.** Planning asserted the three ownership maps
  were disjoint and deliberately set no `depends_on`. The merge record confirms it: three fix
  commits, each touching exactly its own two new files, zero conflicts, zero re-work. The
  evidence is visible in the test counts — each implementation agent recorded 113 tests passing
  while QA later recorded 117, because each was working before its peers had merged.
- **Verifying on body + `Content-Type` rather than status code caught what a status check
  cannot.** QA went further than asked and verified against the _built production server_ plus
  the compiled `.output/server/_routes/` modules, which is the only thing that proves Nitro
  actually registered a route — a colocated unit test imports the handler module directly and
  passes even when the path is unwired.
- **Fixed interface contracts were followed exactly.** All three handlers shipped as verbatim
  copies of the sibling pattern with no shared helper, factory or barrel introduced, preserving
  the deliberate-duplication property that makes these tickets independently mergeable.

### What could improve

- **The "404" in the defect reports was wrong for the fifth consecutive sprint.** All three
  tickets — and the VRTX3-I-0020 canvas, which explicitly stated the request "falls through to
  Nitro's default 404" — reported a 404. Measured reality: `200 text/html` (the SPA shell). The
  defects were real; the status code was not. Planning re-measured rather than carrying the
  claim forward, and the guidance in the agent guide was upgraded from "this happened" to "treat
  a reported `404` on an `/api/*` path as a mis-transcription by default". **This is not fixable
  inside this repo** — the durable fix is at defect-capture time, upstream. Four prior changelog
  entries recorded the same fact and a fifth wrong report still arrived.
- **Planning cost is being spent re-deriving a known answer.** Five sprints have each burned an
  install + dev-server boot + curl cycle to re-confirm the same SPA-fallback behaviour. That
  re-measurement was the right call each time (the alternative is trusting a claim that is
  reliably false), but it is a recurring tax created upstream.
- **The probe family keeps growing unboundedly** — `routes/api/` now holds 100+ files for 50
  probes. The duplication is a deliberate, documented decision and no change is proposed, but
  the count is worth a periodic look.

## Root docs

No REWORK occurred and observable behavior matched the plan exactly, so no post-QA doc changes
were needed. `AGENT.md`, `ARCHITECTURE.md` and `PRODUCT.md` were brought to target state during
planning (probe count 47 → 50, dated Changelog entries, strengthened SPA-fallback gotcha) and
were re-checked against the delivered branch at close: the on-disk handler count is 50, matching
all three documents. `DESIGN.md` untouched — no UI surface changed.

## Artifacts

`SPRINT-PLAN.md` · `VRTX3-T-{0077,0078,0079}/PLAN.md` · `VRTX3-T-{0077,0078,0079}/fix-note.md` ·
`VRTX3-T-{0077,0078,0079}/tdd-test-result.md` · `qa-test-report.md` ·
`integration-test-result.md` · `integration-defects-resolution.md` · `sprint-summary.md` ·
`release-notes.md` — all under `artifacts/VRTX3-S-0012/`.
