---
artifact: integration-test-result
spec: 1
status: complete
author_role: validation
sprint: VRTX3-S-0042
idea: VRTX3-I-0051
branch: vortex/sprint/vrtx3-s-0042-8239c37c
downstream: [artifacts/VRTX3-S-0042/qa-test-report.md]
---

# Integration test result — VRTX3-S-0042

## Commands run

```
$ bun install
$ bun run build
$ bunx playwright test --list          # confirmed: 1 project (chromium), covers both spec files
$ bun run test:e2e --project=chromium
```

## Results

| Spec                                                                              | Result | Notes |
| --------------------------------------------------------------------------------- | ------ | ----- |
| `e2e/home.spec.ts:14` › shows the hero content and desktop nav                    | pass   | 431ms |
| `e2e/home.spec.ts:27` › has no vertical scrollbar on common viewport sizes        | pass   | 563ms |
| `e2e/home.spec.ts:44` › opens and closes the mobile nav from the hamburger button | pass   | 527ms |
| `e2e/smoke.spec.ts:13` › home page loads with no console errors                   | pass   | 389ms |
| `e2e/smoke.spec.ts:26` › the API responds                                         | pass   | 327ms |
| `e2e/smoke.spec.ts:43` › a database-backed route responds                         | pass   | 333ms |

Playwright summary: `6 passed (4.2s)`

Note: this sprint's change (three new API-only health probes) adds no browser-observable
behaviour, per `design.md` § Test-harness phase — no new Playwright spec was expected. The
existing suite was still executed in full against the integrated build, per the E2E mandate.

## Skipped

None.

E2E-RESULT: chromium 6 passed, 0 failed, 0 skipped
