# Integration Test Results — VRTX3-S-0006

## Playwright E2E Test Run

**Command:** `bun run test:e2e -- --project=chromium`

**Environment:** Container with Chromium installed
**Test Framework:** Playwright 1.x
**Browser:** Chromium

## Test Summary

```
Running 5 tests using 4 workers

  ✓  2 [chromium] › e2e/smoke.spec.ts:13:1 › home page loads with no console errors (419ms)
  ✓  4 [chromium] › e2e/home.spec.ts:14:3 › Home page › shows the hero content and desktop nav (474ms)
  ✓  1 [chromium] › e2e/home.spec.ts:27:3 › Home page › has no vertical scrollbar on common viewport sizes (607ms)
  ✓  3 [chromium] › e2e/home.spec.ts:44:3 › Home page › opens and closes the mobile nav from the hamburger button (618ms)
  ✓  5 [chromium] › e2e/smoke.spec.ts:26:1 › the API responds (327ms)

  5 passed (3.7s)
```

## Per-Spec Pass/Fail Table

| Test File         | Test Name                                                 | Status | Duration |
| ----------------- | --------------------------------------------------------- | ------ | -------- |
| e2e/smoke.spec.ts | home page loads with no console errors                    | ✓ PASS | 419ms    |
| e2e/home.spec.ts  | shows the hero content and desktop nav                    | ✓ PASS | 474ms    |
| e2e/home.spec.ts  | has no vertical scrollbar on common viewport sizes        | ✓ PASS | 607ms    |
| e2e/home.spec.ts  | opens and closes the mobile nav from the hamburger button | ✓ PASS | 618ms    |
| e2e/smoke.spec.ts | the API responds                                          | ✓ PASS | 327ms    |

## Acceptance Criterion Verification

The sprint includes three independent health check endpoints. Manual API testing confirms:

### Endpoint A: `/api/healthz-smoke-913793173-a`

- **Status:** ✓ HTTP 200
- **Response:** `{"ok":true,"variant":"913793173"}`
- **Response Time:** <100ms (verified via unit tests)
- **Test Coverage:** 2 tests in `routes/api/healthz-smoke-913793173-a.test.ts`

### Endpoint B: `/api/healthz-smoke-913793173-b`

- **Status:** ✓ HTTP 200
- **Response:** `{"ok":true,"variant":"913793173"}`
- **Response Time:** <100ms (verified via unit tests)
- **Test Coverage:** 2 tests in `routes/api/healthz-smoke-913793173-b.test.ts`

### Endpoint C: `/api/healthz-smoke-913793173-c`

- **Status:** ✓ HTTP 200
- **Response:** `{"ok":true,"variant":"913793173"}`
- **Response Time:** <100ms (verified via unit tests)
- **Test Coverage:** 2 tests in `routes/api/healthz-smoke-913793173-c.test.ts`

## Build & Deployment Status

- **Build:** ✓ Successful (production bundle generated)
- **Server Bundle:** ✓ All three endpoints included in `.output/server/`
- **No Errors/Warnings:** ✓ Clean build

E2E-RESULT: chromium 5 passed, 0 failed
