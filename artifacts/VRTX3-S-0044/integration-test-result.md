---
artifact: integration-test-result
spec: 1
status: complete
author_role: validation
sprint: VRTX3-S-0044
idea: Not Provided
branch: vortex/sprint/vrtx3-s-0044-7d6d10f2
downstream: [artifacts/VRTX3-S-0044/qa-test-report.md]
---

# Integration test result — VRTX3-S-0044

## Commands run

```
$ bun install
$ bun run build
$ bunx playwright test --list          # confirms coverage: 1 project (chromium), 6 tests, 2 spec files
$ bun run test:e2e -- --project=chromium
```

`playwright.config.ts` declares a single project, `chromium` — no mobile/emulated project exists in
this repo, so `--project=chromium` covers every spec.

## Results

| Spec                                                                           | Result | Notes |
| ------------------------------------------------------------------------------ | ------ | ----- |
| `e2e/home.spec.ts` › shows the hero content and desktop nav                    | pass   | 464ms |
| `e2e/home.spec.ts` › has no vertical scrollbar on common viewport sizes        | pass   | 586ms |
| `e2e/home.spec.ts` › opens and closes the mobile nav from the hamburger button | pass   | 577ms |
| `e2e/smoke.spec.ts` › home page loads with no console errors                   | pass   | 480ms |
| `e2e/smoke.spec.ts` › the API responds                                         | pass   | 325ms |
| `e2e/smoke.spec.ts` › a database-backed route responds                         | pass   | 347ms |

Playwright summary: `6 passed (4.1s)`

No spec file was wholly skipped.

## Note on scope

This sprint's three tickets add JSON API probes (`routes/api/healthz-smoke-bugfix{,2,3}-*`) with no
frontend surface — no existing `e2e/*.spec.ts` targets them, and none was added for them (see
`design.md` § D4: `DESIGN.md` is untouched, "these are JSON endpoints with no frontend surface").
The full existing E2E suite was run regardless, to catch any regression in the servable web UI. The
per-scenario contract for the three new probes (body, content type, byte-identity, import surface,
build output) is verified directly against the running dev server and the built server output — see
`qa-test-report.md`'s `SCENARIO-VERDICT:` lines — because Playwright is not the tool for a
route-return-value assertion this repo already covers with an `H3Event`-level unit test
(`AGENTS.md` § Test & Validate).

E2E-RESULT: chromium 6 passed, 0 failed, 0 skipped
