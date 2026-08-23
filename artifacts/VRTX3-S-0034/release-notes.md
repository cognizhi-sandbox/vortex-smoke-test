---
artifact: release-notes
spec: 1
status: complete
author_role: planning
sprint: VRTX3-S-0034
idea: VRTX3-I-0041
branch: vortex/sprint/vrtx3-s-0034-96262b30
upstream: [artifacts/VRTX3-S-0034/sprint-summary.md]
downstream: []
---

# Release notes — Sprint VRTX3-S-0034

**Release date:** 2026-08-23
**Sprint:** VRTX3-S-0034 — `[smoke] Bugfix sprint smoke-bugfix-178747715613700`
**Branch:** `vortex/sprint/vrtx3-s-0034-96262b30` → `dev`

## Summary

Three health probe endpoints that were unreachable now respond. Each returns HTTP 200 with
`Content-Type: application/json` and its own `{ ok: true, variant: "<id>" }` body. Purely
additive — 6 new files, no existing source file modified, no dependency change.

## What's new

| Endpoint                                   | Response                            |
| ------------------------------------------ | ----------------------------------- |
| `GET /api/healthz-smoke-bugfix-839771954`  | `{"ok":true,"variant":"839771954"}` |
| `GET /api/healthz-smoke-bugfix2-554747562` | `{"ok":true,"variant":"554747562"}` |
| `GET /api/healthz-smoke-bugfix3-238311955` | `{"ok":true,"variant":"238311955"}` |

Each probe:

- Needs no auth header, query string or request body — a bare GET succeeds
- Imports only `nitro/h3` — no database, no `event.context` read, no shared code with any sibling
- Ships a colocated unit test asserting the exact response body

This brings the `/api/healthz-smoke-*` family to 109 endpoints.

## What changed in behavior

Before this release the three paths were **not** returning `404`, despite what the defect reports
said. An unmatched `/api/*` path falls through to the single-page-app HTML shell, so each answered
`200 text/html` with a 949-byte HTML body. After this release each answers
`200 application/json;charset=UTF-8` with the JSON body above.

This distinction matters to anyone consuming these probes: **a health check that asserts only on the
status code cannot tell a working endpoint from a missing one on this stack.** Assert on the
response body and `Content-Type`.

## How to verify

Start the dev server with `bun run dev` and read the bound port from the Vite banner — `:5000` is
preferred but contention has pushed it to `:5001`–`:5007` on past runs.

```bash
curl -s -o /dev/null -w '%{http_code} %{content_type}\n' \
  http://localhost:5000/api/healthz-smoke-bugfix-839771954
# expected: 200 application/json;charset=UTF-8
# a missing route would print: 200 text/html; charset=utf-8
```

The colocated tests in `routes/api/healthz-smoke-bugfix*-{839771954,554747562,238311955}.test.ts`
document the expected body. Note that those tests import the handler module directly, so they pass
even if a route were never registered — only a live request proves the routing.

## Quality gates

Verified on the integrated sprint branch:

- `bun run verify` (lint + typecheck + unit) — exit 0; **116 test files, 176 tests passed**; ESLint
  clean under `--max-warnings 0`
- `bun run build` — succeeds (Vite SPA bundle + Nitro server)
- `bun run test:e2e -- --project=chromium` — **6 passed**, 0 failed, 0 skipped
- Live requests against all three restored probes plus a control probe — correct status,
  `Content-Type` and body in every case

## Known issues

None. Integration QA found zero defects; no ticket closed conditionally.

## Documentation

`AGENTS.md`, `ARCHITECTURE.md`, `PRODUCT.md` and `DESIGN.md` are current as of this release, each
carrying a dated Changelog entry for the sprint. The same pass repaired 19 cross-references left
pointing at `./AGENT.md` by the manual's consolidation to `AGENTS.md` in `600b74f`.

## Deployment

No deployment steps beyond the normal branch landing. The probes are stateless handlers with no
migration, configuration or environment dependency. The production server must run under Bun
(`db/client.ts` imports the `bun:sqlite` builtin) — unchanged by this release.

## Related

- **VRTX3-S-0003** (2026-08-21) — three equivalent probes restored
  (`healthz-smoke-bugfix-858873211`, `-bugfix2-664793322`, `-bugfix3-267063007`)
- **VRTX3-S-0002** (2026-08-21) — three equivalent probes restored
  (`healthz-smoke-bugfix-158202122`, `-bugfix2-142310404`, `-bugfix3-834560860`)
- `AGENTS.md` § Health Probe Routes — the pattern and the pinned copy source for adding a probe
- `ARCHITECTURE.md` § Key Decisions — why probes duplicate rather than share a handler
