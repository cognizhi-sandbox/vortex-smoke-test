---
artifact: integration-test-result
spec: 1
status: complete
author_role: validation
sprint: VRTX3-S-0028
idea: VRTX3-I-0037
branch: vortex/sprint/vrtx3-s-0028-2cacd19c
downstream: [artifacts/VRTX3-S-0028/qa-test-report.md]
---

# Integration test result — VRTX3-S-0028

## Commands run

```
$ bun install
$ bun run build
$ bunx playwright test --list                    # confirms project coverage before running
$ bun run test:e2e -- --project=chromium
```

`playwright.config.ts` defines a single project, `chromium`, covering both spec files (`e2e/home.spec.ts`,
`e2e/smoke.spec.ts`) — confirmed via `bunx playwright test --list` (6 tests in 2 files, all under
`[chromium]`). No other project exists to miss.

## Results

| Spec                                                                                       | Result | Notes |
| ------------------------------------------------------------------------------------------ | ------ | ----- |
| `e2e/home.spec.ts` › Home page › shows the hero content and desktop nav                    | pass   | 469ms |
| `e2e/home.spec.ts` › Home page › has no vertical scrollbar on common viewport sizes        | pass   | 602ms |
| `e2e/home.spec.ts` › Home page › opens and closes the mobile nav from the hamburger button | pass   | 557ms |
| `e2e/smoke.spec.ts` › home page loads with no console errors                               | pass   | 402ms |
| `e2e/smoke.spec.ts` › the API responds                                                     | pass   | 372ms |
| `e2e/smoke.spec.ts` › a database-backed route responds                                     | pass   | 401ms |

Playwright summary: `6 passed (5.9s)`

No spec file was wholly skipped; every file ran all of its tests.

E2E-RESULT: chromium 6 passed, 0 failed, 0 skipped
