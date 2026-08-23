---
artifact: ticket-plan
spec: 1
status: complete
author_role: planning
sprint: VRTX3-S-0034
ticket: VRTX3-T-0222
branch: vortex/sprint/vrtx3-s-0034-96262b30
upstream: [artifacts/VRTX3-S-0034/SPRINT-PLAN.md]
downstream: [artifacts/VRTX3-S-0034/VRTX3-T-0222/tdd-test-result.md]
---

# Plan — VRTX3-T-0222: Add the missing `/api/healthz-smoke-bugfix2-554747562` probe

## Objective

`GET /api/healthz-smoke-bugfix2-554747562` answers with `Content-Type: application/json` and the
body `{"ok":true,"variant":"554747562"}`. Today that path is unrouted and is answered by the SPA
`index.html` shell. The fix is two new files and nothing else.

## Root cause

The handler was never written. Measured on a live dev server during planning (Vite bound `:5000`;
read your own banner, it drifts):

```
/api/healthz-smoke-bugfix2-554747562  →  200 text/html; charset=utf-8   949 B  (SPA shell)
/api/healthz-smoke-528856326-a        →  200 application/json;charset=UTF-8  33 B  {"ok":true,"variant":"528856326"}
```

A repo-wide grep for `554747562` (`*.ts`, `*.tsx`, `*.md`, `*.json`, excluding `node_modules`)
returns zero matches — a never-written file, not a typo'd filename or a broken handler.

**The ticket's reported `404` is a mis-transcription.** Nitro never sees the path: `vite.config.ts:29`
mounts the API with `nitro({ serverDir: "./", ignore: ["**/*.test.ts"] })`, and any `/api/*` path
with no matching file falls through to the SPA shell with `200 text/html`. This is documented in
`AGENTS.md` § Gotchas and has now been confirmed live for the twenty-fourth consecutive sprint. This
ticket has no idea canvas behind it, so the `404` was never checked upstream. The defect is real;
its stated status code is not. Do not write a `404 → 200` assertion — it passes whether or not the
route exists.

## Steps

1. Create `routes/api/healthz-smoke-bugfix2-554747562.ts`: default-export a `defineHandler` imported
   from `nitro/h3`, taking no parameters, returning the literal `{ ok: true, variant: "554747562" }`.
   Copy `routes/api/healthz-smoke-528856326-a.ts` and change only the variant string.
2. Create `routes/api/healthz-smoke-bugfix2-554747562.test.ts` by copying
   `routes/api/healthz-smoke-528856326-a.test.ts` — one `it()` case that builds
   `new H3Event(new Request("http://localhost/api/healthz-smoke-bugfix2-554747562"))`, awaits the
   imported handler, and asserts `toEqual({ ok: true, variant: "554747562" })`.
3. Check the literal `554747562` agrees in three places: the handler filename, the test filename,
   and the `variant` field. Note the `bugfix2-` infix — it is part of the path, and the variant id
   itself carries no `2`. The filename _is_ the URL contract; a typo ships a route that is
   unreachable while every test still passes.

## File/module ownership

- `routes/api/healthz-smoke-bugfix2-554747562.ts` (new)
- `routes/api/healthz-smoke-bugfix2-554747562.test.ts` (new)

No other file. No overlap with VRTX3-T-0221 or VRTX3-T-0223, so no `depends_on` edge. The root docs
carrying the probe-family count are planning-owned and were already updated on this sprint's
planning ticket — do not touch them.

## Interface contracts

Fixed; do not vary:

```ts
// routes/api/healthz-smoke-bugfix2-554747562.ts
import { defineHandler } from "nitro/h3";

export default defineHandler(() => {
  return {
    ok: true,
    variant: "554747562",
  };
});
```

- Route path: `/api/healthz-smoke-bugfix2-554747562` (derived from the filename; the `/api/` prefix
  comes from the `routes/api/` directory and is not optional).
- Response body: exactly `{ ok: true, variant: "554747562" }` — `variant` is the **string**
  `"554747562"`, no extra keys, and it does **not** repeat the `bugfix2` infix.
- Import surface: `nitro/h3` only. No `db/` import, no `event.context.user` read, no method guard —
  the probe must stay answerable when auth and the database are unavailable, and every sibling is
  method-agnostic.
- No shared helper, factory, constants file or barrel export. The duplication is deliberate
  (`ARCHITECTURE.md` § Key Decisions, "Health probes duplicate, on purpose").

## Design reference

_No design reference on this sprint._ VRTX3-I-0041's design manifest returned zero blocks, this
ticket has no idea linked at all, and no user-visible surface changes.

## Definition of Done

- DoD-1: `routes/api/healthz-smoke-bugfix2-554747562.ts` exists and default-exports a
  `defineHandler` from `nitro/h3` returning `{ ok: true, variant: "554747562" }`.
- DoD-2: `routes/api/healthz-smoke-bugfix2-554747562.test.ts` exists, builds a real `H3Event`, calls
  the handler directly, and asserts the exact body. It has exactly one `it()` case.
- DoD-3: A live request to `/api/healthz-smoke-bugfix2-554747562` on a running dev server returns
  `Content-Type: application/json` with body `{"ok":true,"variant":"554747562"}` — asserted on the
  body and content type, never on the status code alone.
- DoD-4: Exactly two files are added and zero existing files are modified.
- DoD-5: The new test file contains no wall-clock timing assertion.

## Test plan

- API-route test, `routes/api/healthz-smoke-bugfix2-554747562.test.ts` — covers DoD-1, DoD-2.
  Expected: one case, green. Collected automatically by the Vitest `server` project
  (`routes/**/*.test.ts`, node environment); no harness or config change is needed.
- Live request against the dev server — covers DoD-3. Expected: JSON content type and the exact
  body, replacing today's 949-byte `text/html` shell.

**Copy the `528856326` pair.** The sprint's one idea canvas (VRTX3-I-0041, which covers
VRTX3-T-0223, not this ticket) names `healthz-smoke-bugfix3-993514120` instead, and that test
carries the flaky `expect(elapsed).toBeLessThan(100)` case — the harmful form of the drift. 47 of
the 106 probe tests still carry it. Record the substitution in your work log.
