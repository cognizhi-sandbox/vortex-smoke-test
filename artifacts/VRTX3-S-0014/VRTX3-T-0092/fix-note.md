# VRTX3-T-0092 — fix note

**Root cause:** `routes/api/healthz-smoke-bugfix-174694844.ts` was never created. Nitro resolves
`/api/<name>` purely from the presence of `routes/api/<name>.ts` — a file that was never written is
a path that was never registered, so the request fell through to the SPA `index.html` catch-all
(HTTP 200, `text/html`, not the reported 404). Repo-wide grep for `174694844` returned zero matches,
ruling out a filename typo. Full detail in `PLAN.md` §§1–2 (already on branch).

**Minimal fix:** added the missing handler, copied verbatim from `routes/api/healthz-smoke-528856326-a.ts`
apart from the route name and variant string:

```ts
import { defineHandler } from "nitro/h3";

export default defineHandler(() => {
  return {
    ok: true,
    variant: "174694844",
  };
});
```

**Files touched:**

- `routes/api/healthz-smoke-bugfix-174694844.ts` (new) — the handler.
- `routes/api/healthz-smoke-bugfix-174694844.test.ts` (new) — regression test, single assertion,
  no elapsed-time case (mirrors the `528856326` pair per `AGENT.md` § Health Probe Routes).

No existing file modified. No shared helper/factory/constants introduced (deliberate duplication,
per `ARCHITECTURE.md` § Key Decisions).
