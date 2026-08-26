---
artifact: ticket-plan
spec: 1
status: complete
author_role: planning
sprint: VRTX3-S-0044
ticket: VRTX3-T-0297
idea: VRTX3-I-0053
change: vrtx3-s-0044-smoke-bugfix-sprint-smoke-b
branch: vortex/sprint/vrtx3-s-0044-7d6d10f2
---

# Plan — VRTX3-T-0297: Restore `/api/healthz-smoke-bugfix3-1056287485`

Read `openspec/changes/vrtx3-s-0044-smoke-bugfix-sprint-smoke-b/design.md` first — the measured
context, the root cause and the fixed interface contract live there and are not repeated here.

## Objective

`GET /api/healthz-smoke-bugfix3-1056287485` answers `Content-Type: application/json` with the body
`{"ok":true,"variant":"1056287485"}`. Today that path is unrouted and is answered by the 949-byte
SPA `index.html` shell. Two new files, nothing modified.

Requirement implemented: **Health probe for bugfix variant 1056287485**
(`openspec/changes/vrtx3-s-0044-smoke-bugfix-sprint-smoke-b/specs/health-probes/spec.md`).

## Steps

1. Create `routes/api/healthz-smoke-bugfix3-1056287485.ts` by copying the pinned
   `routes/api/healthz-smoke-528856326-a.ts` and changing only the variant string to `"1056287485"`.
   Handler shape and import surface are fixed — `design.md` § D5.
   **This substitutes the template VRTX3-I-0053 names** (`healthz-smoke-bugfix3-827939824.ts` for
   the handler, `healthz-smoke-bugfix3-850084489.test.ts` for the test). Both were diffed at
   planning and are clean, so the canvas would have been harmless here; the pinned pair is used
   regardless, per `AGENTS.md` § Health Probe Routes and `design.md` § D3.
2. Create `routes/api/healthz-smoke-bugfix3-1056287485.test.ts` by copying the pinned
   `routes/api/healthz-smoke-528856326-a.test.ts`: one `it()` case building
   `new H3Event(new Request("http://localhost/api/healthz-smoke-bugfix3-1056287485"))`, awaiting the
   imported default export, asserting `toEqual({ ok: true, variant: "1056287485" })`. Prepend the
   subfamily regression header comment (`design.md` § D5, last bullet; the live example is
   `routes/api/healthz-smoke-bugfix-507266122.test.ts`).
3. Check the literal `1056287485` agrees in three places — handler filename, test filename, and the
   `variant` field — and that the path segment is `bugfix3`. Ten digits, not nine: this is the only
   variant in the batch with a ten-digit id, and the filename _is_ the URL contract
   (`design.md` § D5, first bullet).
4. Confirm over HTTP against a running dev server, on body and content type, never on the status
   code alone. `design.md` § Context explains why a status assertion proves nothing here — and why
   VRTX3-I-0053's `404` claim, and its first stated acceptance criterion ("returns HTTP 200 (not
   404)"), cannot be used as a check: an unrouted path already returns 200.

## File/module ownership

- `routes/api/healthz-smoke-bugfix3-1056287485.ts` (new)
- `routes/api/healthz-smoke-bugfix3-1056287485.test.ts` (new)

No other file. No overlap with VRTX3-T-0295 or VRTX3-T-0296, so no `depends_on` edge
(`design.md` § D1). The root docs are planning-owned and were settled on this sprint's planning
ticket — do not touch them.

## Design reference

No design reference. `a2a_get_idea_design(idea_key="VRTX3-I-0053")` returns zero blocks at doc
version 11, and no user-visible surface changes.

## Definition of Done

Every acceptance criterion on VRTX3-T-0297 is met — AC-1 through AC-6, each traceable to the
same-named scenario in the change's delta spec. In addition:

- Exactly two files are added and zero existing files are modified.
- The new test file contains exactly one `it()` case.

## Test plan

- API-route test, `routes/api/healthz-smoke-bugfix3-1056287485.test.ts` — covers AC-5 and, through
  the handler's returned object, AC-1. Collected automatically by the Vitest `server` project
  (`routes/**/*.test.ts`, node environment); no harness or config change is needed.
- Live request against the dev server — covers AC-1, AC-2 and AC-3. Read the port from your own
  Vite banner; it is per-container.
- Production build output inspection — covers AC-6.
