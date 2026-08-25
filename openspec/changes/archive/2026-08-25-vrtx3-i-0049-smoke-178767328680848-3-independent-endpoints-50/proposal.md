# Three independent health probes for variant 503463873

## Why

Adding a self-contained HTTP endpoint to this service still goes through a full planning
cycle, even when the whole change is one file that depends on nothing else. Three such
endpoints — `/api/healthz-smoke-503463873-a`, `-b` and `-c` — are blocked on that overhead.

Because the three arrive as one undivided request they are also serialised for no reason:
nothing in any of them depends on either of the others. The sprint owner who needs a trivial
endpoint shipped, and the delivery team that could take the three concurrently, both pay for
that coupling.

The probe family is the repository's standing evidence that independent units of work merge in
parallel without conflict. This change adds three more instances of it.

## What Changes

- **ADDED** `GET /api/healthz-smoke-503463873-a`, returning `{"ok": true, "variant": "503463873"}`
  with a JSON content type.
- **ADDED** `GET /api/healthz-smoke-503463873-b`, same contract.
- **ADDED** `GET /api/healthz-smoke-503463873-c`, same contract.

Each probe is one new handler file under `routes/api/` plus one colocated `.test.ts`. No shared
helper, factory, constants file or barrel export is introduced, and no probe imports another.

Explicitly not changing: authentication or authorization on probes, non-`GET` method handling,
request params or bodies, database access, any frontend surface, observability wiring, CI or
build configuration, Playwright coverage, and the 124 existing `healthz-smoke-*` routes —
including the 47 legacy probe tests that carry a wall-clock assertion.

## Impact

- **Affected capability:** `health-probes` (existing — three requirements added, none modified or
  removed).
- **Affected code:** six new files under `routes/api/`. Zero existing source files modified, zero
  new dependencies, nothing under `src/`, no migration.
- **Affected consumers:** none. Nothing in the repository reads a probe response; the endpoints
  are called by operators and smoke checks outside it.
- **Risk:** low and bounded. The diff is additive, so there is no regression path into current
  behaviour. The three tickets have disjoint file ownership and therefore no dependency edge.
  The root documents are the one surface they could have collided on, and this change removes
  the per-sprint count they carried rather than incrementing it — see `design.md` § D3.
