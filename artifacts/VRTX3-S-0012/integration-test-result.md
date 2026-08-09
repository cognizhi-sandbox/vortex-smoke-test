# Integration / E2E Test Result — VRTX3-S-0012

- **Sprint:** VRTX3-S-0012
- **Date:** 2026-08-09
- **Validation agent:** Vortex Validation (VRTX3-T-0081)

## Command

```
bun run e2e -- --project=chromium
```

which expands to `pree2e` (`node scripts/ensure-playwright-browser.mjs`) followed by
`playwright test "--project=chromium"`.

## Real Playwright output (verbatim)

```
$ node scripts/ensure-playwright-browser.mjs
$ playwright test "--project=chromium"

Running 5 tests using 4 workers

  ✓  2 [chromium] › e2e/home.spec.ts:14:3 › Home page › shows the hero content and desktop nav (326ms)
  ✓  1 [chromium] › e2e/smoke.spec.ts:13:1 › home page loads with no console errors (498ms)
  ✓  4 [chromium] › e2e/home.spec.ts:27:3 › Home page › has no vertical scrollbar on common viewport sizes (548ms)
  ✓  3 [chromium] › e2e/home.spec.ts:44:3 › Home page › opens and closes the mobile nav from the hamburger button (632ms)
  ✓  5 [chromium] › e2e/smoke.spec.ts:26:1 › the API responds (318ms)

  5 passed (3.5s)
```

## Per-spec table

| #   | Spec                   | Test                                                                  | Result    | Duration |
| --- | ---------------------- | --------------------------------------------------------------------- | --------- | -------- |
| 1   | `e2e/smoke.spec.ts:13` | home page loads with no console errors                                | ✅ passed | 498ms    |
| 2   | `e2e/home.spec.ts:14`  | Home page › shows the hero content and desktop nav                    | ✅ passed | 326ms    |
| 3   | `e2e/home.spec.ts:44`  | Home page › opens and closes the mobile nav from the hamburger button | ✅ passed | 632ms    |
| 4   | `e2e/home.spec.ts:27`  | Home page › has no vertical scrollbar on common viewport sizes        | ✅ passed | 548ms    |
| 5   | `e2e/smoke.spec.ts:26` | the API responds                                                      | ✅ passed | 318ms    |

No failures — no trace/screenshot artifacts were produced.

## Context

This sprint's changes are three new API-only probe routes with no UI surface, so no new
E2E spec was required or added. The existing suite was run in full as a regression check
against the sprint's changes (build config, `routes/` scanning) and passed unmodified.
Route-level verification of the three new probes (status/Content-Type/body) was performed
via direct HTTP requests against the built production server and is recorded in
`qa-test-report.md`'s Unit Test Results section, not via Playwright (no UI to exercise).

E2E-RESULT: chromium 5 passed, 0 failed
