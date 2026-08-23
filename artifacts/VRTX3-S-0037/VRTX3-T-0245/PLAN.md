---
artifact: ticket-plan
spec: 1
status: complete
author_role: planning
sprint: VRTX3-S-0037
ticket: VRTX3-T-0245
idea: VRTX3-I-0044
branch: vortex/sprint/vrtx3-s-0037-3cd6b387
upstream: [artifacts/VRTX3-S-0037/SPRINT-PLAN.md]
downstream: [artifacts/VRTX3-S-0037/VRTX3-T-0245/tdd-test-result.md]
---

# Plan — VRTX3-T-0245: Add the missing `/api/healthz-smoke-bugfix3-1025161533` probe

## Objective

`GET /api/healthz-smoke-bugfix3-1025161533` answers with `Content-Type: application/json` and the
body `{"ok":true,"variant":"1025161533"}`. Today that path is unrouted and is answered by the SPA
`index.html` shell. The fix is two new files and nothing else.

## Root cause

The handler was never written — confirming VRTX3-I-0044's root-cause hypothesis. Measured on a live
dev server during planning (Vite bound `:5002` after `:5000` and `:5001` were taken; read your own
banner, the port is per-container):

```
/api/healthz-smoke-bugfix3-1025161533  →  200 text/html; charset=utf-8   949 B  (SPA shell)
/api/healthz-smoke-528856326-a         →  200 application/json;charset=UTF-8  33 B  {"ok":true,"variant":"528856326"}
```

A repo-wide grep for `1025161533` (`*.ts`, `*.tsx`, `*.md`, `*.json`, excluding `node_modules`)
returns zero matches — a never-written file, not a typo'd filename or a broken handler.

**The ticket's reported `404` is a mis-transcription, and VRTX3-I-0044 said so.** The canvas derived
the SPA fall-through correctly from source and flagged its own `404` as likely wrong, but could
measure nothing — no dev server was listening in its capture container. That is a correct
prediction, not a measurement; the live check above was taken anyway and confirmed it, for the
twenty-seventh consecutive sprint. Do not write a `404 → 200` assertion — it passes whether or not
the route exists.

## Steps

1. Create `routes/api/healthz-smoke-bugfix3-1025161533.ts`: default-export a `defineHandler`
   imported from `nitro/h3`, taking no parameters, returning the literal
   `{ ok: true, variant: "1025161533" }`. Copy `routes/api/healthz-smoke-528856326-a.ts` and change
   only the variant string.
2. Create `routes/api/healthz-smoke-bugfix3-1025161533.test.ts` by copying
   `routes/api/healthz-smoke-528856326-a.test.ts` — one `it()` case that builds
   `new H3Event(new Request("http://localhost/api/healthz-smoke-bugfix3-1025161533"))`, awaits the
   imported handler, and asserts `toEqual({ ok: true, variant: "1025161533" })`.
3. Check the literal `1025161533` agrees in three places: the handler filename, the test filename,
   and the `variant` field. Note the filename says `bugfix3` while the variant is bare `1025161533` —
   the `bugfix3` prefix is part of the path, never part of the `variant` string. The filename _is_
   the URL contract; a typo ships a route that is unreachable while every test still passes.

## File/module ownership

- `routes/api/healthz-smoke-bugfix3-1025161533.ts` (new)
- `routes/api/healthz-smoke-bugfix3-1025161533.test.ts` (new)

No other file. No overlap with VRTX3-T-0243 or VRTX3-T-0244, so no `depends_on` edge. The root docs
carrying the probe-family count are planning-owned and were already updated on this sprint's
planning ticket — do not touch them, and disregard VRTX3-I-0044's AC-8, which assigns that work
here.

## Interface contracts

Fixed; do not vary:

```ts
// routes/api/healthz-smoke-bugfix3-1025161533.ts
import { defineHandler } from "nitro/h3";

export default defineHandler(() => {
  return {
    ok: true,
    variant: "1025161533",
  };
});
```

- Route path: `/api/healthz-smoke-bugfix3-1025161533` (derived from the filename; the `/api/` prefix
  comes from the `routes/api/` directory and is not optional).
- Response body: exactly `{ ok: true, variant: "1025161533" }` — `variant` is the **string**
  `"1025161533"` with no `bugfix3` prefix, no extra keys.
- Import surface: `nitro/h3` only. No `db/` import, no `event.context.user` read, no method guard —
  the probe must stay answerable when auth and the database are unavailable, and every sibling is
  method-agnostic.
- No shared helper, factory, constants file or barrel export. The duplication is deliberate
  (`ARCHITECTURE.md` § Key Decisions, "Health probes duplicate, on purpose").

## Design reference

_No design reference on this sprint._ VRTX3-I-0044's design manifest returned zero blocks, and no
user-visible surface changes.

## Definition of Done

- DoD-1: `routes/api/healthz-smoke-bugfix3-1025161533.ts` exists and default-exports a
  `defineHandler` from `nitro/h3` returning `{ ok: true, variant: "1025161533" }`.
- DoD-2: `routes/api/healthz-smoke-bugfix3-1025161533.test.ts` exists, builds a real `H3Event`,
  calls the handler directly, and asserts the exact body. It has exactly one `it()` case.
- DoD-3: A live request to `/api/healthz-smoke-bugfix3-1025161533` on a running dev server returns
  `Content-Type: application/json` with body `{"ok":true,"variant":"1025161533"}` — asserted on the
  body and content type, never on the status code alone.
- DoD-4: The route compiles into the production server — a module for this path appears under
  `.output/server/_routes/api/` (dashes become underscores:
  `healthz_smoke_bugfix3_1025161533.mjs`).
- DoD-5: Exactly two files are added and zero existing files are modified.
- DoD-6: The new test file contains no wall-clock timing assertion.

## Test plan

- API-route test, `routes/api/healthz-smoke-bugfix3-1025161533.test.ts` — covers DoD-1, DoD-2.
  Expected: one case, green. Collected automatically by the Vitest `server` project
  (`routes/**/*.test.ts`, node environment); no harness or config change is needed.
- Live request against the dev server — covers DoD-3. Expected: JSON content type and the exact
  body, replacing today's 949-byte `text/html` shell.
- Built server output — covers DoD-4. The colocated `*.test.ts` is excluded from that output by
  `nitro({ ignore })`; only the handler module should appear.

**Copy the `528856326` pair — VRTX3-I-0044 names it correctly, and nothing needs substituting here.**
This is the first canvas in the family to name the pinned pair _and_ correctly identify a legacy
neighbour by name: it quotes `healthz-smoke-bugfix3-196651982.ts` only as a handler shape example
(handlers carry no timing case) while warning that its _test_ is one of the 47 legacy files. Diffed
during planning — that test does carry `expect(elapsed).toBeLessThan(100)`, so the warning is
accurate. Copy the pinned pair regardless, per the standing rule.

**VRTX3-I-0044's AC-4 wall-clock expectation is dropped, deliberately.** Its own text already rejects
the timing assertion; the outcome it reaches for — the handler performs no I/O — is guaranteed by the
interface contract above (sole import `nitro/h3`, no `db/`, no `event.context` read), not by a
wall-clock check on a shared CI runner.
