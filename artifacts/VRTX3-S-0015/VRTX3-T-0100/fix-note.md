# VRTX3-T-0100 — Fix note

**Root cause:** `routes/api/healthz-smoke-bugfix3-418626414.ts` was never created. Nitro 3
resolves `/api/<name>` purely from the presence of `routes/api/<name>.ts` (no route
registry), so the never-written file meant the request fell through to the SPA
`index.html` catch-all. Confirmed by a repo-wide grep for `418626414` (zero matches
before the fix) and a live dev-server request returning `200 text/html; charset=utf-8`
(SPA shell) instead of JSON.

**Reported status code was wrong, now corrected:** the ticket claimed 404; measured
behavior is `200 text/html` from the SPA fallback. The defect (missing route) is real;
the stated status code was a mis-transcription. Verification therefore asserts on
response body + `Content-Type`, not on a 404→200 transition.

**Fix:** added the missing handler, copied verbatim (apart from the variant string) from
the `528856326-a` reference pair per `AGENT.md` § Health Probe Routes — no shared
helper/factory/constants, no method guard, no `event.context` or `db/` access.

**Files touched:**

- `routes/api/healthz-smoke-bugfix3-418626414.ts` (new) — handler returning
  `{ ok: true, variant: "418626414" }`.
- `routes/api/healthz-smoke-bugfix3-418626414.test.ts` (new) — colocated H3Event
  integration test, single body-equality assertion, no timing assertion.

No existing file modified.
