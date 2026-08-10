# Release Notes — VRTX3-S-0015

**Released:** 2026-08-10 · **Type:** Bugfix · **Risk:** Very low (purely additive)

## Fixed

Three health-probe endpoints that were unreachable are now served. Each responds to `GET` with
HTTP 200, `Content-Type: application/json;charset=UTF-8`, and a JSON body:

| Endpoint                               | Response                            |
| -------------------------------------- | ----------------------------------- |
| `/api/healthz-smoke-bugfix-406186407`  | `{"ok":true,"variant":"406186407"}` |
| `/api/healthz-smoke-bugfix2-487405332` | `{"ok":true,"variant":"487405332"}` |
| `/api/healthz-smoke-bugfix3-418626414` | `{"ok":true,"variant":"418626414"}` |

Each endpoint's handler file had never been created. Because Nitro builds its API route table by
scanning the filesystem, a path with no file was simply absent from the table, and requests fell
through to the single-page-app shell.

**Note for anyone tracking the original reports:** these paths were reported as returning `404`.
They were not — an unmatched `/api/*` path is answered by the SPA `index.html` shell with **HTTP 200
`text/html`**, in development and production alike. The endpoints were genuinely missing; only the
reported status code was wrong. Verify these paths on **response body and `Content-Type`**, never on
a `404 → 200` transition.

## Changed

- Health probe family count: **56 → 59**.
- `PRODUCT.md`, `AGENT.md` and `ARCHITECTURE.md` updated for the new count and the
  most-recent-probe pointer. `ARCHITECTURE.md`'s count had been stale since the previous release
  (it read 53 against an actual 56) and is now corrected; all three counts were re-derived from the
  filesystem rather than incremented.

## Unchanged

No existing source file was modified. No dependency was added, removed or upgraded. No database
schema, migration, configuration, build setting or frontend behavior changed. The release adds six
files — one handler and one test per endpoint — and nothing else.

## Upgrade notes

None. No action required by operators or consumers; the change is additive and backward-compatible.
The new routes require no auth and touch no database, so they remain answerable when those
dependencies are unavailable — which is the point of the probe family.

Note that these handlers declare no method guard, consistent with every other probe in the family:
`POST`/`PUT`/`DELETE` return the same 200 JSON body as `GET`. Custom method handling is out of scope
by design.

## Verification

Verified against the integrated sprint branch: lint, type-check and the full unit/integration suite
(66 files, 126 tests) passed with zero warnings; the production build emitted all three route
modules; the full Playwright E2E suite passed 5/5 with no regression; and all three endpoints were
confirmed over live HTTP against a freshly started server. The core gate and the live endpoint checks
were re-run independently at sprint close and matched. No defects were found during integration QA
and none remain open.
