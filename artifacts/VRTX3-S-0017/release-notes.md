# Release Notes — VRTX3-S-0017

**Released:** 2026-08-10
**Sprint goal:** `[smoke] /api/healthz-smoke-238855431-a endpoint`

## Added

Three new health probe endpoints, each answering HTTP 200 with `Content-Type: application/json`:

| Endpoint                             | Response body                       |
| ------------------------------------ | ----------------------------------- |
| `GET /api/healthz-smoke-238855431-a` | `{"ok":true,"variant":"238855431"}` |
| `GET /api/healthz-smoke-238855431-b` | `{"ok":true,"variant":"238855431"}` |
| `GET /api/healthz-smoke-238855431-c` | `{"ok":true,"variant":"238855431"}` |

Each probe is independent of the other two and of everything else in the service: no auth, no database, no shared helper, no cross-import. Any one can be called, deployed or removed without affecting the others.

Consistent with every other route in the `healthz-smoke-*` family, these handlers declare no method guard — `POST`, `PUT` and `DELETE` return the same 200 JSON body as `GET`.

The probe family is now **65 endpoints** (was 62).

## Changed

- `AGENT.md`, `ARCHITECTURE.md`, `PRODUCT.md` — probe-family count updated 62 → 65; most-recent-set and build-output pointers moved to the `238855431` family.
- `AGENT.md` — the sanctioned probe copy-source pointer now states explicitly that it outranks a template file named by an incoming idea, after an idea named a legacy test carrying a known-flaky wall-clock assertion. The SPA-fallback gotcha records its ninth consecutive confirmation, and its second on an additive enhancement.
- `ARCHITECTURE.md` — the deliberate no-shared-helper decision now records a consequence visible at this scale: a 65-file family means new work tends to sample the directory rather than follow the documented template.
- `DESIGN.md` — changelog entry only; no design-system change.

## Fixed

Nothing. This release is purely additive — no defect was reported against it, and none was found during integration QA.

## Compatibility

**No breaking changes.** No existing endpoint, page, schema, migration or configuration file was modified, and no dependency was added or upgraded. The other 62 health probes, `/api/hello` and the SPA are unchanged in behaviour; the diff against the previous release is 6 new files plus documentation.

## Verification

- Unit/integration suite: **72 test files, 132 tests, all passed.**
- End-to-end (Playwright, chromium): **5 passed, 0 failed.**
- Lint (zero-warning policy), type-check and production build: all green; no test file leaked into the server bundle.
- All three endpoints confirmed live against a running server on body **and** `Content-Type` — not on status code, which cannot distinguish a working `/api/*` route from a missing one in this stack.
