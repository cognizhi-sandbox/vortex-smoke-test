---
artifact: integration-test-result
spec: 1
status: complete
author_role: validation
sprint: VRTX3-S-0030
idea: none-linked
branch: vortex/sprint/vrtx3-s-0030-e2c3a0d0
downstream: [artifacts/VRTX3-S-0030/qa-test-report.md]
---

# Integration test result — VRTX3-S-0030

## Commands run

```
$ bun install
$ bun run build
$ bunx playwright test --list --project=chromium   # confirms project selection covers both spec files
$ bun run test:e2e -- --project=chromium
```

`playwright.config.ts` defines a single project, `chromium` — `--project=chromium` covers every spec
under `e2e/`. `--list` confirmed 6 tests across 2 files before the real run.

## Results

| Spec                                                                           | Result | Notes |
| ------------------------------------------------------------------------------ | ------ | ----- |
| `e2e/home.spec.ts` › shows the hero content and desktop nav                    | pass   | 594ms |
| `e2e/home.spec.ts` › has no vertical scrollbar on common viewport sizes        | pass   | 679ms |
| `e2e/home.spec.ts` › opens and closes the mobile nav from the hamburger button | pass   | 702ms |
| `e2e/smoke.spec.ts` › home page loads with no console errors                   | pass   | 552ms |
| `e2e/smoke.spec.ts` › the API responds                                         | pass   | 328ms |
| `e2e/smoke.spec.ts` › a database-backed route responds                         | pass   | 390ms |

Playwright summary: `6 passed (4.5s)`

No spec file ran zero tests; both files exercised all their cases.

E2E-RESULT: chromium 6 passed, 0 failed, 0 skipped
