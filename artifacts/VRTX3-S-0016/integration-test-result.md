# Integration / E2E Test Result — VRTX3-S-0016

- **Sprint:** VRTX3-S-0016
- **Date:** 2026-08-10
- **Validation agent:** Validation (VRTX3-T-0112)

## Command

```
bun install
bun run build
bun run test:e2e -- --project=chromium
```

## Real Playwright output

```
$ node scripts/ensure-playwright-browser.mjs
$ playwright test "--project=chromium"

Running 5 tests using 4 workers

  ✓  1 [chromium] › e2e/smoke.spec.ts:13:1 › home page loads with no console errors (371ms)
  ✓  2 [chromium] › e2e/home.spec.ts:14:3 › Home page › shows the hero content and desktop nav (396ms)
  ✓  3 [chromium] › e2e/home.spec.ts:27:3 › Home page › has no vertical scrollbar on common viewport sizes (530ms)
  ✓  4 [chromium] › e2e/home.spec.ts:44:3 › Home page › opens and closes the mobile nav from the hamburger button (540ms)
  ✓  5 [chromium] › e2e/smoke.spec.ts:26:1 › the API responds (324ms)

  5 passed (3.4s)
```

## Per-spec table

| Spec                   | Test                                                                  | Result    | Time  |
| ---------------------- | --------------------------------------------------------------------- | --------- | ----- |
| `e2e/smoke.spec.ts:13` | home page loads with no console errors                                | ✅ passed | 371ms |
| `e2e/home.spec.ts:14`  | Home page › shows the hero content and desktop nav                    | ✅ passed | 396ms |
| `e2e/home.spec.ts:27`  | Home page › has no vertical scrollbar on common viewport sizes        | ✅ passed | 530ms |
| `e2e/home.spec.ts:44`  | Home page › opens and closes the mobile nav from the hamburger button | ✅ passed | 540ms |
| `e2e/smoke.spec.ts:26` | the API responds                                                      | ✅ passed | 324ms |

No failures, no traces/screenshots generated.

## Note on probe-endpoint coverage

The repo's Playwright suite (`e2e/home.spec.ts`, `e2e/smoke.spec.ts`) does not include a spec targeting `/api/healthz-smoke-*` routes — it covers the SPA home page and the pre-existing `/api/hello` endpoint. This sprint's three new endpoints were verified separately, directly against a locally built production server (`bun run build` → `bun .output/server/index.mjs`), per the project's documented gotcha that a missing `/api/*` route also returns `200`, so status code alone cannot prove correctness — see `qa-test-report.md` § Issues Found for that evidence (headers + body for all three, confirmed stable across repeated requests and server restarts).

E2E-RESULT: chromium 5 passed, 0 failed
