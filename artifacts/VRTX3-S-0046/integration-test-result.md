---
artifact: integration-test-result
spec: 1
status: complete
author_role: validation
sprint: VRTX3-S-0046
idea: VRTX3-I-0055
branch: vortex/sprint/vrtx3-s-0046-9f6553fc
downstream: [artifacts/VRTX3-S-0046/qa-test-report.md]
---

# Integration test result — VRTX3-S-0046

## Commands run

```
$ bun install
$ bun run build
$ bunx playwright test --list --project=chromium   # confirm project coverage
$ bun run test:e2e -- --project=chromium
```

`playwright.config.ts` declares a single project, `chromium` — `--list` confirmed both spec
files (`e2e/home.spec.ts`, `e2e/smoke.spec.ts`, 6 tests total) are covered by it; there is no
mobile/emulated project to miss.

## Results

| Spec                                                                                          | Result | Notes |
| --------------------------------------------------------------------------------------------- | ------ | ----- |
| `e2e/home.spec.ts:14` › Home page › shows the hero content and desktop nav                    | pass   | 416ms |
| `e2e/home.spec.ts:27` › Home page › has no vertical scrollbar on common viewport sizes        | pass   | 540ms |
| `e2e/home.spec.ts:44` › Home page › opens and closes the mobile nav from the hamburger button | pass   | 590ms |
| `e2e/smoke.spec.ts:13` › home page loads with no console errors                               | pass   | 397ms |
| `e2e/smoke.spec.ts:26` › the API responds                                                     | pass   | 319ms |
| `e2e/smoke.spec.ts:43` › a database-backed route responds                                     | pass   | 332ms |

Playwright summary: `6 passed (4.2s)`

No spec file ran zero tests; nothing skipped.

## Coverage of this sprint's change

The three new probe routes have no dedicated Playwright spec (per D4/D2 of the change design,
each probe is a self-contained additive route verified by its colocated unit test and by live
`curl` against the running dev server — see `qa-test-report.md` § Unit Test Results and the
per-scenario verdicts). The existing E2E suite (home page + smoke) exercises the app shell and
is unaffected by this sprint; it stayed green, confirming no regression.

E2E-RESULT: chromium 6 passed, 0 failed, 0 skipped
