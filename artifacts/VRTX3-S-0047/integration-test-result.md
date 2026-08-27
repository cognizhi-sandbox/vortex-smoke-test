---
artifact: integration-test-result
spec: 1
status: complete
author_role: validation
sprint: VRTX3-S-0047
idea: VRTX3-I-0057
branch: vortex/sprint/vrtx3-s-0047-8cd3c597
downstream: [artifacts/VRTX3-S-0047/qa-test-report.md]
---

# Integration test result — VRTX3-S-0047

## Commands run

```
$ bun install
$ bun run build
$ bunx playwright test --list
$ bun run test:e2e -- --project=chromium
```

`playwright.config.ts` declares one project, `chromium`, over two spec files (`e2e/home.spec.ts`,
`e2e/smoke.spec.ts`); `--list` confirmed 6 tests in 2 files, all covered by the single project, so
`--project=chromium` alone is the full selection — no mobile/emulated project exists in this repo.

First invocation of `bun run test:e2e -- --project=chromium` timed out after 120000ms in
`config.webServer` (`Error: Timed out waiting 120000ms from config.webServer.`). Diagnosed before
treating it as a defect, per the rule that a result which flips between identical runs on unchanged
code is a flake, not a clue: manually started
`bun --bun ./node_modules/vite/bin/vite.js --port 5178 --strictPort` and it printed `VITE ready` in
253ms with `curl http://localhost:5178/` returning `200` within 5s — the server itself was never
slow. A `DEBUG=pw:webserver` re-run on the same unchanged code immediately after showed the
webServer health check connecting and passing normally, and the full command below then passed
clean. No code change was made; this was a one-off flake in this container's webServer startup
race, not a regression in the three new routes (which carry no E2E coverage by standing decision —
`design.md` § D5).

## Results

| Spec                                                                                       | Result | Notes |
| ------------------------------------------------------------------------------------------ | ------ | ----- |
| `e2e/smoke.spec.ts › home page loads with no console errors`                               | pass   | 456ms |
| `e2e/smoke.spec.ts › the API responds`                                                     | pass   | 337ms |
| `e2e/smoke.spec.ts › a database-backed route responds`                                     | pass   | 350ms |
| `e2e/home.spec.ts › Home page › shows the hero content and desktop nav`                    | pass   | 413ms |
| `e2e/home.spec.ts › Home page › has no vertical scrollbar on common viewport sizes`        | pass   | 516ms |
| `e2e/home.spec.ts › Home page › opens and closes the mobile nav from the hamburger button` | pass   | 552ms |

Playwright summary (verbatim, re-run after the diagnosed flake):

```
Running 6 tests using 4 workers
  ✓  1 [chromium] › e2e/smoke.spec.ts:13:1 › home page loads with no console errors (456ms)
  ✓  2 [chromium] › e2e/home.spec.ts:14:3 › Home page › shows the hero content and desktop nav (413ms)
  ✓  4 [chromium] › e2e/home.spec.ts:27:3 › Home page › has no vertical scrollbar on common viewport sizes (516ms)
  ✓  3 [chromium] › e2e/home.spec.ts:44:3 › Home page › opens and closes the mobile nav from the hamburger button (552ms)
  ✓  5 [chromium] › e2e/smoke.spec.ts:26:1 › the API responds (337ms)
  ✓  6 [chromium] › e2e/smoke.spec.ts:43:1 › a database-backed route responds (350ms)

  6 passed (3.5s)
```

No spec file ran zero tests; no skips in either run.

E2E-RESULT: chromium 6 passed, 0 failed, 0 skipped
