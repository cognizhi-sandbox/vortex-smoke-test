# Release Notes — VRTX3-S-0001

**Release type**: Bugfix
**Date**: 2026-08-05
**Sprint goal**: `[smoke] Bugfix sprint smoke-bugfix-1785889878831367`
**Sprint branch tip**: `af35b75` (base `94f7504`)

---

## Fixed

Three health check endpoints were unreachable because their route handlers had
never been added to the server. All three are now live and return HTTP `200`
with `Content-Type: application/json`:

| Endpoint                                   | Response body                       | Ticket       |
| ------------------------------------------ | ----------------------------------- | ------------ |
| `GET /api/healthz-smoke-bugfix-868175391`  | `{"ok":true,"variant":"868175391"}` | VRTX3-T-0001 |
| `GET /api/healthz-smoke-bugfix2-101584827` | `{"ok":true,"variant":"101584827"}` | VRTX3-T-0002 |
| `GET /api/healthz-smoke-bugfix3-403022997` | `{"ok":true,"variant":"403022997"}` | VRTX3-T-0003 |

Each is a self-contained Nitro route handler with its own `H3Event` integration
test — no auth, no database, no shared code between them.

## Correction to the reported symptom

The original reports stated these endpoints "returned 404". **They did not.**
An unmatched `/api/*` path is answered by the SPA `index.html` fallback with
`200 text/html`, in the dev server _and_ in the production build. The real
symptom was an HTML shell where JSON was expected.

This matters for anyone verifying the fix: **the status code was `200` before
and after**. Check the response body and `Content-Type: application/json` — a
"was 404, now 200" check passes whether or not the endpoint exists.

## Changed

Nothing. This release is purely additive: 6 new files, 0 existing files modified.
No configuration, middleware, database, schema, dependency or frontend change.

## Upgrade / deployment notes

None. No migrations, no environment variables, no nginx or process-manager
changes. The new paths are served through the existing `/api/` proxy like every
other route. Standard deploy: `bun run build`, then run `.output/server/index.mjs`
under Bun.

## Verification

- `bun run verify` (lint + typecheck + tests): **pass** — 39 files, 84 tests
- `bun run build`: **pass** — all three routes registered in the compiled server
- Live checks against the built server: correct status, content-type and body
- Playwright chromium E2E: 5/5 passed, no regressions

## Known limitations

No defects remain open against this sprint. One pre-existing behaviour is
unchanged and worth knowing about: **requests to a nonexistent `/api/*` path
return `200` with the HTML SPA shell rather than a JSON `404`.** Clients that
`JSON.parse` an API response will fail confusingly on a typo'd path, and health
probes that test for `404` will not detect a missing endpoint. Tracked as a
follow-up in `SPRINT-PLAN.md`; not addressed here as it is outside this bugfix
sprint's committed scope.
