# Sprint Plan — VRTX3-S-0023

**Title:** Three Independent Health Check Endpoints (1065915107)
**Idea:** VRTX3-I-0032 — `[smoke-178671226979505] 3 independent endpoints (1065915107)` (enhancement, doc v15)
**Planning ticket:** VRTX3-T-0159
**Created:** 2026-08-14

---

## Goal

Ship three standalone Nitro health probes — `GET /api/healthz-smoke-1065915107-a`, `-b` and `-c` — each answering with `Content-Type: application/json` and a body deep-equal to `{ "ok": true, "variant": "1065915107" }`.

The three URLs are the visible deliverable. The _point_ of the sprint is the second-order one the idea states in its success metrics: three unrelated units of work get picked up, built, tested and merged **in parallel**, with file-ownership maps that do not intersect at a single line. Nothing shared, nothing to coordinate, nothing to conflict.

---

## Codebase findings (Stage 0)

Read this sprint: `routes/api/` (163 `.ts` files), `vite.config.ts`, `vitest.config.ts`, `.github/workflows/ci.yml`, and the four root docs. Everything below is measured against this working tree, not carried forward from a prior plan.

**The pattern already exists 80 times over.** Measured: `ls routes/api/healthz-smoke-*.ts | grep -v '\.test\.ts$' | wc -l` → **80** handlers, plus 80 colocated tests (160 of the 163 files under `routes/api/`, the remainder being `hello.ts` / `hello.post.ts` / `hello.test.ts` and the `users/` dynamic-route example). `routes/api/healthz-smoke-528856326-a.ts` is the whole shape, verbatim:

```ts
import { defineHandler } from "nitro/h3";

export default defineHandler(() => {
  return {
    ok: true,
    variant: "528856326",
  };
});
```

Eight lines, one import, no `event` parameter, no method guard.

**Nothing named `1065915107` exists yet.** A repo-wide `grep -rn 1065915107 .` (excluding `node_modules` and `.git`) returned zero matches — the change is purely additive: six new files, zero modified source files. These are never-written files, not typo'd filenames.

**The SPA-fallback baseline was re-measured on a live dev server this sprint, not cited.** Against `bun run dev`, which bound port **5000** in this container (read the banner — see the port note below):

| Path                                | Status | `Content-Type`                   | Size  | Body                                |
| ----------------------------------- | ------ | -------------------------------- | ----- | ----------------------------------- |
| `/api/healthz-smoke-1065915107-a`   | `200`  | `text/html; charset=utf-8`       | 949 B | `<!doctype html>…` (the SPA shell)  |
| `/api/healthz-smoke-1065915107-b`   | `200`  | `text/html; charset=utf-8`       | 949 B | `<!doctype html>…`                  |
| `/api/healthz-smoke-1065915107-c`   | `200`  | `text/html; charset=utf-8`       | 949 B | `<!doctype html>…`                  |
| `/api/healthz-smoke-528856326-a` ✅ | `200`  | `application/json;charset=UTF-8` | 33 B  | `{"ok":true,"variant":"528856326"}` |

**Fifteenth consecutive sprint to confirm it, and the sixth on an enhancement with no incoming `404` claim to debunk.** A missing `/api/*` path is **indistinguishable from a working one by status code** — so every verification in this sprint asserts on the body and `Content-Type`, never on a status code or a `404 → 200` transition. VRTX3-I-0032's risk register states the behaviour correctly rather than asserting a `404`, so there was nothing to correct upstream. The measurement was still taken, because a canvas getting this right is evidence about the canvas, not about the working tree — only a live request tells you whether the file exists today. See [AGENT.md § Gotchas](../../AGENT.md#gotchas).

**Port note:** Vite bound `:5000` this sprint. The last six sprints produced `:5005`, `:5006`, `:5007`, `:5000`, `:5001` and `:5002` — contention, not a trend. Read the banner; do not assume, and do not extrapolate the drift either.

**The idea names the correct test copy-source — the sixth time in a row.** The canvas points at the `routes/api/healthz-smoke-528856326-a` pair and reproduces the rule that this pointer outranks any file an idea names. Measured this sprint: **47 of the 80** probe tests still carry a second `expect(elapsed).toBeLessThan(100)` case — machine-dependent, a known CI-flake source, deliberately dropped in VRTX3-S-0011. So there is **no substitution to make this sprint**; each PLAN.md still pins the copy source by name so the canonical shape cannot drift back in from a directory neighbour.

The canonical test, verified from the checkout:

```ts
import { H3Event } from "nitro/h3";
import { describe, expect, it } from "vitest";

import healthzA from "./healthz-smoke-528856326-a";

describe("GET /api/healthz-smoke-528856326-a", () => {
  it("returns HTTP 200 with correct response body", async () => {
    const event = new H3Event(new Request("http://localhost/api/healthz-smoke-528856326-a"));

    const result = await healthzA(event);

    expect(result).toEqual({ ok: true, variant: "528856326" });
  });
});
```

**No configuration change is needed, and none is in scope.** Read and confirmed:

