# Restore three unreachable health probes — bugfix batch smoke-bugfix-178771128043004

## Why

Three health probes are reported unreachable: `/api/healthz-smoke-bugfix-588991239`,
`/api/healthz-smoke-bugfix2-369920394` and `/api/healthz-smoke-bugfix3-1056287485`. An operator
calling any of them gets the SPA HTML shell instead of the fixed JSON body every sibling probe
answers with, so the probe family — the repository's standing check that a deployed build is
actually serving the Nitro API — has three holes in it.

The three are one batch rather than three changes because they share a single root cause and a
single capability. A `MODIFIED` block replaces its requirement wholesale, so per-defect changes
editing the same capability would archive one after the other and silently drop each other's
scenarios.

The behaviour was never specified. `openspec/specs/health-probes/spec.md` carries no requirement
for any `healthz-smoke-bugfix*` variant — the whole 65-file subfamily is absent from the spec of
record. This change closes that gap for the three variants in the batch, so each has a written
contract and a scenario Integration QA can verify against.

## What Changes

- **ADDED** `GET /api/healthz-smoke-bugfix-588991239`, returning `{"ok": true, "variant":
"588991239"}` with a JSON content type.
- **ADDED** `GET /api/healthz-smoke-bugfix2-369920394`, returning `{"ok": true, "variant":
"369920394"}` with a JSON content type.
- **ADDED** `GET /api/healthz-smoke-bugfix3-1056287485`, returning `{"ok": true, "variant":
"1056287485"}` with a JSON content type.

Each probe is one new handler file under `routes/api/` plus one colocated `.test.ts`. No shared
helper, factory, constants file or barrel export is introduced, and no probe imports another.

Explicitly not changing: authentication or authorization on probes, non-`GET` method handling,
request params or bodies, database access, any frontend surface, observability wiring, CI or build
configuration, Playwright coverage, and the 136 existing `healthz-smoke-*` routes — including the
47 legacy probe tests that carry a wall-clock assertion.

## Impact

- **Affected capability:** `health-probes` (existing — three requirements added, none modified or
  removed).
- **Affected code:** six new files under `routes/api/`. Zero existing source files modified, zero
  new dependencies, nothing under `src/`, no migration.
- **Affected consumers:** none. Nothing in the repository reads a probe response; the endpoints are
  called by operators and smoke checks outside it.
- **Risk:** low and bounded. The diff is additive, so there is no regression path into current
  behaviour. The three tickets have disjoint file ownership and therefore no dependency edge.
- **Root documents:** none updated — no update trigger fires. See `design.md` § D4.
