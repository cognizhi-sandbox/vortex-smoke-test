# Integration E2E Test Results — SPRINT-0002

## Test Execution Summary

**Test Command:**

```bash
bun run e2e -- --project=chromium
```

**Environment:** Chromium browser, Playwright 1.48.0+

**Execution Date:** 2026-07-26

---

## E2E Test Results

| Test Specification                                                                | Status  | Duration |
| --------------------------------------------------------------------------------- | ------- | -------- |
| e2e/home.spec.ts:14:3 — shows the hero content and desktop nav                    | ✅ PASS | 2.0s     |
| e2e/smoke.spec.ts:13:1 — home page loads with no console errors                   | ✅ PASS | 2.1s     |
| e2e/smoke.spec.ts:26:1 — the API responds                                         | ✅ PASS | 498ms    |
| e2e/home.spec.ts:27:3 — has no vertical scrollbar on common viewport sizes        | ✅ PASS | 3.0s     |
| e2e/home.spec.ts:44:3 — opens and closes the mobile nav from the hamburger button | ✅ PASS | 3.1s     |

**Total Duration:** 8.1s

---

## Acceptance Criteria Verification

### Endpoint A: `/api/healthz-smoke-126862920-a`

- **Response:** `{"ok":true,"variant":"126862920"}`
- **Status Code:** HTTP 200 ✅
- **Response Time:** <100ms ✅
- **No Database Calls:** ✅
- **No Authentication:** ✅
- **Independently Deployable:** ✅

### Endpoint B: `/api/healthz-smoke-126862920-b`

- **Response:** `{"ok":true,"variant":"126862920"}`
- **Status Code:** HTTP 200 ✅
- **Response Time:** <100ms ✅
- **No Database Calls:** ✅
- **No Authentication:** ✅
- **Independently Deployable:** ✅

### Endpoint C: `/api/healthz-smoke-126862920-c`

- **Response:** `{"ok":true,"variant":"126862920"}`
- **Status Code:** HTTP 200 ✅
- **Response Time:** <100ms ✅
- **No Database Calls:** ✅
- **No Authentication:** ✅
- **Independently Deployable:** ✅

---

## Build & Deployment Validation

✅ **Build Status:** Successful

- All three endpoints compiled to separate `.mjs` files:
  - `.output/server/_routes/api/healthz_smoke_126862920_a.mjs` (0.30 kB gzipped)
  - `.output/server/_routes/api/healthz_smoke_126862920_b.mjs` (0.30 kB gzipped)
  - `.output/server/_routes/api/healthz_smoke_126862920_c.mjs` (0.30 kB gzipped)

✅ **Production Bundle:** Ready for deployment

---

E2E-RESULT: chromium 5 passed, 0 failed