- `vite.config.ts` — `nitro({ serverDir: "./", ignore: ["**/*.test.ts"] })`. A new `routes/api/*.ts` registers by filename alone; its colocated test is kept out of the server bundle.
- `vitest.config.ts` — the `server` project (`environment: "node"`, `include: ["routes/**/*.test.ts"]`) collects a new colocated probe test with no edit.
- `.github/workflows/ci.yml` — triggers on `push` and `pull_request` to `vortex/**`, `dev` and `main`, running install → typecheck → lint → test → build. Ticket branches and the sprint branch are both covered.

**Design:** `a2a_get_idea_design(ticket_key="VRTX3-T-0159")` returned `blocks: []` — VRTX3-I-0032 carries no wireframe or mockup, so there is nothing to export to `artifacts/VRTX3-S-0023/design/` and no `## Design reference` target for the ticket plans. This is expected: the sprint has no user-visible surface.

**Shared-file surface: exactly one, and it is already resolved.** The probe count appears in `AGENT.md`, `ARCHITECTURE.md` and `PRODUCT.md`, and has gone stale before (fixed in VRTX3-S-0015). Those three files are the _only_ files two implementation units could otherwise both touch. They are updated once, by this planning ticket, with the count re-derived from the filesystem (80 → 83) rather than incremented — so no TASK touches a root doc, and the ownership maps stay disjoint.

---

## Scope

### In scope

| #   | Deliverable                                            | Files                                                                                           |
| --- | ------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| 1   | `GET /api/healthz-smoke-1065915107-a` + colocated test | `routes/api/healthz-smoke-1065915107-a.ts`, `…-a.test.ts`                                       |
| 2   | `GET /api/healthz-smoke-1065915107-b` + colocated test | `routes/api/healthz-smoke-1065915107-b.ts`, `…-b.test.ts`                                       |
| 3   | `GET /api/healthz-smoke-1065915107-c` + colocated test | `routes/api/healthz-smoke-1065915107-c.ts`, `…-c.test.ts`                                       |
| 4   | Root-doc probe count 80 → 83                           | `AGENT.md`, `ARCHITECTURE.md`, `PRODUCT.md` — **done on this planning ticket, not by any TASK** |

### Out of scope (from the idea's own non-scope section)

- **No method guard.** These handlers are method-agnostic by design — `POST`/`PUT`/`DELETE` return the same 200 JSON body. Do not add a 405; it would make three probes inconsistent with the other 80.
- **No shared code.** No helper, factory, constants file or barrel across the three, and no refactor of the existing 80 probes.
- **No auth, no database, no middleware** — the probes must stay answerable when both are unavailable.
- **No frontend work.** Nothing in `src/`, no page, no navigation entry.
- **No new dependency and no config change** — routing, the Vitest projects and CI already cover these files unchanged.
- **No Playwright e2e spec.** Vitest `server`-project coverage is the bar for a probe.
- **No retirement of older probes**, and no back-fix of the 47 legacy tests carrying the flaky timing case.

---

## Phases

Each phase below maps to exactly one TASK, except phases 4 and 5, which are cross-cutting obligations folded into **every** TASK's Definition of Done rather than split out as standalone tickets.

### Phase 1 — `GET /api/healthz-smoke-1065915107-a` → **VRTX3-T-0162**

Copy the `528856326` pair to `routes/api/healthz-smoke-1065915107-a.ts` + `.test.ts`, change the variant string, the filename, the import binding, the `describe` title and the request URL. Nothing else. Two new files, zero modified.
**Verify:** a live request to the literal path returns `application/json` with a body deep-equal to `{"ok":true,"variant":"1065915107"}` — not the 949-byte `text/html` SPA shell.

### Phase 2 — `GET /api/healthz-smoke-1065915107-b` → **VRTX3-T-0163**

Identical to phase 1 for the `-b` suffix. Independent of phases 1 and 3 — no shared file, no ordering edge.
**Verify:** same body/`Content-Type` check against `/api/healthz-smoke-1065915107-b`.

### Phase 3 — `GET /api/healthz-smoke-1065915107-c` → **VRTX3-T-0164**

Identical to phase 1 for the `-c` suffix. Independent of phases 1 and 2.
**Verify:** same body/`Content-Type` check against `/api/healthz-smoke-1065915107-c`.

### Phase 4 — Test harness (folded into every TASK, no ticket of its own)

The harness needs **no change** and must not be changed. `vitest.config.ts`'s `server` project already globs `routes/**/*.test.ts` under a node environment, so each new colocated probe test is collected automatically. Each TASK therefore carries its own test obligation rather than deferring it:

