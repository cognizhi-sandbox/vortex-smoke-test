# Release Notes — VRTX3-S-0012

**2026-08-09 · Bugfix release · three missing health probes**

## Fixed

Three `/api/healthz-smoke-*` health probe endpoints were unreachable because their handler files
had never been created. All three now exist and respond:

| Endpoint                                   | Response                                                         |
| ------------------------------------------ | ---------------------------------------------------------------- |
| `GET /api/healthz-smoke-bugfix-6202295`    | `200` · `application/json` · `{"ok":true,"variant":"6202295"}`   |
| `GET /api/healthz-smoke-bugfix2-433928318` | `200` · `application/json` · `{"ok":true,"variant":"433928318"}` |
| `GET /api/healthz-smoke-bugfix3-196651982` | `200` · `application/json` · `{"ok":true,"variant":"196651982"}` |

Each endpoint is self-contained: no authentication, no database access, no code shared with any
sibling probe.

## Note for anyone verifying these endpoints

**Do not check the status code — check the body and `Content-Type`.** These endpoints were
reported as returning `404`. They did not. An unmatched `/api/*` path on this stack falls through
to the SPA `index.html` shell and returns **`200 text/html`**, so a status-code check passes
whether or not the endpoint exists:

```bash
curl -s -o /dev/null -w '%{http_code} %{content_type}\n' http://<host>/api/healthz-smoke-bugfix-6202295
# working  → 200 application/json;charset=UTF-8
# missing  → 200 text/html; charset=utf-8
```

## Upgrade notes

None. The change is purely additive — 6 new files, 0 existing files modified, no dependency
change, no configuration change, no database schema change or migration. No existing endpoint,
page or behavior is affected, and there is nothing to roll forward or back beyond the deploy
itself.

## Quality gates

Verified against the built production server, not the dev server: all three routes returned the
exact expected JSON body and `Content-Type`, and all three compiled modules were present in the
server build output. Unit suite 117/117 · lint clean (zero-warning policy) · typecheck clean ·
build succeeded · Playwright E2E 5/5. No defects found at integration QA; none left open.

## Scope

The health probe family now numbers 50 endpoints. Unchanged and still out of scope: probe
authentication or authorization, non-`GET` method handling (these handlers remain method-agnostic
by design), request parameters or bodies, observability wiring, and retirement of older probes.
