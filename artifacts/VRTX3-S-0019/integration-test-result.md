# Integration / E2E Test Result — VRTX3-S-0019

- **Sprint:** VRTX3-S-0019
- **Date:** 2026-08-11
- **Validation agent:** Validation (VRTX3-T-0135)

## Command

```
bun run test:e2e -- --project=chromium
```

Run on the merged sprint branch (`vortex/sprint/vrtx3-s-0019-11b271f6`, via ticket branch `vortex/test/VRTX3-T-0135-integration-qa-report-vrtx3-s-0019-5e02ce7a` forked from it) after `bun install` and `bun run build`.

## Playwright run-summary (verbatim)

```
Running 5 tests using 4 workers

  ✓  1 [chromium] › e2e/smoke.spec.ts:13:1 › home page loads with no console errors (302ms)
  ✓  3 [chromium] › e2e/home.spec.ts:14:3 › Home page › shows the hero content and desktop nav (437ms)
  ✓  4 [chromium] › e2e/home.spec.ts:27:3 › Home page › has no vertical scrollbar on common viewport sizes (526ms)
  ✓  2 [chromium] › e2e/home.spec.ts:44:3 › Home page › opens and closes the mobile nav from the hamburger button (597ms)
  ✓  5 [chromium] › e2e/smoke.spec.ts:26:1 › the API responds (322ms)

  5 passed (3.4s)
```

## Per-spec table

| Spec                 | Test                                                                  | Result  | Duration |
| -------------------- | --------------------------------------------------------------------- | ------- | -------- |
| e2e/smoke.spec.ts:13 | home page loads with no console errors                                | ✅ pass | 302ms    |
| e2e/home.spec.ts:14  | Home page › shows the hero content and desktop nav                    | ✅ pass | 437ms    |
| e2e/home.spec.ts:27  | Home page › has no vertical scrollbar on common viewport sizes        | ✅ pass | 526ms    |
| e2e/home.spec.ts:44  | Home page › opens and closes the mobile nav from the hamburger button | ✅ pass | 597ms    |
| e2e/smoke.spec.ts:26 | the API responds                                                      | ✅ pass | 322ms    |

No failures — no trace/screenshot artifacts produced.

## Notes

This sprint's own deliverable (three `healthz-smoke-472035881-*` probes) has no Playwright spec of its own — per SPRINT-PLAN.md § Implementation phases, E2E coverage is deliberately out of scope for probe additions; the colocated Vitest integration test is the tier the whole probe family uses. The existing E2E suite (home page + API smoke) was run in full as the sprint-wide regression check and confirms the build serves correctly with the three new routes compiled in. The three new endpoints were additionally verified live via direct HTTP requests against the dev server — see `qa-test-report.md` § E2E Test Status and § Issues Found.

E2E-RESULT: chromium 5 passed, 0 failed
