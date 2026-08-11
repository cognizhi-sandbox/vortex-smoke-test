---
artifact: integration-test-result
spec: 1
status: complete
author_role: validation
sprint: VRTX3-S-0021
idea: VRTX3-I-0030
branch: vortex/sprint/vrtx3-s-0021-66a28084
downstream: [artifacts/VRTX3-S-0021/qa-test-report.md]
---

# Integration test result — VRTX3-S-0021

## Commands run

```
$ bun install
$ bun run build
$ bun run test:e2e -- --project=chromium
```

`test:e2e` runs `playwright test`, whose config (`playwright.config.ts`) starts its own dedicated
dev server on port 5178 via `webServer` (`bun x vite --port 5178 --strictPort`) — separate from the
manually started dev server used for the earlier manual HTTP checks.

## Results

| Spec                                                                                            | Result | Notes |
| ----------------------------------------------------------------------------------------------- | ------ | ----- |
| `e2e/smoke.spec.ts:13:1 › home page loads with no console errors`                               | pass   | 419ms |
| `e2e/home.spec.ts:14:3 › Home page › shows the hero content and desktop nav`                    | pass   | 521ms |
| `e2e/home.spec.ts:27:3 › Home page › has no vertical scrollbar on common viewport sizes`        | pass   | 597ms |
| `e2e/home.spec.ts:44:3 › Home page › opens and closes the mobile nav from the hamburger button` | pass   | 653ms |
| `e2e/smoke.spec.ts:26:1 › the API responds`                                                     | pass   | 375ms |

Playwright summary: `5 passed (3.5s)`

The sprint's own deliverable (three new `healthz-smoke-568557289-*` probes) has no dedicated
Playwright spec — consistent with every prior probe-family sprint, whose acceptance criteria are
verified via the colocated Vitest `H3Event` tests and a live HTTP check (see
`qa-test-report.md` § E2E Test Status and § Unit Test Results). The E2E suite verifies the SPA shell
and generic `/api/hello` route are unaffected by the sprint's changes, which they are.

E2E-RESULT: chromium 5 passed, 0 failed
