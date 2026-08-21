---
artifact: integration-test-result
spec: 1
status: complete
author_role: validation
sprint: VRTX3-S-0002
idea: VRTX3-I-0005 (VRTX3-T-0009 only; VRTX3-T-0007 and VRTX3-T-0008 have none linked)
branch: vortex/sprint/vrtx3-s-0002-4688bb08
downstream: [artifacts/VRTX3-S-0002/qa-test-report.md]
---

# Integration test result — VRTX3-S-0002

This file replaces a stale record left on disk from the earlier sprint that recycled this sprint key
(variants `106285986`/`524723214`/`764107669`, committed in `e167bb8`; see `SPRINT-PLAN.md` note 1).
It records this sprint's actual run against the current integrated branch.

## Commands run

```
$ bunx playwright test --list          # confirms coverage before running
$ bun run test:e2e -- --project=chromium
```

`playwright.config.ts` defines a single project, `chromium` — no mobile/emulated project exists in
this repo, so `--project=chromium` covers every spec (`--list` confirmed: 1 project, 2 spec files, 6
tests, all under `chromium`).

## Results

| Spec                                                                              | Result | Notes |
| --------------------------------------------------------------------------------- | ------ | ----- |
| `e2e/home.spec.ts:14` — shows the hero content and desktop nav                    | pass   | 693ms |
| `e2e/home.spec.ts:27` — has no vertical scrollbar on common viewport sizes        | pass   | 980ms |
| `e2e/home.spec.ts:44` — opens and closes the mobile nav from the hamburger button | pass   | 740ms |
| `e2e/smoke.spec.ts:13` — home page loads with no console errors                   | pass   | 404ms |
| `e2e/smoke.spec.ts:26` — the API responds                                         | pass   | 332ms |
| `e2e/smoke.spec.ts:43` — a database-backed route responds                         | pass   | 412ms |

Playwright summary (verbatim): `6 passed (7.8s)`

No spec file was wholly skipped.

## Sprint-specific verification (beyond the generic E2E suite)

The sprint's three new probe routes are plain JSON GET endpoints, not part of the browser UI flows
the Playwright suite exercises, so they were separately verified directly against the integrated
build per `AGENT.md` § Gotchas (status code alone cannot distinguish a missing route from a working
one — verify body + `Content-Type`). Dev server bound `:5000` (read from the Vite banner).

```
$ curl -s -o /dev/null -w '%{http_code} %{content_type} ' http://localhost:5000/api/healthz-smoke-bugfix-158202122
200 application/json;charset=UTF-8 {"ok":true,"variant":"158202122"}

$ curl -s -o /dev/null -w '%{http_code} %{content_type} ' http://localhost:5000/api/healthz-smoke-bugfix2-142310404
200 application/json;charset=UTF-8 {"ok":true,"variant":"142310404"}

$ curl -s -o /dev/null -w '%{http_code} %{content_type} ' http://localhost:5000/api/healthz-smoke-bugfix3-834560860
200 application/json;charset=UTF-8 {"ok":true,"variant":"834560860"}
```

All three match the sprint goal's contract exactly: `200`, `application/json`, `{ ok: true, variant: "<id>" }`.
`bun run build` also compiled each into `.output/server/_routes/api/` (confirmed by filename in the
build log), so the routes are wired in the production server, not only in dev.

E2E-RESULT: chromium 6 passed, 0 failed, 0 skipped
