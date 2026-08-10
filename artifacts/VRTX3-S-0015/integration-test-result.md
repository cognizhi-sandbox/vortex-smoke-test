# Integration / E2E Test Result — VRTX3-S-0015

- **Sprint:** VRTX3-S-0015
- **Date:** 2026-08-10
- **Validation agent:** Vortex Agent (Validation, VRTX3-T-0102)

## Command executed

```
bun run test:e2e -- --project=chromium
```

which invokes (per `package.json`): `node scripts/ensure-playwright-browser.mjs && playwright test --project=chromium`, against Playwright's own managed `webServer` (`bun x vite --port 5178 --strictPort`, per `playwright.config.ts`).

## Real Playwright output (verbatim)

```
Running 5 tests using 4 workers

  ✓  1 [chromium] › e2e/home.spec.ts:44:3 › Home page › opens and closes the mobile nav from the hamburger button (509ms)
  ✓  3 [chromium] › e2e/smoke.spec.ts:13:1 › home page loads with no console errors (497ms)
  ✓  2 [chromium] › e2e/home.spec.ts:14:3 › Home page › shows the hero content and desktop nav (524ms)
  ✓  4 [chromium] › e2e/home.spec.ts:27:3 › Home page › has no vertical scrollbar on common viewport sizes (602ms)
  ✓  5 [chromium] › e2e/smoke.spec.ts:26:1 › the API responds (386ms)

  5 passed (3.6s)
```

## Per-spec results

| #   | Spec                   | Test                                                      | Project  | Result | Duration |
| --- | ---------------------- | --------------------------------------------------------- | -------- | ------ | -------- |
| 1   | `e2e/home.spec.ts:44`  | opens and closes the mobile nav from the hamburger button | chromium | PASS   | 509ms    |
| 2   | `e2e/home.spec.ts:14`  | shows the hero content and desktop nav                    | chromium | PASS   | 524ms    |
| 3   | `e2e/home.spec.ts:27`  | has no vertical scrollbar on common viewport sizes        | chromium | PASS   | 602ms    |
| 4   | `e2e/smoke.spec.ts:13` | home page loads with no console errors                    | chromium | PASS   | 497ms    |
| 5   | `e2e/smoke.spec.ts:26` | the API responds                                          | chromium | PASS   | 386ms    |

No failures; no traces/screenshots generated (no test needed retry-on-failure capture).

## Note on E2E scope vs. this sprint's changes

Per `SPRINT-PLAN.md`'s risk assessment, `e2e/smoke.spec.ts:27` probes `/api/hello`, not the `healthz-smoke-*` family, so this sprint's three new probes are outside Playwright's existing spec coverage by design (matching the established pattern for all prior `healthz-smoke-*` sprints — these probes are verified by colocated Vitest integration tests plus live HTTP checks, not Playwright specs). To directly verify the sprint's actual acceptance criteria (each probe reachable and returning the correct JSON body from a live server, not just passing its own unit test — see `AGENT.md` § Gotchas on the SPA-fallback trap), the following live requests were made against a freshly built and started production server (`bun run build` then `bun .output/server/index.mjs`, a clean process start so the route table was freshly scanned):

```
$ curl -s -D - -o /tmp/body.txt http://localhost:3000/api/healthz-smoke-bugfix-406186407
HTTP/1.1 200 OK
Content-Type: application/json;charset=UTF-8
{"ok":true,"variant":"406186407"}

$ curl -s -D - -o /tmp/body.txt http://localhost:3000/api/healthz-smoke-bugfix2-487405332
HTTP/1.1 200 OK
Content-Type: application/json;charset=UTF-8
{"ok":true,"variant":"487405332"}

$ curl -s -D - -o /tmp/body.txt http://localhost:3000/api/healthz-smoke-bugfix3-418626414
HTTP/1.1 200 OK
Content-Type: application/json;charset=UTF-8
{"ok":true,"variant":"418626414"}

$ curl -s -D - -o /tmp/body.txt http://localhost:3000/api/healthz-smoke-bugfix3-404580234   # control — pre-existing route
HTTP/1.1 200 OK
Content-Type: application/json;charset=UTF-8
{"ok":true,"variant":"404580234"}
```

All three new probes, plus the pre-existing control, return the correct body and `Content-Type` — confirming all three routes are registered in the production build's route table, not merely present as source files with a passing colocated unit test.

E2E-RESULT: chromium 5 passed, 0 failed
