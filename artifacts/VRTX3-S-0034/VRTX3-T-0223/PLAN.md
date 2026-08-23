---
artifact: ticket-plan
spec: 1
status: complete
author_role: planning
sprint: VRTX3-S-0034
ticket: VRTX3-T-0223
branch: vortex/sprint/vrtx3-s-0034-96262b30
upstream: [artifacts/VRTX3-S-0034/SPRINT-PLAN.md]
downstream: [artifacts/VRTX3-S-0034/VRTX3-T-0223/tdd-test-result.md]
---

# Plan — VRTX3-T-0223: Add the missing `/api/healthz-smoke-bugfix3-238311955` probe

## Objective

`GET /api/healthz-smoke-bugfix3-238311955` answers with `Content-Type: application/json` and the
body `{"ok":true,"variant":"238311955"}`. Today that path is unrouted and is answered by the SPA
`index.html` shell. The fix is two new files and nothing else.

## Root cause

The handler was never written — VRTX3-I-0041's root-cause hypothesis is correct and was
re-verified against the code. Measured on a live dev server during planning (Vite bound `:5000`;
read your own banner, it drifts):

```
/api/healthz-smoke-bugfix3-238311955  →  200 text/html; charset=utf-8   949 B  (SPA shell)
/api/healthz-smoke-528856326-a        →  200 application/json;charset=UTF-8  33 B  {"ok":true,"variant":"528856326"}
```

A repo-wide grep for `238311955` (`*.ts`, `*.tsx`, `*.md`, `*.json`, excluding `node_modules`)
returns zero matches, reproducing the canvas's Evidence §1 exactly — a never-written file, not a
typo'd filename or a broken handler.

**The canvas's reported `404` is a mis-transcription.** Nitro never sees the path:
`vite.config.ts:29` mounts the API with `nitro({ serverDir: "./", ignore: ["**/*.test.ts"] })`, and
any `/api/*` path with no matching file falls through to the SPA shell with `200 text/html`. This is
documented in `AGENTS.md` § Gotchas and has now been confirmed live for the twenty-fourth
consecutive sprint. The defect is real; its stated status code is not. Do not write a `404 → 200`
assertion — it passes whether or not the route exists.

## Three corrections to VRTX3-I-0041

The canvas is unusually well-evidenced — it locates the missing file, greps the variant id, and
quotes a working sibling in full. Three of its instructions still failed re-verification. Where this
plan and the canvas disagree, follow this plan.

1. **Its `404` claim** (Summary, Repro, Expected vs Actual). Measured: `200 text/html`. See above.
2. **Its copy source.** The canvas names `routes/api/healthz-smoke-bugfix3-993514120.ts` and its
   test. That test was diffed during planning and **does** carry the flaky
   `expect(elapsed).toBeLessThan(100)` case. Copy the pinned `528856326` pair instead — `AGENTS.md`
   § Health Probe Routes outranks a canvas pointer, and 47 of the 106 probe tests still carry the
   timing case.
3. **Its AC-4**, which demands the companion test assert "a sub-100ms response". Dropped
   deliberately. The outcome it reaches for — the handler performs no I/O — is guaranteed by the
   interface contract below (sole import `nitro/h3`, no `db/`, no `event.context` read), not by a
   wall-clock check on a shared CI runner. Its AC-6 also names a build/test command; that is yours
   to choose, so DoD below states the outcome instead.

The canvas's remaining criteria (AC-1, AC-2, AC-3, AC-5, AC-7) are carried into the DoD unchanged.

## Steps

1. Create `routes/api/healthz-smoke-bugfix3-238311955.ts`: default-export a `defineHandler` imported
   from `nitro/h3`, taking no parameters, returning the literal `{ ok: true, variant: "238311955" }`.
   Copy `routes/api/healthz-smoke-528856326-a.ts` and change only the variant string.
