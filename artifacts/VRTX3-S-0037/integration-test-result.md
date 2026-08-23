---
artifact: integration-test-result
spec: 1
status: complete
author_role: validation
sprint: VRTX3-S-0037
idea: VRTX3-I-0044
branch: vortex/sprint/vrtx3-s-0037-3cd6b387
downstream: [artifacts/VRTX3-S-0037/qa-test-report.md]
---

# Integration test result — VRTX3-S-0037

## Commands run

```
$ bun install
$ bun run build
$ bunx playwright test --list --project=chromium   # confirmed 1 project (chromium), 6 tests, 2 spec files
$ bun run test:e2e -- --project=chromium
```

`playwright.config.ts` declares a single project, `chromium` — `--project=chromium` covers every
spec under test; there is no mobile/emulated project to miss.

## Results

| Spec                                                                           | Result | Notes |
| ------------------------------------------------------------------------------ | ------ | ----- |
| `e2e/home.spec.ts` › shows the hero content and desktop nav                    | pass   | 409ms |
| `e2e/home.spec.ts` › has no vertical scrollbar on common viewport sizes        | pass   | 580ms |
| `e2e/home.spec.ts` › opens and closes the mobile nav from the hamburger button | pass   | 575ms |
| `e2e/smoke.spec.ts` › home page loads with no console errors                   | pass   | 406ms |
| `e2e/smoke.spec.ts` › the API responds                                         | pass   | 395ms |
| `e2e/smoke.spec.ts` › a database-backed route responds                         | pass   | 345ms |

Playwright summary: `6 passed (4.1s)`

No spec file ran zero tests; nothing skipped.

E2E-RESULT: chromium 6 passed, 0 failed, 0 skipped
