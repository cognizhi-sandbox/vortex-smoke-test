# Integration / E2E Test Result — VRTX3-S-0013

- **Sprint:** VRTX3-S-0013
- **Date:** 2026-08-09
- **Validation agent:** Validation (VRTX3-T-0090)

## Command

```bash
bun install
bun run build
bun run e2e -- --project=chromium
```

## Real Playwright output

```
$ node scripts/ensure-playwright-browser.mjs
$ playwright test "--project=chromium"

Running 5 tests using 4 workers

  ✓  2 [chromium] › e2e/smoke.spec.ts:13:1 › home page loads with no console errors (321ms)
  ✓  4 [chromium] › e2e/home.spec.ts:14:3 › Home page › shows the hero content and desktop nav (510ms)
  ✓  1 [chromium] › e2e/home.spec.ts:27:3 › Home page › has no vertical scrollbar on common viewport sizes (594ms)
  ✓  3 [chromium] › e2e/home.spec.ts:44:3 › Home page › opens and closes the mobile nav from the hamburger button (606ms)
  ✓  5 [chromium] › e2e/smoke.spec.ts:26:1 › the API responds (380ms)

  5 passed (3.4s)
```

## Per-spec table

| #   | Spec                 | Test                                                      | Status    |
| --- | -------------------- | --------------------------------------------------------- | --------- |
| 1   | e2e/home.spec.ts:27  | has no vertical scrollbar on common viewport sizes        | ✅ passed |
| 2   | e2e/smoke.spec.ts:13 | home page loads with no console errors                    | ✅ passed |
| 3   | e2e/home.spec.ts:44  | opens and closes the mobile nav from the hamburger button | ✅ passed |
| 4   | e2e/home.spec.ts:14  | shows the hero content and desktop nav                    | ✅ passed |
| 5   | e2e/smoke.spec.ts:26 | the API responds                                          | ✅ passed |

No failures — no traces/screenshots produced.

## Sprint-specific manual verification (supplementary, not a substitute for the Playwright run above)

The sprint's three new routes have no dedicated Playwright coverage (none was required by the ticket's acceptance criteria — they are covered by their colocated Vitest `H3Event` tests). As a supplementary live check, after `bun run build`, the production server (`bun .output/server/index.mjs`, port 3000) was started and each endpoint was hit directly:

```
GET /api/healthz-smoke-841017405-a → 200 application/json;charset=UTF-8 {"ok":true,"variant":"841017405"}
GET /api/healthz-smoke-841017405-b → 200 application/json;charset=UTF-8 {"ok":true,"variant":"841017405"}
GET /api/healthz-smoke-841017405-c → 200 application/json;charset=UTF-8 {"ok":true,"variant":"841017405"}
POST /api/healthz-smoke-841017405-a → 200 application/json;charset=UTF-8 {"ok":true,"variant":"841017405"} (method-agnostic, as documented)
GET /api/healthz-smoke-nonexistent-000000 (control) → 200 text/html; charset=utf-8 (SPA fallback, as documented in AGENT.md Gotchas)
```

E2E-RESULT: chromium 5 passed, 0 failed
