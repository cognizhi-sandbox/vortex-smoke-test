---
artifact: integration-test-result
spec: 1
status: complete
author_role: validation
sprint: VRTX3-S-0039
idea: VRTX3-I-0048
branch: vortex/sprint/vrtx3-s-0039-4e9a09bd
downstream: [artifacts/VRTX3-S-0039/qa-test-report.md]
---

# Integration test result — VRTX3-S-0039

## Commands run

```
$ bun install
$ bun run build
$ bunx playwright test --list                 # confirmed single "chromium" project covers both spec files
$ bun run test:e2e -- --project=chromium
```

First attempt timed out (`Error: Timed out waiting 120000ms from config.webServer.`) because stale
`node` processes from an earlier manual dev-server check in this same session were still bound to
`:5000`, `:5001` and `:5002`, one port off Playwright's fixed `:5178` but enough to leave the
container in a state Vite's dependency re-optimization stalled on. Killed the three stale PIDs
(`kill -9 29948 28108 34167`), confirmed the ports were clear, and re-ran. Unrelated to the three
probe routes or any file this sprint touched — no `.spec.ts` covers a webServer boot precondition,
so this is not logged as a defect, only as a self-inflicted environment artifact of manual
verification performed earlier in this same run.

## Results

| Spec                                                                           | Result | Notes |
| ------------------------------------------------------------------------------ | ------ | ----- |
| `e2e/home.spec.ts` › shows the hero content and desktop nav                    | pass   | 395ms |
| `e2e/home.spec.ts` › has no vertical scrollbar on common viewport sizes        | pass   | 495ms |
| `e2e/home.spec.ts` › opens and closes the mobile nav from the hamburger button | pass   | 539ms |
| `e2e/smoke.spec.ts` › home page loads with no console errors                   | pass   | 327ms |
| `e2e/smoke.spec.ts` › the API responds                                         | pass   | 326ms |
| `e2e/smoke.spec.ts` › a database-backed route responds                         | pass   | 342ms |

Playwright summary: `6 passed (4.1s)`

None of the six specs target the three new probe routes — the sprint's idea puts UI/Playwright
coverage for the probes explicitly out of scope (see `SPRINT-PLAN.md` § Codebase findings), and no
`## ADDED` scenario in the delta spec calls for one. The probes were verified directly against the
built server instead (see `qa-test-report.md` § E2E Test Status and § Unit Test Results).

## Skipped

None. No spec file ran zero tests.

E2E-RESULT: chromium 6 passed, 0 failed, 0 skipped
