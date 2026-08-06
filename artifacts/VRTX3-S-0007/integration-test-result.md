# Integration/E2E Test Result — VRTX3-S-0007

**Command run:**

```
bun install
bun run build
bun run test:e2e -- --project=chromium
```

**Environment:** container-provided Chromium via Playwright, dev server on
`http://localhost:5178` per `playwright.config.ts` (`bun x vite --port 5178
--strictPort`, `reuseExistingServer` disabled for this run since `CI` is unset
but no prior server was running).

## Real stdout (captured verbatim)

```
$ node scripts/ensure-playwright-browser.mjs
$ playwright test "--project=chromium"

Running 5 tests using 4 workers

  ✓  2 [chromium] › e2e/home.spec.ts:14:3 › Home page › shows the hero content and desktop nav (411ms)
  ✓  4 [chromium] › e2e/smoke.spec.ts:13:1 › home page loads with no console errors (504ms)
  ✓  1 [chromium] › e2e/home.spec.ts:27:3 › Home page › has no vertical scrollbar on common viewport sizes (609ms)
  ✓  3 [chromium] › e2e/home.spec.ts:44:3 › Home page › opens and closes the mobile nav from the hamburger button (634ms)
  ✓  5 [chromium] › e2e/smoke.spec.ts:26:1 › the API responds (325ms)

  5 passed (3.8s)
```

## Per-spec pass/fail table

| #   | Spec                   | Test                                                                  | Result    | Duration |
| --- | ---------------------- | --------------------------------------------------------------------- | --------- | -------- |
| 1   | `e2e/home.spec.ts:14`  | Home page › shows the hero content and desktop nav                    | ✅ passed | 411ms    |
| 2   | `e2e/smoke.spec.ts:13` | home page loads with no console errors                                | ✅ passed | 504ms    |
| 3   | `e2e/home.spec.ts:27`  | Home page › has no vertical scrollbar on common viewport sizes        | ✅ passed | 609ms    |
| 4   | `e2e/home.spec.ts:44`  | Home page › opens and closes the mobile nav from the hamburger button | ✅ passed | 634ms    |
| 5   | `e2e/smoke.spec.ts:26` | the API responds                                                      | ✅ passed | 325ms    |

**Total: 5 passed, 0 failed, 0 skipped. Wall clock: 3.8s.**

## Sprint-goal-specific verification (supplement to the Playwright suite)

The existing Playwright suite does not target the three new
`healthz-smoke-*` endpoints directly (they are covered at the route level by
`H3Event` integration tests per repo convention, not by browser E2E specs).
To verify this sprint's actual acceptance criteria end-to-end, QA additionally
built the production server (`bun run build`) and started it
(`bun .output/server/index.mjs`), then curled each new endpoint directly (full
output in `qa-test-report.md` under Code Review):

- `GET /api/healthz-smoke-bugfix-534542341` → `200`, `application/json`, `{"ok":true,"variant":"534542341"}`
- `GET /api/healthz-smoke-bugfix2-279986033` → `200`, `application/json`, `{"ok":true,"variant":"279986033"}`
- `GET /api/healthz-smoke-bugfix3-605591646` → `200`, `application/json`, `{"ok":true,"variant":"605591646"}`

All three match their ticket's expected body exactly. A control request to a
still-nonexistent path (`/api/healthz-smoke-nonexistent-000`) returned `200
text/html` (the SPA fallback), confirming the tickets' correction that a
status-code-only check cannot distinguish a fixed endpoint from a missing one.

---

E2E-RESULT: chromium 5 passed, 0 failed
