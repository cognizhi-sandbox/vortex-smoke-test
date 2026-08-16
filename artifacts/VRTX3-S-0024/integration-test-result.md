---
artifact: integration-test-result
spec: 1
status: complete
author_role: validation
sprint: VRTX3-S-0024
idea: VRTX3-I-0033
branch: vortex/sprint/vrtx3-s-0024-e6a9735d
downstream: [artifacts/VRTX3-S-0024/qa-test-report.md]
---

# Integration test result — VRTX3-S-0024

## Commands run

```
$ bun install
$ bun run build
$ bun run test:e2e -- --project=chromium
```

## Results

| Spec                                                                           | Result | Notes |
| ------------------------------------------------------------------------------ | ------ | ----- |
| `e2e/smoke.spec.ts` › home page loads with no console errors                   | pass   | 392ms |
| `e2e/home.spec.ts` › shows the hero content and desktop nav                    | pass   | 487ms |
| `e2e/home.spec.ts` › has no vertical scrollbar on common viewport sizes        | pass   | 578ms |
| `e2e/home.spec.ts` › opens and closes the mobile nav from the hamburger button | pass   | 613ms |
| `e2e/smoke.spec.ts` › the API responds                                         | pass   | 321ms |
| `e2e/smoke.spec.ts` › a database-backed route responds                         | pass   | 355ms |

Playwright summary: `6 passed (3.8s)`

No spec file was wholly skipped; no failures.

E2E-RESULT: chromium 6 passed, 0 failed, 0 skipped
