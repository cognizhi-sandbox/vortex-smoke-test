---
artifact: ticket-plan
spec: 1
status: complete
author_role: planning
sprint: VRTX3-S-0039
ticket: VRTX3-T-0261
change: vrtx3-i-0048-smoke-178762111363042-3-independent-endpoints-81
branch: vortex/sprint/vrtx3-s-0039-4e9a09bd
upstream: [artifacts/VRTX3-S-0039/SPRINT-PLAN.md]
---

# Plan — VRTX3-T-0261: Add `/api/healthz-smoke-812788042-b`

## Objective

`GET /api/healthz-smoke-812788042-b` answers with `Content-Type: application/json` and the body
`{"ok":true,"variant":"812788042"}`. Today that path is unrouted and is answered by the SPA
`index.html` shell. The work is two new files and nothing else.

## Spec reference

`openspec/changes/vrtx3-i-0048-smoke-178762111363042-3-independent-endpoints-81/specs/health-probes/spec.md`,
requirement **"Health probe B for variant 812788042"**. Each of this ticket's five acceptance
criteria is derived one-for-one from a scenario under that requirement, so a QA verdict traces
back to a named behaviour. The `tasks.md` items in its section are tagged with this ticket key.

## Design reference

None. Idea VRTX3-I-0048's design manifest is empty (`blocks: []`), its Wireframes section is empty,
and the idea puts UI explicitly out of scope — this change adds no screen, page, flow or navigable
surface. Nothing was exported to `artifacts/VRTX3-S-0039/design/` because there was nothing to
export, and this section records that as a finding rather than an omission.

## Current state, measured

Measured live during planning on a dev server (Vite bound `:5001` in the planning container after
reporting `Port 5000 is in use` — **read your own banner**, the port is per-container and has
ranged `:5000`–`:5007`):

```
/api/healthz-smoke-812788042-b   →  200 text/html; charset=utf-8        949 B  (SPA shell)
/api/healthz-smoke-528856326-a   →  200 application/json;charset=UTF-8   33 B  {"ok":true,"variant":"528856326"}
```

A repo-wide grep for `812788042` returns zero matches — a never-written file, not a typo'd
filename or a broken handler.

**Do not verify by status code.** An unmatched `/api/*` path falls through to the SPA shell with
`200 text/html`, so a `404 → 200` check passes whether or not your route exists. Assert on the
response body and `Content-Type`.

## Copy source — read this before you open an editor

Copy **`routes/api/healthz-smoke-528856326-a.ts`** and its `.test.ts` sibling.

The idea canvas names `healthz-smoke-1065915107-a.ts` and `healthz-smoke-1065915107-c.test.ts`
instead. Both were diffed during planning and carry no wall-clock assertion, so following the canvas
would have been harmless here — the substitution is applied anyway, because 47 of the 121 probe
tests carry a flaky `expect(elapsed).toBeLessThan(100)` case and the directory offers no way to
tell a safe neighbour from a legacy one. **Record the substitution in your work log.**

Do not add a timing assertion. The property it reaches for — the handler performs no I/O — is
already guaranteed by the interface contract below: the only import is `nitro/h3`, nothing under
`db/` is touched, and no event property is read.

## Steps

1. Create `routes/api/healthz-smoke-812788042-b.ts` with exactly this content →
   **verify:** the file's only import is `defineHandler` from `nitro/h3`, and the variant string
   reads `812788042`, not the template's `528856326`.

   ```ts
   import { defineHandler } from "nitro/h3";

   export default defineHandler(() => {
     return {
       ok: true,
       variant: "812788042",
     };
   });
   ```

2. Create `routes/api/healthz-smoke-812788042-b.test.ts` with exactly this content →
   **verify:** the single `it()` block asserts the returned object and there is no second case.

   ```ts
   import { H3Event } from "nitro/h3";
   import { describe, expect, it } from "vitest";

   import healthzB from "./healthz-smoke-812788042-b";

   describe("GET /api/healthz-smoke-812788042-b", () => {
     it("returns HTTP 200 with correct response body", async () => {
       const event = new H3Event(new Request("http://localhost/api/healthz-smoke-812788042-b"));

       const result = await healthzB(event);

       expect(result).toEqual({ ok: true, variant: "812788042" });
     });
   });
   ```

3. Run the repository's core gate (lint, typecheck, unit tier) →
   **verify:** the new test file is collected and green; lint reports no warning.

4. Start the dev server, read the port from the banner, and request the path →
   **verify:** `Content-Type` is `application/json` and the body is `{"ok":true,"variant":"812788042"}`.
   A `text/html` response of ~949 bytes means the route did not register — check the filename.

5. Produce a production build →
   **verify:** `.output/server/_routes/api/healthz_smoke_812788042_b.mjs` exists (Nitro converts
   dashes to underscores) and no `.test.ts` file was bundled.

## Interface contract — fixed, do not change

- **Path:** `/api/healthz-smoke-812788042-b`, produced solely by the filename
  `routes/api/healthz-smoke-812788042-b.ts`. There is no route table; a filename typo is a wrong URL
  with no other symptom.
- **Response body:** `{ ok: true, variant: "812788042" }` — `variant` is a **string**, and the value
  is the same on all three probes of this trio, not a per-probe value.
- **Imports:** `defineHandler` from `nitro/h3` only. No `db/`, no `event.context.user`, no sibling
  probe, no shared helper, factory, constants file or barrel export.
- **Method handling:** none. Like all 121 existing probes, this handler declares no method guard and
  answers every verb with the same body. Do not add a `405` — it would make this route inconsistent
  with the entire family, and the idea puts method handling out of scope.

## File/module ownership map

| File                                           | Action |
| ---------------------------------------------- | ------ |
| `routes/api/healthz-smoke-812788042-b.ts`      | create |
| `routes/api/healthz-smoke-812788042-b.test.ts` | create |

Nothing else. No existing file under `routes/api/`, nothing in `src/`, no `vite.config.ts`, no
`package.json`, no migration, no root document. The two sibling tickets own the other four files;
the three maps are disjoint, which is why no `depends_on` edge exists between them.

## Out of scope

Auth, rate limiting, database access, real liveness checking, any frontend or navigation change,
monitoring or dashboard wiring, non-`GET` method handling, response-shape negotiation, OpenAPI or
docs generation, Playwright coverage, and any refactor or cleanup of the existing probe family.
