# Sprint Plan — VRTX3-S-0009 (Bugfix)

## Goal

Add three missing self-contained Nitro health-check routes under `routes/api/`, each
returning `200 application/json` with `{ ok: true, variant: "<id>" }`. Purely additive:
6 new files, 0 existing files modified by engineers.

## Defect index

| Ticket       | Endpoint / variant                     | Root cause (one line)                                                                                                                      | Plan                                           |
| ------------ | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------- |
| VRTX3-T-0055 | `/api/healthz-smoke-bugfix-755467473`  | Handler file `routes/api/healthz-smoke-bugfix-755467473.ts` was never created, so Nitro's file-based scan registers no route for the path. | [VRTX3-T-0055/PLAN.md](./VRTX3-T-0055/PLAN.md) |
| VRTX3-T-0056 | `/api/healthz-smoke-bugfix2-192341379` | Handler file `routes/api/healthz-smoke-bugfix2-192341379.ts` was never created — same cause, different variant.                            | [VRTX3-T-0056/PLAN.md](./VRTX3-T-0056/PLAN.md) |
| VRTX3-T-0057 | `/api/healthz-smoke-bugfix3-993514120` | Handler file `routes/api/healthz-smoke-bugfix3-993514120.ts` was never created — same cause, different variant.                            | [VRTX3-T-0057/PLAN.md](./VRTX3-T-0057/PLAN.md) |

Full RCA, steps, ownership, contracts and test plan live in each PLAN.md above and are
deliberately not restated here.

---

## Cross-cutting notes for engineers

**1. All three tickets report "404". That is wrong, and I measured it this sprint.**

I ran `bun run dev` in this container and curled every path. Measured, not cited:

```
/api/healthz-smoke-bugfix-755467473    200 text/html; charset=utf-8       <!doctype html>…
/api/healthz-smoke-bugfix2-192341379   200 text/html; charset=utf-8       <!doctype html>…
/api/healthz-smoke-bugfix3-993514120   200 text/html; charset=utf-8       <!doctype html>…
/api/healthz-smoke-bugfix3-221117839   200 application/json;charset=UTF-8 {"ok":true,"variant":"221117839"}   ← control
/api/healthz-smoke-bugfix-739648350    200 application/json;charset=UTF-8 {"ok":true,"variant":"739648350"}   ← control
/api/healthz-smoke-bugfix2-901895284   200 application/json;charset=UTF-8 {"ok":true,"variant":"901895284"}   ← control
```

A missing `/api/*` path is answered by the **SPA `index.html` fallback with `200 text/html`**.
The status code is `200` **before and after** the fix, so a `404 → 200` check proves nothing
and cannot detect this defect at all. **Assert on `Content-Type` + response body.**

This is the fourth consecutive sprint to hit this trap (`AGENT.md` changelog: VRTX3-S-0001,
-0007, -0008). It has now been promoted into `AGENT.md` → `## Gotchas` so the next agent
finds it without reading changelog history.

**2. No ordering, no dependencies — all three run fully in parallel.**

The three ownership maps are disjoint; every one of the 6 files is new and no existing file
is touched by any ticket. There is no shared module, config, barrel, or route table to
serialize on (`vite.config.ts:29` — `nitro({ serverDir: "./", ignore: ["**/*.test.ts"] })` —
discovers routes purely by filename). **No `depends_on` is set on any of the three**, and
none should be added.

**3. Copy the nearest sibling; share nothing.**

Each ticket names its own reference sibling in its PLAN.md. The 44 existing `healthz-smoke-*`
handlers deliberately share zero code — do not factor out a common helper, and do not add a
method guard: I measured `POST`/`PUT`/`DELETE` against the control and all return the same
`200` JSON body as `GET`. Introducing a `405` would make these three inconsistent with the
other 44.

**4. Test placement is load-bearing.**

The test must live at `routes/api/<name>.test.ts`. `vitest.config.ts` routes `routes/**/*.test.ts`
into the node-environment `server` project (route code can reach `bun:sqlite`); placed anywhere
else it runs under jsdom and fails on `nitro/h3`. The `.test.ts` suffix is also what keeps it
out of the Nitro scan — any other name bundles it into the production server as a route handler.

## Risks

- **Filename typo silently creates a working endpoint at the wrong URL.** Because a missing
  path still returns `200`, a status-only smoke check would pass. Mitigated by asserting the
  exact URL + `Content-Type` + body.
- **Wrong `variant` string.** Must match the path segment digits exactly.
- Otherwise very low: no database, schema, migration, auth, middleware, or frontend involvement.
  Seven prior sprints added endpoints this way with no reported regression.

## Root docs

Observable behavior changes (three new endpoints), so `AGENT.md` is updated on the planning
ticket branch — a dated changelog entry plus the SPA-fallback gotcha promoted into `## Gotchas`.
`PRODUCT.md` / `ARCHITECTURE.md` / `DESIGN.md` are unchanged, matching the convention of the
five prior bugfix sprints. **Engineers must not edit any root doc** — it is already done.

## Follow-ups / out of scope

No genuinely distinct defect surfaced during root-causing. Recorded for a future sprint:

- **The three tickets' "Actual: 404" statements are factually wrong** (measured above). Not a
  code defect and not separately fileable — the fix is unchanged — but the reporting template
  that generates these tickets keeps emitting an unverified `404`, which has now misdirected
  verification in four sprints. Worth correcting at the generator, not in this repo.
- **No E2E coverage asserts `Content-Type` on any `healthz-smoke-*` route.** `e2e/smoke.spec.ts`
  checks `/api/hello` only. A single spec asserting `application/json` on one health route
  would catch a missing-route regression that unit tests structurally cannot (they import the
  handler module directly, so they pass even if Nitro never registers the path).
