# VRTX3-T-0123 — Fix note

## Root cause

`routes/api/healthz-smoke-bugfix-699186705.ts` was never written. Nitro 3
(`serverDir: "./"`, `vite.config.ts:29`) resolves `/api/<name>` purely from the
presence of `routes/api/<name>.ts` — no registry, no manifest. A repo-wide grep for
`699186705` returned zero matches before the fix, confirming a never-written file, not
a typo. The unmatched path fell through to the SPA catch-all, which serves `200
text/html` — **not** the `404` the ticket reported. Measured live on `bun run dev`
(port 5005 — 5000–5004 were in use): target returned `200 text/html; charset=utf-8`
(SPA shell), control `/api/healthz-smoke-528856326-a` returned `200
application/json;charset=UTF-8` `{"ok":true,"variant":"528856326"}`.

## Fix

Minimal, purely additive — copied `routes/api/healthz-smoke-528856326-a.ts` and its
colocated test verbatim, changing only the variant string and route name (per
`AGENT.md` § Health Probe Routes — the `528856326` pair is the designated copy source,
not the older files 47/68 sibling tests carry a flaky `responds in under 100ms` case
that must not be propagated).

## Files touched

- `routes/api/healthz-smoke-bugfix-699186705.ts` — new handler, returns
  `{ ok: true, variant: "699186705" }`.
- `routes/api/healthz-smoke-bugfix-699186705.test.ts` — new regression test (H3Event,
  single body-equality assertion, no wall-clock case).

No existing file modified.
