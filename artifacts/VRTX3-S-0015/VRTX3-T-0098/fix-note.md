# VRTX3-T-0098 — Fix note

**Root cause:** `routes/api/healthz-smoke-bugfix-406186407.ts` was never created. Nitro 3
resolves `/api/<name>` purely from the presence of `routes/api/<name>.ts` — no registry, no
import list — so a never-written file is a never-registered path, and the request fell
through to the SPA `index.html` catch-all (confirmed live: `200 text/html; charset=utf-8`
before the fix, vs. `200 application/json;charset=UTF-8` for a working control route).
Repo-wide grep for `406186407` returned zero matches before this fix, ruling out a filename
typo.

**Minimal fix:** added the missing handler, copied verbatim (apart from route name and
variant) from `routes/api/healthz-smoke-528856326-a.ts`, the current copy-source per
`AGENT.md § Health Probe Routes` (not an older probe, which would carry a flaky
`responds in under 100ms` assertion).

**Files touched:**

- `routes/api/healthz-smoke-bugfix-406186407.ts` (new) — default-exports `defineHandler`
  from `nitro/h3`, returns `{ ok: true, variant: "406186407" }`. No auth, no db import, no
  method guard, no shared helper — matches the fixed interface contract in
  `artifacts/VRTX3-S-0015/VRTX3-T-0098/PLAN.md`.
- `routes/api/healthz-smoke-bugfix-406186407.test.ts` (new) — regression test, colocated,
  constructs a real `H3Event`, single deep-equal assertion, no timing assertion.

No existing file was modified.
