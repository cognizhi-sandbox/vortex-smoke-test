# Agent Guide

`CLAUDE.md` and `GEMINI.md` are symlinks to this file — one authored manual, whatever
harness is reading it.

**Vortex composes four of the sections below straight into every agent's prompt**:
`## Build & Run`, `## Test & Validate`, `## Conventions` and `## Gotchas`. Everything
else — `## Changelog` — is named in the prompt and read from the file on demand. Put an
instruction an agent must obey in one of those four, and keep accumulated sprint history
out of them; a heading outside the four costs nothing, a heading inside costs every run.

Commands are NOT listed here. They are declared once, machine-readably, in
`.vortex/config.yaml` under `commands:`, and reach every agent as a resolved table under
`## Project commands`. This file explains the ones whose behaviour is not obvious; it
does not restate them.

See [PRODUCT.md](./PRODUCT.md) for what this project is, [ARCHITECTURE.md](./ARCHITECTURE.md)
for the stack and key decisions, and [DESIGN.md](./DESIGN.md) for the visual system.

## Build & Run

`start` runs the Vite SPA and the Nitro server together, with HMR for both `.tsx` files
and server routes.

**Read the dev-server port from the Vite banner.** `:5000` is the preferred port, not a
guarantee — contention has pushed it to `:5001`–`:5007` across sprints, and the banner
says which it took (`Port 5000 is in use, trying another one...`). Measuring against the
wrong port yields connection errors that look like a broken route. Playwright is separate
and fixed: `:5178` with `--strictPort`, so a running dev server never absorbs a test run.

`build` outputs two things: `dist/` (the Vite SPA bundle, static) and
`.output/server/index.mjs` (the Nitro server). **The server must run under Bun** —
`db/client.ts` imports the `bun:sqlite` builtin, so `node .output/server/index.mjs` fails
at import. Under PM2/systemd set `interpreter: "bun"`.

`auto-imports.d.ts` does not exist on a fresh clone. The `prebuild` and `pretypecheck`
hooks generate it; if `tsc` fails on a new machine, run
`bun scripts/ensure-generated-files.mjs` first. Give any new tsc-only script the same hook.

**`node` is not on `PATH` in an agent container — use `bun` to run a `.mjs` script directly.**
Bun's script runner shims `node`, so a `node …` line _inside_ a package script works
(`bun run typecheck` runs its `pretypecheck` hook fine), and CI works because GitHub Actions
provides Node. A bare `node scripts/…mjs` in your shell fails with `command not found`.
That applies to `check-doc-links.mjs` too: run it as `bun scripts/check-doc-links.mjs`.
The script itself is portable — only the interpreter on `PATH` differs.

## Test & Validate

`verify` is the browser-free core gate — lint, typecheck and the unit tier. Run it before
committing. `verify-full` adds the E2E tier and is the Validation gate; prefer it, because
every environment this repo targets ships a Chromium.

The E2E scripts carry a preflight that fails fast with a clear message when the browser is
genuinely missing. If you hit it, fall back to `verify`, note the skipped E2E in your
summary, and move on — do **not** retry E2E and do **not** try to install a browser.

`test-smoke` is one spec (`e2e/smoke.spec.ts`): the home page loads, the main heading is
visible, there are no console errors, and `/api/hello` answers.

The unit tier covers three shapes in one run — `src/**/*.test.tsx` (components and pages,
jsdom + React Testing Library), `src/**/*.test.ts` (utilities), and `routes/**/*.test.ts`
(API routes, node environment, a real `H3Event`, no live server). All of them run with
`NODE_ENV=test` and `VITEST=true`, which makes `db/client.ts` use an in-memory SQLite
database, so a test run never touches `sqlite.db`.

| You changed...                            | Add...                                      | Copy from                           |
| ----------------------------------------- | ------------------------------------------- | ----------------------------------- |
| A util (`src/utils`)                      | Unit test, `<name>.test.ts`                 | `src/utils/cn.test.ts`              |
| A component                               | UI test, `<name>.test.tsx`                  | `src/components/ui/button.test.tsx` |
| A page                                    | UI test, `<name>.test.tsx`                  | `src/pages/index.test.tsx`          |
| An API route/middleware                   | Integration test, real `H3Event`, no server | `routes/api/hello.test.ts`          |
| A cross-page/responsive/browser-only flow | Playwright spec in `e2e/`                   | `e2e/home.spec.ts`                  |

**A route's unit test imports the handler module directly**, so it passes even when Nitro
never registered the path. Only a live request proves a route is wired — see `## Gotchas`.

A spec you have not executed is not a test. Never commit a `*.spec.ts` you have not run at
least once.

**Record the pre-sprint test-file count in the sprint plan at Stage 0** —
`git ls-tree -r --name-only HEAD | grep -cE '^(src|routes).*\.test\.(ts|tsx)$'`. Integration
QA reports the post-sprint total; without a written baseline beside it, "122 files / 182
tests" says nothing about what this sprint added, and three consecutive closes have had to
re-derive it after the fact.

## Conventions

### File-Based Routing

**Frontend** (`src/pages/**/*.tsx`):

```
src/pages/
  index.tsx           → /
  about.tsx           → /about
  blog/[id].tsx       → /blog/:id
  [...all].tsx        → /* (catch-all)
  page.test.tsx       → excluded from routing (Pages({ exclude }))
```

**Backend** (`routes/api/**/*.ts`):

```
routes/api/
  hello.ts              → GET /api/hello
  hello.post.ts         → POST /api/hello
  users/index.get.ts    → GET /api/users
  users/[id].ts         → GET /api/users/:id (dynamic routes)
  hello.test.ts         → excluded from routes (nitro({ ignore }))
```

Middleware runs on every route:

```
middleware/
  auth.ts               → sets event.context.user
```

### Health Probe Routes

`routes/api/healthz-smoke-*.ts` is a family of 115 near-identical GET probes, each returning `{ ok: true, variant: "<id>" }`. Adding one: copy `routes/api/healthz-smoke-528856326-a.ts` and its `.test.ts` sibling, change the variant string, change nothing else.

**Copy that pair, not an older one — and not one an idea names.** 47 of the 115 probe tests, all written before VRTX3-S-0011 (e.g. `healthz-smoke-913793173-a.test.ts`, `healthz-smoke-126862920-c.test.ts`, `healthz-smoke-302960562-a.test.ts`), carry a second `responds in under 100ms` case. Wall-clock assertions on a shared CI runner are flaky and prove nothing about the contract, so the current pattern is a single body assertion. Don't propagate the timing case into new probes. Ideas and defect reports occasionally name one of those older files as the template — VRTX3-I-0026 named `healthz-smoke-126862920-c.test.ts` — because they sample the directory rather than read this line. **This pointer outranks the pointer in an idea canvas:** copy the `528856326` pair, keep the single body assertion, and note the substitution in the work log.

**Substitute even when the named file looks fine — and expect the sampling to bite eventually.** VRTX3-I-0027 through VRTX3-I-0035 each named the `528856326` pair themselves, so nine sprints running had nothing to substitute. VRTX3-I-0036 broke that streak by naming `healthz-smoke-1065915107-c.test.ts`, a file _shape-identical_ to the pinned one because it postdates VRTX3-S-0011 and carries no timing case. That was recorded here as the more dangerous version of the drift, not the safer one: the substitution cost nothing, so nothing went wrong to teach the rule, and the next canvas to sample the directory had a 47-in-92 chance of landing on a file where it mattered.

**It landed on one immediately.** VRTX3-I-0037, the very next idea, named `healthz-smoke-302960562-a.test.ts` — a pre-VRTX3-S-0011 file that does carry `expect(elapsed).toBeLessThan(100)` — in both its Technical Approach and its Affected Code sections, and then pinned the shape into an acceptance criterion of its own: _"Each handler returns in under 100 ms when invoked directly in its unit test."_ Following the pointer changed what got written for the first time since VRTX3-I-0026. Note what the canvas did **not** do wrong: it never claimed the timing case was good practice, it simply sampled a neighbour and copied its shape forward, exactly as the two prior drifts did. The lesson is that this failure mode recurs on a schedule set by the 47/95 ratio, not by canvas quality. Follow the pointer regardless of which neighbour was named, drop the timing case, and record the substitution.

**A sprint where the pointer has nothing to substitute is the normal case, not evidence the risk has passed.** VRTX3-S-0030 had no canvas behind either defect, so no template was named at all; VRTX3-I-0040 (VRTX3-S-0033) named the `528856326` pair itself, correctly, and additionally reproduced the reasoning — that the no-I/O property comes from the interface contract rather than a wall-clock assertion. Two consecutive quiet sprints move the ratio to **47 of 100** and change nothing about what to do next time: the 47 legacy tests are never rewritten, so every future canvas that samples the directory instead of reading this line still has close to even odds of landing on one. Check which file was named, every time.

VRTX3-S-0002 ended the quiet run with another shape-identical near-miss: VRTX3-I-0005 named `healthz-smoke-bugfix3-351014898.test.ts`, a post-VRTX3-S-0011 neighbour carrying no timing case, so substituting the pinned pair again cost nothing. That is now the second recorded instance of the harmless form (after VRTX3-I-0036) against one harmful (VRTX3-I-0037) — the ratio to watch is still 47 of 103, not the sampling record. Substitute on the rule, not on how the named file looks.

VRTX3-S-0003 made it three harmless to one: VRTX3-I-0006 named `healthz-smoke-bugfix3-834560860.test.ts`, the pair added by the immediately preceding sprint, so it was shape-identical by construction and the substitution again cost nothing. Note what makes this one worth recording rather than routine — the canvas did not sample at random, it named the **most recent** probe, which is the sampling heuristic most likely to be safe and therefore most likely to look like a reason to stop substituting. It is not one. The ratio (now 47 of 109) is fixed by files that are never rewritten, and the next canvas that reaches one directory entry further back lands in the legacy half.

**It reached one directory entry further back on the very next sprint.** VRTX3-S-0034's VRTX3-I-0041 named `healthz-smoke-bugfix3-993514120` and its test — a pre-VRTX3-S-0011 file carrying `expect(elapsed).toBeLessThan(100)` — and, like VRTX3-I-0037 before it, pinned the shape into an acceptance criterion of its own (_"asserts the 200 body and a sub-100ms response, mirroring the sibling test"_). Second harmful instance against three harmless. Two things about it are worth keeping. First, it followed immediately after the entry above predicted exactly this, which is the ratio behaving as described rather than a surprise. Second, VRTX3-I-0041 is the **best-evidenced canvas the family has produced** — it greps the variant id, quotes the sibling handler in full, diagrams the routing fall-through, and devotes a Regression Risk section to warning against a stale copy-pasted `variant`. Canvas quality does not predict this failure mode, because the drift enters through which neighbour got sampled, not through how carefully the sample was read. Check which file was named, every time.

