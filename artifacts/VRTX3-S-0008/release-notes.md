# Release Notes — Sprint VRTX3-S-0008

**Released:** 2026-08-08
**Sprint goal:** `[smoke] Bugfix sprint smoke-bugfix-178619573250808`

## Fixed

Three health-check endpoints were missing from the server and did not serve their JSON contract.
All three are now available:

- **`GET /api/healthz-smoke-bugfix-739648350`** → `200` `application/json`
  `{"ok":true,"variant":"739648350"}` (VRTX3-T-0049)
- **`GET /api/healthz-smoke-bugfix2-901895284`** → `200` `application/json`
  `{"ok":true,"variant":"901895284"}` (VRTX3-T-0050)
- **`GET /api/healthz-smoke-bugfix3-221117839`** → `200` `application/json`
  `{"ok":true,"variant":"221117839"}` (VRTX3-T-0051)

Each handler is self-contained: no auth, no database, no shared code. Consistent with the
existing `healthz-smoke-*` family, the handlers are method-agnostic — `POST`, `PUT` and `DELETE`
return the same JSON body as `GET`.

## Behavior change worth noting

Before this release, these three paths were answered by the SPA `index.html` fallback with
`200 text/html`. They now return real JSON with `Content-Type: application/json;charset=UTF-8`.

If you have any monitoring or client code that treated these paths as "reachable" purely on the
basis of a `200` status, note that the status was **already** `200` before the fix — only the
body and `Content-Type` changed. Health checks against this endpoint family should assert on the
response body and `Content-Type`, never on status alone.

## Upgrade notes

None. This release is purely additive — 6 new files, 0 existing files modified. There is no
configuration change, no schema change, no migration, no dependency change, and no UI change.
Nothing to do on deploy beyond shipping the new build.

## Verification

- Lint (zero-warning) and typecheck: pass
- Vitest: 102/102 tests across 48 files
- Production build: all three routes compiled into `.output/server/_routes/api/`
- Live HTTP against the production build: all three endpoints plus the control return the
  expected body and `Content-Type`
- Playwright E2E: 5/5 passed

No defects found; no rework cycle was required.

## Known issues

None.
