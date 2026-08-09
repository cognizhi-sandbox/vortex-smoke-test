# Release Notes — VRTX3-S-0009

**Released:** 2026-08-09
**Sprint goal:** `[smoke] Bugfix sprint smoke-bugfix-178623656361405`

## Added

Three health-check endpoints that were previously unrouted. Each responds to any HTTP method with
`200` and `Content-Type: application/json;charset=UTF-8`:

| Endpoint                                   | Response body                       |
| ------------------------------------------ | ----------------------------------- |
| `GET /api/healthz-smoke-bugfix-755467473`  | `{"ok":true,"variant":"755467473"}` |
| `GET /api/healthz-smoke-bugfix2-192341379` | `{"ok":true,"variant":"192341379"}` |
| `GET /api/healthz-smoke-bugfix3-993514120` | `{"ok":true,"variant":"993514120"}` |

Each is a self-contained Nitro route handler with a co-located integration test. Like the 41
existing `healthz-smoke-*` siblings, they declare no method guard — `POST`, `PUT` and `DELETE`
return the same body as `GET`.

## Fixed

The three paths above previously matched no server route. Requests fell through to the SPA
`index.html` shell, which answers `200 text/html` — so the endpoints appeared to exist but never
returned health data. They now resolve to real handlers.

> **Note for anyone verifying these:** a missing `/api/*` path returns `200`, not `404`. Status code
> alone cannot distinguish a working endpoint from a missing one. Check the response body and
> `Content-Type`. See `AGENT.md` → **Gotchas**.

## Changed

Nothing. This release is purely additive — 6 new files, 0 existing source files modified. No
database, schema, migration, auth, middleware, configuration, or frontend change.

## Documentation

`AGENT.md` gained a dated changelog entry for this sprint. The long-standing SPA-fallback gotcha
and the method-agnostic behaviour of the health-check handlers were promoted from changelog prose
into the `## Gotchas` section, where they are discoverable without reading sprint history.

## Upgrade notes

None. No breaking changes, no migrations, no configuration updates, and no action required by
consumers. Existing endpoints and the SPA are unaffected.

## Verification

Lint, typecheck, 108/108 unit and integration tests, and the production build all passed on the
integrated sprint branch, alongside 5/5 Playwright end-to-end specs. All three new endpoints were
additionally verified live against the built production server and again at sprint close on a
running dev server, asserting body and `Content-Type`, with a nonexistent path as a negative
control. No defects were found and no rework was required.
