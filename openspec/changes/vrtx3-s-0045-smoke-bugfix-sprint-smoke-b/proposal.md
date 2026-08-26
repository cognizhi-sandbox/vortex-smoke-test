# Add three missing health probes (VRTX3-S-0045)

## Why

Three probe paths are reported as defects because they answer no JSON:

| Ticket       | Path                                   | Variant      |
| ------------ | -------------------------------------- | ------------ |
| VRTX3-T-0301 | `/api/healthz-smoke-bugfix-1022589408` | `1022589408` |
| VRTX3-T-0302 | `/api/healthz-smoke-bugfix2-448657707` | `448657707`  |
| VRTX3-T-0303 | `/api/healthz-smoke-bugfix3-583276571` | `583276571`  |

All three reports state the paths return `404`. Measured against a live dev server during planning,
**all three return `200 text/html` — the SPA shell**, and a control probe on the same server returns
`200 application/json`. The defects are real; their stated status code is not. Root cause for all
three is identical and is a missing file, not a logic or configuration fault: Nitro derives the route
table from the filesystem, and no `routes/api/` file matches any of the three variants.

The three variants have never appeared in `openspec/specs/health-probes/`, so this change adds their
requirements rather than modifying existing ones.

## What Changes

- **health-probes** — three new requirements, one per variant. Each adds a self-contained
  `defineHandler` route under `routes/api/` and a colocated unit test, in the shape pinned by
  `routes/api/healthz-smoke-528856326-a.ts`.
- No existing file is modified. No shared handler, factory, constants module or barrel export is
  introduced — the family's independence is a standing architectural decision recorded in
  `ARCHITECTURE.md` § Key Decisions.
- No schema, migration, routing-config or client-side change.

## Impact

- **Affected capability:** `health-probes` only.
- **Affected code:** six new files under `routes/api/`, three handlers and three tests. Ownership is
  disjoint per ticket, so the three tickets merge in any order without conflict and need no
  `depends_on` chain.
- **Risk:** low and additive. The one live hazard is the response _shape_, not the routing: an
  unrouted `/api/*` path already answers `200`, so a status-code check cannot distinguish a wired
  probe from a missing one. Verification asserts body and `Content-Type`.

## Follow-ups / out of scope

None. Root-causing surfaced no defect the three committed tickets do not cover.
