---
artifact: integration-test-result
spec: 1
status: complete
author_role: validation
sprint: VRTX3-S-0049
idea: VRTX3-I-0059
branch: vortex/sprint/vrtx3-s-0049-e016db21
downstream: [artifacts/VRTX3-S-0049/qa-test-report.md]
---

# Integration test result — VRTX3-S-0049

## Commands run

```
$ bun install
$ bun run build
$ bunx playwright test --list                    # confirms 2 spec files / 6 tests, single "chromium" project, none restricted to another project
$ bun run test:e2e -- --project=chromium
```

First attempt timed out in `config.webServer` (`Error: Timed out waiting 120000ms from config.webServer.`) while Vite was still cold-optimizing dependencies — confirmed transient by starting the same webServer command by hand and observing it bind and answer `200` well inside the 120s budget. Re-ran `bun run test:e2e -- --project=chromium` immediately after with a warm Vite cache; it passed. Reported below is the passing re-run, per rules.md §4 (a flake on an unrelated cold-start budget is retried, not bisected) — no code changed between attempts.

## Results

| Spec                                                                                          | Result | Notes |
| --------------------------------------------------------------------------------------------- | ------ | ----- |
| `e2e/home.spec.ts:14` › Home page › shows the hero content and desktop nav                    | pass   | 407ms |
| `e2e/home.spec.ts:27` › Home page › has no vertical scrollbar on common viewport sizes        | pass   | 522ms |
| `e2e/home.spec.ts:44` › Home page › opens and closes the mobile nav from the hamburger button | pass   | 534ms |
| `e2e/smoke.spec.ts:13` › home page loads with no console errors                               | pass   | 327ms |
| `e2e/smoke.spec.ts:26` › the API responds                                                     | pass   | 388ms |
| `e2e/smoke.spec.ts:43` › a database-backed route responds                                     | pass   | 423ms |

Playwright summary: `6 passed (3.6s)`

This sprint (VRTX3-I-0059) adds `POST /api/auth/login`, which has no browser-observable UI — it ships no page, no form, no client code. There is no new Playwright spec for it; the existing suite (home page + smoke) is unchanged by this sprint and is what ran. The login endpoint's behaviour is exercised directly against a running dev server instead — see `qa-test-report.md` § E2E Test Status and § Issues Found for the live-check evidence and each `SCENARIO-VERDICT`.

## Skipped

None — every listed spec ran and passed.

E2E-RESULT: chromium 6 passed, 0 failed, 0 skipped
