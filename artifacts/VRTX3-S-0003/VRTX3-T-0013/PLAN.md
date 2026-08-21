---
artifact: ticket-plan
spec: 1
status: complete
author_role: planning
sprint: VRTX3-S-0003
ticket: VRTX3-T-0013
branch: vortex/sprint/vrtx3-s-0003-36924a4a
upstream: [artifacts/VRTX3-S-0003/SPRINT-PLAN.md]
downstream: [artifacts/VRTX3-S-0003/VRTX3-T-0013/tdd-test-result.md]
---

> **STALE FILES IN THIS DIRECTORY — READ THIS FIRST.**
> The sprint key `VRTX3-S-0003` and the ticket key `VRTX3-T-0013` are both being reused. A
> different sprint (2026-08-02, variants `26031336` / `59156521` / `200192357`) already wrote
> `fix-note.md` and `tdd-test-result.md` here, and they report a **completed** fix for
> `/api/healthz-smoke-bugfix-26031336` — a different endpoint. They are not this ticket's record.
> Deleting another sprint's artifacts is out of scope, so they stay. This `PLAN.md` was overwritten
> and is current. Ignore every other file in this directory until you write your own.

# Plan — VRTX3-T-0013: Add the missing `/api/healthz-smoke-bugfix-858873211` probe

## Objective

`GET /api/healthz-smoke-bugfix-858873211` answers with `Content-Type: application/json` and the
body `{"ok":true,"variant":"858873211"}`. Today that path is unrouted and is answered by the SPA
`index.html` shell. The fix is two new files and nothing else.

## Root cause

The handler was never written. Measured on a live dev server during planning (Vite bound `:5000`;
read your own banner, it drifts):

```
/api/healthz-smoke-bugfix-858873211  →  200 text/html; charset=utf-8   949 B  (SPA shell)
/api/healthz-smoke-528856326-a       →  200 application/json;charset=UTF-8  33 B  {"ok":true,"variant":"528856326"}
```

A repo-wide grep for `858873211` (`*.ts`, `*.tsx`, `*.md`, `*.json`, excluding `node_modules`)
returns zero matches — a never-written file, not a typo'd filename or a broken handler.

**The ticket's reported `404` is a mis-transcription.** Nitro never sees the path: `vite.config.ts`
mounts the API with `nitro({ serverDir: "./", ignore: ["**/*.test.ts"] })`, and any `/api/*` path
with no matching file falls through to the SPA shell with `200 text/html`. This is documented in
`AGENT.md` § Gotchas and has now been confirmed live for the twenty-third consecutive sprint. The
defect is real; its stated status code is not. Do not write a `404 → 200` assertion — it passes
whether or not the route exists.

## Steps

1. Create `routes/api/healthz-smoke-bugfix-858873211.ts`: default-export a `defineHandler` imported
   from `nitro/h3`, taking no parameters, returning the literal `{ ok: true, variant: "858873211" }`.
   Copy `routes/api/healthz-smoke-528856326-a.ts` and change only the variant string.
2. Create `routes/api/healthz-smoke-bugfix-858873211.test.ts` by copying
   `routes/api/healthz-smoke-528856326-a.test.ts` — one `it()` case that builds
   `new H3Event(new Request("http://localhost/api/healthz-smoke-bugfix-858873211"))`, awaits the
   imported handler, and asserts `toEqual({ ok: true, variant: "858873211" })`.
3. Check the literal `858873211` agrees in three places: the handler filename, the test filename,
   and the `variant` field. The filename _is_ the URL contract — a typo ships a route that is
   unreachable while every test still passes.

## File/module ownership

- `routes/api/healthz-smoke-bugfix-858873211.ts` (new)
- `routes/api/healthz-smoke-bugfix-858873211.test.ts` (new)

No other file. No overlap with VRTX3-T-0014 or VRTX3-T-0015, so no `depends_on` edge. The root docs
carrying the probe-family count are planning-owned and were already updated on this sprint's
planning ticket — do not touch them.

## Interface contracts

Fixed; do not vary:

```ts
// routes/api/healthz-smoke-bugfix-858873211.ts
import { defineHandler } from "nitro/h3";

export default defineHandler(() => {
  return {
    ok: true,
    variant: "858873211",
  };
});
```

- Route path: `/api/healthz-smoke-bugfix-858873211` (derived from the filename; the `/api/` prefix
  comes from the `routes/api/` directory and is not optional).
- Response body: exactly `{ ok: true, variant: "858873211" }` — `variant` is the **string**
  `"858873211"`, no extra keys.
- Import surface: `nitro/h3` only. No `db/` import, no `event.context.user` read, no method guard —
  the probe must stay answerable when auth and the database are unavailable, and every sibling is
  method-agnostic.
- No shared helper, factory, constants file or barrel export. The duplication is deliberate
  (`ARCHITECTURE.md` § Key Decisions, "Health probes duplicate, on purpose").

## Design reference

_No design reference on this idea._ VRTX3-I-0006's design manifest returned zero blocks, and this
ticket changes no user-visible surface.

## Definition of Done

- DoD-1: `routes/api/healthz-smoke-bugfix-858873211.ts` exists and default-exports a `defineHandler`
  from `nitro/h3` returning `{ ok: true, variant: "858873211" }`.
- DoD-2: `routes/api/healthz-smoke-bugfix-858873211.test.ts` exists, builds a real `H3Event`, calls
  the handler directly, and asserts the exact body. It has exactly one `it()` case.
- DoD-3: A live request to `/api/healthz-smoke-bugfix-858873211` on a running dev server returns
  `Content-Type: application/json` with body `{"ok":true,"variant":"858873211"}` — asserted on the
  body and content type, never on the status code alone.
- DoD-4: Exactly two files are added and zero existing files are modified.
- DoD-5: The new test file contains no wall-clock timing assertion.

## Test plan

- API-route test, `routes/api/healthz-smoke-bugfix-858873211.test.ts` — covers DoD-1, DoD-2.
  Expected: one case, green. Collected automatically by the Vitest `server` project
  (`routes/**/*.test.ts`, node environment); no harness or config change is needed.
- Live request against the dev server — covers DoD-3. Expected: JSON content type and the exact
  body, replacing today's 949-byte `text/html` shell.

**Copy the `528856326` pair, not the file the idea names.** VRTX3-I-0006 names
`routes/api/healthz-smoke-bugfix3-834560860.test.ts`. It was diffed during planning and is
shape-identical to the pinned pair, so following it would do no harm this time — but the rule is to
substitute on the rule, not on how the named file looks: 47 of the 103 probe tests still carry a
flaky `expect(elapsed).toBeLessThan(100)` case, and a canvas that samples the directory has close to
even odds of landing on one. Record the substitution in your work log.
