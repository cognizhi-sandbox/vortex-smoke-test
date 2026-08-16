---
artifact: ticket-plan
spec: 1
status: complete
author_role: planning
sprint: VRTX3-S-0025
ticket: VRTX3-T-0175
branch: vortex/sprint/vrtx3-s-0025-c251997f
upstream: [artifacts/VRTX3-S-0025/SPRINT-PLAN.md]
---

# Plan — VRTX3-T-0175: `/api/healthz-smoke-bugfix3-22079551` returns the SPA shell, not its probe body

## Objective

`GET /api/healthz-smoke-bugfix3-22079551` answers HTTP 200 with `Content-Type: application/json`
and a body deep-equal to `{ "ok": true, "variant": "22079551" }`, served by a new self-contained
Nitro route with a colocated test. Two new files; no existing source file changes.

## Root cause

**The handler was never written.** `routes/api/healthz-smoke-bugfix3-22079551.ts` does not exist,
and Nitro registers routes by filename alone — `nitro({ serverDir: "./", ignore: ["**/*.test.ts"] })`
in `vite.config.ts`, with no route table (`ARCHITECTURE.md` § Routing: "The filename **is** the URL
contract"). No file, no route. This is a missing-file gap, not a regression: nothing was broken by a
change, no middleware or route ordering is involved, and no existing route behaves differently.

A repo-wide grep for `22079551` (excluding `node_modules`/`.git`) returned zero matches, and
`ls routes/api | grep 22079551` returned nothing — confirming a never-written file rather than a
typo'd filename serving a wrong URL. This matches the hypothesis in VRTX3-I-0034 § Root-Cause
Hypothesis, re-verified here rather than inherited.

**The reported `404` is a mis-transcription — and, unlike the canvas, this was measured.**
VRTX3-I-0034 predicted `200 text/html` from the documented gotcha but explicitly recorded that it
could not measure it (ports 5000–5007 and 3000 all refused the connection in its capture container)
and wrote the live check into its own acceptance criteria as the one thing still owed. Done, on a
live dev server on `:5001` (Vite banner: `Port 5000 is in use, trying another one...`):

```
/api/healthz-smoke-bugfix3-22079551   200 text/html; charset=utf-8       949b  (SPA index.html shell)
/api/healthz-smoke-528856326-a        200 application/json;charset=UTF-8  33b  {"ok":true,"variant":"528856326"}
```

The prediction was correct; a correct prediction is still not a measurement, and the measurement is
what licenses the plan. An unmatched `/api/*` path falls through to the SPA shell in dev and
production alike (`AGENT.md` § Gotchas). The defect is real; its stated status code is not.

## Steps

1. Copy `routes/api/healthz-smoke-528856326-a.ts` to
   `routes/api/healthz-smoke-bugfix3-22079551.ts`, changing only the variant string to
   `"22079551"`. Change nothing else — no `event` parameter, no method guard, no import beyond
   `nitro/h3`.
2. Copy `routes/api/healthz-smoke-528856326-a.test.ts` to
   `routes/api/healthz-smoke-bugfix3-22079551.test.ts`, updating the import path, the `describe`
   title, the request URL and the expected variant. Keep it to the **single body assertion** — do
   not add a `responds in under 100ms` case (`AGENT.md` § Health Probe Routes). VRTX3-I-0034 names
   the `528856326` pair itself, so the documented template and the canvas agree here.
3. Run the repo's verification gate, and separately confirm the route is actually wired by issuing a
   live request against a running dev server (port from the Vite banner), checking body and
   `Content-Type` — plus the control route `/api/healthz-smoke-528856326-a` in the same session.

## File/module ownership

Creates, and owns exclusively:

- `routes/api/healthz-smoke-bugfix3-22079551.ts`
- `routes/api/healthz-smoke-bugfix3-22079551.test.ts`

Modifies nothing. **Does not intersect VRTX3-T-0173 or VRTX3-T-0174** — no `depends_on` in either
direction; the three run in parallel. Root docs are planning-owned and already at target state on
the sprint branch; this ticket must not touch `AGENT.md`, `PRODUCT.md`, `ARCHITECTURE.md` or
`DESIGN.md`. VRTX3-I-0034 § Regression Risk agrees: it explicitly leaves the probe-count doc bump
off this ticket as planning-owned, and the count moves 86 → 89 for the sprint as a whole rather than
86 → 87 per defect.

## Interface contracts

Fixed — do not vary:

```ts
// routes/api/healthz-smoke-bugfix3-22079551.ts
import { defineHandler } from "nitro/h3";

export default defineHandler(() => {
  return {
    ok: true,
    variant: "22079551",
  };
});
```

- Route path: `/api/healthz-smoke-bugfix3-22079551` — note the `bugfix3` segment; the filename is
  the URL, and a typo is a dead route with no other symptom.
- `variant` is the **string** `"22079551"`, not a number. It is **8 digits**, where the sprint's two
  sibling ids are 9 — that is the id as captured in the ticket title and the canvas alike, not a
  truncation to correct.
- No shared handler, factory, constants file or barrel export — independence is the point
  (`ARCHITECTURE.md` § Key Decisions).
- No import from `db/`, no read of `event.context.user`, so the probe stays answerable when auth and
  the database are unavailable.
- **No method guard.** No `healthz-smoke-*` handler declares one, so every verb returns the same 200
  body; VRTX3-I-0034 puts non-`GET` handling out of scope. Adding a `405` here alone would make this
  route inconsistent with 86 siblings.

## Design reference

_No design reference on this idea._ VRTX3-I-0034's design manifest returned zero blocks; no
user-visible surface changes.

## Definition of Done

- DoD-1: `routes/api/healthz-smoke-bugfix3-22079551.ts` exists and default-exports a single
  `defineHandler` from `nitro/h3` returning the literal `{ ok: true, variant: "22079551" }`.
- DoD-2: A live `GET /api/healthz-smoke-bugfix3-22079551` against a running dev server returns HTTP
  200 with `Content-Type: application/json` and body exactly `{"ok":true,"variant":"22079551"}` —
  asserted on body and `Content-Type`, not status code alone.
- DoD-3: In the same session and on the same port, control route `/api/healthz-smoke-528856326-a`
  returns `200 application/json` — proving the measurement harness works rather than reporting a
  dead server as a pass.
- DoD-4: `routes/api/healthz-smoke-bugfix3-22079551.test.ts` constructs an `H3Event` and asserts
  `toEqual({ ok: true, variant: "22079551" })` as its single case, with no timing assertion.
- DoD-5: The production server build emits the compiled route module for this path (dashes become
  underscores: `_routes/api/healthz_smoke_bugfix3_22079551.mjs`), confirming it compiled in.
- DoD-6: No file outside the two new ones is added, modified or deleted, and no dependency is added.

The canvas's remaining criterion — re-measure the pre-fix response and correct the report's status
code — was satisfied during planning (see § Root cause) and is deliberately not carried here.

## Test plan

- **API integration**, `routes/api/healthz-smoke-bugfix3-22079551.test.ts` — one case, collected by
  the Vitest `server` project (`environment: "node"`) with no configuration change. Expected: the
  handler's returned object deep-equals `{ ok: true, variant: "22079551" }`. Covers DoD-1, DoD-4.
- **Live request**, manual against a running dev server. Expected: `200`,
  `application/json;charset=UTF-8`, 33-byte body; control route likewise. Covers DoD-2, DoD-3. This
  is the only check that proves Nitro registered the path — the unit test imports the module
  directly and passes even if the URL is dead (VRTX3-I-0034 § Regression Risk names this exact
  failure mode).
- **Production build output** inspected for the compiled route module. Covers DoD-5.
- **Full verification gate** (lint, typecheck, unit/integration suite) green. Covers DoD-6 for
  typecheck/lint regressions.