**A canvas can name this exact hazard and still fall into it.** VRTX3-S-0035's VRTX3-I-0042 named `healthz-smoke-913793173-a.ts` / `.test.ts` — the first file listed as an example two paragraphs above, pre-VRTX3-S-0011, timing case and all — in its Solution, its Technical Approach and its Affected Code sections. Third harmful instance against three harmless. What is new, and the reason it is worth a paragraph rather than a tally mark: its own risk register **states the failure mode correctly** — _"`routes/api/` already holds ~200 `healthz-smoke-*` files; the directory is noisy, so an agent could copy the wrong reference file"_ — and then names a legacy file as the mitigation for it. Prior drifts sampled a neighbour without noticing the hazard; this one noticed the hazard and still landed on the wrong side of it. Treat that as settled: **a canvas cannot self-correct here**, because the information needed to tell a safe neighbour from a legacy one is not in the directory, it is in this section. One thing made it cheaper to contain than VRTX3-I-0037 and VRTX3-I-0041 — it did not pin the timing shape into an acceptance criterion, so dropping the extra `it()` block satisfied every AC as written.

**A canvas can reach this section's own conclusion in prose and still name a file it did not check against it.** VRTX3-S-0036's VRTX3-I-0043 named `healthz-smoke-189360772-a` in three sections — a post-VRTX3-S-0011 file, shape-identical to the pinned pair, so the fourth harmless instance against three harmful. What is new is the reasoning that sits beside it: the same canvas **rejects** the timing assertion in its Open Questions, in the same terms this section uses — _"a sub-100ms check on a constant-returning handler measures the runtime, not the code"_ — and then names, as its template, a file it verified only by being a plausible neighbour. Reaching the right conclusion about the assertion is not the same as knowing which of 115 identical-looking files carries it. The two rules that follow are unchanged by it: substitute regardless of how healthy the named file looks, and check which file was named, every time. The governing number is still the 47 legacy tests, now 47 of 115, which are never rewritten.

**An idea's acceptance criterion does not outrank this either.** When a canvas AC demands the timing assertion, plan to the outcome it is reaching for — the handler performs no I/O — which the probe's interface contract already guarantees (only import is `nitro/h3`, no `db/`, no `event.context` read). Drop the AC and say so in the plan; do not add a wall-clock assertion to satisfy it.

