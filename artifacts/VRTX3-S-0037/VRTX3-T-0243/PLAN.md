---
artifact: ticket-plan
spec: 1
status: complete
author_role: planning
sprint: VRTX3-S-0037
ticket: VRTX3-T-0243
branch: vortex/sprint/vrtx3-s-0037-3cd6b387
upstream: [artifacts/VRTX3-S-0037/SPRINT-PLAN.md]
downstream: [artifacts/VRTX3-S-0037/VRTX3-T-0243/tdd-test-result.md]
---

# Plan — VRTX3-T-0243: Add the missing `/api/healthz-smoke-bugfix-147016547` probe

## Objective

`GET /api/healthz-smoke-bugfix-147016547` answers with `Content-Type: application/json` and the body
`{"ok":true,"variant":"147016547"}`. Today that path is unrouted and is answered by the SPA
`index.html` shell. The fix is two new files and nothing else.

## Root cause

The handler was never written. Measured on a live dev server during planning (Vite bound `:5002`
after `:5000` and `:5001` were taken; read your own banner, the port is per-container):

```
/api/healthz-smoke-bugfix-147016547  →  200 text/html; charset=utf-8   949 B  (SPA shell)
/api/healthz-smoke-528856326-a       →  200 application/json;charset=UTF-8  33 B  {"ok":true,"variant":"528856326"}
```

A repo-wide grep for `147016547` (`*.ts`, `*.tsx`, `*.md`, `*.json`, excluding `node_modules`)
returns zero matches — a never-written file, not a typo'd filename or a broken handler.

**The ticket's reported `404` is a mis-transcription.** Nitro never sees the path: `vite.config.ts`
mounts the API with `nitro({ serverDir: "./", ignore: ["**/*.test.ts"] })`, and any `/api/*` path
with no matching file falls through to the SPA shell with `200 text/html`. This is documented in
`AGENTS.md` § Gotchas and has now been confirmed live for the twenty-seventh consecutive sprint. This
ticket has no idea canvas behind it, so the `404` was never checked upstream. The defect is real;
its stated status code is not. Do not write a `404 → 200` assertion — it passes whether or not the
route exists.

## Steps

1. Create `routes/api/healthz-smoke-bugfix-147016547.ts`: default-export a `defineHandler` imported
   from `nitro/h3`, taking no parameters, returning the literal `{ ok: true, variant: "147016547" }`.
   Copy `routes/api/healthz-smoke-528856326-a.ts` and change only the variant string.
2. Create `routes/api/healthz-smoke-bugfix-147016547.test.ts` by copying
   `routes/api/healthz-smoke-528856326-a.test.ts` — one `it()` case that builds
   `new H3Event(new Request("http://localhost/api/healthz-smoke-bugfix-147016547"))`, awaits the
   imported handler, and asserts `toEqual({ ok: true, variant: "147016547" })`.
3. Check the literal `147016547` agrees in three places: the handler filename, the test filename,
   and the `variant` field. The filename _is_ the URL contract — a typo ships a route that is
   unreachable while every test still passes.

## File/module ownership

- `routes/api/healthz-smoke-bugfix-147016547.ts` (new)
- `routes/api/healthz-smoke-bugfix-147016547.test.ts` (new)

No other file. No overlap with VRTX3-T-0244 or VRTX3-T-0245, so no `depends_on` edge. The root docs
carrying the probe-family count are planning-owned and were already updated on this sprint's
planning ticket — do not touch them.

## Interface contracts

Fixed; do not vary:

```ts
// routes/api/healthz-smoke-bugfix-147016547.ts
import { defineHandler } from "nitro/h3";

export default defineHandler(() => {
  return {
    ok: true,
    variant: "147016547",
  };
});
```

- Route path: `/api/healthz-smoke-bugfix-147016547` (derived from the filename; the `/api/` prefix
  comes from the `routes/api/` directory and is not optional).
- Response body: exactly `{ ok: true, variant: "147016547" }` — `variant` is the **string**
  `"147016547"`, no extra keys.
- Import surface: `nitro/h3` only. No `db/` import, no `event.context.user` read, no method guard —
  the probe must stay answerable when auth and the database are unavailable, and every sibling is
  method-agnostic.
- No shared helper, factory, constants file or barrel export. The duplication is deliberate
  (`ARCHITECTURE.md` § Key Decisions, "Health probes duplicate, on purpose").

## Design reference

_No design reference on this sprint._ This ticket has no idea linked, VRTX3-I-0044's design manifest
returned zero blocks, and no user-visible surface changes.

## Definition of Done

- DoD-1: `routes/api/healthz-smoke-bugfix-147016547.ts` exists and default-exports a `defineHandler`
  from `nitro/h3` returning `{ ok: true, variant: "147016547" }`.
- DoD-2: `routes/api/healthz-smoke-bugfix-147016547.test.ts` exists, builds a real `H3Event`, calls
  the handler directly, and asserts the exact body. It has exactly one `it()` case.
- DoD-3: A live request to `/api/healthz-smoke-bugfix-147016547` on a running dev server returns
  `Content-Type: application/json` with body `{"ok":true,"variant":"147016547"}` — asserted on the
  body and content type, never on the status code alone.
- DoD-4: The route compiles into the production server — a module for this path appears under
  `.output/server/_routes/api/` (dashes become underscores:
  `healthz_smoke_bugfix_147016547.mjs`).
- DoD-5: Exactly two files are added and zero existing files are modified.
- DoD-6: The new test file contains no wall-clock timing assertion.

## Test plan

- API-route test, `routes/api/healthz-smoke-bugfix-147016547.test.ts` — covers DoD-1, DoD-2.
  Expected: one case, green. Collected automatically by the Vitest `server` project
  (`routes/**/*.test.ts`, node environment); no harness or config change is needed.
- Live request against the dev server — covers DoD-3. Expected: JSON content type and the exact
  body, replacing today's 949-byte `text/html` shell.
- Built server output — covers DoD-4. The colocated `*.test.ts` is excluded from that output by
  `nitro({ ignore })`; only the handler module should appear.

**Copy the `528856326` pair.** This ticket has no canvas naming a template, so the pinned pointer in
`AGENTS.md` § Health Probe Routes is the sole source. 47 of the 115 probe tests carry the flaky
`expect(elapsed).toBeLessThan(100)` case; sampling a directory neighbour has close to even odds of
importing it.
