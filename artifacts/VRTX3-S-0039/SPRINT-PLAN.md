---
artifact: sprint-plan
spec: 1
status: complete
author_role: planning
sprint: VRTX3-S-0039
idea: VRTX3-I-0048
change: vrtx3-i-0048-smoke-178762111363042-3-independent-endpoints-81
branch: vortex/sprint/vrtx3-s-0039-4e9a09bd
downstream:
  - artifacts/VRTX3-S-0039/VRTX3-T-0260/PLAN.md
  - artifacts/VRTX3-S-0039/VRTX3-T-0261/PLAN.md
  - artifacts/VRTX3-S-0039/VRTX3-T-0262/PLAN.md
---

# Sprint plan — VRTX3-S-0039

## Goal

Ship `/api/healthz-smoke-812788042-a`, `-b` and `-c`, each answering
`Content-Type: application/json` with `{"ok":true,"variant":"812788042"}`. Purely additive: 6 new
files under `routes/api/`, 0 existing source files modified.

This is a **spec-driven** sprint. The behaviour contract lives in the change, not here:

- `openspec/changes/vrtx3-i-0048-smoke-178762111363042-3-independent-endpoints-81/`
  — `proposal.md`, `design.md`, `specs/health-probes/spec.md`, `tasks.md`.
- Every ticket acceptance criterion derives one-for-one from a scenario in that delta spec, so a
  QA verdict traces back to a named requirement.

Validated at planning with the strict OpenSpec check.

## Backlog

| Ticket       | Type  | Scope                            | Plan                                             |
| ------------ | ----- | -------------------------------- | ------------------------------------------------ |
| VRTX3-T-0258 | EPIC  | container                        | —                                                |
| VRTX3-T-0259 | STORY | container                        | —                                                |
| VRTX3-T-0260 | TASK  | `/api/healthz-smoke-812788042-a` | [`VRTX3-T-0260/PLAN.md`](./VRTX3-T-0260/PLAN.md) |
| VRTX3-T-0261 | TASK  | `/api/healthz-smoke-812788042-b` | [`VRTX3-T-0261/PLAN.md`](./VRTX3-T-0261/PLAN.md) |
| VRTX3-T-0262 | TASK  | `/api/healthz-smoke-812788042-c` | [`VRTX3-T-0262/PLAN.md`](./VRTX3-T-0262/PLAN.md) |

Three implementation tickets, one per endpoint. Each owns exactly two new files; the three
ownership maps are disjoint, so **no `depends_on` edge is set** and the tickets may be worked and
merged in any order, concurrently. That independence is the deliverable the sprint exists to
prove, not an incidental property of it — merging the three into one ticket would ship the same
six files while destroying the thing being demonstrated.

## Phases

Phases 1–3 run in parallel. Phase 4 is the sprint's own gate.

### Phase 1 — Probe A (VRTX3-T-0260)

Add `routes/api/healthz-smoke-812788042-a.ts` and its colocated `.test.ts`.

### Phase 2 — Probe B (VRTX3-T-0261)

Add `routes/api/healthz-smoke-812788042-b.ts` and its colocated `.test.ts`.

### Phase 3 — Probe C (VRTX3-T-0262)

Add `routes/api/healthz-smoke-812788042-c.ts` and its colocated `.test.ts`.

### Phase 4 — Test harness and CI

No harness or CI work is required, and no ticket carries any. Recorded here so the absence is a
finding rather than an omission:

- **Unit tier.** The `server` Vitest project already collects `routes/**/*.test.ts` in a node
  environment with a real `H3Event` and no live server. A new `.test.ts` under `routes/api/` is
  picked up with zero configuration. Each phase above adds its own test; there is no separate
  test ticket.
- **Route registration.** `nitro({ serverDir: "./", ignore: ["**/*.test.ts"] })` in
  `vite.config.ts` registers each handler by filename and keeps colocated tests out of the server
  bundle. No route table, registry or index file to edit.
- **E2E tier.** Untouched. Probes have no browser surface, and the idea puts UI and Playwright
  coverage out of scope. Playwright runs on `:5178` with `--strictPort`, so a running dev server
  never absorbs a test run.
- **CI.** `.github/workflows/ci.yml` already triggers on `push` and `pull_request` for
  `vortex/**`, `dev` and `main`, running doc-links → typecheck → lint → test → build. Ticket
  mini-PRs and this sprint branch therefore get check runs with no change. Lint runs at
  `--max-warnings 0`.

**Test-file baseline, recorded at Stage 0:** `git ls-tree -r --name-only HEAD | grep -cE
'^(src|routes).*\.test\.(ts|tsx)$'` → **128** files. Integration QA should report the post-sprint
total against this number; the expected figure is **131**.

## Codebase findings

- `routes/api/` lists **245 entries**: 121 probe handlers, their 121 colocated tests, `hello.ts`,
  `hello.test.ts`, and the `users/` directory. Counted recursively that is **248 `.ts` files**,
  because `users/` holds four (`[id].ts`, `[id].test.ts`, `index.get.ts`, `index.get.test.ts`).
  Both numbers matter and they are not the same number — 121 + 121 + 2 + 1 = 245 entries,
  121 + 121 + 2 + 4 = 248 files. After this sprint: 124 probes, 251 entries, 254 files.
