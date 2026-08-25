---
artifact: ticket-plan
spec: 1
status: complete
author_role: planning
sprint: VRTX3-S-0043
ticket: VRTX3-T-0291
idea: VRTX3-I-0052
branch: vortex/sprint/vrtx3-s-0043-5e7e01b2
upstream: [artifacts/VRTX3-S-0043/SPRINT-PLAN.md]
downstream: [artifacts/VRTX3-S-0043/VRTX3-T-0291/tdd-test-result.md]
---

# Plan — VRTX3-T-0291: Add the missing `/api/healthz-smoke-bugfix3-827939824` probe

## Objective

`GET /api/healthz-smoke-bugfix3-827939824` answers with `Content-Type: application/json` and the
body `{"ok":true,"variant":"827939824"}`. Today that path is unrouted and is answered by the SPA
`index.html` shell. The fix is two new files and nothing else.

## Root cause

The handler was never written. Measured on a live dev server during planning (Vite bound `:5003`
after `:5000`–`:5002` were all in use — read your own banner, it is per-container):

```
/api/healthz-smoke-bugfix3-827939824  →  200 text/html; charset=utf-8           949 B  (SPA shell)
/api/healthz-smoke-528856326-a        →  200 application/json;charset=UTF-8      33 B  {"ok":true,"variant":"528856326"}
```

`ls routes/api/ | grep 827939824` returns nothing and `git log --all -S'827939824'` returns zero
commits — a never-written file, not a deleted, renamed or typo'd one. There is nothing to revert.
Nitro builds its route table by scanning `routes/` at build time (`vite.config.ts`,
`nitro({ serverDir: "./", ignore: ["**/*.test.ts"] })`); a path with no matching file has no handler
to dispatch to. The 20 existing `healthz-smoke-bugfix3-*` probes resolve correctly under the same
config, so nothing is misconfigured.

VRTX3-I-0052's root-cause hypothesis is correct and was independently re-verified above, not taken
on trust. **Its one factual error is the status code.** The canvas states "Actual: 404 Not Found";
the measured result is `200 text/html`. Any `/api/*` path with no matching file falls through to the
SPA shell, documented in `AGENTS.md` § Gotchas and now confirmed live for the thirtieth consecutive
sprint. The defect is real; its stated status code is not. Do not write a `404 → 200` assertion — it
passes whether or not the route exists.

## Steps

1. Create `routes/api/healthz-smoke-bugfix3-827939824.ts` by copying
   `routes/api/healthz-smoke-528856326-a.ts` and changing only the variant string: default-export a
   `defineHandler` imported from `nitro/h3`, taking no parameters, returning the literal
   `{ ok: true, variant: "827939824" }`.
2. Create `routes/api/healthz-smoke-bugfix3-827939824.test.ts` by copying
   `routes/api/healthz-smoke-528856326-a.test.ts` — one `it()` case that builds
   `new H3Event(new Request("http://localhost/api/healthz-smoke-bugfix3-827939824"))`, awaits the
   imported handler, and asserts `toEqual({ ok: true, variant: "827939824" })`. Add the regression
   header comment fixed below.
3. Check the literal `827939824` agrees in three places: the handler filename, the test filename,
   and the `variant` field. The filename _is_ the URL contract — a typo ships a route that is
   unreachable while every test still passes.
4. Confirm over HTTP against a running dev server, not only via the unit test.

## Copy source — read before step 2

**Copy `healthz-smoke-528856326-a.{ts,test.ts}`. Do not copy either file VRTX3-I-0052 names.**

The canvas names `healthz-smoke-bugfix3-993514120.ts` and its test as the shape reference (Evidence
§2, Fix AC-1) and `healthz-smoke-bugfix-1054626998.test.ts` as the comment reference (Fix AC-4).
Both tests were diffed during planning and **both carry `expect(elapsed).toBeLessThan(100)`**. This
is the harmful form of the copy-source drift `AGENTS.md` § Health Probe Routes documents — the
fourth recorded instance, and the first in which a canvas names two legacy files in two different
roles. 47 of the 133 probe tests still carry the timing case; the numerator is fixed because those
files are never rewritten, so the odds do not improve with time.

**Take the comment, leave the assertion.** The header-comment convention (AC-4) is orthogonal to the
hazard — only the assertion shape is the risk — so it is kept, with the fixed text below. The timing
`it()` block is not.

