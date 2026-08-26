# Design — restore three unreachable health probes (batch smoke-bugfix-178771128043004)

## Context

Read from the working tree at planning time, on `vortex/sprint/vrtx3-s-0044-7d6d10f2` at `2fb20b3`.

- `routes/api/` holds **275 entries**: 136 `healthz-smoke-*` handlers, 136 colocated tests,
  `hello.ts`, `hello.post.ts`, `hello.test.ts`. Counted from the filesystem, not incremented from
  the previous sprint.
- The `healthz-smoke-bugfix*` subfamily is 21 `bugfix-`, 21 `bugfix2-` and 21 `bugfix3-` handlers
  (plus two `-ha` one-offs), each with a colocated test — **65 tests, of which 33 carry a
  wall-clock assertion.**
- **Nothing matching any of the three variants exists, and never has.** `ls routes/api/ | grep
<variant>` returns nothing for all three, and `git log --all -S<variant>` returns **zero commits**
  for all three. These are never-written files, not deleted, renamed or typo'd ones. There is
  nothing to revert.
- Pre-sprint test-file count, for the Integration QA baseline:
  `git ls-tree -r --name-only HEAD | grep -cE '^(src|routes).*\.test\.(ts|tsx)$'` → **143**. Adding
  three probe tests makes the expected post-sprint total **146**.
- Routing needs no wiring: `nitro({ serverDir: "./", ignore: ["**/*.test.ts"] })` in
  `vite.config.ts:29` registers a route by filename, and the Vitest `server` project
  (`environment: "node"`, `include: ["routes/**/*.test.ts"]`) already collects the colocated tests.
- CI (`.github/workflows/ci.yml`) runs on `vortex/**` and needs no change — new route files are
  picked up by glob.

### Measured — the reported `404` is a mis-transcription in all three tickets

