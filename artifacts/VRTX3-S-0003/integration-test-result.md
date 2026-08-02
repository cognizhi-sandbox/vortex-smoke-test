# Integration E2E Test Results — VRTX3-S-0003

## Test Execution Command

```bash
bun run e2e -- --project=chromium
```

## Playwright Run Summary

```
Running 5 tests using 4 workers

  ✓  1 [chromium] › e2e/smoke.spec.ts:13:1 › home page loads with no console errors (317ms)
  ✓  4 [chromium] › e2e/home.spec.ts:14:3 › Home page › shows the hero content and desktop nav (463ms)
  ✓  2 [chromium] › e2e/home.spec.ts:27:3 › Home page › has no vertical scrollbar on common viewport sizes (597ms)
  ✓  3 [chromium] › e2e/home.spec.ts:44:3 › Home page › opens and closes the mobile nav from the hamburger button (645ms)
  ✓  5 [chromium] › e2e/smoke.spec.ts:26:1 › the API responds (331ms)

  5 passed (3.5s)
```

## Per-Spec Results

| Spec File         | Test Name                                                 | Status | Duration |
| ----------------- | --------------------------------------------------------- | ------ | -------- |
| e2e/smoke.spec.ts | home page loads with no console errors                    | ✓PASS  | 317ms    |
| e2e/smoke.spec.ts | the API responds                                          | ✓PASS  | 331ms    |
| e2e/home.spec.ts  | shows the hero content and desktop nav                    | ✓PASS  | 463ms    |
| e2e/home.spec.ts  | has no vertical scrollbar on common viewport sizes        | ✓PASS  | 597ms    |
| e2e/home.spec.ts  | opens and closes the mobile nav from the hamburger button | ✓PASS  | 645ms    |

## Test Execution Environment

- **Browser**: Chromium
- **Total Duration**: 3.5s
- **Environment**: Linux (container)
- **Dependencies**: Playwright 1.40+, Chromium (installed via ensure-playwright-browser.mjs)

E2E-RESULT: chromium 5 passed, 0 failed
