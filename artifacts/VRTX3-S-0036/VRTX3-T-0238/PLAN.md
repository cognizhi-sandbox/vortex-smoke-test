---
artifact: ticket-plan
spec: 1
status: complete
author_role: planning
sprint: VRTX3-S-0036
ticket: VRTX3-T-0238
idea: VRTX3-I-0043
upstream: artifacts/VRTX3-S-0036/SPRINT-PLAN.md
---

# Plan — VRTX3-T-0238: GET /api/healthz-smoke-450228657-a

## Objective

`GET /api/healthz-smoke-450228657-a` answers with `Content-Type: application/json` and a body deep-equal to `{ "ok": true, "variant": "450228657" }`, served by a new self-contained Nitro handler at `routes/api/healthz-smoke-450228657-a.ts` with a colocated integration test beside it. Two new files, zero modified files.

This ticket shares no file with VRTX3-T-0239 or VRTX3-T-0240 and has no ordering relationship to either — build and merge it whenever you pick it up.

## Design reference

None. `a2a_get_idea_design(ticket_key="VRTX3-T-0235")` returned `blocks: []` for VRTX3-I-0043, its **Wireframes** section is empty, and the idea puts UI explicitly out of scope: "No UI. Nothing is rendered, linked or navigable — this is API-only." Nothing visual to build to.

## Steps

1. Copy `routes/api/healthz-smoke-528856326-a.ts` → `routes/api/healthz-smoke-450228657-a.ts` and change the `variant` string to `"450228657"`. Change nothing else — no `event` parameter, no method guard, no extra import.