- A repo-wide grep for `812788042` returns **zero** matches. All three paths are unwritten; none
  is a typo'd filename or a broken handler.
- The established handler is seven lines: a default-exported `defineHandler` from `nitro/h3`
  returning a literal object. Its colocated test constructs an `H3Event` directly and asserts on
  the returned object.
- `middleware/auth.ts` attaches a hardcoded `event.context.user` to every request and never
  rejects, so it does not affect these handlers.
- The `health-probes` capability already exists in `openspec/specs/health-probes/spec.md`, written
  at VRTX3-S-0038's close. This change adds three requirements to it and restates none.

## Cross-cutting notes

- **All three paths answer `200 text/html`, not `404`.** Re-measured live at planning on a dev
  server at `:5001`:

  ```
  /api/healthz-smoke-812788042-a   →  200 text/html; charset=utf-8        949 B  (SPA shell)
  /api/healthz-smoke-812788042-b   →  200 text/html; charset=utf-8        949 B  (SPA shell)
  /api/healthz-smoke-812788042-c   →  200 text/html; charset=utf-8        949 B  (SPA shell)
  /api/healthz-smoke-528856326-a   →  200 application/json;charset=UTF-8   33 B  {"ok":true,"variant":"528856326"}
  ```

  Twenty-ninth consecutive confirmation. Assert on the **body and `Content-Type`**; a
  `404 → 200` check passes whether or not the route exists. VRTX3-I-0048 makes no status-code
  claim — the fifth canvas in this family to stay quiet on it, so there was nothing to debunk.
  The measurement was taken anyway, because what it answers is "does the file exist in this
  working tree today", which no canvas observes.

- **Read your own dev-server port from the Vite banner.** Planning got `:5001`; the banner said
  `Port 5000 is in use, trying another one...`. The port is per-container, not per-sprint —
  VRTX3-S-0036 saw both `:5000` and `:5001` across its own runs, and VRTX3-S-0038 saw `:5000`.
  This sprint's number is not yours to reuse.

- **Copy `routes/api/healthz-smoke-528856326-a.{ts,test.ts}`.** VRTX3-I-0048 names
  `healthz-smoke-1065915107-a.ts` and `healthz-smoke-1065915107-c.test.ts` instead. Both were
  diffed at planning and carry no wall-clock case, so this is the **sixth harmless instance**
  against three harmful — but the substitution is applied regardless, and every PLAN.md says so.
  47 of the 121 probe tests carry `expect(elapsed).toBeLessThan(100)`; the ratio moves to 47 of
  124 after this sprint and is fixed by files that are never rewritten. Do not sample a directory
  neighbour.

  Worth noting about which halves were named: the canvas cites a **handler** (`-a.ts`) and a
  **test** (`-c.test.ts`) from the same triple. Only tests carry the timing case, so a canvas
  citing a handler has said nothing about the risky half — here both were checked and both are
  clean.

- **Do not factor the family into a shared handler, factory, constants file or barrel export.**
  The duplication is a recorded decision in `ARCHITECTURE.md § Key Decisions`. A shared module
  would convert every future probe into a shared-file edit — the coupling the probes exist to
  disprove — and would make these three tickets collide with each other.

- **No ticket touches a root document.** The probe-family count lives in three planning-owned root
  docs and was moved 121 → 124 once, on this planning ticket, re-derived from the filesystem
  rather than incremented. No implementation ticket carries a documentation change.

- **The idea's `bun run verify` criterion is carried as an outcome, not a command.** VRTX3-I-0048's
  AC-8 names a verification script and its three constituent tools. What it reaches for — the new
  tests run green in the existing suite with no new lint warning or type error — is stated in each
  ticket's criteria as an observable result. Which command produces it is the implementing agent's
  call.

- **No design work.** `a2a_get_idea_design` for VRTX3-I-0048 returns `blocks: []` and the canvas's
  Wireframes section is empty, so nothing was exported to `artifacts/VRTX3-S-0039/design/` and no
  PLAN.md carries a design reference. The idea puts UI explicitly out of scope.

## Risks

| Id  | Risk                                                                  | Mitigation                                                                                             |
| --- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| R1  | A stale copy-pasted `variant` string from the template pair           | Each PLAN.md quotes the exact target file contents; the colocated test asserts the literal value       |
| R2  | A filename typo silently produces a wrong URL with no other symptom   | Filename is the URL contract; verification is a live request on the body, plus the build-output module |
| R3  | The wall-clock timing case propagates from one of the 47 legacy tests | Pinned copy source named in the plan and in all three tickets; substitution recorded in each work log  |
| R4  | Two tickets collide in `routes/api/`                                  | Disjoint two-file ownership maps; the only shared surface (root docs) is held by the planning ticket   |

## Definition of done for the sprint

- All three paths answer `200`, `application/json`, `{"ok":true,"variant":"812788042"}` on the
  merged sprint branch.
- Three new colocated tests run green in the existing unit tier; total test files 128 → 131.
- CI is green on the sprint branch.
- No existing route under `routes/api/` changes behaviour.
