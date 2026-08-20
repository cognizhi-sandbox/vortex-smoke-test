---
artifact: ticket-plan
spec: 1
status: complete
author_role: planning
sprint: VRTX3-S-0033
ticket: VRTX3-T-0216
idea: VRTX3-I-0040
upstream: artifacts/VRTX3-S-0033/SPRINT-PLAN.md
---

# Plan — VRTX3-T-0216: GET /api/healthz-smoke-189360772-a

## Objective

`GET /api/healthz-smoke-189360772-a` answers with `Content-Type: application/json` and a body deep-equal to `{ "ok": true, "variant": "189360772" }`, served by a new self-contained Nitro handler at `routes/api/healthz-smoke-189360772-a.ts` with a colocated integration test beside it. Two new files, zero modified files. This ticket shares no file with VRTX3-T-0217 or VRTX3-T-0218 and has no ordering relationship to either — build and merge it whenever you pick it up.

## Design reference

None. `a2a_get_idea_design(ticket_key="VRTX3-T-0213")` returned `blocks: []` for VRTX3-I-0040, and the idea states it itself: "this change adds no screen, page or flow — there is nothing visual to sketch." Nothing in `src/` is touched.

## Steps

1. Copy `routes/api/healthz-smoke-528856326-a.ts` → `routes/api/healthz-smoke-189360772-a.ts` and change the `variant` string to `"189360772"`. Change nothing else — no `event` parameter, no method guard, no extra import.

