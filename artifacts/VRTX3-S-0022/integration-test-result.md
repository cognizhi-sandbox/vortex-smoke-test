---
artifact: integration-test-result
spec: 1
status: complete
author_role: validation
sprint: VRTX3-S-0022
idea: VRTX3-I-0031
branch: vortex/sprint/vrtx3-s-0022-48993fb6
downstream: [artifacts/VRTX3-S-0022/qa-test-report.md]
---

# Integration test result — VRTX3-S-0022

## Commands run

```
$ bun install
$ bun run build
$ bun run test:e2e -- --project=chromium
```

(`test:e2e` runs `node scripts/ensure-playwright-browser.mjs` then `playwright test "--project=chromium"`,
per `package.json`. Executed on VRTX3-T-0157's ticket branch, forked off the integrated sprint branch
`vortex/sprint/vrtx3-s-0022-48993fb6` at commit `92d469b`.)

## Results

| Spec                                                                                          | Result | Notes |
| --------------------------------------------------------------------------------------------- | ------ | ----- |
| `e2e/home.spec.ts:14` › Home page › shows the hero content and desktop nav                    | pass   | 443ms |
| `e2e/home.spec.ts:44` › Home page › opens and closes the mobile nav from the hamburger button | pass   | 515ms |
| `e2e/home.spec.ts:27` › Home page › has no vertical scrollbar on common viewport sizes        | pass   | 529ms |
| `e2e/smoke.spec.ts:13` › home page loads with no console errors                               | pass   | 416ms |
| `e2e/smoke.spec.ts:26` › the API responds                                                     | pass   | 332ms |
| `e2e/smoke.spec.ts:43` › a database-backed route responds                                     | pass   | 368ms |

Playwright summary: `6 passed (3.6s)`

No failures.

E2E-RESULT: chromium 6 passed, 0 failed