2. Create `routes/api/healthz-smoke-bugfix3-238311955.test.ts` by copying
   `routes/api/healthz-smoke-528856326-a.test.ts` — one `it()` case that builds
   `new H3Event(new Request("http://localhost/api/healthz-smoke-bugfix3-238311955"))`, awaits the
   imported handler, and asserts `toEqual({ ok: true, variant: "238311955" })`. One case only; do
   not add the timing case the canvas asks for.
3. Check the literal `238311955` agrees in three places: the handler filename, the test filename,
   and the `variant` field. Note the `bugfix3-` infix — it is part of the path, and the variant id
   itself carries no `3`. The canvas's own Regression Risk section flags a stale copy-pasted
   `variant` as the likeliest way this fix ships wrong; DoD-1 and DoD-2 exist to catch it.

## File/module ownership

- `routes/api/healthz-smoke-bugfix3-238311955.ts` (new)
- `routes/api/healthz-smoke-bugfix3-238311955.test.ts` (new)

No other file. No overlap with VRTX3-T-0221 or VRTX3-T-0222, so no `depends_on` edge. The root docs
carrying the probe-family count are planning-owned and were already updated on this sprint's
planning ticket — do not touch them.

## Interface contracts

Fixed; do not vary:

```ts
// routes/api/healthz-smoke-bugfix3-238311955.ts
import { defineHandler } from "nitro/h3";

export default defineHandler(() => {
  return {
    ok: true,
    variant: "238311955",
  };
});
```

- Route path: `/api/healthz-smoke-bugfix3-238311955` (derived from the filename; the `/api/` prefix
  comes from the `routes/api/` directory and is not optional).
- Response body: exactly `{ ok: true, variant: "238311955" }` — `variant` is the **string**
  `"238311955"`, no extra keys, and it does **not** repeat the `bugfix3` infix.
- Import surface: `nitro/h3` only. No `db/` import, no `event.context.user` read, no method guard —
  the probe must stay answerable when auth and the database are unavailable, and every sibling is
  method-agnostic. `middleware/auth.ts` is a documented stub; a healthz endpoint that depended on it
  would break when real auth replaces it.
- The test file must be named `*.test.ts`. `vite.config.ts:29` ignores that suffix; any other
  suffix gets bundled into the production server as a route handler.
- No shared helper, factory, constants file or barrel export. The duplication is deliberate
  (`ARCHITECTURE.md` § Key Decisions, "Health probes duplicate, on purpose").

## Design reference

_No design reference on this idea._ VRTX3-I-0041's design manifest returned zero blocks, and this
ticket changes no user-visible surface.

## Definition of Done

- DoD-1: `routes/api/healthz-smoke-bugfix3-238311955.ts` exists and default-exports a
  `defineHandler` from `nitro/h3` returning `{ ok: true, variant: "238311955" }`.
- DoD-2: `routes/api/healthz-smoke-bugfix3-238311955.test.ts` exists, builds a real `H3Event`, calls
  the handler directly, and asserts the exact body. It has exactly one `it()` case.
- DoD-3: A live request to `/api/healthz-smoke-bugfix3-238311955` on a running dev server returns
  `Content-Type: application/json` with body `{"ok":true,"variant":"238311955"}` — asserted on the
  body and content type, never on the status code alone. A bare GET succeeds: no auth header, query
  string or body is needed.
- DoD-4: Exactly two files are added and zero existing files are modified — every other
  `healthz-smoke-*` route still returns its own variant id.
- DoD-5: The new test file contains no wall-clock timing assertion.

## Test plan

- API-route test, `routes/api/healthz-smoke-bugfix3-238311955.test.ts` — covers DoD-1, DoD-2.
  Expected: one case, green. Collected automatically by the Vitest `server` project
  (`routes/**/*.test.ts`, node environment); no harness or config change is needed.
- Live request against the dev server — covers DoD-3. Expected: JSON content type and the exact
  body, replacing today's 949-byte `text/html` shell. The unit test alone cannot cover this: it
  imports the handler module directly and passes even if Nitro never registered the path.
