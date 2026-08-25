---
artifact: fix-note
spec: 1
status: complete
author_role: implementation
sprint: VRTX3-S-0043
ticket: VRTX3-T-0291
idea: VRTX3-I-0052
branch: vortex/fix/VRTX3-T-0291-smoke-bugfix-178769906754924-api-healthz-6ba9ec61
upstream: [artifacts/VRTX3-S-0043/VRTX3-T-0291/PLAN.md]
downstream: [artifacts/VRTX3-S-0043/VRTX3-T-0291/tdd-test-result.md]
---

# Fix note — VRTX3-T-0291

## Root cause

`routes/api/healthz-smoke-bugfix3-827939824.ts` was never written. Nitro builds its route
table by scanning `routes/` at build time; a path with no matching file has no handler, so
the request falls through to the SPA `index.html` shell. Confirmed: `ls routes/api/ | grep
827939824` returned nothing and `git log --all -S'827939824'` returned zero commits before
the fix — a never-written file, not a deleted or renamed one.

**Canvas status-code correction**: VRTX3-I-0052 states "Actual: 404 Not Found". Measured
live before the fix: `200 text/html; charset=utf-8` (949 B, the SPA shell), not 404. The
defect is real; the stated status code is not. The regression test and live check both
assert on body + `Content-Type`, never on status code alone.

## Minimal fix

Added the two files the ticket's ownership map allows:

- `routes/api/healthz-smoke-bugfix3-827939824.ts` — `defineHandler` from `nitro/h3`
  returning `{ ok: true, variant: "827939824" }`. Copied from
  `routes/api/healthz-smoke-528856326-a.ts` per PLAN.md's copy-source instruction (not
  either file the canvas names — both carry a `expect(elapsed).toBeLessThan(100)` timing
  assertion that PLAN.md flags as the harmful legacy shape).
- `routes/api/healthz-smoke-bugfix3-827939824.test.ts` — one `it()` case, real `H3Event`,
  asserts the exact body. Carries the fixed regression header comment from PLAN.md. No
  timing assertion (canvas AC-3 dropped deliberately — the no-I/O guarantee comes from the
  `nitro/h3`-only import surface, not a wall-clock number).

No other file touched.

## Files touched

- `routes/api/healthz-smoke-bugfix3-827939824.ts` (new)
- `routes/api/healthz-smoke-bugfix3-827939824.test.ts` (new)
