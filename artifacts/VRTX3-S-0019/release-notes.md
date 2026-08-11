# Release Notes — VRTX3-S-0019

**Released:** 2026-08-11
**Sprint goal:** `[smoke] /api/healthz-smoke-472035881-a endpoint`

## Added

Three new health probe endpoints, each answering HTTP 200 with `Content-Type: application/json`:

| Endpoint                             | Response body                       |
| ------------------------------------ | ----------------------------------- |
| `GET /api/healthz-smoke-472035881-a` | `{"ok":true,"variant":"472035881"}` |
| `GET /api/healthz-smoke-472035881-b` | `{"ok":true,"variant":"472035881"}` |
| `GET /api/healthz-smoke-472035881-c` | `{"ok":true,"variant":"472035881"}` |

Each probe is independent of the other two and of everything else in the service: no auth, no database, no shared helper, no cross-import. Any one can be called, deployed or removed without affecting the others.

Consistent with every other route in the `healthz-smoke-*` family, these handlers declare no method guard — `POST`, `PUT` and `DELETE` return the same 200 JSON body as `GET`.

The probe family is now **71 endpoints** (was 68), with 71 colocated tests.

## Changed

- `AGENT.md`, `ARCHITECTURE.md`, `PRODUCT.md` — probe-family count updated 68 → 71, re-derived from the filesystem; most-recent-set and build-output pointers moved to the `472035881` family.
- `AGENT.md` — the SPA-fallback gotcha records its eleventh consecutive confirmation, and its third on an additive enhancement. Dev-server port drift is promoted from changelog prose into its own Gotchas entry after three sprints running (`:5005` → `:5006` → `:5007`).
- `DESIGN.md` — changelog entry only; no design-system change.

## Fixed

Nothing. This release is purely additive — no defect was reported against it, and none was found during integration QA.

## Compatibility

**No breaking changes.** No existing endpoint, page, schema, migration or configuration file was modified, and no dependency was added or upgraded. The other 68 health probes, `/api/hello` and the SPA are unchanged in behaviour; the diff against the previous release is 6 new files (66 insertions, 0 deletions) plus documentation.

## Verification

- Unit/integration suite: **78 test files, 138 tests, all passed.**
- End-to-end (Playwright, chromium): **5 passed, 0 failed.**
- Lint (zero-warning policy), type-check and production build: all green; no test file leaked into the server bundle.
- Production build emitted `.output/server/_routes/api/healthz_smoke_472035881_a.mjs`, `_b.mjs` and `_c.mjs`, confirming all three routes compiled into the production server.
- All three endpoints confirmed live against a running server on body **and** `Content-Type` — not on status code, which cannot distinguish a working `/api/*` route from a missing one in this stack.
