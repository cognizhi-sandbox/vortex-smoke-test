# VRTX3-T-0125 — Fix note

## Root cause

`routes/api/healthz-smoke-bugfix3-850084489.ts` was never written. Nitro 3 (`serverDir: "./"`,
`vite.config.ts:29`) resolves `/api/<name>` purely from the presence of `routes/api/<name>.ts` — no
registry, no manifest. Repo-wide grep for `850084489` returned zero matches before the fix,
confirming a never-written file rather than a typo. The unmatched path fell through to the SPA
catch-all, which serves `200 text/html; charset=utf-8` (the `index.html` shell) — **not** the `404`
the original report claimed. Re-measured live on `bun run dev` (port `5005`): missing route →
`200 text/html; charset=utf-8`; control `/api/healthz-smoke-528856326-a` → `200
application/json;charset=UTF-8`, `{"ok":true,"variant":"528856326"}`. Per `AGENT.md` § Gotchas, a
status-code check alone can't distinguish a missing route from a working one — verification must
assert on body + `Content-Type`.

## Minimal fix

Added exactly the missing handler, copied verbatim from `routes/api/healthz-smoke-528856326-a.ts`
(the documented copy-source, not an older probe with the flaky wall-clock assertion) with only the
variant string changed:

```ts
// routes/api/healthz-smoke-bugfix3-850084489.ts
import { defineHandler } from "nitro/h3";

export default defineHandler(() => {
  return {
    ok: true,
    variant: "850084489",
  };
});
```

## Files touched

- `routes/api/healthz-smoke-bugfix3-850084489.ts` — new handler (create).
- `routes/api/healthz-smoke-bugfix3-850084489.test.ts` — new regression test, mirrors
  `healthz-smoke-528856326-a.test.ts`, single body-equality assertion, no wall-clock case (create).

No existing file modified. No shared handler/factory/constants/barrel introduced. No auth/db import,
no method guard.

## Verification beyond the unit test

- Live `bun run dev` (port 5005): `GET /api/healthz-smoke-bugfix3-850084489` →
  `200 application/json;charset=UTF-8`, body `{"ok":true,"variant":"850084489"}` — exact match,
  string variant, no extra keys.
- `bun run build`: emitted `.output/server/_routes/api/healthz_smoke_bugfix3_850084489.mjs`; no
  `*test*` module present under `.output/server/_routes/`.
- `git status --porcelain`: exactly the two new files, nothing else changed.