2. Copy `routes/api/healthz-smoke-528856326-a.test.ts` → `routes/api/healthz-smoke-450228657-a.test.ts` and update five things: the import path, the imported binding name, the `describe` title, the request URL, and the expected `variant`.

   **Copy that exact pair — not the one the idea names.** VRTX3-I-0043 names `routes/api/healthz-smoke-189360772-a.ts` / `.test.ts` as the reference, in its Solution, its AC-5 and its Current State sections. Diffed during planning, that pair is shape-identical to the pinned one — one `it()` case, a single body assertion — because `189360772` landed in VRTX3-S-0033, well after the flaky wall-clock case was dropped. So copying the named file would in fact be safe this time.

   Substitute anyway, and note the substitution in your work log. 47 of the 112 probe tests carry a second case this repo stopped writing:

   ```ts
   it("responds in under 100ms", async () => {
     const start = Date.now();
     await healthz(event);
     const elapsed = Date.now() - start;
     expect(elapsed).toBeLessThan(100);
   });
   ```

   Nothing in the directory distinguishes those 47 from the safe ones, and three prior canvases named one of them. **The [AGENTS.md § Health Probe Routes](../../../AGENTS.md#health-probe-routes) pointer outranks the pointer in an idea canvas**, whether or not the named file happens to be clean. Your new test has one `it()` case and one assertion: the response body.

   Nothing is lost by dropping the timing case. The property it reaches for — the handler does no I/O — is already guaranteed by the interface contract below (only import is `nitro/h3`, no `db/`, no `event.context` read). VRTX3-I-0043 reaches the same conclusion in its own Open Questions ("a sub-100ms check on a constant-returning handler measures the runtime, not the code"), so no acceptance criterion is contradicted.

3. Verify the route is actually wired by requesting the literal path against a running dev server and checking the **body and `Content-Type`**, not the status code. A path with no handler returns `200 text/html` (the 949-byte SPA `index.html` shell), so a status-code check passes whether or not the route exists — see [AGENTS.md § Gotchas](../../../AGENTS.md#gotchas). Measured before this ticket started: this path returned `200 text/html; charset=utf-8` (949 B); the control `/api/healthz-smoke-528856326-a` returned `200 application/json;charset=UTF-8` (33 B).

   Read the port from the Vite banner. It bound `:5001` during planning (`Port 5000 is in use, trying another one...`), after four sprints on `:5000`, and the wider series has produced `:5000`–`:5007` — contention, not a trend, so it is not predictable in either direction. Measuring against the wrong port yields connection errors that look like a broken route.

   Note that the unit test in step 2 imports the handler module directly, so it passes even if Nitro never registered the path. This live check is the only step that proves the route is wired.

4. Run the project's standard verification gate and the production build before finishing.

## File/module ownership

| File                                           | Action | Notes                                        |
| ---------------------------------------------- | ------ | -------------------------------------------- |
| `routes/api/healthz-smoke-450228657-a.ts`      | CREATE | The handler. Owned solely by this ticket.    |
| `routes/api/healthz-smoke-450228657-a.test.ts` | CREATE | Colocated test. Owned solely by this ticket. |

**Nothing else.** No existing file may be modified — not `vite.config.ts`, not `vitest.config.ts`, not `.github/workflows/ci.yml`, not `package.json`, not `README.md`, not a root doc, not a sibling probe. `AGENTS.md` / `PRODUCT.md` / `ARCHITECTURE.md` / `DESIGN.md` are out of this ticket's scope entirely; the planner has already brought them to their target state, including the 112 → 115 probe-count bump. A modified existing file is the signal that scope drifted.

VRTX3-I-0043's out-of-scope list says "No OpenAPI/docs entry or monitoring integration" — consistent with the above, and the repo has no OpenAPI artifact to add to. There is no documentation work on this ticket.

## Interface contracts

FIXED — do not change, and do not negotiate with the sibling tickets:

- **URL:** `/api/healthz-smoke-450228657-a`, character for character. The filename **is** the URL registration; there is no route table, so a typo is a wrong URL with no other symptom.
- **Response body:** exactly `{ ok: true, variant: "450228657" }` — `ok` is the boolean `true`, `variant` is the **string** `"450228657"` (not a number, and not suffixed with `-a`). All three probes in this sprint carry the identical variant string; the `a`/`b`/`c` distinction lives in the URL only.
- **Handler shape:** a single default export, `defineHandler` imported from `nitro/h3`, taking no parameters and returning the object literal:

  ```ts
  import { defineHandler } from "nitro/h3";

  export default defineHandler(() => {
    return {
      ok: true,
      variant: "450228657",
    };
  });
  ```

- **No shared code.** No import of a sibling probe, and no new helper, factory, constants file or barrel export. The duplication is deliberate — see [ARCHITECTURE.md § Key Decisions](../../../ARCHITECTURE.md#key-decisions), and the idea's own out-of-scope list ("Duplication across the three files is intentional"). A reviewer asking to factor out a shared handler is asking to delete the property under test.
- **No request state.** No params, query, body, headers, or `event.context.user`; no `db/` import; no auth call. `middleware/auth.ts` still runs on the request and still sets `event.context.user` — the handler must simply ignore it, so the probe stays answerable when auth and the database are unavailable. This is idea AC-6, satisfied structurally rather than by a test.
- **No method guard.** Every verb returns the same 200 body, consistent with the other 112 probes. Do not add a 405.
- **Test file suffix:** `.test.ts`, colocated in `routes/api/`. `vite.config.ts`'s `nitro({ ignore: ["**/*.test.ts"] })` is what keeps it out of the server bundle, and `vitest.config.ts`'s `server` project (`environment: "node"`, `include: ["routes/**/*.test.ts"]`) is what collects it. Rename it or move it and both properties break at once — a `.test.ts` outside `routes/` runs under the jsdom `client` project and fails on the `nitro/h3` import.

## Definition of Done

Tracked as this ticket's acceptance criteria in the FSM. Summarized: the handler and its colocated single-assertion test exist and hold to the contracts above; a live request returns `application/json` with the exact body rather than the SPA shell; the test is collected by Vitest's `server` project unchanged; the production build emits `.output/server/_routes/api/healthz_smoke_450228657_a.mjs` with no `*.test.ts` in the bundle; and the diff is exactly two new files with no dependency added.

## Test plan

| Test                                                               | Expected outcome                                                                                             |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| New colocated `routes/api/healthz-smoke-450228657-a.test.ts`       | Handler returns `{ ok: true, variant: "450228657" }` — passes                                                |
| The 112 pre-existing probe tests + the rest of the unit suite      | Unchanged, still green (this ticket touches none of their files)                                             |
| Live request to `/api/healthz-smoke-450228657-a` on the dev server | `application/json` + the exact JSON body (proves Nitro registered it)                                        |
| Production build                                                   | Succeeds; emits `.output/server/_routes/api/healthz_smoke_450228657_a.mjs`, and no `*.test.ts` in the bundle |

Idea AC-8 — "removing or reverting any one of the three endpoints leaves the other two passing their tests unchanged" — holds structurally here: this ticket reads no sibling file, so its two files stand alone whether or not `-b` and `-c` have landed.
