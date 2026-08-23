---
artifact: ticket-plan
spec: 1
status: complete
author_role: planning
sprint: VRTX3-S-0035
ticket: VRTX3-T-0231
idea: VRTX3-I-0042
upstream: artifacts/VRTX3-S-0035/SPRINT-PLAN.md
---

# Plan — VRTX3-T-0231: GET /api/healthz-smoke-180848429-b

## Objective

`GET /api/healthz-smoke-180848429-b` answers with `Content-Type: application/json` and a body deep-equal to `{ "ok": true, "variant": "180848429" }`, served by a new self-contained Nitro handler at `routes/api/healthz-smoke-180848429-b.ts` with a colocated integration test beside it. Two new files, zero modified files.

This ticket shares no file with VRTX3-T-0230 or VRTX3-T-0232 and has no ordering relationship to either — build and merge it whenever you pick it up.

## Design reference

None. `a2a_get_idea_design(ticket_key="VRTX3-T-0227")` returned `blocks: []` for VRTX3-I-0042, its **Wireframes** section is empty, and the idea puts UI explicitly out of scope: "nothing in `src/` changes; no page links to these endpoints." Nothing visual to build to.

## Steps

1. Copy `routes/api/healthz-smoke-528856326-a.ts` → `routes/api/healthz-smoke-180848429-b.ts` and change the `variant` string to `"180848429"`. Change nothing else — no `event` parameter, no method guard, no extra import.

