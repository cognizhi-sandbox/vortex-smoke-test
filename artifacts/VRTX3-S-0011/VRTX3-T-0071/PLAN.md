# Plan — VRTX3-T-0071: Add health probe endpoint `/api/healthz-smoke-528856326-a`

**Sprint:** VRTX3-S-0011 · **Story:** VRTX3-T-0070 · **Epic:** VRTX3-T-0069
**Sprint plan:** `artifacts/VRTX3-S-0011/SPRINT-PLAN.md`

## Objective

`GET /api/healthz-smoke-528856326-a` answers on the running server with `Content-Type: application/json` and a body deep-equal to `{ "ok": true, "variant": "528856326" }`, backed by one self-contained handler file and one colocated Vitest test. The endpoint shares no code with its two siblings (VRTX3-T-0072 / VRTX3-T-0073) and imports nothing beyond `nitro/h3` — no auth, no database, no helper. Done means two new files exist, nothing else in the repository changed, and the route is proven wired by a live request rather than by a unit test alone.

## Steps

1. Copy `routes/api/healthz-smoke-302960562-a.ts` to `routes/api/healthz-smoke-528856326-a.ts`. Change the `variant` string to `"528856326"`. Change nothing else — no `event` parameter, no method guard, no added import.
2. Copy `routes/api/healthz-smoke-126862920-c.test.ts` to `routes/api/healthz-smoke-528856326-a.test.ts`. Update the import path, the `describe` title, the request URL and the expected variant.
3. **Drop the `responds in under 100ms` test case from the copy.** It is machine-dependent, a known CI-flake source, and the idea deliberately left it out of its acceptance criteria (Open Question 1). Keep only the body assertion.
4. Run the test suite; the new spec must be collected by the `server` Vitest project and pass.
5. Start the dev server and issue a real `GET /api/healthz-smoke-528856326-a`. Confirm the response is `application/json` with the exact body. **A `text/html` response means the route did not register** — see Gotchas below.
6. Build, and confirm `.output/server/_routes/api/healthz_smoke_528856326_a.mjs` exists and that no module was built from the `.test.ts` file.
7. Run the repository's standard pre-commit gate before finishing.

## File/module ownership

This ticket may create these two files and **no others**:

| File                                           | Role                                             |
| ---------------------------------------------- | ------------------------------------------------ |
| `routes/api/healthz-smoke-528856326-a.ts`      | the handler — the filename _is_ the URL contract |
| `routes/api/healthz-smoke-528856326-a.test.ts` | colocated `H3Event` integration test             |

**Must not touch:** `routes/api/healthz-smoke-528856326-b.*` and `-c.*` (owned by VRTX3-T-0072 and VRTX3-T-0073), any of the 44 pre-existing probes, `vite.config.ts`, `vitest.config.ts`, `middleware/auth.ts`, `server.ts`, `db/`, `drizzle/`, `src/`, `e2e/`, `package.json`, or `.github/workflows/`.

Ownership is disjoint from both siblings, so there is no `depends_on` — all three tickets run concurrently, and the merge must produce no conflict because there is no shared file to conflict over.

## Interface contracts (fixed — do not change)

```ts
// routes/api/healthz-smoke-528856326-a.ts
import { defineHandler } from "nitro/h3";

export default defineHandler(() => {
  return {
    ok: true,
    variant: "528856326",
  };
});
```

- **Route path:** `/api/healthz-smoke-528856326-a`, derived from the filename. No registration step exists; a filename typo produces a wrong URL with no other symptom.
- **Response body:** exactly `{ ok: true, variant: "528856326" }`. `variant` is a **string**, matching every sibling (`"302960562"`, `"126862920"`). No extra keys, no timestamp, no version.
- **Import surface:** `nitro/h3` only. No import from `db/`, no read of `event.context`, no import of a sibling probe, no new shared module.
- **No method guard.** The handler takes no `event` and checks no verb.

## Definition of Done

The authoritative list is VRTX3-T-0071's `acceptance_criteria` field. In summary: both files exist and match the contract above; the handler returns the exact object; a live GET returns `application/json` with the exact body; the test is collected by the `server` Vitest project and passes; no shared module is introduced; the built server contains the route module and not the test; nothing outside the ownership map is created or modified.

## Test plan

| Test                                      | Where                                                                                                                                                    | Expected                                                                                          |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Handler returns the contract object       | `routes/api/healthz-smoke-528856326-a.test.ts` — `new H3Event(new Request("http://localhost/api/healthz-smoke-528856326-a"))`, invoke the default export | `toEqual({ ok: true, variant: "528856326" })`                                                     |
| Route is actually wired                   | live `GET` against the dev server                                                                                                                        | `Content-Type: application/json`, body `{"ok":true,"variant":"528856326"}`                        |
| Test file excluded from the server bundle | build output                                                                                                                                             | `.output/server/_routes/api/healthz_smoke_528856326_a.mjs` present; no module from the `.test.ts` |
| No regression                             | existing suite                                                                                                                                           | all pre-existing tests unchanged and passing                                                      |

No Playwright/E2E spec is added — explicitly out of scope for this idea.

## Gotchas

- **A missing `/api/*` route returns `200 text/html`, not `404`.** Unmatched API paths fall through to the SPA `index.html` shell in dev and in production alike. Status code alone cannot distinguish a working endpoint from a missing one, so **assert on the body and `Content-Type`**. Four consecutive sprints re-learned this after acting on a "404" bug report.
- **The unit test imports the handler module directly**, so it passes even if Nitro never registered the path. Only step 5's live request proves the route is wired. Do not skip it.
- **`middleware/auth.ts` still runs** before this handler and sets `event.context.user`. "No auth" means this handler must not _read_ it — it does not mean the middleware is bypassed.
- **Do not factor out a shared helper**, factory, constants file or barrel export for the three endpoints, however tempting with 47 near-identical files in the directory. The duplication is the deliverable; see ARCHITECTURE.md Key Decisions.
- **Do not add a 405 / method guard.** These handlers are method-agnostic by design and the other 44 have no guard. The idea's "unsupported methods" edge case misstates current behaviour; its Out of Scope line ("No non-GET methods", no custom method handling) is what to build to.
