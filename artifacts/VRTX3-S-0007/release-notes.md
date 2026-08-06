# Release Notes — VRTX3-S-0007

**Released:** 2026-08-06 · **Type:** Bugfix · **Sprint goal:** `[smoke] Bugfix sprint smoke-bugfix-178602042849531`

## Fixed

Three health-check endpoints were unreachable — no route was registered for them, so requests
fell through to the SPA `index.html` fallback and received HTML instead of JSON. All three now
serve their intended contract:

| Endpoint                                   | Response body                       |
| ------------------------------------------ | ----------------------------------- |
| `GET /api/healthz-smoke-bugfix-534542341`  | `{"ok":true,"variant":"534542341"}` |
| `GET /api/healthz-smoke-bugfix2-279986033` | `{"ok":true,"variant":"279986033"}` |
| `GET /api/healthz-smoke-bugfix3-605591646` | `{"ok":true,"variant":"605591646"}` |

Each responds `200` with `Content-Type: application/json`. `variant` is a **string**.

Tickets: VRTX3-T-0043, VRTX3-T-0044, VRTX3-T-0045.

## Note for anyone who reported these as "404"

These endpoints were reported as returning `404`. They did not. In this app an unmatched
`/api/*` path is answered by the SPA `index.html` fallback with **`200 text/html`** — in dev
and in the production build alike. A status-code check therefore cannot tell a working API
route from a missing one. **When verifying an API route, assert on the response body and
`Content-Type`.** (Already recorded as a gotcha in `AGENT.md`.)

## Upgrade notes

**None — this release is purely additive and backward compatible.**

- 6 new files (3 handlers, 3 tests); **0 existing files modified**
- No database schema change, no migration to run
- No configuration change, no dependency change
- No API contract changed or removed; nothing deprecated
- No UI change

## Verification

- Lint, typecheck and the full unit/integration suite pass on the integrated branch
- Production build succeeds and registers all three routes
- Playwright chromium E2E: 5 passed, 0 failed — no regressions
- Each endpoint independently confirmed against the running production server (body and
  `Content-Type`), not only via unit tests

## Known issues

None. QA logged zero defects against this sprint and required no fixes. Two pre-existing,
out-of-scope observations are recorded in `sprint-summary.md` under "Carried-forward
follow-ups" — neither affects the endpoints released here.
