---
artifact: integration-test-result
spec: 1
status: complete
author_role: validation
sprint: VRTX3-S-0023
idea: VRTX3-I-0032
branch: vortex/sprint/vrtx3-s-0023-c5a223f8
downstream: [artifacts/VRTX3-S-0023/qa-test-report.md]
---

# Integration test result — VRTX3-S-0023

## Commands run

```
$ bun install
$ bun run build
$ bun run test:e2e -- --project=chromium
```

## Results

| Spec                                                                                          | Result | Notes |
| --------------------------------------------------------------------------------------------- | ------ | ----- |
| `e2e/home.spec.ts:14` — Home page › shows the hero content and desktop nav                    | pass   | 417ms |
| `e2e/home.spec.ts:27` — Home page › has no vertical scrollbar on common viewport sizes        | pass   | 588ms |
| `e2e/home.spec.ts:44` — Home page › opens and closes the mobile nav from the hamburger button | pass   | 538ms |
| `e2e/smoke.spec.ts:13` — home page loads with no console errors                               | pass   | 430ms |
| `e2e/smoke.spec.ts:26` — the API responds                                                     | pass   | 322ms |
| `e2e/smoke.spec.ts:43` — a database-backed route responds                                     | pass   | 365ms |

Playwright summary: `6 passed (3.9s)`

None of the 6 specs exercise the `healthz-smoke-1065915107-*` routes this sprint added — the suite covers the SPA home page and pre-existing smoke checks (`/api/hello`, a database-backed route). The new routes are verified directly via `H3Event` unit tests (see `qa-test-report.md` § Unit Test Results) and a live `curl` check against `bun run dev` (see `qa-test-report.md` § Executive Summary).

## Failures

None.

E2E-RESULT: chromium 6 passed, 0 failed
