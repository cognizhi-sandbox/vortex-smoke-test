# Technical decisions — three health probes for variant 436511294

Read this before implementing any ticket in this change. Each ticket's `PLAN.md` cites the
sections below rather than repeating them.

## Measured context

Taken on `vortex/sprint/vrtx3-s-0047-8cd3c597` at `351a214` during planning.

| Measurement                                                  | Value |
| ------------------------------------------------------------ | ----- |
| `healthz-smoke-*` handlers under `routes/api/`               | 145   |
| Colocated `healthz-smoke-*.test.ts` files                    | 145   |
| Probe tests carrying `expect(elapsed).toBeLessThan(100)`     | 47    |
| `.ts` files under `routes/api/` (recursive)                  | 296   |
| Test files across `src/` and `routes/` (pre-sprint baseline) | 152   |
| Files matching `436511294`                                   | 0     |

The last row is the one this change acts on. The 47 legacy tests are never rewritten, so that
numerator is fixed while the family grows — see § D2.

**Live route measurement.** A dev server was started and its port read from the Vite banner
(`:5000` this run — the port is per container, not per sprint, so do not assume it). Then:

| Path                                       | Result                                                                 |
| ------------------------------------------ | ---------------------------------------------------------------------- |
| `/api/healthz-smoke-436511294-a`           | `200 text/html; charset=utf-8` — the SPA shell                         |
| `/api/healthz-smoke-436511294-b`           | `200 text/html; charset=utf-8` — the SPA shell                         |
| `/api/healthz-smoke-436511294-c`           | `200 text/html; charset=utf-8` — the SPA shell                         |
| `/api/healthz-smoke-528856326-a` (control) | `200 application/json;charset=UTF-8 {"ok":true,"variant":"528856326"}` |
| `POST /api/healthz-smoke-528856326-a`      | `200 application/json;charset=UTF-8`                                   |

An unrouted `/api/*` path falls through to the SPA shell rather than returning `404`, so the
status code cannot distinguish a working endpoint from a missing one. Assert on the body and
`Content-Type`. The idea canvas made no status-code claim, so there was nothing to correct this
time; the measurement was taken regardless, because only it says what is on disk today.

The `POST` row confirms the canvas's own edge-case note: handlers here declare no method guard,
so every verb returns the same body. That is the existing family-wide behaviour and this change
keeps it — it is not a defect and not something to "fix" on three routes in isolation.

## D1 — Three tickets, one probe each, no dependency edge

Each probe owns exactly two new files and shares none with its siblings, so the three ownership
maps are disjoint and no `depends_on` edge is needed. This is the property the family exists to
demonstrate; collapsing the three into one ticket would deliver the same code while discarding
the evidence, and the idea's first user story asks for it explicitly.

The EPIC and STORY are containers and close by rollup. Total backlog: 1 EPIC + 1 STORY + 3 TASKs.

## D2 — Copy from the pinned `healthz-smoke-528856326-a` pair, not from a sampled neighbour

`AGENTS.md § Health Probe Routes` pins `routes/api/healthz-smoke-528856326-a.ts` and its `.test.ts`
sibling as the copy source. 47 of the 145 probe tests predate VRTX3-S-0011 and carry a second
`responds in under 100ms` case; a wall-clock assertion on a shared runner is flaky and proves
nothing about the contract, so the current pattern is a single body assertion.

**What this idea named, and how it checks out.** VRTX3-I-0057 cites
`routes/api/healthz-smoke-302960562-a.ts` as the handler pattern and
`routes/api/healthz-smoke-1065915107-c.test.ts` as the test pattern. Both were diffed at planning:

- `healthz-smoke-302960562-a.ts` — clean. It is a **handler**, and handlers cannot carry the
  timing case; only tests can. Its `.test.ts` sibling _is_ one of the 47 legacy files, but the
  canvas did not cite that file, so the citation carries no exposure.
- `healthz-smoke-1065915107-c.test.ts` — clean, post-VRTX3-S-0011, single body assertion.

So both citations are correct for the role each was cited in. The substitution to the pinned pair
is made anyway and costs nothing: the check that a pointer is right is the same one diff that
catches a wrong one, so reading the named file is never skippable. Implement from the
`528856326-a` pair and change only the variant string and the identifier names.

