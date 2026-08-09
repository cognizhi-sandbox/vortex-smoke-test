# Release Notes — VRTX3-S-0011

**Released:** 2026-08-09
**Sprint:** VRTX3-S-0011 — Three Independent Health Check Endpoints (528856326)
**Idea:** VRTX3-I-0019

---

## Added

Three new health-probe endpoints. Each answers with HTTP `200`, `Content-Type: application/json`, and the body:

```json
{ "ok": true, "variant": "528856326" }
```

| Endpoint                             | Source                                    |
| ------------------------------------ | ----------------------------------------- |
| `GET /api/healthz-smoke-528856326-a` | `routes/api/healthz-smoke-528856326-a.ts` |
| `GET /api/healthz-smoke-528856326-b` | `routes/api/healthz-smoke-528856326-b.ts` |
| `GET /api/healthz-smoke-528856326-c` | `routes/api/healthz-smoke-528856326-c.ts` |

Each ships with a colocated Vitest integration test. The three share no code — no helper, factory, constants file or barrel export, and none imports another. None reads `event.context.user` or touches `db/`, so all three keep answering when auth and the database are unavailable.

## Changed

Documentation only — no behavior change to any existing endpoint:

- **`AGENT.md`** — new `Conventions → Health Probe Routes` section carrying the probe recipe and the "do not factor out a shared handler" rule, promoted out of the changelog. The method-agnostic gotcha now covers what to do when an idea's acceptance criteria contradict it. Lint corrected to ESLint 10.
- **`PRODUCT.md`** — the probe family is now a documented feature with user stories and per-probe acceptance criteria, rather than seven changelog entries. Lint corrected to ESLint 10.
- **`ARCHITECTURE.md`** — new health-probe route contract under Routing (handler shape, filename-is-the-URL, build-output naming); new Key Decisions entry recording why the duplication is kept; concrete stack versions listed once. Playwright corrected to `~1.60.0`.
- **`DESIGN.md`** — changelog entry only; the sprint touches nothing in `src/`.

## Fixed

Nothing. This release is purely additive — no defect was filed during the sprint and no existing route, page, middleware, schema or migration was modified.

## Upgrade notes

**None required.** No configuration change, no migration, no new dependency, no environment variable. The endpoints are registered by filename through the existing Nitro file-based router and are live as soon as the build is deployed.

## Verifying the release

Status code alone will not tell you whether these routes are working: an unmatched `/api/*` path falls through to the SPA `index.html` shell and also returns `200`. Check the body and `Content-Type`:

```bash
curl -s -o /dev/null -w '%{http_code} %{content_type}\n' \
  https://<host>/api/healthz-smoke-528856326-a
# working → 200 application/json;charset=UTF-8
# missing → 200 text/html; charset=utf-8   (the SPA shell)
```

Note that these handlers are method-agnostic by design, consistent with all 47 probes in the family — `POST`, `PUT` and `DELETE` return the same 200 body as `GET`.

## Quality gates

Lint clean (ESLint 10, zero-warning policy) · typecheck clean (strict) · **111/111 unit and integration tests passing across 54 files** · production build succeeded with all three route modules emitted and no test files leaked · **5/5 Playwright E2E specs passing** · all three endpoints independently verified with live requests against the built production server, alongside a negative control confirming the check can fail.

**Zero defects found in integration QA. No known issues are open against this release.**
