---
artifact: integration-test-result
spec: 1
status: complete
author_role: validation
sprint: VRTX3-S-0003
idea: VRTX3-I-0006
branch: vortex/sprint/vrtx3-s-0003-36924a4a
downstream: [artifacts/VRTX3-S-0003/qa-test-report.md]
---

> **Note on this file:** this file previously held the E2E record from a different, earlier sprint
> that also ran as `VRTX3-S-0003` (2026-08-02, variants `26031336`/`59156521`/`200192357`). It is
> replaced here with the record for the current sprint (variants
> `858873211`/`664793322`/`267063007`), per the recycled-key banner in `SPRINT-PLAN.md`.

# Integration test result — VRTX3-S-0003

## Commands run

```
$ bun install
$ bun run build
$ bunx playwright test --list          # confirmed 1 project (chromium), 2 spec files, 6 tests
$ bun run test:e2e -- --project=chromium
```

`playwright.config.ts` defines a single project (`chromium`); there is no mobile/emulated project
to miss.

## Results

| Spec                                                                           | Result | Notes |
| ------------------------------------------------------------------------------ | ------ | ----- |
| `e2e/home.spec.ts` › shows the hero content and desktop nav                    | pass   | 604ms |
| `e2e/home.spec.ts` › has no vertical scrollbar on common viewport sizes        | pass   | 898ms |
| `e2e/home.spec.ts` › opens and closes the mobile nav from the hamburger button | pass   | 623ms |
| `e2e/smoke.spec.ts` › home page loads with no console errors                   | pass   | 382ms |
| `e2e/smoke.spec.ts` › the API responds                                         | pass   | 335ms |
| `e2e/smoke.spec.ts` › a database-backed route responds                         | pass   | 425ms |

Playwright summary (verbatim): `6 passed (7.2s)`

No spec file was wholly skipped; every test in both files executed.

## Skipped

None.

E2E-RESULT: chromium 6 passed, 0 failed, 0 skipped