**The duplication is deliberate — do not factor out a shared handler, factory, constants file or barrel export.** Independence is the point: each probe must be buildable and mergeable without touching any file another probe owns. See [ARCHITECTURE.md](./ARCHITECTURE.md#key-decisions).

A probe must not read `event.context.user` (unlike `routes/api/hello.ts`) and must not import from `db/`, so it stays answerable when auth and the database are unavailable.

### Auto-Imports

No `import React from 'react'` or `import { useState } from 'react'` needed — auto-imported via `unplugin-auto-import`:

```tsx
// This just works:
const App = () => {
  const [count, setCount] = useState(0);
  return <div>{count}</div>;
};
```

Same for `react-router` (useNavigate, useParams, useLocation, etc.).

### Styling

Tailwind CSS v4 (CSS-first, no JavaScript config):

- Custom properties (tokens) live in `src/index.css` under `:root` (light) and `.dark` (dark)
- Add new tokens: edit `src/index.css`, then use in markup as `bg-primary`, `text-foreground`, etc.
- No `tailwind.config.ts` — Tailwind scans `src/` for class usage and generates only what's used

shadcn-style primitives:

- Pattern: `src/components/ui/button.tsx` + `button-variants.ts`
- Variants via `class-variance-authority` (CVA)
- Polymorphism via Radix `Slot` (`asChild` prop)
- Class merging via `cn()` — last call wins, so consumers can override

### Database

Drizzle ORM with SQLite (`db/schema.ts` + `db/client.ts`):

- Schema defined in `db/schema.ts`, imported in routes as `import { db } from '@/db'`
- Migrations auto-generated and committed to `drizzle/`
- After editing schema: `bun run db:generate` → creates migration file
- Dev database is `sqlite.db` (gitignored); test database is in-memory (via `VITEST=true`)

### Testing

| Type           | Location                            | Tool             | Example                                      |
| -------------- | ----------------------------------- | ---------------- | -------------------------------------------- |
| Unit           | `src/utils/cn.test.ts`              | Vitest           | Pure function testing                        |
| Component/Page | `src/components/ui/button.test.tsx` | Vitest + RTL     | Render, query, userEvent                     |
| API Route      | `routes/api/hello.test.ts`          | Vitest + H3Event | Mock event, call handler, assert response    |
| E2E/Smoke      | `e2e/home.spec.ts`                  | Playwright       | Real browser, real dev server, critical path |

New test files: copy a similar existing test file — the table is in `## Test & Validate` above.

## Gotchas

- **A missing `/api/*` route returns `200 text/html`, NOT `404`.** An unmatched API path falls through to the SPA `index.html` shell, in `bun run dev` and in the production build alike (nginx does not change this — `location /api/` proxies straight to Nitro with `proxy_intercept_errors` off). So **status code alone cannot tell a working endpoint from a missing one**, and a `404 → 200` check proves nothing. When adding or verifying an API route, assert on the **response body and `Content-Type`**:

  ```bash
  # missing route  → 200 text/html; charset=utf-8       (the SPA shell)
  # working route  → 200 application/json;charset=UTF-8 {"ok":true,...}
  curl -s -o /dev/null -w '%{http_code} %{content_type}\n' http://localhost:5000/api/<route>
  ```

  Ten bugfix sprints (VRTX3-S-0001, -0007, -0008, -0009, -0012, -0014, -0015, -0018, -0020, -0024) each re-discovered this after acting on a bug report that claimed `404`. The mis-transcription originates upstream in defect capture, not in this repo, so it will keep arriving — **treat a `404` in an incoming defect report for an `/api/*` path as a mis-transcription by default** — the defect is usually real, but its stated status code is not; re-measure before planning any verification around it. Note also that a route's **unit test imports the handler module directly**, so it passes even if Nitro never registered the path — only a live request proves the route is wired.

  **This is not only a bugfix-sprint trap.** VRTX3-S-0016, -0017, -0019, -0021, -0022, -0023, -0026, -0027 and -0028 were additive enhancements with no `404` claim to debunk, and in all nine the not-yet-written paths still answered `200 text/html` while the control answered `200 application/json` — nineteen consecutive confirmations across both sprint shapes. **Nor is a canvas that already debunked its own `404` a reason to skip the measurement:** in VRTX3-S-0018 one of three defects came from an idea that had measured the SPA fallback itself, while its two siblings had no idea linked and asserted `404` unchecked — you cannot tell which kind of report you are holding without re-measuring. VRTX3-S-0020 hit the identical split again, with a twist worth knowing: its one grounded canvas could not measure anything (no dev server was running in the capture container) and instead _predicted_ the `200 text/html` result from this entry, flagging its own `404` as a likely mis-transcription. A correct prediction is still not a measurement — the live check was taken, and confirmed it. VRTX3-S-0019's canvas went further and cited this very entry by name; the measurement was still taken, and still came back `200 text/html`. VRTX3-S-0021's canvas did the same — it stated the fallback behaviour correctly in its own risk register, and the live check was taken anyway, for the thirteenth confirmation; VRTX3-S-0022's and VRTX3-S-0023's canvases did the same again, for the fourteenth and fifteenth. VRTX3-S-0024 hit the uneven-capture split for the third time (VRTX3-S-0018 and -0020 were the others): one of its three defects had a canvas that predicted the fallback correctly but could not measure it, and its two siblings had no idea linked and asserted `404` unchecked — sixteenth confirmation. VRTX3-S-0026 produced the cleanest version of the pattern yet: VRTX3-I-0035 stated the fallback correctly, labelled its own claim **"inferred from `AGENT.md`, not measured"** because no dev server ran in its capture container, and explicitly asked whoever picked it up to re-measure. That is a canvas doing everything right — and the measurement was still taken, for the seventeenth confirmation, because a canvas cannot tell you what is on disk today. VRTX3-I-0036 (VRTX3-S-0026's successor) went one step further and made no status-code claim at all, reasoning the routing straight from `vite.config.ts` instead; the measurement was taken again, for the eighteenth confirmation. VRTX3-I-0037 did the same — no status-code claim, nothing to debunk — and the measurement was taken for the nineteenth. VRTX3-S-0030 supplied the twentieth (two defects, neither with a canvas behind it, both asserting `404` unchecked) and VRTX3-I-0040 the twenty-first: a canvas that states the fallback correctly in its own risk register, cites the 949-byte shell figure, and tells whoever picks it up to assert the JSON body or the built module rather than the status code. The measurement was taken anyway, and matched. VRTX3-S-0002 supplied the twenty-second and repeated the uneven-capture split for the fourth time: VRTX3-I-0005 derived the fallback correctly from source and stated in as many words that it could measure nothing — no dev server was listening in its capture container — while its two sibling defects had no idea linked and asserted `404` unchecked. **A canvas that gets this right is evidence about that canvas, not about the working tree**; only the measurement tells you whether the file exists today. VRTX3-S-0003 supplied the twenty-third and VRTX3-S-0034 the twenty-fourth, the latter repeating the uneven-capture split for the **fifth** time: one of its three defects had a canvas (VRTX3-I-0041) and two had none. Note that the split now has a track record long enough to state plainly — in all five, the ungrounded siblings asserted `404` unchecked and the grounded one was wrong about the status code too. The canvas is not the safer half of a mixed sprint; it is just the half that shows its work. VRTX3-S-0035 supplied the twenty-fifth confirmation and a form not seen before: VRTX3-I-0042 is an **enhancement** canvas that opens _"all return 404 today … Nothing in `routes/api/` matches `180848429` (verified)"_ — one sentence carrying both the standing `404` mis-transcription and a correct, independently reproducible grep, with the `(verified)` parenthetical attaching only to the second. Until then the wrong status code had arrived through defect capture; this shows it can also be written into an additive idea by an author who measured the repository carefully in the same breath. **Scope the word "verified" to the clause it sits in.** VRTX3-S-0036 supplied the twenty-sixth immediately afterwards, and it is the counterpart case: VRTX3-I-0043 makes **no status-code claim at all** — it says only that the three paths "do not exist yet — confirmed by listing `routes/api/`", which is true and reproducible — so for the third time in the series (after VRTX3-I-0036 and VRTX3-I-0037) there was nothing to debunk. Two things follow. A canvas that states no status code is the cheapest kind to plan from, but it is not a reason to skip the measurement, because the question the measurement answers is "does the file exist in this working tree today", which no canvas observes. And a quiet canvas immediately after a loud wrong one is not a trend in canvas quality — the wrong `404` has arrived from defect capture, from a careful enhancement author, and not at all, in consecutive sprints. Whenever you need to know whether an `/api/*` route exists — adding one, verifying one, or triaging one — measure the body and `Content-Type`. There is no sprint shape in which the status code answers the question.

  **Read the dev-server port from the Vite banner — don't assume `:5000`, and don't extrapolate the drift either.** Vite bound `:5005` in VRTX3-S-0017, `:5006` in VRTX3-S-0018 and `:5007` in VRTX3-S-0019 — then `:5000` again in VRTX3-S-0020, `:5001` in VRTX3-S-0021, `:5002` in VRTX3-S-0022 and `:5000` once more in VRTX3-S-0023, -0024, -0026, -0027 and -0028, `:5002` again in VRTX3-S-0030, `:5000` in VRTX3-S-0033, -0003, -0034 and -0035, then **both `:5000` and `:5001` inside VRTX3-S-0036** — planning and two of the three implementation runs got `:5001`, the third and integration QA got `:5000`, in the same sprint. Read that as the correction to the list's shape: the port is per **container**, not per sprint, so even a same-sprint sibling's number is not yours to reuse. The climbs are contention, not a trend, so a planner who hard-coded `:5008` after the first three would have been as wrong as one who assumed `:5000` the sprint after — and a planner who then read `:5000`, `:5001`, `:5002` as a fresh climb and predicted `:5003` would have been wrong too. A five-sprint run on `:5000` broke on the sixth, which is the same lesson from the other side. The banner says which port it took and why (`Port 5000 is in use, trying another one...`); read it. Measuring against the wrong port yields connection errors that look like a broken route.

- **Nitro's `serverDir`**: Defaults to `false` — must be `"./"` in `vite.config.ts` or `routes/` and `middleware/` never load. Ours is set correctly; don't change it.
- **API route handlers are method-agnostic**: none of the `healthz-smoke-*` handlers declare a method guard, so `POST`/`PUT`/`DELETE` return the same `200` JSON body as `GET`. Don't add a `405` to one route in isolation — it would make it inconsistent with every other `healthz-smoke-*` route. If an idea's acceptance criteria claim a non-`GET` request "does not return the 200 body", that claim is wrong for this stack: check whether the same idea also puts custom method handling out of scope (it usually does), and plan to the out-of-scope line, not the claim.
- **Page tests**: `Pages()` needs `exclude: ["**/*.test.tsx"]` or the build breaks on the first page test. Our `vite.config.ts` has this.
- **Route tests**: `nitro()` needs `ignore: ["**/*.test.ts"]` or route tests get bundled into the prod server. Our `vite.config.ts` has this.
- **Auto-imports**: `auto-imports.d.ts` doesn't exist on a fresh clone — `prebuild` and `pretypecheck` scripts generate it. If `tsc` fails on a new machine, run `node scripts/ensure-generated-files.mjs` first.
- **Playwright port**: Runs on port 5178, not 5000, so it never collides with the dev server.
- **tsconfig.node.json**: Is `composite: true` — can't set `noEmit`, so it has its own `outDir` to avoid scattering compiled files.
- **Database client**: `db/client.ts` resolves `sqlite.db` and `drizzle/` from `process.cwd()`, not `import.meta.url` — Vite/Nitro/Vitest all transform this module, so its `import.meta.url` isn't a real file URL. Test under Vitest uses in-memory db.
- **Bun requirement**: `db/client.ts` imports `bun:sqlite` (Bun builtin), so anything that loads it must run under Bun. Consequences:
  - `vitest.config.ts` splits into a `client` project (jsdom, everything except `routes/**`) and a `server` project (`environment: "node"`, `routes/**/*.test.ts`)
  - `test` and `test:watch` run `bun --bun vitest` (not plain `vitest`)
  - Production server `.output/server/index.mjs` needs Bun runtime (PM2/systemd: set `interpreter: "bun"`)
- **Branch protection**: Recommended to set required status checks on `vortex/sprint/*` and `vortex/feat/*` branches to enforce CI passing before merge.
- **Husky hooks**: Pre-commit runs `lint-staged` on staged files only; doesn't run full lint or test. Run `bun run verify` locally before committing to catch issues early.

## Changelog

### 2026-08-23 — Sprint VRTX3-S-0036: Three Independent Health Check Endpoints (450228657)

Added `/api/healthz-smoke-450228657-a`, `-b` and `-c`, each returning HTTP 200 with `Content-Type: application/json` and body `{ ok: true, variant: "450228657" }`. Purely additive — 6 new files, 0 existing source files modified. Probe family count 112 → 115, re-derived from the filesystem and bumped in all three docs that carry it (this file, `ARCHITECTURE.md`, `PRODUCT.md`) in the same pass.

**The copy-source pointer caught its fourth harmless near-miss, in a form that answers a question the harmful ones raised.** VRTX3-I-0043 named `healthz-smoke-189360772-a` — post-VRTX3-S-0011, no timing case, so the substitution cost nothing — while separately arguing, correctly and unprompted, that a sub-100ms assertion on a constant-returning handler measures the runtime rather than the code. [Health Probe Routes](#health-probe-routes) now records what that pairing settles: an author can hold the right view about the assertion and still name a template carrying it, because the two are independent — one is a judgement, the other is knowledge of which of 115 identical-looking files is which, and only this section carries the second. Four harmless instances now stand against three harmful; the governing ratio is unchanged at 47 of 115.

**The SPA-fallback measurement reached its twenty-sixth consecutive confirmation, twelfth on an enhancement**, and it is the mirror of the twenty-fifth. VRTX3-I-0042 wrote a wrong `404` into an enhancement for the first time; VRTX3-I-0043, one sprint later, makes no status-code claim at all and confines itself to a reproducible grep. [Gotchas](#gotchas) now notes that the two together rule out reading canvas quality as a trend, and that a silent canvas still does not remove the need to measure — the measurement answers what is on disk today, which no canvas observes.

**Vite bound `:5001`** for planning and two of the three implementation runs, and `:5000` for the third and for integration QA — the first sprint observed to produce two ports at once. The port list in [Gotchas](#gotchas) is corrected accordingly: it is a per-container value, so a sibling agent's number from the same sprint is no safer to reuse than last sprint's.

**Two documented `node …` invocations do not run in an agent container**, found while closing the sprint. `node` is not on this image's `PATH`; the commands work inside a package script (Bun's runner shims `node`) and in CI (Actions provides Node), which is why the gap survived. [Build & Run](#build--run) now gives the `bun`-based invocation for `ensure-generated-files.mjs` and `check-doc-links.mjs`.

**The pre-sprint test-file baseline is now an instruction rather than a recurring retro item.** Three closes running (VRTX3-S-0033, -0035, -0036) have re-derived it after the fact because the recommendation only ever lived in a finished sprint's summary, which nothing downstream reads. [Test & Validate](#test--validate) carries the one-line command; a plan that omits it now contradicts a file every agent is given.

One inventory correction, recorded in `artifacts/VRTX3-S-0036/SPRINT-PLAN.md` rather than here: the VRTX3-S-0035 plan's breakdown of `routes/api/` listed `hello.post.ts` and three `users/` files. Neither matches the tree — `hello.post.ts` appears in [Conventions](#conventions) as an illustration of the method-suffix rule, not as inventory, and `users/` holds four files. The probe count itself was right and nothing downstream depended on the breakdown.

No change to routing, the test harness or CI. `nitro({ serverDir: "./" })` registers a new `routes/api/*.ts` by filename alone; the Vitest `server` project collects its colocated `*.test.ts` with no configuration; `.github/workflows/ci.yml` already triggers on `push` and `pull_request` to `vortex/**`.

### 2026-08-23 — Sprint VRTX3-S-0035: Three Independent Health Check Endpoints (180848429)

Added `/api/healthz-smoke-180848429-a`, `-b` and `-c`, each returning HTTP 200 with `Content-Type: application/json` and body `{ ok: true, variant: "180848429" }`. Purely additive — 6 new files, 0 existing source files modified. Probe family count 109 → 112, re-derived from the filesystem and bumped in all three docs that carry it (this file, `ARCHITECTURE.md`, `PRODUCT.md`) in the same pass.

**The copy-source pointer caught its third harmful near-miss, and this one closes a question the previous two left open.** VRTX3-I-0042 named `healthz-smoke-913793173-a` — the very file this document already lists as an example of the 47 legacy tests — while its own risk register correctly described the hazard of copying the wrong neighbour from a noisy directory. [Health Probe Routes](#health-probe-routes) now records that a canvas cannot self-correct here: naming the failure mode is not the same as having the information to avoid it, and that information lives only in this section. The cheaper half of the finding is recorded too — unlike VRTX3-I-0037 and VRTX3-I-0041, this canvas did not pin the timing shape into an acceptance criterion, so the substitution contradicted nothing.

**The SPA-fallback measurement reached its twenty-fifth consecutive confirmation, eleventh on an enhancement**, in a form worth distinguishing from the twenty-four before it. Every prior wrong `404` arrived through defect capture; VRTX3-I-0042 wrote one into an additive enhancement, in the same sentence as a correct and independently reproducible grep, with `(verified)` attached only to the grep. [Gotchas](#gotchas) now says to scope that word to the clause it sits in.

### 2026-08-23 — Sprint VRTX3-S-0034 (`smoke-bugfix-178747715613700`): Three Missing Health Probes

Added three missing health probes, each returning HTTP 200 with `Content-Type: application/json` and body `{ ok: true, variant: "<id>" }`: `/api/healthz-smoke-bugfix-839771954`, `/api/healthz-smoke-bugfix2-554747562`, `/api/healthz-smoke-bugfix3-238311955`. Purely additive — 6 new files, 0 existing source files modified. Probe family count 106 → 109, re-derived from the filesystem and bumped in all three docs that carry it (this file, `ARCHITECTURE.md`, `PRODUCT.md`) in the same pass.

**The copy-source pointer caught its second harmful near-miss.** VRTX3-I-0041 named `healthz-smoke-bugfix3-993514120` — a pre-VRTX3-S-0011 file carrying the wall-clock case — and pinned the timing assertion into an acceptance criterion of its own. [Health Probe Routes](#health-probe-routes) now records it, along with the part worth generalizing: this was the best-evidenced canvas the family has produced, and it still drifted, because the failure enters through which neighbour got sampled rather than through how carefully the sample was read. The previous entry predicted this would happen on the next canvas to reach one file past the newest; it did.

**The SPA-fallback measurement reached its twenty-fourth consecutive confirmation**, and the uneven-capture split its fifth. [Gotchas](#gotchas) now states what five instances support: in a mixed sprint the grounded canvas is not the more reliable half, it is just the half that shows its work — VRTX3-I-0041 was wrong about the status code in the same way its two canvas-less siblings were. The confirmation tally there had also fallen one sprint behind; VRTX3-S-0003 is now recorded as the twenty-third.

**Dead cross-references repaired.** Consolidating the manual to `AGENTS.md` in `600b74f` left 19 links to the old `./AGENT.md` path across the four root docs (6 here, 9 in `ARCHITECTURE.md`, 3 in `PRODUCT.md`, 1 in `DESIGN.md`) — every one a 404 for a reader following it. Rewritten to `./AGENTS.md`; anchors and prose unchanged. Root docs cannot be delegated to a fix ticket, so this was repaired on the planning ticket that noticed it.

### 2026-08-21 — Sprint VRTX3-S-0003 (`smoke-bugfix-17873270732264355`): Three Missing Health Probes

Added three missing health probes, each returning HTTP 200 with `Content-Type: application/json` and body `{ ok: true, variant: "<id>" }`: `/api/healthz-smoke-bugfix-858873211`, `/api/healthz-smoke-bugfix2-664793322`, `/api/healthz-smoke-bugfix3-267063007`. Purely additive — 6 new files, 0 existing source files modified. Probe family count 103 → 106, re-derived from the filesystem and bumped in all three docs that carry it (`AGENT.md`, `ARCHITECTURE.md`, `PRODUCT.md`) in the same pass.

**Key recycling is now a pattern, not an accident — this is the second consecutive sprint to hit it, and the first to hit it twice over.** `VRTX3-S-0003` and the ticket keys `VRTX3-T-0013/0014/0015` all previously belonged to the 2026-08-02 sprint recorded further down this changelog (variants `26031336`, `59156521`, `200192357`). Its artifacts were already on disk at `artifacts/VRTX3-S-0003/`, so planning **overwrote** `SPRINT-PLAN.md` and the three `PLAN.md` files and left the rest — `fix-note.md`, `tdd-test-result.md`, `qa-test-report.md`, `release-notes.md`, `sprint-summary.md`, `integration-test-result.md` — in place, since deleting another sprint's record is out of scope. VRTX3-S-0002 hit exactly this a day earlier and the mitigation is unchanged: every current `PLAN.md` and the `SPRINT-PLAN.md` open with a banner naming the stale files, because a per-ticket directory holding a `fix-note.md` that reports a **completed** fix for a different variant reads as "already done" to anyone who opens the directory rather than the plan. Two occurrences in two sprints means the next agent should expect it rather than be surprised by it — check the variant ids in a `fix-note.md` against the ticket you are actually working before believing it.

**Twenty-third consecutive confirmation of the SPA-fallback trap.** Re-measured on a live dev server during planning rather than cited: all three target paths returned `200 text/html; charset=utf-8` (the SPA shell, 949 bytes), the control `/api/healthz-smoke-528856326-a` returned `200 application/json;charset=UTF-8` (33 bytes). A repo-wide grep for each variant id returned zero matches, confirming never-written files rather than typo'd filenames. VRTX3-I-0006 sits behind one of the three defects and is the most thorough canvas this trap has produced — it lists the missing file, greps for the variant, quotes a sibling handler in full, and names the commit that fixed the identical defect last sprint — and its one wrong claim is the status code: it states Nitro "returns its default 404". Everything else in it survived re-verification. **Evidence quality does not predict this particular error**, which is the sharpest form of the standing rule: measure, whatever the report says.

**The copy-source pointer caught a third near-miss, and the harmless kind again.** VRTX3-I-0006 named `healthz-smoke-bugfix3-834560860.test.ts` — the pair added by VRTX3-S-0002, the immediately preceding sprint, so shape-identical by construction. [Health Probe Routes](#health-probe-routes) now records why naming the _newest_ probe is worth flagging rather than waving through: it is the sampling heuristic most likely to be safe, and therefore the one most likely to look like grounds for skipping the substitution. The 47-of-106 legacy ratio is what governs, not the sampling record.

**One canvas count was wrong and the docs did not inherit it.** VRTX3-I-0006 states that twenty `bugfix3-*` variants exist; the tree holds 17 pairs (34 entries). Its `routes/api/` figure of 209 entries is right, and is the pre-fix number.

**Vite bound `:5000`** this sprint. Fifteen sprints have now produced `:5005`, `:5006`, `:5007`, `:5000`, `:5001`, `:5002`, `:5000`, `:5000`, `:5000`, `:5000`, `:5000`, `:5002`, `:5000`, `:5000` and `:5000` — read the banner.

No change to routing, the test harness or CI. `nitro({ serverDir: "./" })` registers a new `routes/api/*.ts` by filename alone; the Vitest `server` project collects its colocated `*.test.ts` with no configuration; `.github/workflows/ci.yml` already triggers on `push` and `pull_request` to `vortex/**`.

### 2026-08-21 — Sprint VRTX3-S-0002 (`smoke-bugfix-17873246012078034`): Three Missing Health Probes

Added three missing health probes, each returning HTTP 200 with `Content-Type: application/json` and body `{ ok: true, variant: "<id>" }`: `/api/healthz-smoke-bugfix-158202122`, `/api/healthz-smoke-bugfix2-142310404`, `/api/healthz-smoke-bugfix3-834560860`. Purely additive — 6 new files, 0 existing source files modified. Probe family count 100 → 103, re-derived from the filesystem and bumped in all three docs that carry it (`AGENT.md`, `ARCHITECTURE.md`, `PRODUCT.md`) in the same pass.

**Note the sprint key: this is the SECOND sprint to run as `VRTX3-S-0002`, with the same three ticket keys as the first.** The 2026-08-02 entry further down this changelog is a different sprint (variants `106285986`, `524723214`, `764107669`) that reused `VRTX3-T-0007/0008/0009`. Its artifacts were already on disk at `artifacts/VRTX3-S-0002/` from commit `e167bb8`, so planning **overwrote** `SPRINT-PLAN.md` and the three `PLAN.md` files and left the rest — `fix-note.md`, `tdd-test-result.md`, `qa-test-report.md`, `release-notes.md`, `sprint-summary.md`, `integration-test-result.md` — in place, since deleting another sprint's record was out of scope. The hazard is specific and worth knowing if keys recycle again: each per-ticket directory now holds a stale `fix-note.md` reporting a **completed** fix for a variant that is not the current ticket's, which reads as "already done" to anyone who opens the directory rather than the plan. Every current `PLAN.md` opens with a warning banner naming the stale files.

**Twenty-second consecutive confirmation of the SPA-fallback trap.** Re-measured on a live dev server during planning rather than cited: all three target paths returned `200 text/html; charset=utf-8` (the SPA shell, 949 bytes), the control `/api/healthz-smoke-528856326-a` returned `200 application/json;charset=UTF-8` (33 bytes). A repo-wide grep for each variant id returned zero matches, confirming never-written files rather than typo'd filenames. This was also the **fourth** occurrence of the uneven-capture split (after VRTX3-S-0018, -0020 and -0024): VRTX3-I-0005 sits behind one of the three defects and reasoned the fallback out correctly from source while stating plainly that nothing in its capture container could measure it; the other two tickets have no idea linked and repeat the `404` verbatim.

**The copy-source pointer caught a second harmless substitution.** VRTX3-I-0005 named `healthz-smoke-bugfix3-351014898.test.ts` as the test template. Diffed during planning: shape-identical to the pinned `528856326` pair — one `it()` case, a single body assertion — because `351014898` landed in VRTX3-S-0024, long after the flaky wall-clock case was dropped. The substitution was made anyway. [Health Probe Routes](#health-probe-routes) now records the tally as two harmless near-misses to one harmful, and repeats that the number to watch is the 47-of-103 legacy ratio, not the sampling record.

**One canvas arithmetic slip, correctly scoped.** VRTX3-I-0005's AC-6 puts the root-doc probe-count bump out of scope for the fix and names it planning-owned — right on both counts — but reads the move as 100 → 101, which is the per-defect view. The sprint adds three probes, so the count moved once, to 103.

**Vite bound `:5000`** this sprint. Fourteen sprints have now produced `:5005`, `:5006`, `:5007`, `:5000`, `:5001`, `:5002`, `:5000`, `:5000`, `:5000`, `:5000`, `:5000`, `:5002`, `:5000` and `:5000` — read the banner.

No change to routing, the test harness or CI. `nitro({ serverDir: "./" })` registers a new `routes/api/*.ts` by filename alone; the Vitest `server` project collects its colocated `*.test.ts` with no configuration; `.github/workflows/ci.yml` already triggers on `push` and `pull_request` to `vortex/**`.

### 2026-08-20 — Sprint VRTX3-S-0033: Three Independent Health Check Endpoints (189360772)

Added `/api/healthz-smoke-189360772-a`, `-b` and `-c`, each returning HTTP 200 with `Content-Type: application/json` and body `{ ok: true, variant: "189360772" }`. Purely additive — 6 new files, 0 existing source files modified, no new dependency, nothing in `src/`. Probe family count 97 → 100, re-derived from the filesystem and bumped in all three docs that carry it (`AGENT.md`, `ARCHITECTURE.md`, `PRODUCT.md`) in the same pass.

**Twenty-first consecutive confirmation of the SPA-fallback trap, tenth on an enhancement.** Re-measured on a live dev server during planning rather than cited: all three target paths returned `200 text/html; charset=utf-8` (the SPA shell, 949 bytes), the control `/api/healthz-smoke-528856326-a` returned `200 application/json;charset=UTF-8` (33 bytes). A repo-wide grep for `189360772` returned zero matches, confirming never-written files rather than typo'd filenames. VRTX3-I-0040 belongs to the well-behaved class: it states the fallback correctly in its own risk register, quotes the 949-byte figure, and instructs that verification assert the JSON body or the built module. The measurement was taken anyway, which is the rule.

**The idea named the pinned copy source itself and reproduced the reasoning behind it.** VRTX3-I-0040 names the `528856326` pair in both its Solution and Affected Code sections, and its risk register states in its own words why sampling a neighbour is the failure mode — the first canvas to explain the rule rather than just comply with it. There was nothing to substitute. [Health Probe Routes](#health-probe-routes) now records that a quiet sprint is the normal case rather than evidence the risk has passed: the 47 legacy tests are never rewritten, so the ratio only dilutes (47 of 100 now) and the odds of a future sample landing badly stay close to even.

**One canvas claim was wrong and the docs did not inherit it.** VRTX3-I-0040's AC-8 names `README.md`, `ARCHITECTURE.md` and `AGENT.md` as the three files carrying the probe-family count. `README.md` carries no probe count and no `healthz` reference at all — a grep for both returns nothing. The three docs that carry it are `AGENT.md`, `ARCHITECTURE.md` and `PRODUCT.md`, all four root docs being planning-owned, so no implementation ticket touched a document this sprint and `README.md` was not modified.

**Vite bound `:5000`** this sprint. Thirteen sprints have now produced `:5005`, `:5006`, `:5007`, `:5000`, `:5001`, `:5002`, `:5000`, `:5000`, `:5000`, `:5000`, `:5000`, `:5002` and `:5000` — read the banner.

No change to routing, the test harness or CI. `nitro({ serverDir: "./" })` registers a new `routes/api/*.ts` by filename alone; the Vitest `server` project collects its colocated `*.test.ts` with no configuration; `.github/workflows/ci.yml` already triggers on `push` and `pull_request` to `vortex/**`.

### 2026-08-20 — Sprint VRTX3-S-0030: Bugfix Sprint – Two Missing Health Probes (`-ha` family)

Added two missing health probes, each returning HTTP 200 with `Content-Type: application/json` and body `{ ok: true, variant: "<id>" }`: `/api/healthz-smoke-bugfix-ha-853006542`, `/api/healthz-smoke-bugfix-ha2-165600260`. Purely additive — 4 new files, 0 existing source files modified. Probe family count 95 → 97, re-derived from the filesystem and bumped in all three docs that carry it (`AGENT.md`, `ARCHITECTURE.md`, `PRODUCT.md`) in the same pass.

**Twentieth consecutive confirmation of the SPA-fallback trap.** Re-measured on a live dev server during planning rather than cited: both target paths returned `200 text/html; charset=utf-8` (the SPA shell, 949 bytes), the control `/api/healthz-smoke-528856326-a` returned `200 application/json;charset=UTF-8` (33 bytes). A repo-wide grep for `853006542` and `165600260` returned zero matches, confirming never-written files rather than typo'd filenames. Neither ticket has an idea linked — this is the first sprint in the series where _no_ defect had a canvas behind it, so nothing upstream sanity-checked either `404` and there was no counter-claim to weigh; the measurement was the only evidence available.

**Both defect reports dropped the `/api/` prefix from the path, and the same measurement settles it.** The tickets name `/healthz-smoke-bugfix-ha-853006542` and `/healthz-smoke-bugfix-ha2-165600260`; all 95 existing probes serve under `/api/`. Requesting the _working_ control without the prefix (`/healthz-smoke-528856326-a`) also returned the 949-byte SPA shell — so a prefix-less probe path is unreachable by construction, and the fixes land under `routes/api/` like every sibling. This is the same one curl that debunks the `404`: it answers both questions at once, which is worth knowing because the prefix slip is easy to read as a second, routing-shaped defect. Older changelog entries (SPRINT-0004/-0005/-0007) write probe paths without the prefix too — that is report shorthand, not a second route family.

**A new infix, `-ha` / `-ha2`, entered the family.** No prior filename carries it, so there is no neighbour to pattern-match a name against and no collision risk. `-ha-` and `-ha2-` are distinct routes with distinct variants, not a typo for one another.

**Vite bound `:5002`** this sprint (`5000` and `5001` both in use). Twelve sprints have now produced `:5005`, `:5006`, `:5007`, `:5000`, `:5001`, `:5002`, `:5000`, `:5000`, `:5000`, `:5000`, `:5000` and `:5002` — read the banner.

The `528856326` copy-source pointer had nothing to substitute this sprint: with no canvas behind either defect, no template file was named at all. The flaky `responds in under 100ms` case remains confined to the 47 pre-VRTX3-S-0011 tests, now 47 of 97. No change to routing, the test harness or CI.

### 2026-08-20 — Sprint VRTX3-S-0028: Three Independent Health Check Endpoints (458730798)

Added `/api/healthz-smoke-458730798-a`, `-b` and `-c`, each returning HTTP 200 with `Content-Type: application/json` and body `{ ok: true, variant: "458730798" }`. Purely additive — 6 new files, 0 existing source files modified, no new dependency, nothing in `src/`. Probe family count 92 → 95, re-derived from the filesystem and bumped in all three docs that carry it (`AGENT.md`, `ARCHITECTURE.md`, `PRODUCT.md`) in the same pass.

**The copy-source pointer caught a real substitution for the first time in eleven sprints, and it is the case VRTX3-S-0027 predicted one sprint earlier.** That sprint recorded a shape-identical neighbour as "the more dangerous version of the drift" precisely because nothing went wrong, and put the odds of the next sample landing badly at 47-in-92. VRTX3-I-0037 landed badly: it named `healthz-smoke-302960562-a.test.ts` — a pre-VRTX3-S-0011 file that does carry `expect(elapsed).toBeLessThan(100)` — in two sections, and then pinned the timing case into an acceptance criterion of its own ("Each handler returns in under 100 ms when invoked directly in its unit test"). The `528856326` pair was substituted, the timing case was kept out, and the canvas AC was dropped rather than satisfied: the property it reaches for (no I/O) is already guaranteed by the probe's interface contract, so a wall-clock assertion buys nothing and costs a flake. [Health Probe Routes](#health-probe-routes) now says both things — that the failure recurs on a schedule set by the 47/95 ratio rather than by canvas quality, and that an idea's own AC does not outrank the pointer either.

**Nineteenth consecutive confirmation of the SPA-fallback trap, ninth on an enhancement.** Re-measured on a live dev server during planning rather than cited: all three target paths returned `200 text/html; charset=utf-8` (the SPA shell, 949 bytes), the control `/api/healthz-smoke-528856326-a` returned `200 application/json;charset=UTF-8` (33 bytes). A repo-wide grep for `458730798` returned zero matches, confirming never-written files rather than typo'd filenames. Like its predecessor, VRTX3-I-0037 makes no status-code claim at all — there was nothing to debunk, and the measurement was taken anyway, which is the rule.

**The canvas's endpoint count was wrong and the docs did not inherit it.** VRTX3-I-0037 states the project "already serves 186 endpoints of exactly this shape" and that `routes/api/` "holds 187 files". The file count is right; the endpoint count is not — it counts the colocated `*.test.ts` siblings, which are not routes. Measured: 92 probe handlers, 92 probe tests, plus `hello.ts`, `hello.post.ts`, `hello.test.ts` and the `users/` example. The count that went into the three docs is 95, re-derived from the tree rather than taken from the idea.

**Vite bound `:5000`** this sprint. Eleven sprints have now produced `:5005`, `:5006`, `:5007`, `:5000`, `:5001`, `:5002`, `:5000`, `:5000`, `:5000`, `:5000` and `:5000` — read the banner.

The idea again kept the root-doc probe-count bump out of its own acceptance criteria, stating instead that nothing outside the six new files is modified. Fourth sprint in a row where the planning/implementation boundary needed no correction during decomposition.

No change to routing, the test harness or CI. `nitro({ serverDir: "./" })` registers a new `routes/api/*.ts` by filename alone; the Vitest `server` project collects its colocated `*.test.ts` with no configuration; `.github/workflows/ci.yml` already triggers on `push` and `pull_request` to `vortex/**`.

### 2026-08-19 — Sprint VRTX3-S-0027: Three Independent Health Check Endpoints (868033827)

Added `/api/healthz-smoke-868033827-a`, `-b` and `-c`, each returning HTTP 200 with `Content-Type: application/json` and body `{ ok: true, variant: "868033827" }`. Purely additive — 6 new files, 0 existing source files modified, no new dependency, nothing in `src/`. Probe family count 89 → 92, re-derived from the filesystem and bumped in all three docs that carry it (`AGENT.md`, `ARCHITECTURE.md`, `PRODUCT.md`) in the same pass.

**The copy-source pointer earned its keep for the first time in ten sprints, and the case it caught is the quiet one.** VRTX3-I-0027 through VRTX3-I-0035 all named the documented `528856326` pair. VRTX3-I-0036 named `healthz-smoke-1065915107-c.test.ts` instead — a directory neighbour, sampled rather than read from [Health Probe Routes](#health-probe-routes). Diffed this sprint: the two files are shape-identical, one `it()` case and a single body assertion, because `1065915107` was added in VRTX3-S-0023 well after the flaky timing case was dropped. So the substitution was a no-op, which is exactly why it is worth recording: a drift that costs nothing on the sprint that introduces it teaches nobody, and the next sampled neighbour has a 47-in-92 chance of carrying `expect(elapsed).toBeLessThan(100)`. That section now says to substitute regardless of how healthy the named file looks.

**Eighteenth consecutive confirmation of the SPA-fallback trap, eighth on an enhancement.** Re-measured on a live dev server during planning rather than cited: all three target paths returned `200 text/html; charset=utf-8` (the SPA shell, 949 bytes), the control `/api/healthz-smoke-528856326-a` returned `200 application/json;charset=UTF-8` (33 bytes). A repo-wide grep for `868033827` returned zero matches, confirming never-written files rather than typo'd filenames. VRTX3-I-0036 is a new shape of well-behaved canvas: it makes no status-code claim at all, deriving the routing from `vite.config.ts` in its risk register instead of asserting a `404`. There was nothing to debunk, and the measurement was taken anyway — which is the rule.

**Vite bound `:5000`** this sprint. Ten sprints have now produced `:5005`, `:5006`, `:5007`, `:5000`, `:5001`, `:5002`, `:5000`, `:5000`, `:5000` and `:5000` — read the banner.

The idea again kept the root-doc probe-count bump out of its own acceptance criteria, stating instead that no file outside the six new ones is modified. Third sprint in a row where the planning/implementation boundary needed no correction during decomposition.

No change to routing, the test harness or CI. `nitro({ serverDir: "./" })` registers a new `routes/api/*.ts` by filename alone; the Vitest `server` project collects its colocated `*.test.ts` with no configuration; `.github/workflows/ci.yml` already triggers on `push` and `pull_request` to `vortex/**`.

### 2026-08-19 — Sprint VRTX3-S-0026: Three Independent Health Check Endpoints (888240601)

Added `/api/healthz-smoke-888240601-a`, `-b` and `-c`, each returning HTTP 200 with `Content-Type: application/json` and body `{ ok: true, variant: "888240601" }`. Purely additive — 6 new files, 0 existing source files modified, no new dependency, nothing in `src/`. Probe family count 86 → 89, re-derived from the filesystem and bumped in all three docs that carry it (`AGENT.md`, `ARCHITECTURE.md`, `PRODUCT.md`) in the same pass.

**Seventeenth consecutive confirmation of the SPA-fallback trap, seventh on an enhancement.** Re-measured on a live dev server during planning rather than cited: all three target paths returned `200 text/html; charset=utf-8` (the SPA shell, 949 bytes), the control `/api/healthz-smoke-528856326-a` returned `200 application/json;charset=UTF-8` (33 bytes). A repo-wide grep for `888240601` returned zero matches, confirming never-written files rather than typo'd filenames.

**VRTX3-I-0035 is the best-behaved canvas this trap has produced, and it still did not remove the need to measure.** It stated the fallback behaviour correctly, and — unlike the canvases that merely asserted it — labelled its own claim as _inferred from `AGENT.md`, not measured_, because no dev server was running in its capture container, then asked whoever picked it up to re-measure before verifying. [Gotchas](#gotchas) now records it as the clean case: a canvas can be right about the mechanism and still say nothing about what is on disk today. The distinction that matters is not whether a report is careful, it is that only a live request observes the working tree.

**Vite bound `:5000`** this sprint. Nine sprints have now produced `:5005`, `:5006`, `:5007`, `:5000`, `:5001`, `:5002`, `:5000`, `:5000` and `:5000` — read the banner.

The `528856326` copy-source pointer held for an eleventh sprint, and VRTX3-I-0035 named it itself — the eighth idea in a row to name the documented template rather than sample the directory, so there was no substitution to make. The flaky `responds in under 100ms` case remains confined to the 47 pre-VRTX3-S-0011 tests, now 47 of 89.

The idea also kept the root-doc probe-count bump out of its own acceptance criteria and named it planning-owned, citing the VRTX3-S-0024 note that established this. That is the second sprint in a row where the boundary needed no correction during decomposition.

No change to routing, the test harness or CI. `nitro({ serverDir: "./" })` registers a new `routes/api/*.ts` by filename alone; the Vitest `server` project collects its colocated `*.test.ts` with no configuration; `.github/workflows/ci.yml` already triggers on `push` and `pull_request` to `vortex/**`.

### 2026-08-16 — Sprint VRTX3-S-0024: Bugfix Sprint – Three Missing Health Probes

Added three missing health probes, each returning HTTP 200 with `Content-Type: application/json` and body `{ ok: true, variant: "<id>" }`: `/api/healthz-smoke-bugfix-27681476`, `/api/healthz-smoke-bugfix2-107364458`, `/api/healthz-smoke-bugfix3-351014898`. Purely additive — 6 new files, 0 existing source files modified. Probe family count 83 → 86, re-derived from the filesystem and bumped in all three docs that carry it (`AGENT.md`, `ARCHITECTURE.md`, `PRODUCT.md`) in the same pass.

**Sixteenth consecutive confirmation of the SPA-fallback trap.** Re-measured on a live dev server during planning rather than cited: all three target paths returned `200 text/html; charset=utf-8` (the SPA shell, 949 bytes), the control `/api/healthz-smoke-528856326-a` returned `200 application/json;charset=UTF-8` (33 bytes). A repo-wide grep for each variant id returned zero matches, confirming never-written files rather than typo'd filenames.

**The uneven-capture split repeated for the third time** (after VRTX3-S-0018 and -0020), and it is worth stating as the steady state rather than the exception. VRTX3-I-0033, behind one of the three defects, reasoned the fallback out correctly from this guide, labelled its own `404` a likely mis-transcription, and explicitly asked whoever picked it up to re-measure — because no dev server was listening in its capture container. Its two sibling tickets have no idea linked at all and repeat the `404` verbatim. A ticket does not tell you which kind you are holding, so the rule is unchanged: **re-measure, whatever the report says.**

**Vite bound `:5000`** this sprint, as in VRTX3-S-0023. Eight sprints have now produced `:5005`, `:5006`, `:5007`, `:5000`, `:5001`, `:5002`, `:5000` and `:5000` — read the banner.

The `528856326` copy-source pointer held for a tenth sprint, and VRTX3-I-0033 named it itself — the seventh idea in a row to name the documented template rather than sample the directory, so there was no substitution to make. The flaky `responds in under 100ms` case remains confined to the 47 pre-VRTX3-S-0011 tests, now 47 of 86.

One planning-side note worth carrying: VRTX3-I-0033's own acceptance criteria asked the implementing ticket to bump the probe count in the root docs. Root docs are planning-owned, and the count moves 83 → 86 for the sprint as a whole rather than 83 → 84 per defect, so that criterion was dropped from the tickets and applied here instead.

No change to routing, the test harness or CI.

### 2026-08-14 — Sprint VRTX3-S-0023: Three Independent Health Check Endpoints (1065915107)

Added `/api/healthz-smoke-1065915107-a`, `-b` and `-c`, each returning HTTP 200 with `Content-Type: application/json` and body `{ ok: true, variant: "1065915107" }`. Purely additive — 6 new files, 0 existing source files modified, no new dependency, nothing in `src/`. Probe family count 80 → 83, re-derived from the filesystem and bumped in all three docs that carry it (`AGENT.md`, `ARCHITECTURE.md`, `PRODUCT.md`) in the same pass.

**Fifteenth consecutive confirmation of the SPA-fallback trap, sixth on an enhancement.** Re-measured on a live dev server during planning rather than cited: all three target paths returned `200 text/html; charset=utf-8` (the SPA shell, 949 bytes), the control `/api/healthz-smoke-528856326-a` returned `200 application/json;charset=UTF-8` (33 bytes). A repo-wide grep for `1065915107` returned zero matches, confirming never-written files rather than typo'd filenames. VRTX3-I-0032 stated the fallback behaviour correctly in its own risk register, so there was no `404` to debunk — the measurement was taken anyway, which is the rule.

**Vite bound `:5000`** this sprint. Seven sprints have now produced `:5005`, `:5006`, `:5007`, `:5000`, `:5001`, `:5002` and `:5000` — the return to `:5000` after three straight climbs is the clearest evidence yet that there is nothing to extrapolate, only a banner to read. [Gotchas](#gotchas) now says so in both directions.

The `528856326` copy-source pointer held for a ninth sprint, and VRTX3-I-0032 named it itself — the sixth idea in a row to name the documented template rather than sample the directory, so there was no substitution to make. The flaky `responds in under 100ms` case remains confined to the 47 pre-VRTX3-S-0011 tests, now 47 of 83.

No change to routing, the test harness or CI. `nitro({ serverDir: "./" })` registers a new `routes/api/*.ts` by filename alone; the Vitest `server` project collects its colocated `*.test.ts` with no configuration; `.github/workflows/ci.yml` already triggers on `push` and `pull_request` to `vortex/**`.

### 2026-08-11 — Sprint VRTX3-S-0022: Three Independent Health Check Endpoints (600965021)

Added `/api/healthz-smoke-600965021-a`, `-b` and `-c`, each returning HTTP 200 with `Content-Type: application/json` and body `{ ok: true, variant: "600965021" }`. Purely additive — 6 new files, 0 existing source files modified, no new dependency, nothing in `src/`. Probe family count 77 → 80, re-derived from the filesystem and bumped in all three docs that carry it (`AGENT.md`, `ARCHITECTURE.md`, `PRODUCT.md`) in the same pass.

**Fourteenth consecutive confirmation of the SPA-fallback trap, fifth on an enhancement.** Re-measured on a live dev server during planning rather than cited: all three target paths returned `200 text/html; charset=utf-8` (the SPA shell, 949 bytes), the control `/api/healthz-smoke-528856326-a` returned `200 application/json;charset=UTF-8` (33 bytes). A repo-wide grep for `600965021` returned zero matches, confirming never-written files rather than typo'd filenames. VRTX3-I-0031 stated the fallback behaviour correctly in its own risk register, so there was no `404` to debunk — the measurement was taken anyway, which is the rule.

**Vite bound `:5002`** (`5000` and `5001` were both in use). Six sprints have now produced `:5005`, `:5006`, `:5007`, `:5000`, `:5001` and `:5002` — still no pattern to extrapolate, only a banner to read.

The `528856326` copy-source pointer held for an eighth sprint, and VRTX3-I-0031 named it itself — the fifth idea in a row to name the documented template rather than sample the directory, so there was no substitution to make. The flaky `responds in under 100ms` case remains confined to the 47 pre-VRTX3-S-0011 tests, now 47 of 80.

No change to routing, the test harness or CI. `nitro({ serverDir: "./" })` registers a new `routes/api/*.ts` by filename alone; the Vitest `server` project collects its colocated `*.test.ts` with no configuration; `.github/workflows/ci.yml` already triggers on `push` and `pull_request` to `vortex/**`.

### 2026-08-11 — Sprint VRTX3-S-0021: Three Independent Health Check Endpoints (568557289)

Added `/api/healthz-smoke-568557289-a`, `-b` and `-c`, each returning HTTP 200 with `Content-Type: application/json` and body `{ ok: true, variant: "568557289" }`. Purely additive — 6 new files, 0 existing source files modified, no new dependency, nothing in `src/`. Probe family count 74 → 77, re-derived from the filesystem and bumped in all three docs that carry it (`AGENT.md`, `ARCHITECTURE.md`, `PRODUCT.md`) in the same pass.

**Thirteenth consecutive confirmation of the SPA-fallback trap, fourth on an enhancement.** Re-measured on a live dev server during planning rather than cited: all three target paths returned `200 text/html; charset=utf-8` (the SPA shell, 949 bytes), the control `/api/healthz-smoke-528856326-a` returned `200 application/json;charset=UTF-8` (33 bytes). A repo-wide grep for `568557289` returned zero matches, confirming never-written files rather than typo'd filenames. VRTX3-I-0030 stated the fallback behaviour correctly in its own risk register, so there was no `404` to debunk — the measurement was taken anyway, which is the rule. [Gotchas](#gotchas) now spells out why: a canvas being right is evidence about the canvas, not about the working tree.

**Vite bound `:5001`** (`5000` was in use). Five sprints have now produced `:5005`, `:5006`, `:5007`, `:5000` and `:5001` — there is no pattern to extrapolate, only a banner to read.

The `528856326` copy-source pointer held for a seventh sprint, and VRTX3-I-0030 named it itself — the fourth idea in a row to name the documented template rather than sample the directory, so there was no substitution to make. The flaky `responds in under 100ms` case remains confined to the 47 pre-VRTX3-S-0011 tests, now 47 of 77.

No change to routing, the test harness or CI. `nitro({ serverDir: "./" })` registers a new `routes/api/*.ts` by filename alone; the Vitest `server` project collects its colocated `*.test.ts` with no configuration; `.github/workflows/ci.yml` already triggers on `push` and `pull_request` to `vortex/**`.

### 2026-08-11 — Sprint VRTX3-S-0020: Bugfix Sprint – Three Missing Health Probes

Added three missing health probes, each returning HTTP 200 with `Content-Type: application/json` and body `{ ok: true, variant: "<id>" }`: `/api/healthz-smoke-bugfix-1060413982`, `/api/healthz-smoke-bugfix2-521525844`, `/api/healthz-smoke-bugfix3-287868165`. Purely additive — 6 new files, 0 existing source files modified. Probe family count 71 → 74, re-derived from the filesystem and bumped in all three docs that carry it (`AGENT.md`, `ARCHITECTURE.md`, `PRODUCT.md`) in the same pass.

**Twelfth consecutive confirmation of the SPA-fallback trap.** Re-measured on a live dev server during planning rather than cited: all three target paths returned `200 text/html; charset=utf-8` (the SPA shell, 949 bytes), the control `/api/healthz-smoke-528856326-a` returned `200 application/json;charset=UTF-8` (33 bytes). Repo-wide grep for each variant id returned zero matches, confirming never-written files rather than typo'd filenames.

**The dev server bound `:5000` this sprint — which is exactly why the [Gotchas](#gotchas) rule says to read the Vite banner rather than assume.** The three prior sprints bound `:5005`, `:5006` and `:5007`, and it would have been easy to read that drift as a trend and hard-code `:5007`. The port is whatever the banner says; it is not predictable in either direction.

**The uneven-capture split from VRTX3-S-0018 repeated exactly.** VRTX3-I-0029 (behind one of the three defects) measured nothing itself — no dev server was running in the capture container — but correctly predicted the `200 text/html` result from this guide, labelled its own `404` a likely mis-transcription, and asked for a live measurement before planning. Its two sibling tickets have no idea linked and assert `404` verbatim. Whether a ticket's status code was sanity-checked upstream still is not visible from the ticket, so the rule stands: **re-measure, whatever the report says.**

The `528856326` copy-source pointer held for a sixth sprint, and VRTX3-I-0029 named it itself — the third idea in a row to name the documented template rather than sample the directory, so there was no substitution to make. The flaky `responds in under 100ms` case remains confined to the 47 pre-VRTX3-S-0011 tests, now 47 of 74.

No change to routing, the test harness or CI.

### 2026-08-11 — Sprint VRTX3-S-0019: Three Independent Health Check Endpoints (472035881)

Added `/api/healthz-smoke-472035881-a`, `-b` and `-c`, each returning HTTP 200 with `Content-Type: application/json` and body `{ ok: true, variant: "472035881" }`. Purely additive — 6 new files, 0 existing source files modified, no new dependency, nothing in `src/`. Probe family count 68 → 71, re-derived from the filesystem and bumped in all three docs that carry it (`AGENT.md`, `ARCHITECTURE.md`, `PRODUCT.md`) in the same pass.

**Eleventh consecutive confirmation of the SPA-fallback trap, third on an enhancement.** Re-measured on a live dev server during planning rather than cited: all three target paths returned `200 text/html; charset=utf-8` (the SPA shell, 949 bytes), the control `/api/healthz-smoke-528856326-a` returned `200 application/json;charset=UTF-8` (33 bytes). `ls routes/api | grep 472035881` returned nothing, confirming never-written files rather than typo'd filenames. Notable: VRTX3-I-0028 cited the [Gotchas](#gotchas) entry by name and stated the fallback behaviour correctly, so there was no `404` claim to debunk — the measurement was taken anyway, which is the rule.

**Dev-server port drift is now recorded in [Gotchas](#gotchas) rather than only in this changelog.** Vite bound `:5007` here (`5000`–`5006` all taken), after `:5005` and `:5006` in the two prior sprints. Three sprints running is a pattern, not an accident.

The `528856326` copy-source pointer held for a fifth sprint, and VRTX3-I-0028 named it itself — the second idea in a row to name the documented template rather than sample the directory, so there was no substitution to make. The flaky `responds in under 100ms` case remains confined to the 47 pre-VRTX3-S-0011 tests, now 47 of 71.

No change to routing, the test harness or CI. `nitro({ serverDir: "./" })` registers a new `routes/api/*.ts` by filename alone; the Vitest `server` project collects its colocated `*.test.ts` with no configuration; `.github/workflows/ci.yml` already triggers on `push` and `pull_request` to `vortex/**`.

### 2026-08-10 — Sprint VRTX3-S-0018: Bugfix Sprint – Three Missing Health Probes

Added three missing health probes, each returning HTTP 200 with `Content-Type: application/json` and body `{ ok: true, variant: "<id>" }`: `/api/healthz-smoke-bugfix-699186705`, `/api/healthz-smoke-bugfix2-502272230`, `/api/healthz-smoke-bugfix3-850084489`. Purely additive — 6 new files, 0 existing source files modified. Probe family count 65 → 68, re-derived from the filesystem and bumped in all three docs that carry it (`AGENT.md`, `ARCHITECTURE.md`, `PRODUCT.md`) in the same pass.

**Tenth consecutive confirmation of the SPA-fallback trap.** Re-measured on a live dev server during planning rather than cited: all three target paths returned `200 text/html; charset=utf-8` (the SPA shell, 949 bytes), the control `/api/healthz-smoke-528856326-a` returned `200 application/json;charset=UTF-8`. Repo-wide grep for each variant id returned zero matches, confirming never-written files rather than typo'd filenames. The dev server bound `:5006` in the planning container — `5000`–`5005` were taken, so read the Vite banner rather than assuming the port.

**Upstream defect capture is improving, but unevenly — and the gap is now visible within a single sprint.** The idea behind one of the three (VRTX3-I-0027) measured the SPA fallback itself, published the `200 text/html` evidence, and labelled its own `404` a mis-transcription. The other two tickets have no idea linked and repeated the `404` unchecked. So the [Gotchas](#gotchas) rule stands unchanged and still earns its keep: **re-measure, whatever the report says**, because whether a given ticket's status code was checked upstream is not something you can tell from the ticket.

The `528856326` copy-source pointer held for a fourth sprint: the flaky `responds in under 100ms` case is still confined to the 47 pre-VRTX3-S-0011 tests, now 47 of 68. VRTX3-I-0027 named the `528856326` pair itself — the first idea to name the documented template rather than sample the directory, so there was no substitution to make this sprint.

No change to routing, the test harness or CI.

### 2026-08-10 — Sprint VRTX3-S-0017: Three Independent Health Check Endpoints (238855431)

Added `/api/healthz-smoke-238855431-a`, `-b` and `-c`, each returning HTTP 200 with `Content-Type: application/json` and body `{ ok: true, variant: "238855431" }`. Purely additive — 6 new files, 0 existing source files modified, no new dependency, nothing in `src/`. Probe family count 62 → 65, re-derived from the filesystem and bumped in all three docs that carry it (`AGENT.md`, `ARCHITECTURE.md`, `PRODUCT.md`) in the same pass.

**The copy-source pointer in [Health Probe Routes](#health-probe-routes) now outranks the idea canvas, and says so.** VRTX3-I-0026 named `routes/api/healthz-smoke-126862920-c.test.ts` as the test template. That file is one of the 47 pre-VRTX3-S-0011 probe tests carrying the flaky `responds in under 100ms` case — the exact assertion this guide has told three sprints running not to propagate. The idea was not wrong about the shape it wanted (its own risk register says "prefer body assertions… or omit"), it just sampled the directory instead of reading this line. Ideas will keep doing that as long as 47 of 68 tests carry the old shape, so the rule is now explicit: the `528856326` pair wins over any file an idea names.

**Ninth consecutive confirmation of the SPA-fallback trap, second on an enhancement.** Re-measured on a live dev server during planning: all three target paths returned `200 text/html; charset=utf-8` (the SPA shell), the control `/api/healthz-smoke-528856326-a` returned `200 application/json;charset=UTF-8`. Note the dev server binds `5005` in the planning container when `5000` is taken — check the Vite banner rather than assuming the port.

No change to routing, the test harness or CI. `nitro({ serverDir: "./" })` registers a new `routes/api/*.ts` by filename alone; the Vitest `server` project collects its colocated `*.test.ts` with no configuration; `.github/workflows/ci.yml` already triggers on `push` and `pull_request` to `vortex/**`.

### 2026-08-10 — Sprint VRTX3-S-0016: Three Independent Health Check Endpoints (756246354)

Added `/api/healthz-smoke-756246354-a`, `-b` and `-c`, each returning HTTP 200 with `Content-Type: application/json` and body `{ ok: true, variant: "756246354" }`. Purely additive — 6 new files, 0 existing source files modified, no new dependency, nothing in `src/`. Probe family count 59 → 62, re-derived from the filesystem and bumped in all three docs that carry it (`AGENT.md`, `ARCHITECTURE.md`, `PRODUCT.md`) in the same pass.

**The SPA-fallback trap is not a bugfix-only phenomenon, and [Gotchas](#gotchas) now says so.** Every prior confirmation came from a defect report claiming `404`. This sprint was an additive enhancement with no such claim, and the baseline was measured anyway during planning: all three target paths returned `200 text/html; charset=utf-8` (the SPA `index.html` shell) before implementation, while the control `/api/healthz-smoke-528856326-a` returned `200 application/json;charset=UTF-8` with its variant body. Eighth consecutive confirmation, first one on an enhancement — so the rule is now stated as "measure the body whenever you need to know whether a route exists", not "distrust `404`s in defect reports".

No change to routing, the test harness or CI. `nitro({ serverDir: "./" })` registers a new `routes/api/*.ts` by filename alone; the Vitest `server` project collects its colocated `*.test.ts` with no configuration; `.github/workflows/ci.yml` already triggers on `push` and `pull_request` to `vortex/**`. The `528856326` copy-source pointer held for a third sprint — no new probe test carries the flaky `responds in under 100ms` case.

### 2026-08-10 — Sprint VRTX3-S-0015: Bugfix Sprint – Three Missing Health Probes

Added three missing health probes, each returning HTTP 200 with `Content-Type: application/json` and body `{ ok: true, variant: "<id>" }`: `/api/healthz-smoke-bugfix-406186407`, `/api/healthz-smoke-bugfix2-487405332`, `/api/healthz-smoke-bugfix3-418626414`. Purely additive — 6 new files, 0 existing files modified. Probe family count 56 → 59.

**Seventh consecutive sprint to hit the SPA-fallback trap.** Re-measured on a live dev server during planning rather than cited from prior records: each missing path returned `200 text/html; charset=utf-8` (the SPA `index.html` shell), while the working control `/api/healthz-smoke-bugfix3-404580234` returned `200 application/json;charset=UTF-8`. Repo-wide grep for each variant id returned zero matches, confirming never-written files rather than typo'd filenames. Worth noting the upstream improvement: the idea canvas for VRTX3-I-0024 **pre-emptively flagged its own `404` as a likely mis-transcription** and asked for a measurement, rather than asserting it as fact — the first time capture has caught this itself. The [Gotchas](#gotchas) entry now records the seventh occurrence.

**Fixed a stale probe count in `ARCHITECTURE.md`.** Its § Routing figure read 53 files while the tree held 56 — VRTX3-S-0014 bumped `AGENT.md` and `PRODUCT.md` but missed that doc. All three counts are now re-derived from the filesystem, not incremented blind: 59. If you bump one, bump all three.

### 2026-08-10 — Sprint VRTX3-S-0014: Bugfix Sprint – Three Missing Health Probes

Added three missing health probes, each returning HTTP 200 with `Content-Type: application/json` and body `{ ok: true, variant: "<id>" }`: `/api/healthz-smoke-bugfix-174694844`, `/api/healthz-smoke-bugfix2-754372119`, `/api/healthz-smoke-bugfix3-404580234`. Purely additive — 6 new files, 0 existing files modified. Probe family count 53 → 56.

**Sixth consecutive sprint to hit the SPA-fallback trap**, and this time the idea canvas itself carried the wrong status code through a full evidence section. Re-measured on `bun run dev` during planning rather than cited from prior records: each missing path returned `200 text/html; charset=utf-8` (the SPA `index.html` shell), while the working control `/api/healthz-smoke-841017405-a` returned `200 application/json;charset=UTF-8`. Repo-wide grep for each variant id returned zero matches, confirming a never-written file rather than a typo'd filename. The [Gotchas](#gotchas) entry now records that the mis-transcription originates upstream in defect capture and will keep arriving.

The single-assertion probe-test shape held: the `528856326` copy-source pointer added in VRTX3-S-0013 did its job, and the flaky `responds in under 100ms` case was kept out of all three new tests.

### 2026-08-09 — Sprint VRTX3-S-0013: Three Independent Health Check Endpoints (841017405)

Added `/api/healthz-smoke-841017405-a`, `-b` and `-c`, each returning HTTP 200 with `Content-Type: application/json` and body `{ ok: true, variant: "841017405" }`. Purely additive — 6 new files, 0 existing files modified, no new dependency, nothing in `src/`. Probe family count 50 → 53.

**One correction to the recipe in [Health Probe Routes](#health-probe-routes), and it matters.** The copy-source named there was `healthz-smoke-302960562-a`, whose `.test.ts` carries a second `expect(elapsed).toBeLessThan(100)` case. That assertion is machine-dependent, is a known CI-flake source, and was already dropped once — VRTX3-S-0011 deliberately omitted it and produced the single-assertion shape in `healthz-smoke-528856326-a.test.ts`. Because the recipe still pointed at the old file, the flaky case was one copy-paste away from coming back every sprint. The named source is now the `528856326` pair, with an explicit note not to propagate the timing case.

No change to routing, the test harness or CI: `nitro({ serverDir: "./" })` registers a new `routes/api/*.ts` by filename alone, the Vitest `server` project picks up its colocated `*.test.ts` with no configuration, and `.github/workflows/ci.yml` already triggers on `push` and `pull_request` to `vortex/**`.

Stack facts re-checked against `package.json` this sprint and confirmed already accurate here: ESLint `^10.7.0`, Playwright `~1.60.0`, Vitest `^4.1.10`, Nitro `^3.0.260610-beta`.

### 2026-08-09 — Sprint VRTX3-S-0012: Bugfix Sprint – Three Missing Health Probes

Added three missing health probes, each returning HTTP 200 with `Content-Type: application/json` and body `{ ok: true, variant: "<id>" }`: `/api/healthz-smoke-bugfix-6202295`, `/api/healthz-smoke-bugfix2-433928318`, `/api/healthz-smoke-bugfix3-196651982`. Purely additive — 6 new files, 0 existing files modified. Probe family count ~47 → ~50.

**Fifth consecutive sprint to hit the SPA-fallback trap.** All three were again reported as returning `404`. Re-measured directly on `bun run dev` during planning rather than cited from prior records: each missing path returned `200 text/html; charset=utf-8` (the SPA `index.html` shell), while the working control `/api/healthz-smoke-bugfix3-993514120` returned `200 application/json;charset=UTF-8`. The [Gotchas](#gotchas) entry now says to treat a reported `404` on an `/api/*` path as a mis-transcription by default — the defect is real, the status code in the report is not.

### 2026-08-09 — Sprint VRTX3-S-0011: Three Independent Health Check Endpoints (528856326)

Added three independent health-probe endpoints, each returning HTTP 200 with `Content-Type: application/json` and body `{ ok: true, variant: "528856326" }`: `/api/healthz-smoke-528856326-a`, `-b`, `-c`. Purely additive — 6 new files, 0 existing files modified, no new dependency. Each is a self-contained handler with a colocated `H3Event` integration test; no shared helper, no cross-import.

The probe pattern has been promoted out of this changelog into [Conventions → Health Probe Routes](#health-probe-routes), so the next agent finds the "don't factor out a shared handler" rule before writing code rather than after.

Two corrections to this guide, both measured against the repo rather than carried forward: **lint is ESLint 10** (`^10.7.0` in `package.json`), not ESLint 9 as previously documented here; and the method-agnostic gotcha now says what to do when an idea's acceptance criteria contradict it — this sprint's idea asserted that `POST`/`PUT`/`DELETE` "does not return the 200 success body", which is false for these handlers. Planned to the idea's own out-of-scope line ("no non-GET methods", no custom method handling) instead.

### 2026-08-09 — Sprint VRTX3-S-0009: Bugfix Sprint – Three Missing Health Check Endpoints

Added three missing health check endpoints, each returning HTTP 200 with `Content-Type: application/json` and body `{ ok: true, variant: "<id>" }`: `/api/healthz-smoke-bugfix-755467473`, `/api/healthz-smoke-bugfix2-192341379`, `/api/healthz-smoke-bugfix3-993514120`. Purely additive — 6 new files, 0 existing files modified. Each is a self-contained handler following the established H3Event integration test pattern (no auth, no database, no code sharing).

**Fourth consecutive sprint to hit the SPA-fallback trap — so the lesson has been promoted out of this changelog into [Gotchas](#gotchas), where the next agent will actually find it.** All three endpoints were again reported as "returning 404". Measured during planning on `bun run dev`: each missing path returned `200 text/html; charset=utf-8` (the SPA `index.html` shell), while the working controls (`...-739648350`, `...-901895284`, `...-221117839`) returned `200 application/json;charset=UTF-8`. Prior sprints cited this from earlier records; this sprint re-measured it directly and confirmed it.

The method-agnostic behaviour of these handlers (previously recorded here for VRTX3-S-0008) has likewise moved to Gotchas, re-verified by direct measurement against a control route.

### 2026-08-08 — Sprint VRTX3-S-0008: Bugfix Sprint – Three Missing Health Check Endpoints

Added three missing health check endpoints, each returning HTTP 200 with `Content-Type: application/json` and body `{ ok: true, variant: "<id>" }`: `/api/healthz-smoke-bugfix-739648350`, `/api/healthz-smoke-bugfix2-901895284`, `/api/healthz-smoke-bugfix3-221117839`. Purely additive — 6 new files, 0 existing files modified. Each is a self-contained handler following the established H3Event integration test pattern (no auth, no database, no code sharing).

**Third consecutive sprint to re-confirm the SPA-fallback gotcha.** All three were again reported as "returning 404". They were not: on `bun run dev`, each missing path returned `200` with `Content-Type: text/html` (the SPA `index.html` shell), while the working control `/api/healthz-smoke-bugfix3-605591646` returned `200 application/json;charset=UTF-8`. A status-code assertion passes whether or not the route exists — **when adding or verifying an API route, assert on the response body and `Content-Type`, never on a 404→200 transition.**

Two further details measured this sprint, both previously assumed rather than checked:

- **The handlers are method-agnostic.** `POST`/`PUT`/`DELETE` against a `healthz-smoke-*` route return the same `200` JSON body as `GET`, not a 405 or 500. None of the siblings declare a method guard; don't add one.
- **Route → build-output naming.** `bun run build` emits one module per route under `.output/server/_routes/api/`, with dashes converted to underscores — e.g. `/api/healthz-smoke-bugfix3-605591646` → `.output/server/_routes/api/healthz_smoke_bugfix3_605591646.mjs`. Useful for confirming a route actually compiled into the production server.

### 2026-08-06 — Sprint VRTX3-S-0007: Bugfix Sprint – Three Missing Health Check Endpoints

Added three missing health check endpoints, each returning HTTP 200 with `Content-Type: application/json` and body `{ ok: true, variant: "<id>" }`: `/api/healthz-smoke-bugfix-534542341`, `/api/healthz-smoke-bugfix2-279986033`, `/api/healthz-smoke-bugfix3-605591646`. Purely additive — 6 new files, 0 existing files modified. Each is a self-contained handler following the established H3Event integration test pattern (no auth, no database, no code sharing).

**Reconfirms the VRTX3-S-0001 gotcha, with measurements.** All three were reported as "returning 404". They were not: on `bun run dev`, each missing path returned `200` with `Content-Type: text/html` (the SPA `index.html` fallback), while the working control `/api/healthz-smoke-bugfix3-764107669` returned `200 application/json;charset=UTF-8`. A status-code assertion therefore passes whether or not the route exists — **when adding or verifying an API route, assert on the response body and `Content-Type`, never on a 404→200 transition.**

### 2026-08-05 — Sprint VRTX3-S-0006: Three Independent Health Check Endpoints

Added three completely independent health-check endpoints (`/api/healthz-smoke-913793173-a`, `/api/healthz-smoke-913793173-b`, `/api/healthz-smoke-913793173-c`), each returning `{ok:true,variant:"913793173"}`. Demonstrates parallel endpoint development pattern with zero interdependencies and no shared code. Each endpoint is self-contained with integration tests using H3Event pattern. Reference implementation for adding multiple endpoints without coordination overhead.

### 2026-08-05 — Sprint VRTX3-S-0001: Bugfix Sprint – Three Missing Health Check Endpoints

Added three missing health check endpoints, each returning HTTP 200 with `Content-Type: application/json` and a body of `{ ok: true, variant: "<id>" }`: `/api/healthz-smoke-bugfix-868175391`, `/api/healthz-smoke-bugfix2-101584827`, `/api/healthz-smoke-bugfix3-403022997`. Purely additive — 6 new files, 0 existing files modified. Each is a self-contained handler following the established H3Event integration test pattern (no auth, no database, no code sharing).

**Gotcha worth knowing (applies beyond this sprint):** these endpoints were reported as "returning 404". They were not. An unmatched `/api/*` path is answered by the **SPA `index.html` fallback with `200 text/html`** — in `bun run dev` and in the production build alike (nginx does not change this; `/api/` proxies straight to Nitro with `proxy_intercept_errors` off). So a missing API route is indistinguishable from a working one by status code alone. When adding or verifying an API route, **assert on the response body and `Content-Type`, never on a 404→200 transition** — such a check passes whether or not the route exists.

### 2026-08-02 — Sprint VRTX3-S-0004: Three Independent Health Check Endpoints

Added three independent health check endpoints demonstrating parallel development without code sharing. Endpoints: `/api/healthz-smoke-680958919-a`, `/api/healthz-smoke-680958919-b`, `/api/healthz-smoke-680958919-c`. Each endpoint is a completely self-contained file returning `{ok:true,variant:"680958919"}`. Pattern: zero interdependencies, independent tests, independent commits. Demonstrates that multiple endpoints can be built concurrently with no coordination overhead. See [Adding Tests](./AGENTS.md#adding-tests) for test pattern: integration test using real H3Event, no live server needed.

### 2026-08-02 — Sprint VRTX3-S-0003: Bugfix Sprint – Three Missing Health Check Endpoints

Fixed three more missing health check endpoints that were returning 404 errors. Each endpoint is now available and returns HTTP 200 with a simple JSON response (`{ ok: true, variant: "<id>" }`). Endpoints: `/api/healthz-smoke-bugfix-26031336`, `/api/healthz-smoke-bugfix2-59156521`, `/api/healthz-smoke-bugfix3-200192357`. All endpoints follow the established H3Event integration test pattern with no external dependencies (no auth, no database, no code sharing). See [Adding Tests](./AGENTS.md#adding-tests) for the test pattern.

### 2026-08-02 — Sprint VRTX3-S-0002: Bugfix Sprint – Three Missing Health Check Endpoints

Fixed three missing health check endpoints that were returning 404 errors. Each endpoint is now available and returns HTTP 200 with a simple JSON response (`{ ok: true, variant: "<id>" }`). Endpoints: `/api/healthz-smoke-bugfix-106285986`, `/api/healthz-smoke-bugfix2-524723214`, `/api/healthz-smoke-bugfix3-764107669`. All endpoints follow the established H3Event integration test pattern with no external dependencies (no auth, no database, no code sharing). See [Adding Tests](./AGENTS.md#adding-tests) for the test pattern.

### 2026-07-26 — Sprint SPRINT-0019: Three Independent Health Check Endpoints

Added three independent health check endpoints (`/api/healthz-smoke-302960562-a`, `/api/healthz-smoke-302960562-b`, `/api/healthz-smoke-302960562-c`) as worked examples of parallel endpoint development without code sharing. Each endpoint follows the H3Event integration test pattern; copy `routes/api/healthz-smoke-302960562-a.test.ts` when adding new endpoints. Demonstrates that multiple endpoints can be built concurrently with no coordination overhead.

### 2026-07-26 — Sprint SPRINT-0007: Health Check Endpoint

Added `/healthz-smoke-cancel-569985850` endpoint as third example of simple self-contained API route. Pattern identical to SPRINT-0004 and SPRINT-0005 endpoints. See [Adding Tests](./AGENTS.md#adding-tests) for test pattern: integration test using real H3Event, no live server needed. Copy `routes/api/healthz-smoke-cancel-569985850.test.ts` when adding new endpoints.

### 2026-07-26 — Sprint SPRINT-0005: Health Check Endpoint

Added `/healthz-smoke-cancel-158110053` endpoint as second example of simple self-contained API route. Pattern identical to SPRINT-0004 endpoint. See [Adding Tests](./AGENTS.md#adding-tests) for test pattern: integration test using real H3Event, no live server needed. Copy `routes/api/healthz-smoke-cancel-158110053.test.ts` when adding new endpoints.

### 2026-07-26 — Sprint SPRINT-0004: Health Check Endpoint

Added `/healthz-smoke-cancel-407995880` endpoint as example of simple self-contained API route. See [Adding Tests](./AGENTS.md#adding-tests) for test pattern: integration test using real H3Event, no live server needed. Copy `routes/api/healthz-smoke-cancel-407995880.test.ts` when adding new endpoints.

### 2026-07-26 — Bootstrap sprint

Initial agent guide. Development workflow: `bun install`, `bun run dev`, `bun run build`. Verification gates: `bun run verify` (core, no browser), `bun run verify:full` (includes E2E). Conventions: file-based routing (frontend + backend), auto-imports (react + react-router), Tailwind v4 + shadcn pattern, Drizzle in `db/`, test tiers (unit/component/API/E2E). Gotchas: Nitro `serverDir: "./"`, Bun runtime requirement for `bun:sqlite`, Playwright on port 5178, ts-composite setup. CI via GitHub Actions on `vortex/**` branches.
