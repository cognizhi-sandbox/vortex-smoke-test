# Plan — VRTX3-T-0110: Add health probe endpoint `/api/healthz-smoke-756246354-c`

**Sprint:** VRTX3-S-0016 · **Story:** VRTX3-T-0107 · **Epic:** VRTX3-T-0106
**Sprint plan:** `artifacts/VRTX3-S-0016/SPRINT-PLAN.md`

## Objective

`GET /api/healthz-smoke-756246354-c` answers on the running server with `Content-Type: application/json` and a body deep-equal to `{ "ok": true, "variant": "756246354" }`, backed by one self-contained handler file and one colocated Vitest test. The endpoint shares no code with its two siblings (VRTX3-T-0108 / VRTX3-T-0109) and imports nothing beyond `nitro/h3` — no auth, no database, no helper. Done means two new files exist, nothing else in the repository changed, and the route is proven wired by a live request rather than by a unit test alone.

## Steps

1. Copy `routes/api/healthz-smoke-528856326-a.ts` to `routes/api/healthz-smoke-756246354-c.ts`. Change the `variant` string to `"756246354"`. Change nothing else — no `event` parameter, no method guard, no added import.
2. Copy `routes/api/healthz-smoke-528856326-a.test.ts` to `routes/api/healthz-smoke-756246354-c.test.ts`. Update the import path, the imported binding name, the `describe` title, the request URL and the expected variant.
3. **Copy from the `528856326` pair, not from `913793173` or any other pre-VRTX3-S-0011 probe.** The older probe tests carry a second `responds in under 100ms` case. It is machine-dependent, a known CI-flake source, and was deliberately dropped from the house pattern. The new test keeps the body assertion only. `AGENT.md` § Health Probe Routes names this copy source explicitly.
4. Run the test suite; the new spec must be collected by the `server` Vitest project and pass.
5. Start the dev server and issue a real `GET /api/healthz-smoke-756246354-c`. Confirm the response is `application/json` with the exact body. **A `text/html` response means the route did not register** — see Gotchas below. This path was measured during planning and currently returns `200 text/html`; that must flip to `200 application/json`.
6. Build, and confirm `.output/server/_routes/api/healthz_smoke_756246354_c.mjs` exists and that no module was built from the `.test.ts` file.
7. Run the repository's standard pre-commit verification gate before finishing.

## File/module ownership

This ticket may create these two files and **no others**:

| File                                           | Role                                             |
| ---------------------------------------------- | ------------------------------------------------ |
| `routes/api/healthz-smoke-756246354-c.ts`      | the handler — the filename _is_ the URL contract |
| `routes/api/healthz-smoke-756246354-c.test.ts` | colocated `H3Event` integration test             |

**Must not touch:** the sibling probes owned by VRTX3-T-0108 and VRTX3-T-0109, any of the 59 pre-existing probes, `vite.config.ts`, `vitest.config.ts`, `middleware/auth.ts`, `server.ts`, `db/`, `drizzle/`, `src/`, `e2e/`, `package.json`, `.github/workflows/`, or any root doc (`AGENT.md` / `PRODUCT.md` / `ARCHITECTURE.md` / `DESIGN.md` — already at target state on planning ticket VRTX3-T-0105, including the 59 → 62 probe-count bump).

Ownership is disjoint from both siblings, so there is no `depends_on` — all three tickets run concurrently, and the merge must produce no conflict because there is no shared file to conflict over.

## Interface contracts (fixed — do not change)

```ts
// routes/api/healthz-smoke-756246354-c.ts
import { defineHandler } from "nitro/h3";

export default defineHandler(() => {
  return {
    ok: true,
    variant: "756246354",
  };
});
```

- **Route path:** `/api/healthz-smoke-756246354-c`, derived from the filename. No registration step exists; a filename typo produces a wrong URL with no other symptom.
- **Response body:** exactly `{ ok: true, variant: "756246354" }`. `variant` is a **string**, matching every sibling (`"528856326"`, `"841017405"`). No extra keys, no timestamp, no version. All three suffixes share the same variant value.
- **Import surface:** `nitro/h3` only. No import from `db/`, no read of `event.context`, no import of a sibling probe, no new shared module.
- **No method guard.** The handler takes no `event` and checks no verb.

## Definition of Done

The authoritative list is VRTX3-T-0110's `acceptance_criteria` field. In summary: both files exist and match the contract above; the handler returns the exact object; a live GET returns `application/json` with the exact body; the test is collected by the `server` Vitest project, passes, and carries no timing assertion; no shared module is introduced; the built server contains the route module and not the test; nothing outside the ownership map is created or modified.

## Test plan

| Test                                      | Where                                                                                                                                                    | Expected                                                                                          |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Handler returns the contract object       | `routes/api/healthz-smoke-756246354-c.test.ts` — `new H3Event(new Request("http://localhost/api/healthz-smoke-756246354-c"))`, invoke the default export | `toEqual({ ok: true, variant: "756246354" })`                                                     |
| Route is actually wired                   | live `GET` against the dev server                                                                                                                        | `Content-Type: application/json`, body `{"ok":true,"variant":"756246354"}`                        |
| Test file excluded from the server bundle | build output                                                                                                                                             | `.output/server/_routes/api/healthz_smoke_756246354_c.mjs` present; no module from the `.test.ts` |
| No regression                             | existing suite                                                                                                                                           | all pre-existing tests unchanged and passing                                                      |

No Playwright/E2E spec is added — explicitly out of scope for this idea.

## Gotchas

- **A missing `/api/*` route returns `200 text/html`, not `404`.** Unmatched API paths fall through to the SPA `index.html` shell in dev and in production alike. Measured on this exact path during planning: `200 text/html; charset=utf-8`, against a control (`/api/healthz-smoke-528856326-a`) returning `200 application/json;charset=UTF-8`. Status code alone cannot distinguish a working endpoint from a missing one, so **assert on the body and `Content-Type`**.
- **The unit test imports the handler module directly**, so it passes even if Nitro never registered the path. Only step 5's live request proves the route is wired. Do not skip it.
- **`middleware/auth.ts` still runs** before this handler and sets `event.context.user`. "No auth" means this handler must not _read_ it — it does not mean the middleware is bypassed. Copying `routes/api/hello.ts` by mistake would introduce exactly that coupling and break the probe whenever auth is unavailable.
- **Do not factor out a shared helper**, factory, constants file or barrel export for the three endpoints, however tempting with 59 near-identical files already in the directory. The duplication is the deliverable and the decision is settled in `ARCHITECTURE.md` § Key Decisions — a shared module would turn every probe into a shared-file edit.
- **Do not add a 405 / method guard.** These handlers are method-agnostic by design and the other 59 have none. The idea puts non-`GET` method handling explicitly out of scope.
- **Copy-paste variant drift is the realistic failure.** Update the test when you copy it, not just the handler — a stale `variant` or a leftover filename from the source is the mistake that actually happens.
