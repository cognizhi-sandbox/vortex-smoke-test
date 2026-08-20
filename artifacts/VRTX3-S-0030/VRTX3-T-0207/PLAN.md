---
artifact: ticket-plan
spec: 1
status: complete
author_role: planning
sprint: VRTX3-S-0030
ticket: VRTX3-T-0207
branch: vortex/sprint/vrtx3-s-0030-e2c3a0d0
upstream: [artifacts/VRTX3-S-0030/SPRINT-PLAN.md]
---

# Plan — VRTX3-T-0207: `/api/healthz-smoke-bugfix-ha2-165600260` returns the SPA shell, not its probe body

## Objective

`GET /api/healthz-smoke-bugfix-ha2-165600260` answers HTTP 200 with `Content-Type: application/json`
and a body deep-equal to `{ "ok": true, "variant": "165600260" }`, served by a new self-contained
Nitro route with a colocated test. Two new files; no existing source file changes.

## Root cause

**The handler was never written.** `routes/api/healthz-smoke-bugfix-ha2-165600260.ts` does not
exist, and Nitro registers routes by filename alone — `nitro({ serverDir: "./", ignore:
["**/*.test.ts"] })` in `vite.config.ts`, with no route table (`ARCHITECTURE.md` § Routing: "The
filename **is** the URL contract"). No file, no route. This is a missing-file gap, not a regression:
nothing was broken by a change, no middleware or route ordering is involved, and no existing route
behaves differently.

A repo-wide grep for `165600260` (excluding `node_modules`/`.git`) returned zero matches, confirming
a never-written file rather than a typo'd filename serving a wrong URL.

**The ticket's reported `404` is a mis-transcription of the symptom.** Measured live during planning
against a dev server on `:5002` (Vite banner — `5000` and `5001` were both in use):

```
/api/healthz-smoke-bugfix-ha2-165600260   200 text/html; charset=utf-8       949b  (SPA index.html shell)
/healthz-smoke-bugfix-ha2-165600260       200 text/html; charset=utf-8       949b  (SPA index.html shell)
/api/healthz-smoke-528856326-a            200 application/json;charset=UTF-8  33b  {"ok":true,"variant":"528856326"}
```

An unmatched `/api/*` path falls through to the SPA shell in dev and production alike, so it answers
`200 text/html`, never `404` (`AGENT.md` § Gotchas). The defect is real; its stated status code is
not. This ticket has no idea canvas behind it, so nothing upstream sanity-checked that code.

**The ticket's path is also missing its `/api/` prefix**, which is a labelling slip, not a second
defect. The ticket writes `/healthz-smoke-bugfix-ha2-165600260`; every one of the 95 existing probes
lives under `routes/api/` and is served at `/api/…`. Measured in the same session: the working
control `/healthz-smoke-528856326-a` — a route that exists — also returns the 949-byte SPA shell
when requested without the prefix. So the prefix is required, and the route to create is
`/api/healthz-smoke-bugfix-ha2-165600260`.

## Steps

1. Copy `routes/api/healthz-smoke-528856326-a.ts` to
   `routes/api/healthz-smoke-bugfix-ha2-165600260.ts`, changing only the variant string to
   `"165600260"`. Change nothing else — no `event` parameter, no method guard, no import beyond
   `nitro/h3`.
2. Copy `routes/api/healthz-smoke-528856326-a.test.ts` to
   `routes/api/healthz-smoke-bugfix-ha2-165600260.test.ts`, updating the import path, the `describe`
   title, the request URL and the expected variant. Keep it to the **single body assertion** — do
   not add a `responds in under 100ms` case (`AGENT.md` § Health Probe Routes).
3. Run the repo's verification gate, and separately confirm the route is actually wired by issuing a
   live request against a running dev server (port from the Vite banner), checking body and
   `Content-Type` — plus the control route `/api/healthz-smoke-528856326-a` in the same session.

## File/module ownership

Creates, and owns exclusively:

- `routes/api/healthz-smoke-bugfix-ha2-165600260.ts`
- `routes/api/healthz-smoke-bugfix-ha2-165600260.test.ts`

Modifies nothing. **Does not intersect VRTX3-T-0206** — no `depends_on` in either direction; the two
run in parallel. Root docs are planning-owned and already at target state on the sprint branch; this
ticket must not touch `AGENT.md`, `PRODUCT.md`, `ARCHITECTURE.md` or `DESIGN.md`.

## Interface contracts

Fixed — do not vary:

```ts
// routes/api/healthz-smoke-bugfix-ha2-165600260.ts
import { defineHandler } from "nitro/h3";

export default defineHandler(() => {
  return {
    ok: true,
    variant: "165600260",
  };
});
```

- Route path: `/api/healthz-smoke-bugfix-ha2-165600260` — the filename is the URL; a typo is a dead
  route with no other symptom. Note the `-ha2-` infix: no existing probe carries it, and it is not a
  typo for the sibling ticket's `-ha-`; the two are distinct routes with distinct variants.
- `variant` is the **string** `"165600260"`, not a number.
- No shared handler, factory, constants file or barrel export — independence is the point
  (`ARCHITECTURE.md` § Key Decisions).
- No import from `db/`, no read of `event.context.user`, so the probe stays answerable when auth and
  the database are unavailable.

## Design reference

_No design reference._ This ticket has no idea linked, and no user-visible surface changes.

## Definition of Done

- DoD-1: `routes/api/healthz-smoke-bugfix-ha2-165600260.ts` exists and default-exports a single
  `defineHandler` from `nitro/h3` returning the literal `{ ok: true, variant: "165600260" }`.
- DoD-2: A live `GET /api/healthz-smoke-bugfix-ha2-165600260` against a running dev server returns
  HTTP 200 with `Content-Type: application/json` and body exactly
  `{"ok":true,"variant":"165600260"}` — asserted on body and `Content-Type`, not status code alone.
- DoD-3: In the same session and on the same port, control route `/api/healthz-smoke-528856326-a`
  returns `200 application/json` — proving the measurement harness works rather than reporting a
  dead server as a pass.
- DoD-4: `routes/api/healthz-smoke-bugfix-ha2-165600260.test.ts` constructs an `H3Event` and asserts
  `toEqual({ ok: true, variant: "165600260" })` as its single case, with no timing assertion.
- DoD-5: No file outside the two new ones is added, modified or deleted, and no dependency is added.

## Test plan

- **API integration**, `routes/api/healthz-smoke-bugfix-ha2-165600260.test.ts` — one case, collected
  by the Vitest `server` project (`environment: "node"`) with no configuration change. Expected: the
  handler's returned object deep-equals `{ ok: true, variant: "165600260" }`. Covers DoD-1, DoD-4.
- **Live request**, manual against a running dev server. Expected: `200`,
  `application/json;charset=UTF-8`, 33-byte body; control route likewise. Covers DoD-2, DoD-3. This
  is the only check that proves Nitro registered the path — the unit test imports the module
  directly and passes even if the URL is dead.
- **Full verification gate** (lint, typecheck, unit/integration suite) green. Covers DoD-5 for
  typecheck/lint regressions.
