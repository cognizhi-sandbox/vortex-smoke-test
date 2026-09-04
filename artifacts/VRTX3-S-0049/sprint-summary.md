---
artifact: sprint-summary
spec: 1
status: complete
author_role: planning
sprint: VRTX3-S-0049
idea: VRTX3-I-0059
branch: vortex/sprint/vrtx3-s-0049-e016db21
upstream:
  [
    artifacts/VRTX3-S-0049/SPRINT-PLAN.md,
    artifacts/VRTX3-S-0049/qa-test-report.md,
    artifacts/VRTX3-S-0049/VRTX3-T-0332/summary.md,
  ]
---

# Sprint summary — VRTX3-S-0049

## Tickets

| Ticket       | Type  | Title                                                                 | Outcome                                                    |
| ------------ | ----- | --------------------------------------------------------------------- | ---------------------------------------------------------- |
| VRTX3-T-0329 | TASK  | Sprint plan — VRTX3-S-0049                                            | DONE — change authored, backlog created, root docs updated |
| VRTX3-T-0330 | EPIC  | Password login for identity-user-auth                                 | DONE — closed by rollup                                    |
| VRTX3-T-0331 | STORY | An operator can verify a password and see the attempt recorded        | DONE — closed by rollup                                    |
| VRTX3-T-0332 | TASK  | Password login endpoint with credential storage and attempt recording | DONE — merged at `4e85667`, see `VRTX3-T-0332/summary.md`  |
| VRTX3-T-0334 | TASK  | Integration QA report — VRTX3-S-0049                                  | DONE — PASS verdict, no defects, see `qa-test-report.md`   |
| VRTX3-T-0335 | TASK  | Sprint close bundle — VRTX3-S-0049                                    | DONE — this file and `release-notes.md`                    |

One implementation ticket. Two containers closed by rollup, three lifecycle tickets.

## What shipped

The sprint goal was "VRTX3-I-0059: The identity-user-auth capability", and the capability now exists where before it did not — a fact established by reading the code at planning rather than taken from the idea, which described the problem as a missing contract. There was no implementation either: `middleware/auth.ts` assigned a hardcoded `event.context.user`, `db/schema.ts` declared one table, and `/api/auth/login` answered `200 text/html` (the SPA shell).

Delivered on VRTX3-T-0332 (`4e85667`): `POST /api/auth/login` verifies an email and password against an argon2id hash held in a new `user_credentials` table, writes exactly one `login_attempts` row for every evaluated attempt, and returns the outcome — HTTP 200 with a user summary on success, 401 `Invalid credentials` on a wrong password or an unknown email (indistinguishable to the caller), 400 `Invalid request` on a malformed body with nothing recorded. The schema change ships as a committed migration (`drizzle/0001_typical_vertigo.sql`).

The capability's contract is written down for the first time in `openspec/changes/vrtx3-i-0059-the-identity-user-auth-capa/specs/identity-user-auth/spec.md` — two requirements, eleven scenarios — which is what the idea actually asked for. `PRODUCT.md` gained a capability map and a password-login entry; `ARCHITECTURE.md` gained an Identity section, the entity-level data model, and two Key Decisions (credentials never on `users`; one password hash via `Bun.password`).

Sprint goal met.

## Divergence from plan

No scope, backlog or decision changed between planning and delivery. Three items are worth recording rather than a padded section:

- **The one-TASK decomposition held.** Schema, migration, seed, route and tests landed in a single agent session with no rework and no `depends_on` to sequence, which is what the merge argument at planning predicted.
- **Test-count split landed as planned.** Six of the eleven scenarios are covered by the new unit-integration suite (`routes/api/auth/login.post.test.ts`, 7 tests); the remaining five — method routing, body-vs-status distinguishability, and the credential-storage scenarios — were verified live, exactly as PLAN.md step 6 anticipated they would have to be. The bare-`H3Event` pattern cannot reach Nitro's router or a migration on a fresh checkout.
- **One implementation detail the plan did not anticipate:** the in-memory test database is a module-level singleton shared across tests in a file, so `login.post.test.ts` needs a `beforeEach` clearing `login_attempts` before asserting row counts. Discovered and handled in implementation; it costs nothing but is the kind of thing a plan cannot know until a test asserts on stored state, which no prior test in this repository did.

## Verification

**PASS.** See `artifacts/VRTX3-S-0049/qa-test-report.md` for the eleven per-scenario verdicts and the live-check evidence; `artifacts/VRTX3-S-0049/integration-test-result.md` for the E2E run; `artifacts/VRTX3-S-0049/integration-defects-resolution.md` for the empty defect list. No defects were found and no fix rounds were needed.

Independently re-run on this close-bundle ticket at `513cb26`: `bun run verify` exit 0, 159 test files / 225 tests passed, reproducing QA's figures. Post-sprint test-file count is 159 against the 158 pre-sprint baseline recorded in the change's design document — the one addition being this sprint's route test.

## Defects Raised

None. No DEFECT ticket was created during the sprint window (`a2a_list_tickets(type="defect", created_since=2026-09-04T08:45:35Z)` returned an empty list), and integration QA found nothing to raise.