**VRTX3-I-0052's AC-3 demands the sub-100ms assertion. It is dropped, deliberately.** The outcome it
reaches for — the handler performs no I/O — is guaranteed by the interface contract below (only
import is `nitro/h3`; no `db/`, no `event.context` read), not by a wall-clock number on a shared CI
runner, where it is flaky and proves nothing about the contract. An idea's acceptance criterion does
not outrank `AGENTS.md` here. Every other criterion in the canvas is carried into the DoD unchanged.
Record the substitution and the dropped AC in your work log.

## File/module ownership

- `routes/api/healthz-smoke-bugfix3-827939824.ts` (new)
- `routes/api/healthz-smoke-bugfix3-827939824.test.ts` (new)

No other file. No overlap with VRTX3-T-0289 or VRTX3-T-0290, so no `depends_on` edge. This satisfies
the canvas's AC-6 (`vite.config.ts`, `server.ts`, `middleware/` and every existing route file stay
untouched). The root docs are planning-owned and were settled on this sprint's planning ticket — do
not touch them.

## Interface contracts

Fixed; do not vary:

```ts
// routes/api/healthz-smoke-bugfix3-827939824.ts
import { defineHandler } from "nitro/h3";

export default defineHandler(() => {
  return {
    ok: true,
    variant: "827939824",
  };
});
```

```ts
// routes/api/healthz-smoke-bugfix3-827939824.test.ts — header comment, fixed text
/**
 * REGRESSION TEST for smoke bugfix
 *
 * Bug: GET /api/healthz-smoke-bugfix3-827939824 was returning the SPA shell (reported as 404)
 * Root cause: Missing route handler file
 * Fix: Create the route handler and verify it returns correct response
 */
```

- Route path: `/api/healthz-smoke-bugfix3-827939824` (derived from the filename; the `/api/` prefix
  comes from the `routes/api/` directory and is not optional). Note the prefix is `bugfix3`, not
  `bugfix` — it is part of the filename and therefore part of the URL. No `-a`/`-b`/`-c` suffix.
- Response body: exactly `{ ok: true, variant: "827939824" }` — `variant` is the **string**
  `"827939824"` (the numeric part only, without the `bugfix3` prefix), no extra keys.
- Import surface: `nitro/h3` only. No `db/` import, no `event.context.user` read, no method guard —
  the probe must stay answerable when auth and the database are unavailable, and every sibling is
  method-agnostic.
- No shared helper, factory, constants file or barrel export. The duplication is deliberate
  (`ARCHITECTURE.md` § Key Decisions, "Health probes duplicate, on purpose").

## Design reference

_No design reference on this sprint._ `a2a_get_idea_design(idea_key: "VRTX3-I-0052")` returned an
empty `blocks` array at doc v10, and no user-visible surface changes.

## Definition of Done

- DoD-1: `routes/api/healthz-smoke-bugfix3-827939824.ts` exists and default-exports a
  `defineHandler` from `nitro/h3` returning `{ ok: true, variant: "827939824" }`.
- DoD-2: `routes/api/healthz-smoke-bugfix3-827939824.test.ts` exists, carries the regression header
  comment above, builds a real `H3Event`, calls the handler directly, and asserts the exact body. It
  has exactly one `it()` case.
- DoD-3: A live request to `/api/healthz-smoke-bugfix3-827939824` on a running dev server returns
  `Content-Type: application/json` with body `{"ok":true,"variant":"827939824"}` — asserted on the
  body and content type, never on the status code alone.
- DoD-4: Exactly two files are added and zero existing files are modified.
- DoD-5: The new test file contains no wall-clock timing assertion.
- DoD-6: In the built output, a module for this route is present under `.output/server/` and no
  `*.test.ts` file is bundled as a handler — the Nitro `ignore` pattern still applies.

## Test plan

- API-route test, `routes/api/healthz-smoke-bugfix3-827939824.test.ts` — covers DoD-1, DoD-2.
  Expected: one case, green. Collected automatically by the Vitest `server` project
  (`routes/**/*.test.ts`, node environment); no harness or config change is needed. A test placed
  outside `routes/` would run under jsdom and fail on server imports.
- Live request against the dev server — covers DoD-3. Expected: JSON content type and the exact
  body, replacing today's 949-byte `text/html` shell.
- Build output inspection — covers DoD-6.
