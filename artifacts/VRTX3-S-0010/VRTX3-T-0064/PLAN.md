# Plan — VRTX3-T-0064: Implement GET /api/healthz-smoke-46132092-a

**Sprint:** VRTX3-S-0010 · **Story:** VRTX3-T-0063 · **Epic:** VRTX3-T-0062
**Sprint plan:** [../SPRINT-PLAN.md](../SPRINT-PLAN.md)
**Created:** 2026-08-09

---

## Objective

`GET /api/healthz-smoke-46132092-a` on the running app answers with `Content-Type:
application/json` and the body `{"ok":true,"variant":"46132092"}`, backed by a self-contained
eight-line Nitro handler and a colocated H3Event integration test. Purely additive — two new
files, zero existing files modified, no shared helper, no config change. When this is done the
endpoint is indistinguishable in shape from the 45 `healthz-smoke-*` routes already in
`routes/api/`, and it shares no code with its two peer endpoints (`-b`, `-c`) being built in
parallel.

## Steps

1. **Re-check the name is still free.** `grep -rl "46132092" routes/` — expect no hits for the
   `-a` files. (It was clean at planning time on 2026-08-09.)
2. **Create `routes/api/healthz-smoke-46132092-a.ts`**, copying
   `routes/api/healthz-smoke-913793173-a.ts` verbatim and changing only the variant string:

   ```ts
   import { defineHandler } from "nitro/h3";

   export default defineHandler(() => {
     return {
       ok: true,
       variant: "46132092",
     };
   });
   ```

   Nitro serialises the returned object, sets `Content-Type: application/json` and returns 200
   — do not set any of that by hand. Do not add a method guard, auth check or database call.

3. **Create `routes/api/healthz-smoke-46132092-a.test.ts`**, copying
   `routes/api/healthz-smoke-913793173-a.test.ts` and changing only the path and variant:

   ```ts
   import { H3Event } from "nitro/h3";
   import { describe, expect, it } from "vitest";

   import healthz from "./healthz-smoke-46132092-a";

   describe("GET /api/healthz-smoke-46132092-a", () => {
     it("returns HTTP 200 with correct response body", async () => {
       const event = new H3Event(new Request("http://localhost/api/healthz-smoke-46132092-a"));

       const result = await healthz(event);

       expect(result).toEqual({ ok: true, variant: "46132092" });
     });

     it("responds in under 100ms", async () => {
       const event = new H3Event(new Request("http://localhost/api/healthz-smoke-46132092-a"));

       const start = Date.now();
       await healthz(event);
       const elapsed = Date.now() - start;

       expect(elapsed).toBeLessThan(100);
     });
   });
   ```

   The `under 100ms` case is carried over for pattern consistency with its 45 siblings. It is
   deliberately **not** an acceptance criterion — a wall-clock assertion is load-dependent. If
   it ever flakes in CI, that is not a defect in this endpoint.

4. **Prove the route is actually wired with a live request**, not just a green test. Start the
   dev server and check the **body and `Content-Type`**:

   ```
   200 application/json;charset=UTF-8  {"ok":true,"variant":"46132092"}   ← wired
   200 text/html; charset=utf-8        <!doctype html>…                   ← NOT wired (SPA shell)
   ```

   Confirm the same for `POST` — it must return the identical JSON body, matching the
   method-agnostic behaviour of every sibling handler.

5. **Confirm the route compiled into the production server**: the build emits
   `.output/server/_routes/api/healthz_smoke_46132092_a.mjs` (dashes become underscores).
6. Run your standard verification gate before finishing.

## File/module ownership

**Create:**

| File                                          | Purpose                              |
| --------------------------------------------- | ------------------------------------ |
| `routes/api/healthz-smoke-46132092-a.ts`      | The handler (8 lines)                |
| `routes/api/healthz-smoke-46132092-a.test.ts` | H3Event integration test (~25 lines) |

**Modify:** none.

**Do not touch** — owned by a peer TASK or frozen for this sprint: any `*-46132092-b*` or
`*-46132092-c*` file (VRTX3-T-0065 / VRTX3-T-0066), the 45 existing `routes/api/` handlers,
`vite.config.ts`, `vitest.config.ts`, `nginx.conf`, `ecosystem.config.js`, `Dockerfile`,
`package.json`, `.github/workflows/ci.yml`, `e2e/**`.

This ownership map is disjoint from both peers', so there is **no `depends_on` on this ticket**
and no rebase is expected. If you find yourself needing to edit a file outside this map, stop
and escalate rather than widening the map.

## Interface contracts

**FIXED — do not change; peers code against the identical shape:**

- Response body is exactly `{ ok: true, variant: "46132092" }` — two keys, nothing more.
  `ok` is the boolean `true`; `variant` is the **string** `"46132092"` (not a number).
- The module **default-exports** the result of `defineHandler` imported from `"nitro/h3"`, so
  the test can `import healthz from "./healthz-smoke-46132092-a"` and call it with an
  `H3Event`.
- Path is exactly `/api/healthz-smoke-46132092-a`, derived from the filename — there is no
  route table to register in.
- No method guard: every verb returns the same body.

## Definition of Done

The authoritative list is this ticket's `acceptance_criteria` field. In short: the two files
exist in the shape above, the live request proves wiring by body + `Content-Type`, the new
assertions pass, the route appears in the production build output, independence holds (no
cross-imports, no new shared module), and no existing file is modified.

## Test plan

| Test                                          | Tier                      | Expected outcome                                      |
| --------------------------------------------- | ------------------------- | ----------------------------------------------------- |
| `returns HTTP 200 with correct response body` | Vitest `server` (node)    | `toEqual({ ok: true, variant: "46132092" })` passes   |
| `responds in under 100ms`                     | Vitest `server` (node)    | Passes; not an acceptance criterion (flake-prone)     |
| Live `GET` on the running app                 | Manual / live request     | `application/json` + exact JSON body, not the shell   |
| Live `POST` on the running app                | Manual / live request     | Same 200 JSON body as `GET`                           |
| Production build output                       | Build artefact inspection | `.../_routes/api/healthz_smoke_46132092_a.mjs` exists |

**No new harness work.** `vitest.config.ts` already includes `routes/**/*.test.ts` in the
`server` project (`environment: "node"`) — the new test is discovered with zero registration.
**No new CI work.** `.github/workflows/ci.yml` already triggers on push _and_ pull_request for
`vortex/**` and runs typecheck → lint → test → build under bun; the new files are picked up by
the existing steps.

**Do not** add a shared test helper across the three new tests — the duplication is the point
of the exercise, and a shared fixture would break the independence this sprint measures.

## Why a green unit test is not enough

The test imports the handler module **directly**, so it passes even if Nitro never mapped the
path. And an unmatched `/api/*` path answers `200 text/html` (the SPA `index.html` shell), not
`404` — so a status-code check passes whether or not the route exists. Four sprints acted on
"returns 404" reports that were really this fallback. That is why step 4 asserts on body and
`Content-Type`, and why it is a required acceptance criterion rather than a nice-to-have.
