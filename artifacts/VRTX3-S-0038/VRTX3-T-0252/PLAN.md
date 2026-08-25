---
artifact: ticket-plan
spec: 1
status: complete
author_role: planning
sprint: VRTX3-S-0038
ticket: VRTX3-T-0252
change: vrtx3-i-0047-smoke-178761821653473-3-independent-endpoints-99
branch: vortex/sprint/vrtx3-s-0038-099d395a
upstream: [artifacts/VRTX3-S-0038/SPRINT-PLAN.md]
---

# Plan — VRTX3-T-0252: Add `/api/healthz-smoke-992401223-a`

## Objective

`GET /api/healthz-smoke-992401223-a` answers with `Content-Type: application/json` and the body
`{"ok":true,"variant":"992401223"}`. Today that path is unrouted and is answered by the SPA
`index.html` shell. The work is two new files and nothing else.

## Spec reference

`openspec/changes/vrtx3-i-0047-smoke-178761821653473-3-independent-endpoints-99/specs/health-probes/spec.md`,
requirement **"Health probe A for variant 992401223"**. Each of this ticket's five acceptance
criteria is derived one-for-one from a scenario under that requirement, so a QA verdict traces
back to a named behaviour. `tasks.md` items 1.1–1.3 are tagged with this ticket key.

## Design reference

None. Idea VRTX3-I-0047's design manifest is empty (`blocks: []`) and the idea puts UI explicitly
out of scope — this change adds no screen, page, flow or navigable surface. Nothing was exported to
`artifacts/VRTX3-S-0038/design/` because there was nothing to export, and this section records that
as a finding rather than an omission.

## Current state, measured

Measured live during planning on a dev server (Vite bound `:5000` in the planning container —
**read your own banner**, the port is per-container and has ranged `:5000`–`:5007`):

```
/api/healthz-smoke-992401223-a   →  200 text/html; charset=utf-8        949 B  (SPA shell)
/api/healthz-smoke-528856326-a   →  200 application/json;charset=UTF-8   33 B  {"ok":true,"variant":"528856326"}
```

A repo-wide grep for `992401223` returns zero matches — a never-written file, not a typo'd
filename or a broken handler.

**Do not verify by status code.** An unmatched `/api/*` path falls through to the SPA shell with
`200 text/html`, so a `404 → 200` check passes whether or not your route exists. Assert on the
response body and `Content-Type`.

## Copy source — read this before you open an editor

Copy **`routes/api/healthz-smoke-528856326-a.ts`** and its `.test.ts` sibling.

The idea canvas names `healthz-smoke-189360772-a` instead. That pair was diffed during planning and
carries no wall-clock assertion, so following the canvas would have been harmless here — the
substitution is applied anyway, because 47 of the 118 probe tests carry a flaky
`expect(elapsed).toBeLessThan(100)` case and the directory offers no way to tell a safe neighbour
from a legacy one. **Record the substitution in your work log.**

Do not add a timing assertion. The property it reaches for — the handler performs no I/O — is
already guaranteed by the interface contract below: the only import is `nitro/h3`, nothing under
`db/` is touched, and no event property is read.

## Steps

1. Create `routes/api/healthz-smoke-992401223-a.ts` with exactly this content →
   **verify:** the file's only import is `defineHandler` from `nitro/h3`, and the variant string
   reads `992401223`, not the template's `528856326`.

   ```ts
   import { defineHandler } from "nitro/h3";

   export default defineHandler(() => {
     return {
       ok: true,
       variant: "992401223",
     };
   });
   ```

2. Create `routes/api/healthz-smoke-992401223-a.test.ts` with exactly this content →
   **verify:** the single `it()` block asserts the returned object and there is no second case.

   ```ts
   import { H3Event } from "nitro/h3";
   import { describe, expect, it } from "vitest";

   import healthzA from "./healthz-smoke-992401223-a";

   describe("GET /api/healthz-smoke-992401223-a", () => {
     it("returns HTTP 200 with correct response body", async () => {
       const event = new H3Event(new Request("http://localhost/api/healthz-smoke-992401223-a"));

       const result = await healthzA(event);

       expect(result).toEqual({ ok: true, variant: "992401223" });
     });
   });
   ```

3. Run the repository's core gate (lint, typecheck, unit tier) →
   **verify:** the new test file is collected and green; lint reports no warning.

4. Start the dev server, read the port from the banner, and request the path →
   **verify:** `Content-Type` is `application/json` and the body is `{"ok":true,"variant":"992401223"}`.
   A `text/html` response of ~949 bytes means the route did not register — check the filename.

5. Produce a production build →
   **verify:** `.output/server/_routes/api/healthz_smoke_992401223_a.mjs` exists (Nitro converts
   dashes to underscores) and no `.test.ts` file was bundled.

## Interface contract — fixed, do not change

- **Path:** `/api/healthz-smoke-992401223-a`, produced solely by the filename
  `routes/api/healthz-smoke-992401223-a.ts`. There is no route table; a filename typo is a wrong URL
  with no other symptom.
- **Response body:** `{ ok: true, variant: "992401223" }` — `variant` is a **string**, and the value
  is the same on all three probes of this trio, not a per-probe value.
- **Imports:** `defineHandler` from `nitro/h3` only. No `db/`, no `event.context.user`, no sibling
  probe, no shared helper.
- **Method handling:** none. Like all 118 existing probes, this handler declares no method guard and
  answers every verb with the same body. Do not add a `405` — it would make this route inconsistent
  with the entire family, and the idea puts method handling out of scope.

## File/module ownership map

| File                                           | Action |
| ---------------------------------------------- | ------ |
| `routes/api/healthz-smoke-992401223-a.ts`      | create |
| `routes/api/healthz-smoke-992401223-a.test.ts` | create |

Nothing else. No existing file under `routes/api/`, nothing in `src/`, no `vite.config.ts`, no
`package.json`, no migration, no root document. The two sibling tickets own the other four files;
the three maps are disjoint, which is why no `depends_on` edge exists between them.

## Out of scope

Auth, rate limiting, database access, real liveness checking, any frontend or navigation change,
monitoring or dashboard wiring, non-`GET` method handling, response-shape negotiation, and any
refactor of the existing probe family.
