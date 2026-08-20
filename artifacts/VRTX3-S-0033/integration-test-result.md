---
artifact: integration-test-result
spec: 1
status: complete
author_role: validation
sprint: VRTX3-S-0033
idea: VRTX3-I-0040
branch: vortex/sprint/vrtx3-s-0033-c609ec83
downstream: [artifacts/VRTX3-S-0033/qa-test-report.md]
---

# Integration test result — VRTX3-S-0033

## Commands run

```
$ bun install
$ bun run build
$ bunx playwright test --list          # confirmed 1 project (chromium) covers all 6 specs
$ bun run test:e2e -- --project=chromium
```

## Results

| Spec                                                                              | Result | Notes |
| --------------------------------------------------------------------------------- | ------ | ----- |
| `e2e/home.spec.ts:14` › shows the hero content and desktop nav                    | pass   | 405ms |
| `e2e/home.spec.ts:27` › has no vertical scrollbar on common viewport sizes        | pass   | 526ms |
| `e2e/home.spec.ts:44` › opens and closes the mobile nav from the hamburger button | pass   | 537ms |
| `e2e/smoke.spec.ts:13` › home page loads with no console errors                   | pass   | 423ms |
| `e2e/smoke.spec.ts:26` › the API responds                                         | pass   | 317ms |
| `e2e/smoke.spec.ts:43` › a database-backed route responds                         | pass   | 395ms |

Playwright summary: `6 passed (4.1s)`

No spec file ran zero tests; nothing skipped.

## Skipped

None.

E2E-RESULT: chromium 6 passed, 0 failed, 0 skipped
