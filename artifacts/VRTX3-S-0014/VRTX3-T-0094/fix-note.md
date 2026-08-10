# VRTX3-T-0094 — Fix note

## Root cause

`routes/api/healthz-smoke-bugfix3-404580234.ts` was never created. Nitro 3 resolves
`/api/<name>` purely from the presence of `routes/api/<name>.ts` — there is no route
registry or manifest, so a file that was never written is a path that was never
registered. Repo-wide grep for `404580234` returned zero matches before the fix,
ruling out a filename typo. The unmatched path fell through to the SPA `index.html`
shell (`200 text/html`), not a `404` as the ticket stated — re-measured against a
live `bun run dev` (see PLAN.md § Reproduction).

## Minimal fix

Added exactly two files, copied from `routes/api/healthz-smoke-528856326-a.ts` (+
its `.test.ts`) verbatim apart from the route name / variant string:

- `routes/api/healthz-smoke-bugfix3-404580234.ts` — `defineHandler` from `nitro/h3`
  returning `{ ok: true, variant: "404580234" }`. No method guard, no `db/` import,
  no `event.context` read, no shared helper — matches sibling probes and the
  fixed interface contract in PLAN.md.
- `routes/api/healthz-smoke-bugfix3-404580234.test.ts` — constructs an `H3Event`,
  calls the handler, single `toEqual` assertion. No elapsed-time case.

No existing file modified.

## Files touched

- `routes/api/healthz-smoke-bugfix3-404580234.ts` (new)
- `routes/api/healthz-smoke-bugfix3-404580234.test.ts` (new)