One **improvement**-labelled TASK was raised at planning and is deliberately outside this sprint: **VRTX3-T-0333** — `middleware/auth.ts` still fabricates an identity on every request. Status BACKLOG, parentless, awaiting triage. It is not a defect: the stub is behaving as built, and connecting a proven credential to request context needs a session mechanism that does not exist and a design decision of its own.

## Retrospective

**What went well**

- **Reading the code before scoping paid for the whole sprint.** `routes/api/users/index.get.ts` selects whole `users` rows and returns them to unauthenticated callers. That one file read is why credentials went into their own table instead of onto `users` — the obvious shape, and the one that would have published password hashes through a public endpoint while breaking an existing test. Cost: one `cat`. It is now a standing Key Decision rather than a fact each future sprint has to rediscover.
- **Measuring at planning removed the unknowns from implementation.** Three claims were tested with throwaway code during planning rather than trusted: that `.post.ts` restricts the method (it does — the other verb falls through to the SPA shell, and it is not a `405`), that `readBody` works inside the bare-`H3Event` unit pattern including with no body, and that `Bun.password` is argon2id at ~73 ms. QA's independent live checks reproduced all three. The implementation ticket hit no surprises, which is the return on about ten minutes of planning-time experiments.
- **Deriving acceptance criteria one-for-one from scenarios made the QA verdict mechanical.** Eleven scenarios, eleven criteria, eleven verdicts — no judgment call about whether something "counts as done".

**What could improve**

- **The idea canvas contributed almost nothing.** It was a generated shell: one acceptance criterion, empty Current State, Technical Approach and Affected Code, no design blocks. Every fact the sprint relied on came from the codebase. That is a recoverable cost when planning investigates properly, but it means the planning phase carries the entire discovery burden, and a sprint that skipped Stage 0 would have planned against a description that was wrong about the starting state.
- **A happy-path-only acceptance criterion underspecifies by construction.** "Valid credentials: the operation is recorded and its outcome is returned" is satisfied by a handler that returns success unconditionally. Planning had to add the rejection path as an explicit assumption (design § D4) to make "valid credentials" an observable property rather than a constant. Ideas that name only the success path should be expected to need this, and the assumption should be recorded rather than absorbed silently.
- **Two planning-time frictions each cost a round trip and are worth knowing about.** The A2A ticket writer strips any description line containing `design.md` — it matches root-doc names case-insensitively, so a pointer at an OpenSpec change's design document is deleted silently (the tool's `note` says so; it is easy to miss). And a first draft of the `PRODUCT.md` capability map linked to `openspec/specs/identity-user-auth/spec.md`, which the platform only writes at sprint close — CI's doc-link check runs on every `vortex/**` push and would have been red for the entire sprint. Both were caught before the commit, the second only because the check was run locally rather than assumed.
- **The E2E cold-start timeout will recur.** The first `test:e2e` attempt timed out waiting 120 s for `config.webServer` while Vite was still cold-optimizing; the immediate re-run passed. Correctly treated as a flake rather than bisected, but it is a real budget question about a cold dependency-optimization pass, not about any code this sprint wrote.

## Compliance / Control Evidence

| Control / policy                     | Evidence produced                                          | Location                                                     | Status    | Exception                                                                                                                                                                      |
| ------------------------------------ | ---------------------------------------------------------- | ------------------------------------------------------------ | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Change specified before build        | OpenSpec change: proposal, design, delta spec, tasks       | `openspec/changes/vrtx3-i-0059-the-identity-user-auth-capa/` | Satisfied | —                                                                                                                                                                              |
| Change verified before release       | QA report, PASS verdict, 11/11 scenario verdicts           | `artifacts/VRTX3-S-0049/qa-test-report.md`                   | Satisfied | —                                                                                                                                                                              |
| Tests executed                       | `bun run verify` exit 0, 159 files / 225 tests             | `artifacts/VRTX3-S-0049/VRTX3-T-0332/tdd-test-result.md`     | Satisfied | —                                                                                                                                                                              |
| End-to-end suite executed            | `E2E-RESULT: chromium 6 passed, 0 failed, 0 skipped`       | `artifacts/VRTX3-S-0049/integration-test-result.md`          | Satisfied | —                                                                                                                                                                              |
| Defects dispositioned                | 0 found at integration QA, 0 open at close                 | `artifacts/VRTX3-S-0049/integration-defects-resolution.md`   | Satisfied | —                                                                                                                                                                              |
| Requirements traceable to acceptance | 11 criteria on VRTX3-T-0332, one per spec scenario         | ticket VRTX3-T-0332 acceptance criteria                      | Satisfied | —                                                                                                                                                                              |
| Schema change controlled             | Migration generated and committed, applied at startup      | `drizzle/0001_typical_vertigo.sql`, `drizzle/meta/`          | Satisfied | —                                                                                                                                                                              |
| Secrets not committed                | Demo credential is a declared public fixture, not a secret | design § D9, `db/client.ts` seed block                       | Satisfied | Seeded demo password `password123` is intentional test data for a boilerplate template with pre-existing hardcoded demo users; it grants no access to any deployed environment |
| Release contents recorded            | Release notes                                              | `artifacts/VRTX3-S-0049/release-notes.md`                    | Satisfied | —                                                                                                                                                                              |
