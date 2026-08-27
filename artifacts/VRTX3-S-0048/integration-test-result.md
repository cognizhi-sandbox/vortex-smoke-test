---
artifact: integration-test-result
spec: 1
status: complete
author_role: validation
sprint: VRTX3-S-0048
idea: VRTX3-I-0058
branch: vortex/sprint/vrtx3-s-0048-aaf68415
downstream: [artifacts/VRTX3-S-0048/qa-test-report.md]
---

# Integration test result — VRTX3-S-0048

## Commands run

```
$ bun install
$ bun run build
$ bunx playwright test --list        # confirmed coverage: 1 project (chromium), 6 tests, 2 spec files
$ bun run test:e2e                   # = playwright test (single chromium project; no other project defined)
```

First `bun run test:e2e` attempt hit `Error: Timed out waiting 120000ms from config.webServer.` with no other
symptom (no port conflict, no process on 5178, manual `vite --port 5178 --strictPort` bound and served
`/` and `/api/hello` with `200` inside 3s). Re-ran immediately with no changes: passed clean. Treated as a
flake per `rules.md` §4 (identical inputs, different outcome), not a regression — logged, not filed as a
defect.

## Results

| Spec                                                                           | Result | Notes |
| ------------------------------------------------------------------------------ | ------ | ----- |
| `e2e/home.spec.ts` › shows the hero content and desktop nav                    | pass   | 394ms |
| `e2e/home.spec.ts` › has no vertical scrollbar on common viewport sizes        | pass   | 606ms |
| `e2e/home.spec.ts` › opens and closes the mobile nav from the hamburger button | pass   | 502ms |
| `e2e/smoke.spec.ts` › home page loads with no console errors                   | pass   | 406ms |
| `e2e/smoke.spec.ts` › the API responds                                         | pass   | 320ms |
| `e2e/smoke.spec.ts` › a database-backed route responds                         | pass   | 372ms |

Playwright summary: `6 passed (2.7s)`

No spec file skipped; no spec file ran zero tests. This sprint's three probe endpoints carry no
Playwright coverage by standing decision (`design.md` § D5 — "No Playwright work... probes carry no
E2E coverage by standing decision"); their behaviour is exercised by their colocated unit tests and by
this report's own live-request checks (see `qa-test-report.md`).

E2E-RESULT: chromium 6 passed, 0 failed, 0 skipped
