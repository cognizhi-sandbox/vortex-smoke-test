# VRTX3-T-0124 — Fix note

**Root cause:** `routes/api/healthz-smoke-bugfix2-502272230.ts` was never written. Nitro 3
resolves `/api/<name>` purely from the presence of `routes/api/<name>.ts` (no registry, no
manifest) — a repo-wide grep for `502272230` returned zero matches prior to this fix, confirming
a never-written file rather than a typo. The unmatched request fell through to the SPA
`index.html` catch-all, which answers `200 text/html` — not the `404` the ticket reported (see
`PLAN.md` § 1 for the re-measurement). The `404 → 200` shape therefore proves nothing; verification
must assert on response body + `Content-Type`.

**Fix (minimal, purely additive):** added the handler, copied verbatim from
`routes/api/healthz-smoke-528856326-a.ts` with only the variant string and route name changed —
no method guard, no auth, no db import, no shared helper.

**Files touched:**

- `routes/api/healthz-smoke-bugfix2-502272230.ts` (new) — default-exports `defineHandler` from
  `nitro/h3` returning `{ ok: true, variant: "502272230" }`.
- `routes/api/healthz-smoke-bugfix2-502272230.test.ts` (new) — regression test, single body
  assertion via a real `H3Event`, no wall-clock assertion.

No existing file modified.
