# Plan — VRTX3-T-0162: GET /api/healthz-smoke-1065915107-a

## Objective

`GET /api/healthz-smoke-1065915107-a` answers with `Content-Type: application/json` and a body deep-equal to `{ "ok": true, "variant": "1065915107" }`, served by a new self-contained Nitro handler at `routes/api/healthz-smoke-1065915107-a.ts` with a colocated integration test beside it. Two new files, zero modified files. This ticket shares no file with VRTX3-T-0163 or VRTX3-T-0164 and has no ordering relationship to either — build and merge it whenever you pick it up.

## Design reference

None. `a2a_get_idea_design(ticket_key=…)` returned `blocks: []` for VRTX3-I-0032 — the idea carries no wireframe or mockup, because this sprint has no user-visible surface. Nothing in `src/` is touched.

## Steps

1. Copy `routes/api/healthz-smoke-528856326-a.ts` → `routes/api/healthz-smoke-1065915107-a.ts` and change the `variant` string to `"1065915107"`. Change nothing else — no `event` parameter, no method guard, no extra import.
2. Copy `routes/api/healthz-smoke-528856326-a.test.ts` → `routes/api/healthz-smoke-1065915107-a.test.ts` and update five things: the import path, the imported binding name, the `describe` title, the request URL, and the expected `variant`.
   **Copy that exact test file.** 47 of the 80 probe tests carry a second `expect(elapsed).toBeLessThan(100)` case — machine-dependent, a known CI-flake source, deliberately dropped in VRTX3-S-0011 — so a directory neighbour is a coin flip. See [AGENT.md § Health Probe Routes](../../../AGENT.md#health-probe-routes), whose pointer outranks any file named in an idea canvas. The new test has one assertion: the response body.
3. Verify the route is actually wired by requesting the literal path against a running dev server and checking the **body and `Content-Type`**, not the status code. A path with no handler returns `200 text/html` (the SPA `index.html` shell), so a status-code check passes whether or not the route exists — see [AGENT.md § Gotchas](../../../AGENT.md#gotchas). Measured before this ticket started: this path returned `200 text/html; charset=utf-8` (949 B); the control `/api/healthz-smoke-528856326-a` returned `200 application/json;charset=UTF-8` (33 B). Read the port from the Vite banner — it bound `:5000` during planning, but the six prior sprints bound `:5005`, `:5006`, `:5007`, `:5000`, `:5001` and `:5002`, so it is not predictable in either direction.
4. Run the project's standard verification gate and the production build before finishing.

## File/module ownership

| File                                            | Action | Notes                                        |
| ----------------------------------------------- | ------ | -------------------------------------------- |
| `routes/api/healthz-smoke-1065915107-a.ts`      | CREATE | The handler. Owned solely by this ticket.    |
| `routes/api/healthz-smoke-1065915107-a.test.ts` | CREATE | Colocated test. Owned solely by this ticket. |

**Nothing else.** No existing file may be modified — not `vite.config.ts`, not `vitest.config.ts`, not `.github/workflows/ci.yml`, not a root doc, not a sibling probe. `AGENT.md` / `PRODUCT.md` / `ARCHITECTURE.md` / `DESIGN.md` are out of this ticket's scope entirely; the planner has already brought them to their target state, including the 80 → 83 probe-count bump. A modified existing file is the signal that scope drifted.

## Interface contracts

FIXED — do not change, and do not negotiate with the sibling tickets:

- **URL:** `/api/healthz-smoke-1065915107-a`, character for character. The filename **is** the URL registration; there is no route table, so a typo is a wrong URL with no other symptom.
- **Response body:** exactly `{ ok: true, variant: "1065915107" }` — `ok` is the boolean `true`, `variant` is the **string** `"1065915107"` (not a number, and not suffixed with `-a`).
- **Handler shape:** a single default export, `defineHandler` imported from `nitro/h3`, taking no parameters and returning the object literal:

  ```ts
  import { defineHandler } from "nitro/h3";

  export default defineHandler(() => {
    return {
      ok: true,
      variant: "1065915107",
    };
  });
  ```

- **No shared code.** No import of a sibling probe, and no new helper, factory, constants file or barrel export. The duplication is deliberate — see [ARCHITECTURE.md § Key Decisions](../../../ARCHITECTURE.md#key-decisions). A reviewer asking to factor out a shared handler is asking to delete the property under test.
- **No request state.** No params, query, body, headers, or `event.context.user`; no `db/` import; no auth call. The probe must stay answerable when auth and the database are unavailable.
- **No method guard.** Every verb returns the same 200 body, consistent with the other 80 probes. Do not add a 405.

## Definition of Done

- `routes/api/healthz-smoke-1065915107-a.ts` exists, default-exports a `defineHandler` from `nitro/h3` taking no parameters, and returns the literal `{ ok: true, variant: "1065915107" }`.
- A live request to `/api/healthz-smoke-1065915107-a` returns `Content-Type: application/json` with a body deep-equal to `{"ok":true,"variant":"1065915107"}` — not the 949-byte `text/html` SPA shell.
- `routes/api/healthz-smoke-1065915107-a.test.ts` exists, imports the handler directly, constructs an `H3Event` for `http://localhost/api/healthz-smoke-1065915107-a`, and asserts the returned object deep-equals `{ ok: true, variant: "1065915107" }`; it contains exactly one `it()` case and no elapsed-time or "responds in under Nms" assertion.
- That new test passes in Vitest's `server` project, and the app's lint, type-check, unit suite and production build are all green.
- The production build emits `.output/server/_routes/api/healthz_smoke_1065915107_a.mjs` (dashes → underscores), and no `*.test.ts` file appears in the bundle.
- The handler imports nothing but `nitro/h3`: no sibling probe, no `db/`, no new shared helper/factory/constants/barrel module anywhere in the diff.
- The diff is exactly two new files with zero existing files modified and no dependency added to `package.json`.

## Test plan

| Test                                                                | Expected outcome                                                                                              |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| New colocated `routes/api/healthz-smoke-1065915107-a.test.ts`       | Handler returns `{ ok: true, variant: "1065915107" }` — passes                                                |
| The 80 pre-existing probe tests + the rest of the unit suite        | Unchanged, still green (this ticket touches none of their files)                                              |
| Live request to `/api/healthz-smoke-1065915107-a` on the dev server | `application/json` + the exact JSON body (proves Nitro registered it)                                         |
| Production build                                                    | Succeeds; emits `.output/server/_routes/api/healthz_smoke_1065915107_a.mjs`, and no `*.test.ts` in the bundle |

Note that the unit test imports the handler module directly, so it passes even if Nitro never registered the path — the live body/`Content-Type` check is the part that proves the route is wired.
