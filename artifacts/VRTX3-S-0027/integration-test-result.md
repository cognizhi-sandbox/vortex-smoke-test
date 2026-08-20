---
artifact: integration-test-result
spec: 1
status: complete
author_role: validation
sprint: VRTX3-S-0027
idea: VRTX3-I-0036
branch: vortex/sprint/vrtx3-s-0027-bc93e1fe
downstream: [artifacts/VRTX3-S-0027/qa-test-report.md]
---

# Integration test result — VRTX3-S-0027

## Commands run

```
$ bun install
$ bun run build
$ bunx playwright test --list
# Total: 6 tests in 2 files, single project "chromium" (playwright.config.ts declares
# only one project, which covers e2e/home.spec.ts and e2e/smoke.spec.ts in full)
$ bun run test:e2e -- --project=chromium
```

## Results

| Spec                                                                              | Result | Notes |
| --------------------------------------------------------------------------------- | ------ | ----- |
| `e2e/home.spec.ts:14` › shows the hero content and desktop nav                    | pass   | 556ms |
| `e2e/home.spec.ts:27` › has no vertical scrollbar on common viewport sizes        | pass   | 533ms |
| `e2e/home.spec.ts:44` › opens and closes the mobile nav from the hamburger button | pass   | 611ms |
| `e2e/smoke.spec.ts:13` › home page loads with no console errors                   | pass   | 419ms |
| `e2e/smoke.spec.ts:26` › the API responds                                         | pass   | 322ms |
| `e2e/smoke.spec.ts:43` › a database-backed route responds                         | pass   | 361ms |

Playwright summary: `6 passed (4.4s)`

No spec file was wholly skipped. This sprint added no new UI surface (three backend-only JSON
probes, VRTX3-S-0027 SPRINT-PLAN.md § Design: `a2a_get_idea_design` returned `blocks: []`), so the
existing `e2e/` suite — which does not target the new probes — is the full applicable coverage; the
probes themselves were verified live below, not via Playwright.

## Live verification of the sprint's own deliverable

`e2e/` has no spec covering the new probes (they are non-UI JSON endpoints, out of Playwright's
scope), so acceptance was confirmed with a live request against the built server (`bun run dev`,
port 5000 — read from the Vite banner per `AGENT.md` § Gotchas):

```
$ curl -s -w '\n%{http_code} %{content_type}\n' http://localhost:5000/api/healthz-smoke-868033827-a
{"ok":true,"variant":"868033827"}
200 application/json;charset=UTF-8

$ curl -s -w '\n%{http_code} %{content_type}\n' http://localhost:5000/api/healthz-smoke-868033827-b
{"ok":true,"variant":"868033827"}
200 application/json;charset=UTF-8

$ curl -s -w '\n%{http_code} %{content_type}\n' http://localhost:5000/api/healthz-smoke-868033827-c
{"ok":true,"variant":"868033827"}
200 application/json;charset=UTF-8
```

Control (`528856326-a`, known-good): `200 application/json;charset=UTF-8`,
`{"ok":true,"variant":"528856326"}`. Missing-route control (`healthz-smoke-nonexistent-zzz`):
`200 text/html; charset=utf-8` (the SPA fallback), confirming the three new paths return the real
JSON handler and not the fallback shell.

E2E-RESULT: chromium 6 passed, 0 failed, 0 skipped
