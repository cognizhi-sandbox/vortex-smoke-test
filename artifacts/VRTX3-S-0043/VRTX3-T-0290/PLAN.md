---
artifact: ticket-plan
spec: 1
status: complete
author_role: planning
sprint: VRTX3-S-0043
ticket: VRTX3-T-0290
branch: vortex/sprint/vrtx3-s-0043-5e7e01b2
upstream: [artifacts/VRTX3-S-0043/SPRINT-PLAN.md]
downstream: [artifacts/VRTX3-S-0043/VRTX3-T-0290/tdd-test-result.md]
---

# Plan — VRTX3-T-0290: Add the missing `/api/healthz-smoke-bugfix2-232336916` probe

## Objective

`GET /api/healthz-smoke-bugfix2-232336916` answers with `Content-Type: application/json` and the
body `{"ok":true,"variant":"232336916"}`. Today that path is unrouted and is answered by the SPA
`index.html` shell. The fix is two new files and nothing else.

## Root cause

The handler was never written. Measured on a live dev server during planning (Vite bound `:5003`
after `:5000`–`:5002` were all in use — read your own banner, it is per-container):

```
/api/healthz-smoke-bugfix2-232336916  →  200 text/html; charset=utf-8           949 B  (SPA shell)
/api/healthz-smoke-528856326-a        →  200 application/json;charset=UTF-8      33 B  {"ok":true,"variant":"528856326"}
```

`ls routes/api/ | grep 232336916` returns nothing and `git log --all -S'232336916'` returns zero
commits — a never-written file, not a deleted, renamed or typo'd one. There is nothing to revert.
Nitro builds its route table by scanning `routes/` at build time (`vite.config.ts`,
`nitro({ serverDir: "./", ignore: ["**/*.test.ts"] })`); a path with no matching file has no handler
to dispatch to. The 20 existing `healthz-smoke-bugfix2-*` probes resolve correctly under the same
config, so nothing is misconfigured.

**The ticket's reported `404` is a mis-transcription.** Any `/api/*` path with no matching file
falls through to the SPA shell with `200 text/html`, documented in `AGENTS.md` § Gotchas and now
confirmed live for the thirtieth consecutive sprint. **This ticket has no idea canvas behind it**
(`a2a_get_idea_canvas` reports no `idea_id`), so the `404` was never checked upstream. The defect is
real; its stated status code is not. Do not write a `404 → 200` assertion — it passes whether or not
the route exists.

## Steps

1. Create `routes/api/healthz-smoke-bugfix2-232336916.ts` by copying
   `routes/api/healthz-smoke-528856326-a.ts` and changing only the variant string: default-export a
   `defineHandler` imported from `nitro/h3`, taking no parameters, returning the literal
   `{ ok: true, variant: "232336916" }`.
2. Create `routes/api/healthz-smoke-bugfix2-232336916.test.ts` by copying
   `routes/api/healthz-smoke-528856326-a.test.ts` — one `it()` case that builds
   `new H3Event(new Request("http://localhost/api/healthz-smoke-bugfix2-232336916"))`, awaits the
   imported handler, and asserts `toEqual({ ok: true, variant: "232336916" })`. Add the regression
   header comment fixed below. **Do not copy a neighbouring `bugfix2-*` test** — 33 of the 62 tests
   in the `bugfix*` subfamily carry a wall-clock timing case.
3. Check the literal `232336916` agrees in three places: the handler filename, the test filename,
   and the `variant` field. The filename _is_ the URL contract — a typo ships a route that is
   unreachable while every test still passes.
4. Confirm over HTTP against a running dev server, not only via the unit test.

## File/module ownership

- `routes/api/healthz-smoke-bugfix2-232336916.ts` (new)
- `routes/api/healthz-smoke-bugfix2-232336916.test.ts` (new)

No other file. No overlap with VRTX3-T-0289 or VRTX3-T-0291, so no `depends_on` edge. The root docs
are planning-owned and were settled on this sprint's planning ticket — do not touch them.

## Interface contracts

Fixed; do not vary:

```ts
// routes/api/healthz-smoke-bugfix2-232336916.ts
import { defineHandler } from "nitro/h3";

export default defineHandler(() => {
  return {
    ok: true,
    variant: "232336916",
  };
});
```

```ts
// routes/api/healthz-smoke-bugfix2-232336916.test.ts — header comment, fixed text
/**
 * REGRESSION TEST for smoke bugfix
 *
 * Bug: GET /api/healthz-smoke-bugfix2-232336916 was returning the SPA shell (reported as 404)
 * Root cause: Missing route handler file
 * Fix: Create the route handler and verify it returns correct response
 */
```

- Route path: `/api/healthz-smoke-bugfix2-232336916` (derived from the filename; the `/api/` prefix
  comes from the `routes/api/` directory and is not optional). Note the prefix is `bugfix2`, not
  `bugfix` — it is part of the filename and therefore part of the URL. No `-a`/`-b`/`-c` suffix.
- Response body: exactly `{ ok: true, variant: "232336916" }` — `variant` is the **string**
  `"232336916"` (the numeric part only, without the `bugfix2` prefix), no extra keys.
- Import surface: `nitro/h3` only. No `db/` import, no `event.context.user` read, no method guard —
  the probe must stay answerable when auth and the database are unavailable, and every sibling is
  method-agnostic.
- No shared helper, factory, constants file or barrel export. The duplication is deliberate
  (`ARCHITECTURE.md` § Key Decisions, "Health probes duplicate, on purpose").

## Design reference

_No design reference on this sprint._ This ticket has no idea linked, VRTX3-I-0052's design manifest
returned zero blocks, and no user-visible surface changes.

## Definition of Done

- DoD-1: `routes/api/healthz-smoke-bugfix2-232336916.ts` exists and default-exports a
  `defineHandler` from `nitro/h3` returning `{ ok: true, variant: "232336916" }`.
- DoD-2: `routes/api/healthz-smoke-bugfix2-232336916.test.ts` exists, carries the regression header
  comment above, builds a real `H3Event`, calls the handler directly, and asserts the exact body. It
  has exactly one `it()` case.
- DoD-3: A live request to `/api/healthz-smoke-bugfix2-232336916` on a running dev server returns
  `Content-Type: application/json` with body `{"ok":true,"variant":"232336916"}` — asserted on the
  body and content type, never on the status code alone.
- DoD-4: Exactly two files are added and zero existing files are modified.
- DoD-5: The new test file contains no wall-clock timing assertion.

## Test plan

- API-route test, `routes/api/healthz-smoke-bugfix2-232336916.test.ts` — covers DoD-1, DoD-2.
  Expected: one case, green. Collected automatically by the Vitest `server` project
  (`routes/**/*.test.ts`, node environment); no harness or config change is needed.
- Live request against the dev server — covers DoD-3. Expected: JSON content type and the exact
  body, replacing today's 949-byte `text/html` shell.
