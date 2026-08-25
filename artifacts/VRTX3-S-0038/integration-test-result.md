---
artifact: integration-test-result
spec: 1
status: complete
author_role: validation
sprint: VRTX3-S-0038
idea: VRTX3-I-0047
branch: vortex/sprint/vrtx3-s-0038-099d395a
downstream: [artifacts/VRTX3-S-0038/qa-test-report.md]
---

# Integration test result — VRTX3-S-0038

## Commands run

```
$ bun install
$ bun run build
$ bunx playwright test --list          # confirms project coverage before running
$ bun run test:e2e -- --project=chromium
```

`bunx playwright test --list` shows a single project (`chromium`) and 6 tests across 2 spec
files (`e2e/home.spec.ts`, `e2e/smoke.spec.ts`) — the full set of specs in this repo. This
sprint added no browser-facing surface (three JSON-only API probes), so no new spec exists to
select; `--project=chromium` covers everything `testMatch` defines.

First invocation of `bun run test:e2e -- --project=chromium` timed out after 120000ms waiting
on `config.webServer` — Vite was still re-optimizing dependencies against a webServer health
check that had not yet returned. A manual `bun --bun ./node_modules/vite/bin/vite.js --port
5178 --strictPort` confirmed the same server binds and answers `200` within ~1s outside
Playwright's harness, so this was a one-off cold-start stall, not a route or config defect. The
retry below is the evidence of record.

## Results

| Spec                                                                                       | Result | Notes |
| ------------------------------------------------------------------------------------------ | ------ | ----- |
| `e2e/home.spec.ts › Home page › shows the hero content and desktop nav`                    | pass   | 383ms |
| `e2e/home.spec.ts › Home page › has no vertical scrollbar on common viewport sizes`        | pass   | 524ms |
| `e2e/home.spec.ts › Home page › opens and closes the mobile nav from the hamburger button` | pass   | 548ms |
| `e2e/smoke.spec.ts › home page loads with no console errors`                               | pass   | 394ms |
| `e2e/smoke.spec.ts › the API responds`                                                     | pass   | 324ms |
| `e2e/smoke.spec.ts › a database-backed route responds`                                     | pass   | 356ms |

Playwright summary: `6 passed (4.2s)`

None of these specs exercise the three new probes — the existing E2E suite has no browser
surface for `routes/api/*`, and the sprint added none. The probes are verified directly (live
HTTP requests against the dev server, plus the build-output module check) and recorded in
`qa-test-report.md`; this file's scope is the existing Playwright suite, run to confirm the
sprint introduced no regression there.

## Live probe verification (not Playwright — recorded here for the E2E-adjacent evidence trail)

Dev server (`bun run dev`) bound to `:5001` (`:5000` was in use). Requests below are the
process's real HTTP evidence, not a `playwright test` run — the acceptance criteria are network
behaviour, and there is no browser DOM for these routes to assert against.

```
$ curl -s -D - http://localhost:5001/api/healthz-smoke-992401223-a
HTTP/1.1 200 OK
content-type: application/json;charset=UTF-8
{"ok":true,"variant":"992401223"}

$ curl -s -D - http://localhost:5001/api/healthz-smoke-992401223-b
HTTP/1.1 200 OK
content-type: application/json;charset=UTF-8
{"ok":true,"variant":"992401223"}

$ curl -s -D - http://localhost:5001/api/healthz-smoke-992401223-c
HTTP/1.1 200 OK
content-type: application/json;charset=UTF-8
{"ok":true,"variant":"992401223"}
```

Repeated with `?foo=bar` query string and an `X-Test: abc` header on each of the three paths:
byte-identical body and status to the calls above (`diff` against the first response: no
output, i.e. identical).

Control comparison (D3 in `design.md`): `GET /api/healthz-smoke-nonexistent-zzz` → `200
text/html; charset=utf-8` (the SPA shell), confirming the three probes are genuinely routed and
not indistinguishable SPA fallback.

## Skipped

None.

E2E-RESULT: chromium 6 passed, 0 failed, 0 skipped
