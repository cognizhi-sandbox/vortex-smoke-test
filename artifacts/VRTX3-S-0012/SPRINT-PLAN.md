# Sprint VRTX3-S-0012 — Bugfix Plan (index)

**Sprint goal:** three missing `/api/healthz-smoke-*` probe routes exist and serve
`{"ok":true,"variant":"<id>"}` as `application/json`. Purely additive: 6 new files, 0 modified.

**Sprint type:** BUGFIX (light planning variant). No EPIC/STORY/TASK scaffolding.

Full RCA and fix plan for each defect live in that defect's own `PLAN.md` — this file is an
index and is deliberately not a second copy of them.

---

## Defects

| Key          | Route to add                           | Root cause (one line)                                                                                                                       | PLAN.md                                          |
| ------------ | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| VRTX3-T-0077 | `/api/healthz-smoke-bugfix-6202295`    | Handler file was never created; Nitro resolves `/api/<name>` purely from `routes/api/<name>.ts`, so an absent file is an unregistered path. | [`VRTX3-T-0077/PLAN.md`](./VRTX3-T-0077/PLAN.md) |
| VRTX3-T-0078 | `/api/healthz-smoke-bugfix2-433928318` | Same — file never created; repo-wide grep for `433928318` returns zero matches, so it is not a filename typo either.                        | [`VRTX3-T-0078/PLAN.md`](./VRTX3-T-0078/PLAN.md) |
| VRTX3-T-0079 | `/api/healthz-smoke-bugfix3-196651982` | Same — file never created; confirmed against the idea canvas (VRTX3-I-0020) and re-measured on a live dev server.                           | [`VRTX3-T-0079/PLAN.md`](./VRTX3-T-0079/PLAN.md) |

---

## Cross-cutting notes for the implementation agents

**No shared files. No ordering. No `depends_on`.** Each defect adds exactly two brand-new files
under `routes/api/` and modifies nothing. The three ownership maps are disjoint (verified: the
six target filenames do not exist and share no path with each other or with any existing file),
so all three can be built and merged in parallel. Nothing in this sprint needs sequencing.

**Do not factor out a shared handler.** The duplication across the ~47 existing probes is a
deliberate architectural decision — see `ARCHITECTURE.md` § Key Decisions and `AGENT.md`
§ Health Probe Routes. A helper, factory, constants file or barrel export would break the
zero-overlap ownership property that makes these tickets parallelisable, and fails the ticket.

**The reported symptom "404" is WRONG — do not verify against it.** Measured on this branch
against a live `bun run dev` (2026-08-09):

```
GET /api/healthz-smoke-bugfix-6202295      → 200 text/html; charset=utf-8   (SPA index.html shell)
GET /api/healthz-smoke-bugfix2-433928318   → 200 text/html; charset=utf-8   (SPA index.html shell)
GET /api/healthz-smoke-bugfix3-196651982   → 200 text/html; charset=utf-8   (SPA index.html shell)
GET /api/healthz-smoke-bugfix3-993514120   → 200 application/json;charset=UTF-8  {"ok":true,"variant":"993514120"}   (control, exists)
```

An unmatched `/api/*` path falls through to the SPA shell with **HTTP 200**, never 404. A
status-code check therefore passes whether or not the route exists. **Assert on the response
body and `Content-Type`.** This is the _fifth_ consecutive sprint (VRTX3-S-0001, -0007, -0008,
-0009, -0012) whose idea claimed 404; the claim has now been re-measured rather than
carried forward, and the RCA and fix shape are unaffected by it — only the verification method is.

**A route's unit test proves nothing about routing.** The colocated `*.test.ts` imports the
handler module directly, so it passes even if Nitro never registered the path. Only a live
request, or the presence of the compiled module under `.output/server/_routes/api/`
(dashes → underscores), proves the route is wired.

**Test files must be named `*.test.ts`.** `vite.config.ts:29` uses
`nitro({ serverDir: "./", ignore: ["**/*.test.ts"] })`. A test named `*.spec.ts` would be
bundled into the production server as if it were a route handler.

**Method guards are out of scope.** The sibling handlers carry none, so every HTTP verb returns
the same body. The new routes inherit that for consistency; changing it belongs in its own idea
covering all ~50 probes.

---

## Root docs

Observable behavior changes (three new public endpoints), so root docs were brought to target
state on this planning ticket: `AGENT.md` and `ARCHITECTURE.md` (probe-family count 47 → 50,
Changelog) and `PRODUCT.md` (Changelog). `DESIGN.md` untouched — no UI surface changes.

---

## Follow-ups / out of scope

- **The idea/canvas "404" claim is systematically wrong and keeps being re-litigated.** Five
  sprints have now each spent planning effort re-measuring the same SPA-fallback behaviour. The
  durable fix is upstream of this repo — at defect-capture time — not in a code ticket. Recorded
  here; no ticket filed (planning has no DEFECT-creation authority).
- **Probe-family growth is unbounded.** `routes/api/` will hold 100+ files after this sprint. No
  action proposed — the duplication is the deliberate decision recorded in `ARCHITECTURE.md`
  § Key Decisions — but the file count is worth a periodic look.
- No genuinely distinct defect was surfaced by root-causing. All three reported defects are the
  same missing-artifact class and are fully covered by the sprint's committed DEFECT tickets.
