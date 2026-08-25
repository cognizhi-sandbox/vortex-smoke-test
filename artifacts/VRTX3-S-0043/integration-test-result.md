---
artifact: integration-test-result
spec: 1
status: complete
author_role: validation
sprint: VRTX3-S-0043
idea: VRTX3-I-0052
branch: vortex/sprint/vrtx3-s-0043-5e7e01b2
downstream: [artifacts/VRTX3-S-0043/qa-test-report.md]
---

# Integration test result — VRTX3-S-0043

## Commands run

```
$ bun install
$ bun run build
$ bunx playwright test --list          # confirms one project (chromium) covers both specs
$ bun run test:e2e -- --project=chromium
```

`playwright.config.ts` declares a single project, `chromium` — `--project=chromium` alone is the
full covering selection here; there is no mobile/emulated project to miss.

First invocation of `bun run test:e2e -- --project=chromium` failed with
`Error: Timed out waiting 120000ms from config.webServer.` — an orphaned `vite --port 5178` process
from an earlier manual check in this container (PID discovered via `/proc/*/cmdline`) already held
the port, so Playwright's own `webServer` block could not bind it. Killed the orphan
(`kill -9 <pid>`), confirmed `:5178` free, re-ran. Not a regression: the port conflict was caused by
this QA session's own diagnostic step, not by sprint code, and is not the same failure class as an
AGENTS.md port-banner drift.

## Results

| Spec                                                                           | Result | Notes |
| ------------------------------------------------------------------------------ | ------ | ----- |
| `e2e/home.spec.ts` › shows the hero content and desktop nav                    | pass   | 482ms |
| `e2e/home.spec.ts` › has no vertical scrollbar on common viewport sizes        | pass   | 527ms |
| `e2e/home.spec.ts` › opens and closes the mobile nav from the hamburger button | pass   | 540ms |
| `e2e/smoke.spec.ts` › home page loads with no console errors                   | pass   | 339ms |
| `e2e/smoke.spec.ts` › the API responds                                         | pass   | 327ms |
| `e2e/smoke.spec.ts` › a database-backed route responds                         | pass   | 341ms |

Playwright summary: `6 passed (4.1s)`

No spec file was wholly skipped.

## Skipped

None.

E2E-RESULT: chromium 6 passed, 0 failed, 0 skipped
