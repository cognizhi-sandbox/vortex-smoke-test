---
artifact: integration-test-result
spec: 1
status: complete
author_role: validation
sprint: VRTX3-S-0034
idea: VRTX3-I-0041
branch: vortex/sprint/vrtx3-s-0034-96262b30
downstream: [artifacts/VRTX3-S-0034/qa-test-report.md]
---

# Integration test result — VRTX3-S-0034

## Commands run

```
$ bun install
$ bun run build
$ bunx playwright test --list          # confirmed single "chromium" project covers all specs
$ bun run test:e2e -- --project=chromium
```

## Results

| Spec                                                                                        | Result | Notes |
| ------------------------------------------------------------------------------------------- | ------ | ----- |
| `e2e/home.spec.ts:14` Home page › shows the hero content and desktop nav                    | pass   | 523ms |
| `e2e/home.spec.ts:27` Home page › has no vertical scrollbar on common viewport sizes        | pass   | 630ms |
| `e2e/home.spec.ts:44` Home page › opens and closes the mobile nav from the hamburger button | pass   | 559ms |
| `e2e/smoke.spec.ts:13` home page loads with no console errors                               | pass   | 428ms |
| `e2e/smoke.spec.ts:26` the API responds                                                     | pass   | 322ms |
| `e2e/smoke.spec.ts:43` a database-backed route responds                                     | pass   | 352ms |

Playwright summary: `6 passed (4.3s)`

No spec file ran zero tests; nothing skipped.

E2E-RESULT: chromium 6 passed, 0 failed, 0 skipped
