---
artifact: ticket-plan
spec: 1
status: complete
author_role: planning
sprint: VRTX3-S-0003
ticket: VRTX3-T-0015
branch: vortex/sprint/vrtx3-s-0003-36924a4a
upstream: [artifacts/VRTX3-S-0003/SPRINT-PLAN.md]
downstream: [artifacts/VRTX3-S-0003/VRTX3-T-0015/tdd-test-result.md]
---

> **STALE FILES IN THIS DIRECTORY — READ THIS FIRST.**
> The sprint key `VRTX3-S-0003` and the ticket key `VRTX3-T-0015` are both being reused. A
> different sprint (2026-08-02, variants `26031336` / `59156521` / `200192357`) already wrote
> `fix-note.md` and `tdd-test-result.md` here, and they report a **completed** fix for
> `/api/healthz-smoke-bugfix3-200192357` — a different endpoint. They are not this ticket's record.
> Deleting another sprint's artifacts is out of scope, so they stay. This `PLAN.md` was overwritten
> and is current. Ignore every other file in this directory until you write your own.

# Plan — VRTX3-T-0015: Add the missing `/api/healthz-smoke-bugfix3-267063007` probe

## Objective

`GET /api/healthz-smoke-bugfix3-267063007` answers with `Content-Type: application/json` and the
body `{"ok":true,"variant":"267063007"}`. Today that path is unrouted and is answered by the SPA
`index.html` shell. The fix is two new files and nothing else.

## Root cause

The handler was never written. Measured on a live dev server during planning (Vite bound `:5000`;
read your own banner, it drifts):

```
/api/healthz-smoke-bugfix3-267063007  →  200 text/html; charset=utf-8   949 B  (SPA shell)
/api/healthz-smoke-528856326-a        →  200 application/json;charset=UTF-8  33 B  {"ok":true,"variant":"528856326"}
```

A repo-wide grep for `267063007` (`*.ts`, `*.tsx`, `*.md`, `*.json`, excluding `node_modules`)
returns zero matches — a never-written file, not a typo'd filename or a broken handler. VRTX3-I-0006
reached the same conclusion from source, and its root-cause hypothesis is confirmed.

**The idea's `404` claim is wrong, and it is the one claim in VRTX3-I-0006 that did not survive
re-verification.** The canvas states Nitro's router "returns its default 404" for an unmatched path.
Measured: it does not. `vite.config.ts` mounts the API with
`nitro({ serverDir: "./", ignore: ["**/*.test.ts"] })` and any `/api/*` path with no matching file
falls through to the SPA `index.html` shell with `200 text/html` — in dev and in the production
build alike (`AGENT.md` § Gotchas; twenty-third consecutive live confirmation). The defect is real
and the fix shape the canvas proposes is correct; only the status code is wrong. Consequence for
implementation: **do not write a `404 → 200` assertion**, because it passes whether or not the route
exists.

## Steps

1. Create `routes/api/healthz-smoke-bugfix3-267063007.ts`: default-export a `defineHandler` imported
   from `nitro/h3`, taking no parameters, returning the literal `{ ok: true, variant: "267063007" }`.
   Copy `routes/api/healthz-smoke-528856326-a.ts` and change only the variant string.
2. Create `routes/api/healthz-smoke-bugfix3-267063007.test.ts` by copying
   `routes/api/healthz-smoke-528856326-a.test.ts` — one `it()` case that builds
   `new H3Event(new Request("http://localhost/api/healthz-smoke-bugfix3-267063007"))`, awaits the
   imported handler, and asserts `toEqual({ ok: true, variant: "267063007" })`.
3. Check the literal `267063007` agrees in three places: the handler filename, the test filename,
   and the `variant` field. Note the infix is `bugfix3`, not `bugfix` or `bugfix2` — it is part of
   the URL and differs from its two sibling tickets by one character.

## File/module ownership

- `routes/api/healthz-smoke-bugfix3-267063007.ts` (new)
- `routes/api/healthz-smoke-bugfix3-267063007.test.ts` (new)

No other file. No overlap with VRTX3-T-0013 or VRTX3-T-0014, so no `depends_on` edge. The root docs
carrying the probe-family count are planning-owned and were already updated on this sprint's
planning ticket — do not touch them.

## Interface contracts

Fixed; do not vary:

```ts
// routes/api/healthz-smoke-bugfix3-267063007.ts
import { defineHandler } from "nitro/h3";

export default defineHandler(() => {
  return {
    ok: true,
    variant: "267063007",
  };
});
```

- Route path: `/api/healthz-smoke-bugfix3-267063007` (derived from the filename; the `/api/` prefix
  comes from the `routes/api/` directory and is not optional).
- Response body: exactly `{ ok: true, variant: "267063007" }` — `variant` is the **string**
  `"267063007"`, no extra keys.
- Import surface: `nitro/h3` only — `defineHandler`, not the older `defineEventHandler` the README's
  routing example shows. No `db/` import, no `event.context.user` read, no method guard.
- No shared helper, factory, constants file or barrel export. The duplication is deliberate
  (`ARCHITECTURE.md` § Key Decisions, "Health probes duplicate, on purpose").

## Design reference

_No design reference on this idea._ `a2a_get_idea_design` for VRTX3-I-0006 (doc v10) returned an
empty block list, and this ticket changes no user-visible surface.

## Definition of Done

- DoD-1: `routes/api/healthz-smoke-bugfix3-267063007.ts` exists and default-exports a
  `defineHandler` from `nitro/h3` returning `{ ok: true, variant: "267063007" }`.
- DoD-2: `routes/api/healthz-smoke-bugfix3-267063007.test.ts` exists, builds a real `H3Event`, calls
  the handler directly, and asserts the exact body. It has exactly one `it()` case.
- DoD-3: A live request to `/api/healthz-smoke-bugfix3-267063007` on a running dev server returns
  `Content-Type: application/json` with body `{"ok":true,"variant":"267063007"}` — asserted on the
  body and content type, never on the status code alone.
- DoD-4: Exactly two files are added and zero existing files are modified.
- DoD-5: The new test file contains no wall-clock timing assertion.

## Test plan

- API-route test, `routes/api/healthz-smoke-bugfix3-267063007.test.ts` — covers DoD-1, DoD-2.
  Expected: one case, green. Collected automatically by the Vitest `server` project
  (`routes/**/*.test.ts`, node environment); no harness or config change is needed. Note this test
  imports the handler module directly, so it would pass even if Nitro never registered the path —
  DoD-3 is what proves the route is wired.
- Live request against the dev server — covers DoD-3. Expected: JSON content type and the exact
  body, replacing today's 949-byte `text/html` shell.

**Copy the `528856326` pair, not the file the idea names.** VRTX3-I-0006 names
`routes/api/healthz-smoke-bugfix3-834560860.test.ts`. It was diffed during planning and is
shape-identical to the pinned pair, so following it would do no harm this time — but the rule is to
substitute on the rule, not on how the named file looks: 47 of the 103 probe tests still carry a
flaky `expect(elapsed).toBeLessThan(100)` case, and a canvas that samples the directory has close to
even odds of landing on one. Record the substitution in your work log.
