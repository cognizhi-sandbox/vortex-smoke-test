# Release Notes — VRTX3-S-0018

**Sprint goal:** `[smoke] Bugfix sprint smoke-bugfix-178640575450999`
**Released:** 2026-08-11 · **Type:** Bugfix · Purely additive, no breaking changes

---

## Fixed

Three health probe endpoints that were reported missing did not exist and are now served. Each
responds to `GET` with `HTTP 200`, `Content-Type: application/json`, and the exact body shown:

| Endpoint                               | Response body                       | Ticket       |
| -------------------------------------- | ----------------------------------- | ------------ |
| `/api/healthz-smoke-bugfix-699186705`  | `{"ok":true,"variant":"699186705"}` | VRTX3-T-0123 |
| `/api/healthz-smoke-bugfix2-502272230` | `{"ok":true,"variant":"502272230"}` | VRTX3-T-0124 |
| `/api/healthz-smoke-bugfix3-850084489` | `{"ok":true,"variant":"850084489"}` | VRTX3-T-0125 |

Each is an independent, self-contained handler with a colocated test — no auth, no database, no
shared code with any other endpoint. Like every probe in this family, the handlers are
method-agnostic: non-`GET` verbs return the same body.

**Cause:** the route files had never been written. Route paths in this stack are resolved from the
filesystem, so an unwritten file is an unregistered path.

**A note on the reported symptom:** all three were reported as returning `404`. They did not. An
unmatched `/api/*` path in this stack falls through to the SPA `index.html` shell and answers
`200 text/html`, in development and production alike. The endpoints were genuinely missing, but the
status code in the reports was inaccurate — a detail that matters to anyone verifying this fix, as a
`404 → 200` check would pass whether or not the endpoints exist. Confirm on the response body and
`Content-Type` instead.

## Changed

- Health probe family: **65 → 68** endpoints.
- `AGENT.md`, `ARCHITECTURE.md` and `PRODUCT.md` updated with the new count and dated changelog
  entries.

## Unchanged

No existing endpoint, page, middleware, database schema or configuration was modified. No new
dependency was added, nothing under `src/` changed, and no existing API contract moved. Routing, the
test harness and CI are untouched.

## Verification

- All three endpoints confirmed serving the contracted body and `Content-Type` by live request
  against a running server.
- Unit/component/API suite: 135 tests passing across 75 files. Lint and typecheck clean.
- Full end-to-end suite: 5 specs passing.
- Production build confirmed all three routes compiled into the server output.

## Upgrade notes

None. Purely additive — no migration, no configuration change, no action required by consumers.

## Known issues

None. The sprint closed with a clean QA verdict and no open defects.
