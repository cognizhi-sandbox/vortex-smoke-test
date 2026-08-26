# Add three missing health probes (VRTX3-S-0046)

## Why

Three probe paths are reported as defects because they answer no JSON:

| Ticket       | Path                                   | Variant     |
| ------------ | -------------------------------------- | ----------- |
| VRTX3-T-0307 | `/api/healthz-smoke-bugfix-769466328`  | `769466328` |
| VRTX3-T-0308 | `/api/healthz-smoke-bugfix2-101945976` | `101945976` |
| VRTX3-T-0309 | `/api/healthz-smoke-bugfix3-238143877` | `238143877` |

All three reports state the paths return `404`. Measured against a live dev server during planning,
**all three return `200 text/html` — the 949-byte SPA shell** — while a control probe on the same
server returns `200 application/json`. The defects are real; their stated status code is not. Root
cause for all three is identical and is a missing file, not a logic or configuration fault: Nitro
derives its route table from the filesystem, and no file under `routes/api/` matches any of the
three variants.

The three variants have never appeared in `openspec/specs/health-probes/`, so this change adds their
requirements rather than modifying existing ones.

## What Changes

- **health-probes** — three new requirements, one per variant. Each adds a self-contained
  `defineHandler` route under `routes/api/` and a colocated regression test, in the shape pinned by
  `routes/api/healthz-smoke-528856326-a.ts`.
- No existing file is modified. No shared handler, factory, constants module or barrel export is
  introduced — the family's independence is a standing architectural decision recorded in
  `ARCHITECTURE.md` § Key Decisions.
- No schema, migration, routing-config or client-side change. No root doc changes: see
  `design.md` § D5.

## Impact

- **Affected capability:** `health-probes` only.
- **Affected code:** six new files under `routes/api/` — three handlers and three tests. Ownership is
  disjoint per ticket, so the three tickets merge in any order without conflict and need no
  `depends_on` chain.
- **Risk:** low and additive. The live hazard is the response _shape_, not the routing: an unrouted
  `/api/*` path already answers `200`, so a status-code check cannot distinguish a wired probe from a
  missing one. Verification asserts body and `Content-Type`.

## Follow-ups / out of scope

None. Root-causing surfaced no defect the three committed tickets do not cover.

One acceptance criterion from the VRTX3-T-0309 canvas is deliberately **not** carried into any
ticket: its AC-10 asks the fix to re-derive and update the probe count in `AGENTS.md`,
`ARCHITECTURE.md` and `PRODUCT.md`. Those documents no longer carry a probe count — the standing
`ARCHITECTURE.md` § Key Decisions entry "Root docs carry no per-sprint counts" removed it precisely
so it could not become a shared surface every parallel ticket collides on. `AGENTS.md` is
human-authored and out of scope for any agent; the stale figure it carries is already recorded in
`.vortex/agents-generated.md`, which states explicitly that it is not maintained as a running
figure. There is nothing for a fix ticket to update, so the criterion is dropped rather than
reassigned.
