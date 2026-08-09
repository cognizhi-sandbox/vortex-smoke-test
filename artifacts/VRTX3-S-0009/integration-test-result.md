# Integration / E2E Test Result — VRTX3-S-0009

## Command

```bash
bun run test:e2e -- --project=chromium
```

(`test:e2e` → `playwright test`; invoked with `--project=chromium` per instructions. Config: `playwright.config.ts`, dedicated port 5178, `webServer` auto-starts `bun x vite --port 5178 --strictPort`.)

## Real stdout (captured, not paraphrased)

```
$ node scripts/ensure-playwright-browser.mjs
$ playwright test "--project=chromium"

Running 5 tests using 4 workers

  ✓  3 [chromium] › e2e/home.spec.ts:14:3 › Home page › shows the hero content and desktop nav (492ms)
  ✓  2 [chromium] › e2e/home.spec.ts:44:3 › Home page › opens and closes the mobile nav from the hamburger button (511ms)
  ✓  4 [chromium] › e2e/smoke.spec.ts:13:1 › home page loads with no console errors (518ms)
  ✓  1 [chromium] › e2e/home.spec.ts:27:3 › Home page › has no vertical scrollbar on common viewport sizes (612ms)
  ✓  5 [chromium] › e2e/smoke.spec.ts:26:1 › the API responds (320ms)

  5 passed (3.6s)
```

## Per-spec results

| Spec                | Test                                                                  | Result    |
| ------------------- | --------------------------------------------------------------------- | --------- |
| `e2e/home.spec.ts`  | Home page › has no vertical scrollbar on common viewport sizes        | ✅ passed |
| `e2e/home.spec.ts`  | Home page › shows the hero content and desktop nav                    | ✅ passed |
| `e2e/home.spec.ts`  | Home page › opens and closes the mobile nav from the hamburger button | ✅ passed |
| `e2e/smoke.spec.ts` | home page loads with no console errors                                | ✅ passed |
| `e2e/smoke.spec.ts` | the API responds                                                      | ✅ passed |

## Notes

- This suite exercises the SPA shell and `/api/hello` — it does not target the 3 new `healthz-smoke-bugfix*` routes from this sprint's tickets specifically. Those were verified directly against the built production server (`bun .output/server/index.mjs`) via `curl`, asserting response body + `Content-Type` per the repo's documented gotcha (status-code-only checks cannot distinguish a working route from the SPA fallback). See `## E2E Test Status` and `## Issues Found` in `qa-test-report.md` for those results.
- No regressions observed; all pre-existing specs remain green.

E2E-RESULT: chromium 5 passed, 0 failed
