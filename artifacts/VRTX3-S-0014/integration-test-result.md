# Integration / E2E Test Result — VRTX3-S-0014

- **Sprint:** VRTX3-S-0014
- **Date:** 2026-08-10
- **Validation agent:** Vortex Validation Agent

## Command

```
bun run test:e2e -- --project=chromium
```

which expands to `playwright test "--project=chromium"` (via the `test:e2e` npm script;
`pretest:e2e` first runs `node scripts/ensure-playwright-browser.mjs`, confirming Chromium
was available in-container). Playwright's own `webServer` config built and served the app
via `bun x vite --port 5178 --strictPort` (see `playwright.config.ts`).

## Real Playwright output (run-summary line, verbatim)

```
Running 5 tests using 4 workers

  ✓  1 [chromium] › e2e/home.spec.ts:44:3 › Home page › opens and closes the mobile nav from the hamburger button (519ms)
  ✓  4 [chromium] › e2e/home.spec.ts:14:3 › Home page › shows the hero content and desktop nav (524ms)
  ✓  3 [chromium] › e2e/smoke.spec.ts:13:1 › home page loads with no console errors (577ms)
  ✓  2 [chromium] › e2e/home.spec.ts:27:3 › Home page › has no vertical scrollbar on common viewport sizes (625ms)
  ✓  5 [chromium] › e2e/smoke.spec.ts:26:1 › the API responds (331ms)

  5 passed (3.8s)
```

## Per-spec table

| #   | Spec                   | Test                                                      | Status    | Duration |
| --- | ---------------------- | --------------------------------------------------------- | --------- | -------- |
| 1   | `e2e/home.spec.ts:44`  | opens and closes the mobile nav from the hamburger button | ✅ passed | 519ms    |
| 2   | `e2e/home.spec.ts:27`  | has no vertical scrollbar on common viewport sizes        | ✅ passed | 625ms    |
| 3   | `e2e/home.spec.ts:14`  | shows the hero content and desktop nav                    | ✅ passed | 524ms    |
| 4   | `e2e/smoke.spec.ts:13` | home page loads with no console errors                    | ✅ passed | 577ms    |
| 5   | `e2e/smoke.spec.ts:26` | the API responds                                          | ✅ passed | 331ms    |

No failures — no trace/screenshot artifacts were generated.

## Relation to this sprint's changes

None of the five specs exercise the `healthz-smoke-*` probe family directly
(`e2e/smoke.spec.ts` only probes `/api/hello`, per `SPRINT-PLAN.md`'s own risk note), so
this run's purpose is regression coverage: confirming the sprint's three purely-additive
new route files did not break the app shell, nav, or existing API smoke check. The three
new routes themselves were verified separately by live `curl` against a freshly started
`bun run dev` server and by their colocated Vitest integration tests — both recorded in
`qa-test-report.md`.

E2E-RESULT: chromium 5 passed, 0 failed
