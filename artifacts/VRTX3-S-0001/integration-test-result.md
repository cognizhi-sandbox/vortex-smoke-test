# Integration/E2E Test Result — VRTX3-S-0001

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

  ✓  3 [chromium] › e2e/smoke.spec.ts:13:1 › home page loads with no console errors (912ms)
  ✓  2 [chromium] › e2e/home.spec.ts:14:3 › Home page › shows the hero content and desktop nav (1.2s)
  ✓  5 [chromium] › e2e/smoke.spec.ts:26:1 › the API responds (402ms)
  ✓  1 [chromium] › e2e/home.spec.ts:27:3 › Home page › has no vertical scrollbar on common viewport sizes (1.4s)
  ✓  4 [chromium] › e2e/home.spec.ts:44:3 › Home page › opens and closes the mobile nav from the hamburger button (1.4s)

  5 passed (5.7s)
```

## Per-spec pass/fail table

| #   | Spec                   | Test                                                                  | Result    | Duration |
| --- | ---------------------- | --------------------------------------------------------------------- | --------- | -------- |
| 1   | `e2e/home.spec.ts:27`  | Home page › has no vertical scrollbar on common viewport sizes        | ✅ passed | 1.4s     |
| 2   | `e2e/home.spec.ts:14`  | Home page › shows the hero content and desktop nav                    | ✅ passed | 1.2s     |
| 3   | `e2e/smoke.spec.ts:13` | home page loads with no console errors                                | ✅ passed | 912ms    |
| 4   | `e2e/home.spec.ts:44`  | Home page › opens and closes the mobile nav from the hamburger button | ✅ passed | 1.4s     |
| 5   | `e2e/smoke.spec.ts:26` | the API responds                                                      | ✅ passed | 402ms    |

**Total: 5 passed, 0 failed, 0 skipped. Wall clock: 5.7s.**

## Sprint-goal-specific verification (supplement to the Playwright suite)

The existing Playwright suite does not target the three new
`healthz-smoke-*` endpoints directly (they are covered at the route level by
`H3Event` integration tests per repo convention, not by browser E2E specs).
To verify this sprint's actual acceptance criteria end-to-end, QA additionally
ran the production build and curled each new endpoint directly (full output
in `qa-test-report.md` under Code Review):

- `GET /api/healthz-smoke-bugfix-868175391` → `200`, `application/json`, `{"ok":true,"variant":"868175391"}`
- `GET /api/healthz-smoke-bugfix2-101584827` → `200`, `application/json`, `{"ok":true,"variant":"101584827"}`
- `GET /api/healthz-smoke-bugfix3-403022997` → `200`, `application/json`, `{"ok":true,"variant":"403022997"}`

All three match their ticket's expected body exactly.

---

E2E-RESULT: chromium 5 passed, 0 failed