The dev server bound **`:5004`** in this container (`:5000`–`:5003` were all in use; read your own
Vite banner, the port is per-container and no other agent's number is reusable).

| Path                                       | Status | Content-Type                     | Size  | Body              |
| ------------------------------------------ | ------ | -------------------------------- | ----- | ----------------- |
| `/api/healthz-smoke-bugfix-588991239`      | 200    | `text/html; charset=utf-8`       | 949 B | SPA shell         |
| `/api/healthz-smoke-bugfix2-369920394`     | 200    | `text/html; charset=utf-8`       | 949 B | SPA shell         |
| `/api/healthz-smoke-bugfix3-1056287485`    | 200    | `text/html; charset=utf-8`       | 949 B | SPA shell         |
| `/api/healthz-smoke-528856326-a` (control) | 200    | `application/json;charset=UTF-8` | 33 B  | `{"ok":true,...}` |

An unrouted `/api/*` path falls through to the SPA shell with `200 text/html`, so **the status code
cannot distinguish a working endpoint from a missing one**. All three tickets report `404`; all
three are wrong about it. The defects are real — the routes genuinely do not exist — but no
scenario, acceptance criterion or test may assert `404 → 200`, because such an assertion passes
whether or not the route is added. Every scenario in the delta spec therefore asserts on the
**body and content type**.

This is the thirtieth consecutive confirmation of the behaviour documented in `AGENTS.md`
§ Gotchas, and the **seventh** occurrence of the uneven-capture split: VRTX3-T-0297 has a canvas
(VRTX3-I-0053) behind it and VRTX3-T-0295 / VRTX3-T-0296 have no idea linked at all
(`a2a_get_idea_canvas` reports no `idea_id` for either). Worth stating because the split's record
is now seven for seven and has never varied in shape: the ungrounded tickets assert `404`
unchecked, and the grounded one asserts it too. VRTX3-I-0053's evidence is otherwise excellent —
it greps the directory, quotes a sibling handler in full and diagrams the routing fall-through —
and it is still wrong about the status code, calling the `404` "environment-independent". Canvas
quality does not predict this failure mode. The measurement was taken anyway, because the question
it answers — does the file exist in _this_ working tree — is not something a canvas observes.

## Decisions

### D1 — Three tickets, one change

The three defects arrived as one batch (`smoke-bugfix-178771128043004`) and touch one capability.
One change carrying three `ADDED` requirement deltas is correct; three changes would each edit
`health-probes` and archive in sequence, and any `MODIFIED` among them would replace its
requirement wholesale and drop its siblings' scenarios.

The three tickets stay separate because their file ownership is disjoint (two new files each, no
overlap) and each is independently mergeable — which is the property the probe family exists to
demonstrate. **No `depends_on` edge between them.**

### D2 — `ADDED`, not `MODIFIED`

A defect delta is normally a regression scenario on the requirement the defect violated. There is
no such requirement here: `openspec/specs/health-probes/spec.md` contains **zero** occurrences of
`healthz-smoke-bugfix`, so the entire subfamily's behaviour was never specified. This is the
genuine SPEC-GAP case, and `ADDED` is correct. Reaching for `MODIFIED` would mean naming a
requirement that does not exist.

### D3 — Copy the pinned `528856326-a` pair, not the templates the canvas names

VRTX3-I-0053 names `routes/api/healthz-smoke-bugfix3-827939824.ts` as the handler template and
`routes/api/healthz-smoke-bugfix3-850084489.test.ts` as the test template. Both were diffed at
planning: **neither carries a timing case**, so following the canvas would have been harmless this
time. The pinned `healthz-smoke-528856326-a.{ts,test.ts}` pair is used regardless, per `AGENTS.md`
§ Health Probe Routes, and the substitution is recorded here.

The substitution is not conditional on how healthy the named file looks. 33 of the 65
`healthz-smoke-bugfix*` tests carry `expect(elapsed).toBeLessThan(100)`, so a canvas that samples
that subdirectory has roughly even odds of landing on one, and two prior sprints (VRTX3-I-0037,
VRTX3-I-0041) did exactly that and pinned the timing shape into an acceptance criterion. A
wall-clock assertion on a constant-returning handler measures the CI runner, not the code; the
property it reaches for — the handler performs no I/O — is guaranteed by the interface contract in
§ D5 instead. New tests get a single body assertion.

### D4 — No root document is updated

None of the three triggers fires. `PRODUCT.md`'s capability map already carries a `health-probes`
line and gains nothing — three more instances of an existing capability is not a new capability.
`ARCHITECTURE.md` is unchanged: no topology, data model, integration point or cross-cutting
constraint moves, and no decision here binds work beyond this change (D3 restates standing
`AGENTS.md` guidance; D1–D2 and D5 are scoped to this change). `DESIGN.md` is untouched because
nothing user-visible changes — these are JSON endpoints with no frontend surface.

### D5 — Fixed interface contract, identical across all three

Handler, in full — vary only the filename and the `variant` string:

```ts
import { defineHandler } from "nitro/h3";

export default defineHandler(() => {
  return {
    ok: true,
    variant: "<digits>",
  };
});
```

- **Route path is the filename.** `routes/api/healthz-smoke-bugfix2-369920394.ts` →
  `/api/healthz-smoke-bugfix2-369920394`. A typo in the digits ships a route at the wrong URL whose
  own test still passes, because the test imports the same misspelled file. Check the digits
  against the reported URL, not only against each other.
- **`variant` is the digits only** — `"369920394"`, not `"bugfix2-369920394"`. Confirmed against
  the whole subfamily; the `bugfix`/`bugfix2`/`bugfix3` prefix is part of the path, never the body.
- **No `-a`/`-b`/`-c` suffix.** All 63 subfamily members are `healthz-smoke-bugfix<N>-<digits>`.
- **Import surface is `nitro/h3` only.** No `db/` import, no `event.context.user` read, no method
  guard — the probe must stay answerable when auth and the database are unavailable, and every
  sibling is method-agnostic.
- **No shared module.** The duplication is deliberate — `ARCHITECTURE.md` § Key Decisions.
- **Test files carry the subfamily's regression header comment**, matching
  `healthz-smoke-bugfix-507266122.test.ts`.

### D6 — The build-output scenario names no `.mjs` filename

The archived probe deltas assert an exact compiled module name (`healthz_smoke_613529736_a.mjs`).
That mapping has not been observed for the `bugfix` subfamily — there is no `.output/` directory in
this tree to check it against — so the scenario asserts that the built route output contains a
compiled module serving the probe path and no `.test.ts` file, which is checkable without pinning a
filename nobody has verified.

## Follow-ups / out of scope

- **The `healthz-smoke-bugfix*` subfamily is absent from the spec of record.** This change specifies
  3 of its 63 variants; the other 60 remain unspecified. Not a defect and not filed as one — noted
  so a future sprint can decide whether the family is worth backfilling.
- **33 of 65 `bugfix*` tests carry a wall-clock assertion.** They are never rewritten by policy, so
  the ratio only worsens as the family grows. Noted, not actioned.
- **`AGENTS.md`'s probe-family count is stale** — it says 124, the filesystem says 136.
  `.vortex/agents-generated.md` already records this drift and explicitly declines to maintain a
  running figure, so it is deliberately not re-stamped here. The durable statement stands: 47 legacy
  timing tests out of a family that grows every sprint.
- **`artifacts/VRTX3-S-0044/SPRINT-PLAN.md` is not authored by planning on this sprint.** This
  ticket's generic acceptance criteria ask for one, and the spec-driven dispatch instruction
  overrides that: the platform generates it at DONE and anything written there is overwritten. The
  per-defect RCA lives in each ticket's `PLAN.md`, and the cross-cutting notes live in this file.
