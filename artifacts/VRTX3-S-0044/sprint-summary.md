---
artifact: sprint-summary
spec: 1
status: complete
author_role: planning
sprint: VRTX3-S-0044
idea: VRTX3-I-0053
branch: vortex/sprint/vrtx3-s-0044-7d6d10f2
upstream: [artifacts/VRTX3-S-0044/SPRINT-PLAN.md, artifacts/VRTX3-S-0044/qa-test-report.md]
downstream: [artifacts/VRTX3-S-0044/release-notes.md]
---

# Sprint summary — VRTX3-S-0044

Sprint goal: `[smoke] Bugfix sprint smoke-bugfix-178771128043004`. Type: BUGFIX.

Only VRTX3-T-0297 traces to an idea (VRTX3-I-0053); VRTX3-T-0295 and VRTX3-T-0296 have no idea
linked. The frontmatter names the one that exists.

## Tickets

| Ticket       | Type   | Title                                            | Outcome                    |
| ------------ | ------ | ------------------------------------------------ | -------------------------- |
| VRTX3-T-0298 | TASK   | Bugfix plan — VRTX3-S-0044                       | DONE (`1eed670`,`0d35293`) |
| VRTX3-T-0297 | DEFECT | `/api/healthz-smoke-bugfix3-1056287485` unrouted | DONE (PR #314, `a4c9691`)  |
| VRTX3-T-0295 | DEFECT | `/api/healthz-smoke-bugfix-588991239` unrouted   | DONE (PR #315, `e2c2622`)  |
| VRTX3-T-0296 | DEFECT | `/api/healthz-smoke-bugfix2-369920394` unrouted  | DONE (PR #316, `a8bcdb5`)  |
| VRTX3-T-0299 | TASK   | Integration QA report — VRTX3-S-0044             | DONE (PR #317, `c712ed7`)  |
| VRTX3-T-0300 | TASK   | Sprint close bundle — VRTX3-S-0044               | This artifact              |

No EPIC or STORY — correct for a BUGFIX sprint. The three committed DEFECTs were refined in place
during planning; no ticket was created at any point in the sprint.

## What shipped

Sprint goal met. Three health probes that answered the SPA shell now answer JSON:

| Endpoint                                | Body                                 | Ticket       |
| --------------------------------------- | ------------------------------------ | ------------ |
| `/api/healthz-smoke-bugfix-588991239`   | `{"ok":true,"variant":"588991239"}`  | VRTX3-T-0295 |
| `/api/healthz-smoke-bugfix2-369920394`  | `{"ok":true,"variant":"369920394"}`  | VRTX3-T-0296 |
| `/api/healthz-smoke-bugfix3-1056287485` | `{"ok":true,"variant":"1056287485"}` | VRTX3-T-0297 |

Six new source files, zero existing source files modified. `git diff --stat 2fb20b3..HEAD` over the
sprint's fork point shows 23 files changed, **1323 insertions and 0 deletions** — no `M` line
against anything that already existed. The probe family moved 136 → 139 handlers; the test-file
count moved 143 → 146, matching the baseline recorded in the change's `design.md` § Context exactly.

Re-verified at close on the integrated branch: `bun run verify` exit `0`, **146 test files, 206
tests passing**, lint clean at `--max-warnings 0`, typecheck clean.

All nine `tasks.md` checkboxes are stamped, three per ticket — the platform found every key,
so the tagging held.

## Divergence from plan

None material. The three fixed interface contracts were delivered verbatim: each handler imports
only `nitro/h3`, returns the bare numeric `variant` as a string with no extra keys, carries no
method guard, and shares no code with any sibling. `grep -l toBeLessThan` over the three new test
files returns no match.

Four points are worth recording.

**D1 — This is the repository's first spec-driven BUGFIX sprint.** The five archived changes are all
enhancement sprints. `openspec/specs/health-probes/spec.md` carried **zero** occurrences of
`healthz-smoke-bugfix`, so the entire 65-file subfamily was unspecified and the delta was `ADDED`,
not the `MODIFIED` a defect normally takes. That is the genuine spec-gap case rather than a
shortcut: there was no requirement to attach a regression scenario to.

**D2 — The delta carries a sixth scenario the family's archived deltas do not.** "An unrouted path
is distinguishable only by body, not by status" writes the `404` mis-transcription into the spec of
record instead of leaving it in prose that each sprint re-derives. QA verified it live for all three
probes against a deliberately unrouted control path. If it survives merge, the next sprint that
specifies a probe inherits the lesson as a contract rather than as advice.

**D3 — The copy-source substitution propagated intact, in its harmless form.** VRTX3-I-0053 named
`healthz-smoke-bugfix3-827939824.ts` and `healthz-smoke-bugfix3-850084489.test.ts`. Both were
diffed at planning and both are clean, so following the canvas would have cost nothing this time.
The pinned `healthz-smoke-528856326-a` pair was used regardless; all three implementation agents
copied it and said so, and VRTX3-T-0297's fix note cited the reasoning rather than just the
instruction.

**D4 — The one deliberate under-specification resolved itself.** `design.md` § D6 declined to pin
the compiled `.mjs` module name in the build-output scenario, because the dash→underscore mapping
had never been observed for the `bugfix` subfamily and there was no `.output/` in the tree to check.
The scenario asserted "a compiled route module serving the path" instead. Implementation and QA both
built and measured it: the mapping does hold —
`.output/server/_routes/api/healthz_smoke_bugfix_588991239.mjs`,
`healthz_smoke_bugfix2_369920394.mjs` and `healthz_smoke_bugfix3_1056287485.mjs`. The caution cost
nothing and the question is now answered by measurement, so a future delta can pin the name.

**Root docs unchanged this sprint** — the fourth consecutive sprint requiring no edit. See below.

## Root docs

No trigger fired, and no root-doc line is now inaccurate. Verified rather than assumed:
`grep -n '588991239\|369920394\|1056287485'` across all four root docs returns nothing, so no
document names a path this sprint changed.

- **`PRODUCT.md`** — the Health probes capability line already describes the family without
  counting it, and § Health probe endpoints states explicitly that the document "deliberately
  carries no count and no 'most recent' pointer". Restoring three instances of an existing
  capability adds no line.
- **`ARCHITECTURE.md`** — § Health probe route contract already states the filename-is-the-URL
  contract with its build-output example pinned to the never-rotating `528856326` copy source.
  `## Key Decisions` gains nothing: "Health probes duplicate, on purpose" governed this sprint as
  written and predicted the decomposition exactly — three tickets, two new files each, zero
  `depends_on` edges, delivered in an order (0297, 0295, 0296) unrelated to their keys.
- **`DESIGN.md`** — an API-only change touches no token, type scale, grid, interaction pattern or
  accessibility standard. VRTX3-I-0053's design manifest is empty (`blocks: []`), so "unchanged"
  means reviewed and found to have no visual surface, and nothing was exported to
  `artifacts/VRTX3-S-0044/design/` because there was nothing to export.
- **`AGENTS.md`** — human-authored; read, never written. Its probe-family count is stale again (it
  says 124; the filesystem said 136 at planning and 139 now). `.vortex/agents-generated.md` already
  records this drift and explicitly declines to maintain a running figure, so it was **not**
  re-stamped for a third time. The durable statement stands: 47 legacy timing tests out of a family
  that grows every sprint.

**On the "dated Changelog entry" clause in this ticket's acceptance criteria.** The sprint did
change observable behaviour, so that clause is live — but the standing role rule is that root docs
carry no new changelog entries, because the commit message already carries the change narrative,
dated and attributed. Where a ticket instruction and the standing contract conflict, the contract
wins and the conflict gets named, which is what this paragraph does. It is also what the repository
has actually done: the last entry in each root doc's § Changelog is VRTX3-S-0039, and the four
sprints since added none. Existing changelog sections are left in place as history.

## Retrospective

**Went well**

- **R1 — The plan's three overrides were followed without re-litigation.** Copy source, status
  code, and the scenario shape each contradicted something in the source canvas, and three
  independent agents carried out all three and recorded the reason in their own fix notes. Nothing
  had to be corrected at QA. Writing the _reason_ into the plan, not just the instruction, is again
  what made that reproducible.
- **R2 — Ownership maps stayed disjoint, and the merge order proved it.** VRTX3-T-0297 landed
  first, then -0295, then -0296 — ticket keys out of order, no `depends_on` edge, no conflict, no
  rebase.
- **R3 — Under-specifying a fact nobody had measured was the right call and cost nothing.** D4
  above: the scenario stayed verifiable, the build answered the open question, and no acceptance
  criterion had to be walked back. The alternative — pinning a filename derived from a neighbouring
  subfamily's convention — would have been correct by luck.
- **R4 — Zero defects at integration QA**, no rework on any ticket, and the E2E suite green 6/6.

**Could improve**

- **R5 — The QA report's scenario count is wrong in two places.** It states "15 delta-spec scenarios
  (5 per requirement × 3 requirements)" in its executive summary, and
  `integration-defects-resolution.md` repeats it. The delta carries **18** (6 per requirement × 3),
  and the report itself enumerates 18 `SCENARIO-VERDICT:` lines, all pass. So coverage is complete
  and the verdict stands — only the prose is wrong. It is worth flagging because the count is the
  one line a reader skims, and because it is exactly the arithmetic that would hide a genuinely
  missed scenario. Counting the verdict lines rather than restating a product would catch it.
- **R6 — The `404` mis-transcription arrived for the thirty-first consecutive sprint.** Every sprint
  pays the same live re-measurement to debunk the same wrong status code. This sprint at least
  converts the lesson into a spec scenario (D2), which is the first time the loop has done anything
  durable with it — but the fix still belongs upstream in defect capture.
- **R7 — Two of three defects had no idea linked**, and the third's canvas asserted `404` too. This
  is the eighth occurrence of the uneven-capture split, and its shape has not varied in eight
  sprints: the ungrounded half asserts `404` unchecked, the grounded half predicts the SPA fallback
  or asserts `404` and cannot measure either way.
- **R8 — The ticket-description root-doc filter is content-blind to paths.** Planning's first update
  to VRTX3-T-0295 silently dropped the change-id line, because "read its `design.md` first" contains
  the substring `design.md` — the OpenSpec change's technical-decisions document, not root
  `DESIGN.md`. The policy is right and the ticket recovered, but a spec-driven ticket description
  needs to name that file constantly, so the phrasing workaround ("the technical-decisions document
  in that change directory") is now load-bearing and undocumented. Matching on path rather than
  filename would remove the workaround entirely.
- **R9 — Four containers, three dev-server ports, one sprint** (planning `:5004`, VRTX3-T-0296
  `:5003`, VRTX3-T-0297 and QA `:5002`). Every agent read its own banner and none assumed, so
  nothing went wrong — recorded because it is the clearest single-sprint evidence yet that the port
  is per-container and not a sprint-level fact.

## Follow-ups carried out of this sprint

Recorded in the change's `design.md` § Follow-ups / out of scope. None is an open defect and none
blocked the close — planning has no DEFECT-creation authority, so all are left for a future sprint:

- **F1** — the `healthz-smoke-bugfix*` subfamily is 63 numbered variants; this change specifies 3.
  The other 60 remain absent from the spec of record.
- **F2** — 33 of the 65 `bugfix*` tests carry a wall-clock assertion. They are never rewritten by
  policy, so the ratio only worsens as the family grows; a one-off sweep would retire the recurring
  copy-source hazard at its source.
- **F3** — the defect-capture gap behind R6 and R7: unlinked defect tickets carrying unverified
  status codes.

## Open defects

**None.** Integration QA found zero defects; `integration-defects-resolution.md` records an empty
table with `INTEGRATION_DEFECTS_RESOLUTION: COMPLETE`. This ticket's description carries no
"Conditionally approved" notice, so there are no known issues to carry past close.
