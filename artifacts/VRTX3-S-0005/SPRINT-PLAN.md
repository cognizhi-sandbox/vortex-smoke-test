# SPRINT-PLAN: VRTX3-S-0005 – Bugfix: Three Missing Health Check Endpoints

## Sprint Goal

Fix three missing health check endpoints (`/api/healthz-smoke-bugfix-*`) that return 404 instead of 200 with correct JSON response. Each is a simple self-contained route handler.

---

## Committed Defects

| Key          | Endpoint                               | RCA                        | Plan                                           |
| ------------ | -------------------------------------- | -------------------------- | ---------------------------------------------- |
| VRTX3-T-0027 | `/api/healthz-smoke-bugfix-566239482`  | Missing route handler file | [VRTX3-T-0027/PLAN.md](./VRTX3-T-0027/PLAN.md) |
| VRTX3-T-0028 | `/api/healthz-smoke-bugfix2-93488734`  | Missing route handler file | [VRTX3-T-0028/PLAN.md](./VRTX3-T-0028/PLAN.md) |
| VRTX3-T-0029 | `/api/healthz-smoke-bugfix3-331988924` | Missing route handler file | [VRTX3-T-0029/PLAN.md](./VRTX3-T-0029/PLAN.md) |

---

## Common Pattern

All three defects follow the **same root cause and fix strategy**:

- **Root Cause:** Route handler files do not exist under `routes/api/`
- **Fix:** Create two files per endpoint:
  1. Handler: `routes/api/healthz-smoke-bugfix*-<variant>.ts` (9 lines, returns `{ok:true,variant:"<id>"}`)
  2. Test: `routes/api/healthz-smoke-bugfix*-<variant>.test.ts` (copied from REFERENCE `routes/api/healthz-smoke-302960562-a.test.ts`, adjusted variant ID)

---

## Implementation Notes

- **No dependencies between fixes:** Each endpoint is self-contained (no shared code, no auth, no database)
- **No cross-file touches:** Each fix creates only two new files under its own route name
- **Test pattern:** H3Event integration test, no live server needed (Vitest runs immediately)
- **Verification gate:** `bun run verify` covers lint, typecheck, and unit tests

---

## Follow-ups / Out of Scope

None identified during root-cause analysis. All three defects are straightforward missing endpoints with clear, isolated fixes.