2. Copy `routes/api/healthz-smoke-528856326-a.test.ts` → `routes/api/healthz-smoke-180848429-b.test.ts` and update five things: the import path, the imported binding name, the `describe` title, the request URL, and the expected `variant`.

   **Copy that exact pair — not the one the idea names.** VRTX3-I-0042 names `routes/api/healthz-smoke-913793173-a.ts` / `.test.ts` as the reference, in its Solution, its Technical Approach and its Affected Code sections. That test is pre-VRTX3-S-0011 and carries a second case this repo stopped writing:

   ```ts
   it("responds in under 100ms", async () => {
     const start = Date.now();
     await healthz(event);
     const elapsed = Date.now() - start;
     expect(elapsed).toBeLessThan(100);
   });
   ```

   It is also, verbatim, the first file [AGENTS.md § Health Probe Routes](../../../AGENTS.md#health-probe-routes) lists as an example of the 47 legacy tests. A wall-clock assertion on a shared CI runner is machine-dependent and measures the runner, not the contract; it was deliberately dropped in VRTX3-S-0011. **The AGENTS.md pointer outranks the pointer in an idea canvas.** Your new test has one `it()` case and one assertion: the response body. Note the substitution in your work log.

   Nothing is lost by dropping it. The property a timing assertion reaches for — the handler does no I/O — is already guaranteed by the interface contract below (only import is `nitro/h3`, no `db/`, no `event.context` read). And no acceptance criterion is contradicted: VRTX3-I-0042's AC-5 asks only that the test assert the handler resolves to the object.

3. Verify the route is actually wired by requesting the literal path against a running dev server and checking the **body and `Content-Type`**, not the status code. A path with no handler returns `200 text/html` (the 949-byte SPA `index.html` shell), so a status-code check passes whether or not the route exists — see [AGENTS.md § Gotchas](../../../AGENTS.md#gotchas). Measured before this ticket started: this path returned `200 text/html; charset=utf-8` (949 B); the control `/api/healthz-smoke-528856326-a` returned `200 application/json;charset=UTF-8` (33 B).

   Read the port from the Vite banner. It bound `:5000` during planning, but the thirteen prior sprints bound `:5005`, `:5006`, `:5007`, `:5000`, `:5001`, `:5002`, `:5000`, `:5000`, `:5000`, `:5000`, `:5000`, `:5002` and `:5000` — contention, not a trend, so it is not predictable in either direction. Measuring against the wrong port yields connection errors that look like a broken route.

   Ignore the idea's opening claim that this path "returns 404 today". It does not, and never did — that is the standing mis-transcription documented in Gotchas, arriving this time inside an enhancement canvas rather than a defect report. The rest of the same sentence ("nothing in `routes/api/` matches `180848429`") is correct and was re-verified during planning.

4. Run the project's standard verification gate and the production build before finishing.

## File/module ownership

| File                                           | Action | Notes                                        |
| ---------------------------------------------- | ------ | -------------------------------------------- |
| `routes/api/healthz-smoke-180848429-b.ts`      | CREATE | The handler. Owned solely by this ticket.    |
| `routes/api/healthz-smoke-180848429-b.test.ts` | CREATE | Colocated test. Owned solely by this ticket. |

**Nothing else.** No existing file may be modified — not `vite.config.ts`, not `vitest.config.ts`, not `.github/workflows/ci.yml`, not `package.json`, not `README.md`, not a root doc, not a sibling probe. `AGENTS.md` / `PRODUCT.md` / `ARCHITECTURE.md` / `DESIGN.md` are out of this ticket's scope entirely; the planner has already brought them to their target state, including the 109 → 112 probe-count bump. A modified existing file is the signal that scope drifted.

One note on the idea, so its out-of-scope line does not read as a contradiction: VRTX3-I-0042 says "No README/ARCHITECTURE update — these are throwaway probe endpoints." `README.md` carries no probe count at all (grep for `healthz` and `probe` returns nothing in it) and is untouched this sprint. The three documents that do carry the count are planning-owned and already updated. Either way, there is no documentation work on this ticket.

## Interface contracts

FIXED — do not change, and do not negotiate with the sibling tickets:

- **URL:** `/api/healthz-smoke-180848429-b`, character for character. The filename **is** the URL registration; there is no route table, so a typo is a wrong URL with no other symptom.
- **Response body:** exactly `{ ok: true, variant: "180848429" }` — `ok` is the boolean `true`, `variant` is the **string** `"180848429"` (not a number, and not suffixed with `-b`). All three probes in this sprint carry the identical variant string; the `a`/`b`/`c` distinction lives in the URL only.
- **Handler shape:** a single default export, `defineHandler` imported from `nitro/h3`, taking no parameters and returning the object literal:

  ```ts
  import { defineHandler } from "nitro/h3";

  export default defineHandler(() => {
    return {
      ok: true,
      variant: "180848429",
    };
  });
  ```

- **No shared code.** No import of a sibling probe, and no new helper, factory, constants file or barrel export. The duplication is deliberate — see [ARCHITECTURE.md § Key Decisions](../../../ARCHITECTURE.md#key-decisions), and the idea's own out-of-scope list. A reviewer asking to factor out a shared handler is asking to delete the property under test.
- **No request state.** No params, query, body, headers, or `event.context.user`; no `db/` import; no auth call. `middleware/auth.ts` still runs on the request and still sets `event.context.user` — the handler must simply ignore it, so the probe stays answerable when auth and the database are unavailable. This is idea AC-8, satisfied structurally rather than by a test.
- **No method guard.** Every verb returns the same 200 body, consistent with the other 109 probes. Do not add a 405.
- **Test file suffix:** `.test.ts`, colocated in `routes/api/`. `vite.config.ts`'s `nitro({ ignore: ["**/*.test.ts"] })` is what keeps it out of the server bundle, and `vitest.config.ts`'s `server` project (`environment: "node"`, `include: ["routes/**/*.test.ts"]`) is what collects it. Rename it or move it and both properties break at once.

## Definition of Done

Tracked as this ticket's acceptance criteria in the FSM. Summarized: the handler and its colocated single-assertion test exist and hold to the contracts above; a live request returns `application/json` with the exact body rather than the SPA shell; the test is collected by Vitest's `server` project unchanged; the production build emits `.output/server/_routes/api/healthz_smoke_180848429_b.mjs` with no `*.test.ts` in the bundle; and the diff is exactly two new files with no dependency added.

## Test plan

| Test                                                               | Expected outcome                                                                                             |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| New colocated `routes/api/healthz-smoke-180848429-b.test.ts`       | Handler returns `{ ok: true, variant: "180848429" }` — passes                                                |
| The 109 pre-existing probe tests + the rest of the unit suite      | Unchanged, still green (this ticket touches none of their files)                                             |
| Live request to `/api/healthz-smoke-180848429-b` on the dev server | `application/json` + the exact JSON body (proves Nitro registered it)                                        |
| Production build                                                   | Succeeds; emits `.output/server/_routes/api/healthz_smoke_180848429_b.mjs`, and no `*.test.ts` in the bundle |

Note that the unit test imports the handler module directly, so it passes even if Nitro never registered the path — the live body/`Content-Type` check is the part that proves the route is wired.
