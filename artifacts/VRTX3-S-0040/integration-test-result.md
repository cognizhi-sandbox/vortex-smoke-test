---
artifact: integration-test-result
spec: 1
status: complete
author_role: validation
sprint: VRTX3-S-0040
idea: VRTX3-I-0049
branch: vortex/sprint/vrtx3-s-0040-85be96ae
downstream: [artifacts/VRTX3-S-0040/qa-test-report.md]
---

# Integration test result — VRTX3-S-0040

## Commands run

```
$ bun install
$ bun run build
$ bunx playwright test --list          # confirmed the single `chromium` project covers all 6 specs
$ bun run test:e2e -- --project=chromium
```

An initial `bun run test:e2e -- --project=chromium` run timed out waiting on
`config.webServer` (120s). Cause: a stray `bun run dev` process left running on port 5000 from
an earlier manual verification step in this same container was contending for resources, which
stalled the webServer's own `vite --port 5178 --strictPort` startup mid nitro-build. Killed the
stray process (`kill -9` on its PIDs); the re-run below completed cleanly in 4.2s. This is
container/session resource contention from my own prior manual step, not a defect in the sprint's
code — noted here for traceability, not logged as a DEFECT.

## Results

| Spec                                                                           | Result | Notes |
| ------------------------------------------------------------------------------ | ------ | ----- |
| `e2e/smoke.spec.ts` › home page loads with no console errors                   | pass   | 480ms |
| `e2e/home.spec.ts` › shows the hero content and desktop nav                    | pass   | 499ms |
| `e2e/home.spec.ts` › has no vertical scrollbar on common viewport sizes        | pass   | 614ms |
| `e2e/home.spec.ts` › opens and closes the mobile nav from the hamburger button | pass   | 661ms |
| `e2e/smoke.spec.ts` › the API responds                                         | pass   | 388ms |
| `e2e/smoke.spec.ts` › a database-backed route responds                         | pass   | 350ms |

Playwright summary: `6 passed (4.2s)`

None of these specs exercise the new `healthz-smoke-503463873-*` probes directly — the family adds
no browser-observable behaviour (per `design.md` § Test-harness phase), so probe coverage is the
unit tier plus the live HTTP verification recorded in `qa-test-report.md`. This run proves the
existing E2E suite has no regression from the sprint's changes.

E2E-RESULT: chromium 6 passed, 0 failed, 0 skipped
