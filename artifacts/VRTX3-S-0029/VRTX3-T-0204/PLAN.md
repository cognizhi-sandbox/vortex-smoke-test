---
artifact: ticket-plan
spec: 1
status: complete
author_role: planning
sprint: VRTX3-S-0029
ticket: VRTX3-T-0204
branch: vortex/sprint/vrtx3-s-0029-877b7fd5
upstream: [artifacts/VRTX3-S-0029/SPRINT-PLAN.md]
---

# Plan — VRTX3-T-0204: `/api/healthz-smoke-bugfix-ha2-649579386` returns the SPA shell, not its probe body

## Objective

`GET /api/healthz-smoke-bugfix-ha2-649579386` answers HTTP 200 with `Content-Type: application/json`
and a body deep-equal to `{ "ok": true, "variant": "649579386" }`, served by a new self-contained
Nitro route with a colocated test. Two new files; no existing source file changes.

## Root cause

**The handler was never written.** `routes/api/healthz-smoke-bugfix-ha2-649579386.ts` does not
exist, and Nitro registers routes by filename alone —
`nitro({ serverDir: "./", ignore: ["**/*.test.ts"] })` in `vite.config.ts:29`, with no route table
(`ARCHITECTURE.md` § Routing: "The filename **is** the URL contract"). No file, no route. This is a
missing-file gap, not a regression: nothing was broken by a change, no middleware or route ordering
is involved, and no existing route behaves differently.

A repo-wide grep for `649579386` (excluding `node_modules`/`.git`) returned zero matches, confirming
a never-written file rather than a typo'd filename serving a wrong URL.

**The ticket's reported `404` is a mis-transcription of the symptom.** Measured live during planning
against a running dev server on `:5001` (the Vite banner reported `Port 5000 is in use`):

```
/healthz-smoke-bugfix-ha2-649579386       200 text/html; charset=utf-8       949B  (SPA index.html shell)
/api/healthz-smoke-bugfix-ha2-649579386   200 text/html; charset=utf-8       949B  (SPA index.html shell)
/api/healthz-smoke-528856326-a            200 application/json;charset=UTF-8  33B  {"ok":true,"variant":"528856326"}
```

An unmatched `/api/*` path falls through to the SPA shell in dev and production alike, so it answers
`200 text/html`, never `404` (`AGENT.md` § Gotchas). The defect is real; its stated status code is
not. This ticket has no idea canvas behind it, so nothing upstream sanity-checked that code.

**The ticket also drops the `/api/` prefix from the path; build under `routes/api/` regardless.**
See `SPRINT-PLAN.md` § Cross-cutting notes 1 for the evidence and the decision. Both spellings were
measured and both return the SPA shell today, so the report distinguishes nothing.

## Steps

1. Copy `routes/api/healthz-smoke-528856326-a.ts` to
   `routes/api/healthz-smoke-bugfix-ha2-649579386.ts`, changing only the variant string to
   `"649579386"`. Change nothing else — no `event` parameter, no method guard, no import beyond
   `nitro/h3`.
2. Copy `routes/api/healthz-smoke-528856326-a.test.ts` to
   `routes/api/healthz-smoke-bugfix-ha2-649579386.test.ts`, updating the import path, the `describe`
   title, the request URL and the expected variant. Keep it to the **single body assertion** — do
   not add a `responds in under 100ms` case (`AGENT.md` § Health Probe Routes).
3. Run the repo's verification gate, and separately confirm the route is actually wired by issuing a
   live request against a running dev server (port from the Vite banner), checking body and
   `Content-Type` — plus the control route `/api/healthz-smoke-528856326-a` in the same session.

## File/module ownership

Creates, and owns exclusively:

- `routes/api/healthz-smoke-bugfix-ha2-649579386.ts`
- `routes/api/healthz-smoke-bugfix-ha2-649579386.test.ts`

Modifies nothing. **Does not intersect VRTX3-T-0203** — no `depends_on` in either direction; the two
run in parallel. The shared `-ha` stem is a naming coincidence, not a shared module: do not create
any file both tickets would touch. Root docs are planning-owned and already at target state on the
sprint branch; this ticket must not touch `AGENT.md`, `PRODUCT.md`, `ARCHITECTURE.md` or `DESIGN.md`.

## Interface contracts

Fixed — do not vary:

```ts
// routes/api/healthz-smoke-bugfix-ha2-649579386.ts
import { defineHandler } from "nitro/h3";

export default defineHandler(() => {
  return {
    ok: true,
    variant: "649579386",
  };
});
```

- Route path: `/api/healthz-smoke-bugfix-ha2-649579386` — the filename is the URL; a typo is a dead
  route with no other symptom. Note `ha2`, not `ha-2` or `ha`.
- `variant` is the **string** `"649579386"`, not a number.
- No shared handler, factory, constants file or barrel export — independence is the point
  (`ARCHITECTURE.md` § Key Decisions).
- No import from `db/`, no read of `event.context.user`, so the probe stays answerable when auth and
  the database are unavailable.

## Design reference

_No design reference on this idea._ This ticket has no idea linked, and no user-visible surface
changes.

## Definition of Done

- DoD-1: `routes/api/healthz-smoke-bugfix-ha2-649579386.ts` exists and default-exports a single
  `defineHandler` from `nitro/h3` returning the literal `{ ok: true, variant: "649579386" }`.
- DoD-2: A live `GET /api/healthz-smoke-bugfix-ha2-649579386` against a running dev server returns
  HTTP 200 with `Content-Type: application/json` and body exactly
  `{"ok":true,"variant":"649579386"}` — asserted on body and `Content-Type`, not status code alone.
- DoD-3: In the same session and on the same port, control route `/api/healthz-smoke-528856326-a`
  returns `200 application/json` — proving the measurement harness works rather than reporting a
  dead server as a pass.
- DoD-4: `routes/api/healthz-smoke-bugfix-ha2-649579386.test.ts` constructs an `H3Event` and asserts
  `toEqual({ ok: true, variant: "649579386" })` as its single case, with no timing assertion.
- DoD-5: No file outside the two new ones is added, modified or deleted, and no dependency is added.

## Test plan

- **API integration**, `routes/api/healthz-smoke-bugfix-ha2-649579386.test.ts` — one case, collected
  by the Vitest `server` project (`environment: "node"`) with no configuration change. Expected: the
  handler's returned object deep-equals `{ ok: true, variant: "649579386" }`. Covers DoD-1, DoD-4.
- **Live request**, manual against a running dev server. Expected: `200`,
  `application/json;charset=UTF-8`, 33-byte body; control route likewise. Covers DoD-2, DoD-3. This
  is the only check that proves Nitro registered the path — the unit test imports the module
  directly and passes even if the URL is dead.
- **Full verification gate** (lint, typecheck, unit/integration suite) green. Covers DoD-5 for
  typecheck/lint regressions.