**Do not add a timing assertion.** No acceptance criterion in this change asks for one. The
property such an assertion reaches for — the handler performs no I/O — is guaranteed by the
interface contract in § D3 instead: the only import is `nitro/h3`, and there is no `db/` import
and no `event.context` read to be slow.

## D3 — Fixed interface contract

Every probe file in this change is exactly this shape, with `<letter>` and the identifier varying:

- Module: `routes/api/healthz-smoke-436511294-<letter>.ts`
- Only import: `defineHandler` from `nitro/h3`
- Default export: `defineHandler(() => ({ ok: true, variant: "436511294" }))` — a parameterless
  arrow returning an object literal, `variant` a **string**
- No `event` parameter read, no method guard, no `db/` import, no sibling import

The colocated test is `routes/api/healthz-smoke-436511294-<letter>.test.ts`: build
`new H3Event(new Request("http://localhost/api/healthz-smoke-436511294-<letter>"))`, `await` the
default export, and `expect(result).toEqual({ ok: true, variant: "436511294" })`. One `it` block.

The variant string `436511294` is shared by all three probes and the trailing `-a`/`-b`/`-c`
distinguishes the paths — matching how existing sibling sets behave (`healthz-smoke-302960562-a`
and `-c` both return `variant: "302960562"`).

**The filename is the URL contract.** `routes/api/x.ts` serves `/api/x` with no registration
step, so a filename typo is a wrong URL with no other symptom — and, per the measurement above,
the wrong URL still answers `200`. Verify by body and `Content-Type`, never by status.

## D4 — No root document changes this sprint

None of the three triggers fires:

- **`PRODUCT.md`** — the capability map gains no line. `health-probes` is already a listed
  capability and the document deliberately carries no probe count and no "most recent" pointer,
  so three more instances of an existing capability change nothing in it.
- **`ARCHITECTURE.md`** — topology, data model, integration points and cross-cutting constraints
  are untouched. No decision here binds work beyond this change: D1, D2 and D3 are all
  applications of the existing "Health probes duplicate, on purpose" entry, so `## Key Decisions`
  gains nothing.
- **`DESIGN.md`** — no token, type scale, grid, interaction pattern or accessibility standard
  moves. There is no UI in this change; the idea carries no design blocks.

`AGENTS.md` is human-authored and is never rewritten. Its probe-family denominator has drifted
again (it says 124; the filesystem says 145). `.vortex/agents-generated.md` already records that
drift and states, correctly, that it will not be maintained as a running figure — re-stamping it
every sprint is exactly the upkeep the "Root docs carry no per-sprint counts" decision avoids, and
the count is one command away from the filesystem. No new entry was added.

## D5 — Test harness

No harness change. The tiers already cover this shape and this change adds no new one.

- Route tests run under the Vitest `server` project (`environment: "node"`,
  `include: ["routes/**/*.test.ts"]`). A test placed anywhere else silently does not run, so the
  file must be colocated in `routes/api/` and `.test.ts`-suffixed.
- `vite.config.ts` sets `nitro({ serverDir: "./", ignore: ["**/*.test.ts"] })`. The `.test.ts`
  suffix is therefore mandatory rather than stylistic: a test file named outside that convention
  is bundled into the production server as a route handler.
- A route's unit test imports the handler module directly, so it passes even if Nitro never
  registered the path. Only a live request, or the presence of the route module in the build
  output, proves the route is wired — which is why every ticket's AC-5 asserts on
  `.output/server/_routes/api/healthz_smoke_436511294_<letter>.mjs` (dashes become underscores).
- No Playwright work. `e2e/smoke.spec.ts` is untouched; probes carry no E2E coverage by standing
  decision, and Validation runs the full E2E tier against the merged sprint branch anyway.

Expected post-sprint test-file total: 155 (baseline 152 + 3).

## D6 — CI

No CI change. `.github/workflows/ci.yml` already triggers on pushes and pull requests to
`vortex/**`, `dev` and `main`, so each ticket's mini-PR and the sprint branch get check runs with
no edit. The workflow runs the repository's existing lint, typecheck and unit tiers; three new
files of the established shape add no job, no matrix entry and no dependency.
