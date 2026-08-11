# Integration / E2E Test Result — VRTX3-S-0018

- **Sprint:** VRTX3-S-0018
- **Date:** 2026-08-11
- **Validation agent:** Vortex Agent (Validation)

## Command

Run on the merged sprint branch (`vortex/sprint/vrtx3-s-0018-4c478329`, via the QA ticket
branch forked from it), after `bun install` and `bun run build`:

```
bun run test:e2e -- --project=chromium
```

which resolves to `playwright test "--project=chromium"` (Playwright config port 5178, its own
dedicated dev server via `webServer`, distinct from the manual dev-server check used for AC
verification).

## Real run summary (verbatim)

```
Running 5 tests using 4 workers

  ✓  1 [chromium] › e2e/home.spec.ts:14:3 › Home page › shows the hero content and desktop nav (447ms)
  ✓  3 [chromium] › e2e/smoke.spec.ts:13:1 › home page loads with no console errors (444ms)
  ✓  2 [chromium] › e2e/home.spec.ts:44:3 › Home page › opens and closes the mobile nav from the hamburger button (554ms)
  ✓  4 [chromium] › e2e/home.spec.ts:27:3 › Home page › has no vertical scrollbar on common viewport sizes (577ms)
  ✓  5 [chromium] › e2e/smoke.spec.ts:26:1 › the API responds (321ms)

  5 passed (3.4s)
```

## Per-spec table

| #   | Spec                   | Test                                                                  | Status | Duration |
| --- | ---------------------- | --------------------------------------------------------------------- | ------ | -------- |
| 1   | `e2e/home.spec.ts:14`  | Home page › shows the hero content and desktop nav                    | PASS   | 447ms    |
| 2   | `e2e/home.spec.ts:44`  | Home page › opens and closes the mobile nav from the hamburger button | PASS   | 554ms    |
| 3   | `e2e/home.spec.ts:27`  | Home page › has no vertical scrollbar on common viewport sizes        | PASS   | 577ms    |
| 4   | `e2e/smoke.spec.ts:13` | home page loads with no console errors                                | PASS   | 444ms    |
| 5   | `e2e/smoke.spec.ts:26` | the API responds                                                      | PASS   | 321ms    |

No failures — no trace/screenshot artifacts produced.

## Note on scope

The existing E2E suite (`e2e/home.spec.ts`, `e2e/smoke.spec.ts`) does not target the
`healthz-smoke-*` probe family (per `SPRINT-PLAN.md` cross-cutting note 6: `e2e/smoke.spec.ts:27`
probes `/api/hello`, not this family). This sprint's three new endpoints were verified directly
against a live `bun run dev` server instead (see `qa-test-report.md` § Issues Found and §
Executive Summary for the body/`Content-Type` evidence), consistent with this repo's documented
gotcha that status code alone cannot confirm route existence.

## Marker

E2E-RESULT: chromium 5 passed, 0 failed
