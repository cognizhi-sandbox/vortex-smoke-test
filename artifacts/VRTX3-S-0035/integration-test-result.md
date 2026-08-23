---
artifact: integration-test-result
spec: 1
status: complete
author_role: validation
sprint: VRTX3-S-0035
idea: VRTX3-I-0042
branch: vortex/sprint/vrtx3-s-0035-b613a5d1
---

# Integration Test Result — VRTX3-S-0035

## Command

```
bun run test:e2e -- --project=chromium
```

which resolves to `playwright test "--project=chromium"` (via the `pretest:e2e` hook
`node scripts/ensure-playwright-browser.mjs`, then Playwright itself). Confirmed with
`bunx playwright test --list` that this selection covers every spec in `e2e/` — the repo
has exactly one Playwright project, `chromium`, and both spec files (`home.spec.ts`,
`smoke.spec.ts`) run under it; there is no mobile/emulated project to miss.

## Run output (verbatim run-summary)

First invocation hit a transient webServer connection refusal
(`connect ECONNREFUSED ::1:5178`) during Vite's cold start and the run's overall wait
exceeded the 120s `webServer.timeout`; re-running the identical command immediately after
succeeded cleanly, confirmed via `DEBUG=pw:webserver` that Vite became reachable in ~700ms
on the second attempt. This is a cold-start scheduling flake, not a code defect — the same
build, same command, same port.

```
$ bun run test:e2e -- --project=chromium
$ node scripts/ensure-playwright-browser.mjs
$ playwright test "--project=chromium"

Running 6 tests using 4 workers
  ✓  1 [chromium] › e2e/smoke.spec.ts:13:1 › home page loads with no console errors (342ms)
  ✓  2 [chromium] › e2e/home.spec.ts:14:3 › Home page › shows the hero content and desktop nav (407ms)
  ✓  4 [chromium] › e2e/home.spec.ts:44:3 › Home page › opens and closes the mobile nav from the hamburger button (520ms)
  ✓  3 [chromium] › e2e/home.spec.ts:27:3 › Home page › has no vertical scrollbar on common viewport sizes (524ms)
  ✓  5 [chromium] › e2e/smoke.spec.ts:26:1 › the API responds (334ms)
  ✓  6 [chromium] › e2e/smoke.spec.ts:43:1 › a database-backed route responds (352ms)

  6 passed (4.1s)
```

Exit code: 0.

## Per-spec results

| Spec file     | Test                                                                  | Result | Duration |
| ------------- | --------------------------------------------------------------------- | ------ | -------- |
| smoke.spec.ts | home page loads with no console errors                                | PASS   | 342ms    |
| home.spec.ts  | Home page › shows the hero content and desktop nav                    | PASS   | 407ms    |
| home.spec.ts  | Home page › has no vertical scrollbar on common viewport sizes        | PASS   | 524ms    |
| home.spec.ts  | Home page › opens and closes the mobile nav from the hamburger button | PASS   | 520ms    |
| smoke.spec.ts | the API responds                                                      | PASS   | 334ms    |
| smoke.spec.ts | a database-backed route responds                                      | PASS   | 352ms    |

No spec file was wholly or partially skipped. Neither existing E2E spec targets the new
`healthz-smoke-180848429-*` probes (no ticket in this sprint added one and none was required
by the acceptance criteria); those probes were verified directly via HTTP against the built
`.output` server instead — see `qa-test-report.md` § Issues Found for that evidence.

E2E-RESULT: chromium 6 passed, 0 failed, 0 skipped
