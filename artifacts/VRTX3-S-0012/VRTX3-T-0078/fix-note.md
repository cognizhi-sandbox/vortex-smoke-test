# VRTX3-T-0078 — Fix note

**Root cause:** `routes/api/healthz-smoke-bugfix2-433928318.ts` was never created. Nitro 3
resolves `/api/<name>` purely from the presence of `routes/api/<name>.ts` — no registry or
manifest — so the missing file meant the path was never registered. Repo-wide
`grep -rn "433928318"` returned zero matches before this fix, ruling out a filename typo.
The request fell through to the SPA `index.html` catch-all, which returns HTTP 200
`text/html` — this is why the ticket's reported "404" is wrong; measured directly on
`bun run dev`, the unmatched path returned `200 text/html; charset=utf-8`, not 404.

**Fix (minimal, purely additive):** added the handler exactly per the fixed interface
contract in the ticket/PLAN.md, copying the sibling `healthz-smoke-bugfix3-993514120`
pattern — no auth, no `db/` import, no method guard, no shared helper.

**Files touched:**

- `routes/api/healthz-smoke-bugfix2-433928318.ts` (created) — handler returning
  `{ ok: true, variant: "433928318" }`.
- `routes/api/healthz-smoke-bugfix2-433928318.test.ts` (created) — regression test, real
  `H3Event` against the handler module.

**Verification beyond the regression test:** live `bun run dev` request now returns
`200 application/json;charset=UTF-8` with body `{"ok":true,"variant":"433928318"}`
(previously `200 text/html; charset=utf-8`, the SPA shell). Production build emits
`.output/server/_routes/api/healthz_smoke_bugfix2_433928318.mjs`; no `*.test.ts`-derived
module appears under `.output/server/_routes/`.

No other file modified.
