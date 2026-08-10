# Plan — VRTX3-T-0118: GET /api/healthz-smoke-238855431-a

## Objective

`GET /api/healthz-smoke-238855431-a` answers with `Content-Type: application/json` and a body deep-equal to `{ "ok": true, "variant": "238855431" }`, served by a new self-contained Nitro handler at `routes/api/healthz-smoke-238855431-a.ts` with a colocated integration test beside it. Two new files, zero modified files. This ticket shares no file with VRTX3-T-0119 or VRTX3-T-0120 and has no ordering relationship to either — build and merge it whenever you pick it up.

## Steps

1. Copy `routes/api/healthz-smoke-528856326-a.ts` → `routes/api/healthz-smoke-238855431-a.ts` and change the `variant` string to `"238855431"`. Change nothing else — no `event` parameter, no method guard, no extra import.
2. Copy `routes/api/healthz-smoke-528856326-a.test.ts` → `routes/api/healthz-smoke-238855431-a.test.ts` and update five things: the import path, the imported binding name, the `describe` title, the request URL, and the expected `variant`.
   **Copy that exact test file.** Do **not** copy `routes/api/healthz-smoke-126862920-c.test.ts` even though the idea canvas names it — it carries a second `expect(elapsed).toBeLessThan(100)` case that is machine-dependent and a known CI-flake source, deliberately dropped in VRTX3-S-0011. The new test has one assertion: the response body.
3. Verify the route is actually wired by requesting the literal path against a running dev server and checking the **body and `Content-Type`**, not the status code. A path with no handler returns `200 text/html` (the SPA `index.html` shell), so a status-code check passes whether or not the route exists — see [AGENT.md § Gotchas](../../../AGENT.md#gotchas). Measured before this ticket started: this path returned `200 text/html; charset=utf-8`; the control `/api/healthz-smoke-528856326-a` returned `200 application/json;charset=UTF-8`.
4. Run the project's standard verification gate and the build before finishing.

## File/module ownership

| File                                           | Action | Notes                                        |
| ---------------------------------------------- | ------ | -------------------------------------------- |
| `routes/api/healthz-smoke-238855431-a.ts`      | CREATE | The handler. Owned solely by this ticket.    |
| `routes/api/healthz-smoke-238855431-a.test.ts` | CREATE | Colocated test. Owned solely by this ticket. |

**Nothing else.** No existing file may be modified — not `vite.config.ts`, not `vitest.config.ts`, not CI, not a root doc, not a sibling probe. `AGENT.md` / `PRODUCT.md` / `ARCHITECTURE.md` / `DESIGN.md` are out of this ticket's scope entirely; the planner has already brought them to their target state. A modified existing file is the signal that scope drifted.

## Interface contracts

FIXED — do not change, and do not negotiate with the sibling tickets:

- **URL:** `/api/healthz-smoke-238855431-a`, character for character. The filename **is** the URL registration; there is no route table, so a typo is a wrong URL with no other symptom.
- **Response body:** exactly `{ ok: true, variant: "238855431" }` — `ok` is the boolean `true`, `variant` is the **string** `"238855431"` (not a number, and not suffixed with `-a`).
- **Handler shape:** a single default export, `defineHandler` imported from `nitro/h3`, taking no parameters and returning the object literal:

  ```ts
  import { defineHandler } from "nitro/h3";

  export default defineHandler(() => {
    return {
      ok: true,
      variant: "238855431",
    };
  });
  ```

- **No shared code.** No import of a sibling probe, and no new helper, factory, constants file or barrel export. The duplication is deliberate — see [ARCHITECTURE.md § Key Decisions](../../../ARCHITECTURE.md#key-decisions).
- **No request state.** No params, query, body, headers, or `event.context.user`; no `db/` import; no auth call.
- **No method guard.** Every verb returns the same 200 body, consistent with the other 62 probes. Do not add a 405.

## Definition of Done

- `routes/api/healthz-smoke-238855431-a.ts` exists, default-exports a `defineHandler` from `nitro/h3` taking no parameters, and returns the literal `{ ok: true, variant: "238855431" }`.
- A live request to `/api/healthz-smoke-238855431-a` returns `Content-Type: application/json` with a body deep-equal to `{"ok":true,"variant":"238855431"}` — not the `text/html` SPA shell.
- `routes/api/healthz-smoke-238855431-a.test.ts` exists, imports the handler directly, constructs an `H3Event` for `http://localhost/api/healthz-smoke-238855431-a`, and asserts the returned object deep-equals `{ ok: true, variant: "238855431" }`; it carries no wall-clock/timing assertion.
- That test passes as part of Vitest's `server` project, and the app's lint, type-check, unit suite and production build are all green.
- The handler imports nothing but `nitro/h3`: no sibling probe, no `db/`, no new shared helper/factory/constants/barrel module anywhere in the diff.
- The diff is exactly two new files with zero existing files modified.

## Test plan

| Test                                                               | Expected outcome                                                                                             |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| New colocated `routes/api/healthz-smoke-238855431-a.test.ts`       | Handler returns `{ ok: true, variant: "238855431" }` — passes                                                |
| The 62 pre-existing probe tests + the rest of the unit suite       | Unchanged, still green (this ticket touches none of their files)                                             |
| Live request to `/api/healthz-smoke-238855431-a` on the dev server | `application/json` + the exact JSON body (proves Nitro registered it)                                        |
| Production build                                                   | Succeeds; emits `.output/server/_routes/api/healthz_smoke_238855431_a.mjs`, and no `*.test.ts` in the bundle |

Note that the unit test imports the handler module directly, so it passes even if Nitro never registered the path — the live body/`Content-Type` check is the part that proves the route is wired.
