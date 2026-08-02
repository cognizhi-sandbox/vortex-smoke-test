# Integration Test Result — VRTX3-S-0004

## Test Command

```
bun run e2e -- --project=chromium
```

## Execution Environment

- **Playwright Version**: v1.x (latest)
- **Browser**: Chromium
- **Test Framework**: Playwright
- **Platform**: Linux (container)
- **Node/Bun Runtime**: Bun v1.3.14

## Test Results Summary

**Total Tests**: 5  
**Passed**: 5  
**Failed**: 0  
**Duration**: 3.5s

### Per-Test Results

| Test Spec         | Test Name                                                 | Status  | Duration | Notes                                                |
| ----------------- | --------------------------------------------------------- | ------- | -------- | ---------------------------------------------------- |
| e2e/home.spec.ts  | Shows the hero content and desktop nav                    | ✅ PASS | 409ms    | Hero content and desktop nav render correctly        |
| e2e/home.spec.ts  | Has no vertical scrollbar on common viewport sizes        | ✅ PASS | 629ms    | No unintended scrollbars on mobile/desktop viewports |
| e2e/home.spec.ts  | Opens and closes the mobile nav from the hamburger button | ✅ PASS | 646ms    | Mobile navigation toggle works correctly             |
| e2e/smoke.spec.ts | Home page loads with no console errors                    | ✅ PASS | 569ms    | No JavaScript errors in console during page load     |
| e2e/smoke.spec.ts | The API responds                                          | ✅ PASS | 384ms    | API endpoints respond to requests                    |

## Notes

- All Playwright tests executed successfully
- No console errors or warnings detected during test runs
- Response times well within acceptable thresholds
- Test infrastructure (Chromium, Playwright runtime) functioning correctly

E2E-RESULT: chromium 5 passed, 0 failed