2. Copy `routes/api/healthz-smoke-528856326-a.test.ts` → `routes/api/healthz-smoke-189360772-a.test.ts` and update five things: the import path, the imported binding name, the `describe` title, the request URL, and the expected `variant`.

   **Copy that exact pair.** VRTX3-I-0040 names it too — in its Solution and Affected Code sections — so there is no substitution to make this sprint, which is the uneventful case rather than a sign the risk is gone. 47 of the 97 existing probe tests carry a second `expect(elapsed).toBeLessThan(100)` case; they are pre-VRTX3-S-0011 files that are never rewritten, so a directory neighbour is close to a coin flip. That assertion is wall-clock on a shared CI runner: machine-dependent, a known flake source, deliberately dropped in VRTX3-S-0011. [AGENT.md § Health Probe Routes](../../../AGENT.md#health-probe-routes) pins the `528856326` pair and its pointer outranks any file named elsewhere. Your new test has one `it()` case and one assertion: the response body.

   The property a timing assertion reaches for — the handler does no I/O — is already guaranteed by the interface contract below (only import is `nitro/h3`, no `db/`, no `event.context` read), so nothing is lost by leaving it out.

3. Verify the route is actually wired by requesting the literal path against a running dev server and checking the **body and `Content-Type`**, not the status code. A path with no handler returns `200 text/html` (the 949-byte SPA `index.html` shell), so a status-code check passes whether or not the route exists — see [AGENT.md § Gotchas](../../../AGENT.md#gotchas). Measured before this ticket started: this path returned `200 text/html; charset=utf-8` (949 B); the control `/api/healthz-smoke-528856326-a` returned `200 application/json;charset=UTF-8` (33 B). Read the port from the Vite banner — it bound `:5000` during planning, but the twelve prior sprints bound `:5005`, `:5006`, `:5007`, `:5000`, `:5001`, `:5002`, `:5000`, `:5000`, `:5000`, `:5000`, `:5000` and `:5002`, so it is not predictable in either direction.

4. Run the project's standard verification gate and the production build before finishing.

## File/module ownership

| File                                           | Action | Notes                                        |
| ---------------------------------------------- | ------ | -------------------------------------------- |
| `routes/api/healthz-smoke-189360772-a.ts`      | CREATE | The handler. Owned solely by this ticket.    |
| `routes/api/healthz-smoke-189360772-a.test.ts` | CREATE | Colocated test. Owned solely by this ticket. |

**Nothing else.** No existing file may be modified — not `vite.config.ts`, not `vitest.config.ts`, not `.github/workflows/ci.yml`, not `package.json`, not `README.md`, not a root doc, not a sibling probe. `AGENT.md` / `PRODUCT.md` / `ARCHITECTURE.md` / `DESIGN.md` are out of this ticket's scope entirely; the planner has already brought them to their target state, including the 97 → 100 probe-count bump. A modified existing file is the signal that scope drifted.

One note on the idea, because following it literally would break the rule above: VRTX3-I-0040's AC-8 says the sprint's only edits outside `routes/api/` are probe-family counts in `README.md`, `ARCHITECTURE.md` and `AGENT.md`. `README.md` carries no probe count at all (grep for `healthz` and `probe` returns nothing in it), and the two docs that do are planning-owned and already updated. There is no documentation work on this ticket.

## Interface contracts

FIXED — do not change, and do not negotiate with the sibling tickets:

- **URL:** `/api/healthz-smoke-189360772-a`, character for character. The filename **is** the URL registration; there is no route table, so a typo is a wrong URL with no other symptom.
- **Response body:** exactly `{ ok: true, variant: "189360772" }` — `ok` is the boolean `true`, `variant` is the **string** `"189360772"` (not a number, and not suffixed with `-a`). All three probes in this sprint carry the identical variant string; the `a`/`b`/`c` distinction lives in the URL only.
- **Handler shape:** a single default export, `defineHandler` imported from `nitro/h3`, taking no parameters and returning the object literal:

  ```ts
  import { defineHandler } from "nitro/h3";

  export default defineHandler(() => {
    return {
      ok: true,
      variant: "189360772",
    };
  });
  ```

- **No shared code.** No import of a sibling probe, and no new helper, factory, constants file or barrel export. The duplication is deliberate — see [ARCHITECTURE.md § Key Decisions](../../../ARCHITECTURE.md#key-decisions). A reviewer asking to factor out a shared handler is asking to delete the property under test.
- **No request state.** No params, query, body, headers, or `event.context.user`; no `db/` import; no auth call. `middleware/auth.ts` still runs on the request and still sets `event.context.user` — the handler must simply ignore it, so the probe stays answerable when auth and the database are unavailable.
- **No method guard.** Every verb returns the same 200 body, consistent with the other 97 probes. Do not add a 405.
- **Test file suffix:** `.test.ts`, colocated in `routes/api/`. `vite.config.ts`'s `nitro({ ignore: ["**/*.test.ts"] })` is what keeps it out of the server bundle, and `vitest.config.ts`'s `server` project is what collects it. Rename it and both properties break.

## Definition of Done

Tracked as this ticket's acceptance criteria in the FSM. Summarized: the handler and its colocated single-assertion test exist and hold to the contracts above; a live request returns `application/json` with the exact body rather than the SPA shell; the test is collected by Vitest's `server` project unchanged; the production build emits `.output/server/_routes/api/healthz_smoke_189360772_a.mjs` with no `*.test.ts` in the bundle; and the diff is exactly two new files with no dependency added.

## Test plan

| Test                                                               | Expected outcome                                                                                             |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| New colocated `routes/api/healthz-smoke-189360772-a.test.ts`       | Handler returns `{ ok: true, variant: "189360772" }` — passes                                                |
| The 97 pre-existing probe tests + the rest of the unit suite       | Unchanged, still green (this ticket touches none of their files)                                             |
| Live request to `/api/healthz-smoke-189360772-a` on the dev server | `application/json` + the exact JSON body (proves Nitro registered it)                                        |
| Production build                                                   | Succeeds; emits `.output/server/_routes/api/healthz_smoke_189360772_a.mjs`, and no `*.test.ts` in the bundle |

Note that the unit test imports the handler module directly, so it passes even if Nitro never registered the path — the live body/`Content-Type` check is the part that proves the route is wired.