- One new `*.test.ts` per TASK, copied from `routes/api/healthz-smoke-528856326-a.test.ts`, containing exactly **one** `it()` case asserting the returned object deep-equals `{ ok: true, variant: "1065915107" }`.
- **No `responds in under 100ms` case.** 47 of the 80 existing probe tests carry that wall-clock assertion; it is machine-dependent, a known CI-flake source, and was deliberately dropped in VRTX3-S-0011. A directory neighbour is a coin flip — copy the file named above, per [AGENT.md § Health Probe Routes](../../AGENT.md#health-probe-routes), whose pointer outranks any file an idea names.
- The existing 80 probe tests and the rest of the unit suite stay green and untouched.
- **The unit test alone does not prove the route is wired** — it imports the handler module directly, so it passes even if Nitro never registered the path. The live body/`Content-Type` check in each phase is the part that proves registration.

**Verify:** each TASK's new test passes in the `server` project; no existing test file is modified.

### Phase 5 — CI (folded into every TASK, no ticket of its own)

CI needs **no change** and must not be changed. `.github/workflows/ci.yml` already triggers on `push` and `pull_request` to `vortex/**`, `dev` and `main`, so every ticket branch (`vortex/feat/…`) and the sprint branch (`vortex/sprint/…`) get check runs with no edit. Each TASK's DoD therefore includes the app's lint, type-check, unit suite and production build all being green on its own branch, and:

- The production build emits `.output/server/_routes/api/healthz_smoke_1065915107_<suffix>.mjs` (dashes → underscores) — the artifact that confirms the route compiled into the production server.
- No `*.test.ts` file appears in the server bundle.
- No dependency is added to `package.json`, and `.github/workflows/ci.yml` is not modified.

**Verify:** CI green on each ticket branch, and green on the sprint branch after all three squash-merge.

---

## Decomposition

| Ticket           | Type  | Title                                        | Agent                           |
| ---------------- | ----- | -------------------------------------------- | ------------------------------- |
| **VRTX3-T-0160** | EPIC  | Health probe family `1065915107`             | — (container, closes by rollup) |
| **VRTX3-T-0161** | STORY | Three independent `1065915107` health probes | — (container, closes by rollup) |
| **VRTX3-T-0162** | TASK  | `GET /api/healthz-smoke-1065915107-a`        | implementation                  |
| **VRTX3-T-0163** | TASK  | `GET /api/healthz-smoke-1065915107-b`        | implementation                  |
| **VRTX3-T-0164** | TASK  | `GET /api/healthz-smoke-1065915107-c`        | implementation                  |

**Why three TASKs and not one.** The MINIMUM VIABLE BACKLOG rule says merge unless there is a concrete technical reason not to. Here the reason is the deliverable itself: VRTX3-I-0032's success metric is _"zero merge conflicts and zero existing source files modified across the three parallel units — the property the probe family exists to demonstrate."_ Collapsing a/b/c into one ticket would produce the same six files through one sequential agent session and prove nothing about parallel merge. Three tickets **is** the artifact under test.

**Why no `depends_on` edge anywhere.** The three ownership maps are disjoint — two new files each, no file in common, no import between them, no shared config. Adding a dependency edge would serialize them and, again, delete the property being demonstrated. The one file set they could have collided on (the three root docs carrying the probe count) is owned exclusively by this planning ticket and is already at its target value.

---

## Risks

| Risk                                                                                                                                                                                                                | Mitigation                                                                                                                                                                                              |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **SPA fallback masks a missing route.** An unwritten `/api/*` path returns `200 text/html`, so a status-code assertion passes whether or not the route exists — measured again this sprint, fifteenth confirmation. | Every verification in every PLAN.md asserts on the response **body and `Content-Type`**. The baseline measurement is recorded in each PLAN.md so the implementer knows what "before" looked like.       |
| **Copy-source drift re-introduces the flaky timing case.** 47 of 80 probe tests carry `expect(elapsed).toBeLessThan(100)`; sampling a neighbour is a coin flip.                                                     | Each PLAN.md pins `routes/api/healthz-smoke-528856326-a.test.ts` by name and states the one-`it()` rule explicitly as a DoD item.                                                                       |
| **Doc count drift.** The probe count lives in three root docs and has gone stale before (VRTX3-S-0015).                                                                                                             | Re-derived from the filesystem (80 → 83) and updated in all three in one pass on this planning ticket. No TASK touches a root doc, so there is no concurrent-edit window.                               |
| **A reviewer asks to factor out a shared handler.**                                                                                                                                                                 | That is a request to delete the property under test. [ARCHITECTURE.md § Key Decisions](../../ARCHITECTURE.md#key-decisions) records the choice; each PLAN.md restates it as a fixed interface contract. |
| **Wrong dev-server port during verification** produces connection errors that look like a broken route.                                                                                                             | Read the Vite banner. It bound `:5000` here; the six prior sprints bound `:5005`, `:5006`, `:5007`, `:5000`, `:5001`, `:5002`.                                                                          |

---

## Definition of Done (sprint)

- All three paths return `Content-Type: application/json` and a body deep-equal to `{"ok":true,"variant":"1065915107"}` on the integrated sprint branch.
- Six new files under `routes/api/`; zero existing source files modified; no dependency added.
- The three new colocated tests pass in the Vitest `server` project, each with exactly one `it()` case and no elapsed-time assertion.
- The production build emits `healthz_smoke_1065915107_a.mjs`, `_b.mjs` and `_c.mjs` under `.output/server/_routes/api/`, with no `*.test.ts` in the bundle.
- CI is green on the sprint branch.
- The probe count reads **83** in `AGENT.md`, `ARCHITECTURE.md` and `PRODUCT.md` (delivered by the planning ticket).
