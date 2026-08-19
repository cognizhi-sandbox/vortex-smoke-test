---
artifact: integration-test-result
spec: 1
status: complete
author_role: validation
sprint: VRTX3-S-0026
idea: VRTX3-I-0035
branch: vortex/sprint/vrtx3-s-0026-52dbe58c
downstream: [artifacts/VRTX3-S-0026/qa-test-report.md]
---

# Integration test result — VRTX3-S-0026

## Commands run

```
$ bun install
$ bun run build
$ bun run test:e2e -- --project=chromium
```

First attempt timed out (`Error: Timed out waiting 120000ms from config.webServer.`) — root-caused
to a leftover manual `bun run dev` process I had started earlier in this same session for the live
wiring check (§ below), still bound in the container. Killed it (`kill -9`, confirmed via
`/proc/*/cmdline`) and cleared the stale `node_modules/.vite` cache, then re-ran. This is
self-induced session state, not a sprint regression — no defect filed.

## Results

| Spec                                                                           | Result | Notes |
| ------------------------------------------------------------------------------ | ------ | ----- |
| `e2e/home.spec.ts` › shows the hero content and desktop nav                    | pass   | 432ms |
| `e2e/home.spec.ts` › has no vertical scrollbar on common viewport sizes        | pass   | 618ms |
| `e2e/home.spec.ts` › opens and closes the mobile nav from the hamburger button | pass   | 571ms |
| `e2e/smoke.spec.ts` › home page loads with no console errors                   | pass   | 400ms |
| `e2e/smoke.spec.ts` › the API responds                                         | pass   | 382ms |
| `e2e/smoke.spec.ts` › a database-backed route responds                         | pass   | 366ms |

Playwright summary: `6 passed (6.2s)`

No spec file was wholly skipped; all 6 cases across both spec files ran and passed.

## Skipped

None.

E2E-RESULT: chromium 6 passed, 0 failed, 0 skipped
