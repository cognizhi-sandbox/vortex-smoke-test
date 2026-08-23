---
artifact: integration-test-result
spec: 1
status: complete
author_role: validation
sprint: VRTX3-S-0036
idea: VRTX3-I-0043
branch: vortex/sprint/vrtx3-s-0036-30380777
downstream: [artifacts/VRTX3-S-0036/qa-test-report.md]
---

# Integration test result — VRTX3-S-0036

## Commands run

```
$ bun install
$ bun run build
$ bun run test:e2e -- --project=chromium
```

`playwright test --list` confirms a single Playwright project (`chromium`, from
`playwright.config.ts`) covering both spec files under `e2e/` — no mobile/emulated project
exists to miss, so `--project=chromium` is the full covering selection.

## Results

| Spec                                                                           | Result | Notes |
| ------------------------------------------------------------------------------ | ------ | ----- |
| `e2e/home.spec.ts › shows the hero content and desktop nav`                    | pass   | 420ms |
| `e2e/home.spec.ts › has no vertical scrollbar on common viewport sizes`        | pass   | 538ms |
| `e2e/home.spec.ts › opens and closes the mobile nav from the hamburger button` | pass   | 533ms |
| `e2e/smoke.spec.ts › home page loads with no console errors`                   | pass   | 400ms |
| `e2e/smoke.spec.ts › the API responds`                                         | pass   | 331ms |
| `e2e/smoke.spec.ts › a database-backed route responds`                         | pass   | 358ms |

Playwright summary: `6 passed (3.9s)`

No spec file ran zero tests; both `home.spec.ts` and `smoke.spec.ts` executed all their cases.

E2E-RESULT: chromium 6 passed, 0 failed, 0 skipped
