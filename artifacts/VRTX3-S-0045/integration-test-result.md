---
artifact: integration-test-result
spec: 1
status: complete
author_role: validation
sprint: VRTX3-S-0045
idea: Not Applicable
branch: vortex/sprint/vrtx3-s-0045-4cae88d7
downstream: [artifacts/VRTX3-S-0045/qa-test-report.md]
---

# Integration test result — VRTX3-S-0045

## Commands run

```
$ bun install
$ bun run build
$ bunx playwright test --list          # confirm project coverage before running
$ bun run test:e2e -- --project=chromium
```

`playwright.config.ts` declares a single project, `chromium`; `--list` confirmed all 6 specs
(`e2e/home.spec.ts`, `e2e/smoke.spec.ts`) run under it, so `--project=chromium` covers the full
suite — no spec is restricted to a second/mobile project that would be missed.

## Results

| Spec                                                                                          | Result | Notes |
| --------------------------------------------------------------------------------------------- | ------ | ----- |
| `e2e/home.spec.ts:14` › Home page › shows the hero content and desktop nav                    | pass   | 401ms |
| `e2e/home.spec.ts:27` › Home page › has no vertical scrollbar on common viewport sizes        | pass   | 535ms |
| `e2e/home.spec.ts:44` › Home page › opens and closes the mobile nav from the hamburger button | pass   | 544ms |
| `e2e/smoke.spec.ts:13` › home page loads with no console errors                               | pass   | 471ms |
| `e2e/smoke.spec.ts:26` › the API responds                                                     | pass   | 325ms |
| `e2e/smoke.spec.ts:43` › a database-backed route responds                                     | pass   | 346ms |

Playwright summary (verbatim): `6 passed (4.1s)`

No spec file ran zero tests; no skips.

## Notes

No Playwright spec targets the `healthz-smoke-*` probe family, including this sprint's three new
routes — that family is verified by its colocated unit tests plus a live-server body/`Content-Type`
check (see `qa-test-report.md` → `## E2E Test Status` and the `SCENARIO-VERDICT` lines), per
`design.md` D1: status code alone cannot distinguish a wired probe from the SPA-shell fallback, and
none of the existing E2E specs exercise this route family. This is pre-existing test-suite scope,
not a gap introduced by this sprint.

E2E-RESULT: chromium 6 passed, 0 failed, 0 skipped
