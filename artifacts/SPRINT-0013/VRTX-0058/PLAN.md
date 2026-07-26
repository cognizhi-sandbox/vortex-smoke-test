# VRTX-0058: Verify Test Harness and CI Pass

**Sprint:** SPRINT-0013  
**Ticket Type:** TASK  
**Owner:** QA / CI  
**Depends On:** VRTX-0057  
**Status:** Ready for Implementation

---

## Summary

Verify that all test harness gates (lint, typecheck, test) and CI pipeline pass after the endpoint implementation and documentation updates. This is a gate ticket confirming readiness for merge.

**Plan Path:** `artifacts/SPRINT-0013/SPRINT-PLAN.md#phase-3-verification`

---

## Context & Background

### Problem

After implementing VRTX-0056 and updating docs (VRTX-0057), we need confirmation that all verification gates pass and the sprint is production-ready.

### Why This Matters

- Lint/typecheck/test gates prevent regressions and style violations
- CI workflow confirms the build is reproducible and passes in the isolated CI environment
- Gate verification is the final check before merge to production

### Scope

- Run local verification gates: `bun run lint`, `bun run typecheck`, `bun run test`
- Verify GitHub Actions CI passes on the sprint branch
- Confirm production build (`bun run build`) succeeds
- No changes to code; only verification and reporting

---

## Acceptance Criteria (Definition of Done)

- [ ] **Lint passes:** `bun run lint` exits with status 0, no warnings or errors
  - ESLint 9 + typescript-eslint
  - Prettier formatting check
  - Zero-warning policy enforced
- [ ] **Type check passes:** `bun run typecheck` exits with status 0
  - tsc --build on src/ and routes/
  - Strict mode enabled
  - No TypeScript errors
- [ ] **Unit/integration tests pass:** `bun run test` exits with status 0
  - Vitest runs all test files
  - New test file (healthz-smoke-cancel-537464696.test.ts) passes
  - All existing tests still pass (no regressions)
  - Test output includes the new test cases
- [ ] **Build succeeds:** `bun run build` exits with status 0
  - Vite SPA bundles successfully
  - Nitro server bundles successfully
  - `dist/` and `.output/` directories created
- [ ] **Full verification gate passes:** `bun run verify` exits with status 0
  - This is `lint && typecheck && test` in sequence
- [ ] **CI workflow passes on sprint branch**
  - GitHub Actions workflow triggered automatically on push
  - All steps pass: Setup, Lint, Type Check, Test, Build
  - No failures or warnings
  - Workflow status shows green (✓)
- [ ] **No blockers or regressions**
  - No new issues introduced by VRTX-0056 or VRTX-0057
  - All acceptance criteria from prior tickets verified

---

## Verification Checklist

### Local Verification (Before Pushing)

```bash
# Step 1: Ensure branch is up-to-date with latest from sprint branch
git fetch origin
git rebase origin/vortex/sprint/sprint-0013-e9613a57

# Step 2: Run full verification gate
bun run verify

# Step 3: Run individual gates for detailed output (if verify failed)
bun run lint
bun run typecheck
bun run test

# Step 4: Build production bundles
bun run build

# Step 5: Verify no uncommitted changes that would block merge
git status

# Step 6: Confirm both VRTX-0056 and VRTX-0057 commits are present
git log --oneline | head -5
# Should show commits from VRTX-0056 and VRTX-0057
```

### CI Verification (After Pushing)

1. **GitHub Actions Workflow**
   - Navigate to: `https://github.com/<repo>/actions`
   - Find the workflow run triggered by the push to `vortex/feat/VRTX-0057-***`
   - Verify all jobs pass:
     - ✓ Setup
     - ✓ Lint
     - ✓ Type Check
     - ✓ Test
     - ✓ Build
   - Check workflow status badge on sprint branch is green
2. **Artifact Verification (Optional)**
   - Download CI-generated artifacts from the workflow run
   - Verify `dist/` bundle contains the expected files
   - Verify `.output/server/` bundle is present

### Smoke Test (Optional But Recommended)

```bash
# If you want to verify the endpoint works in the running app:

# Terminal 1: Start dev server
bun run dev

# Terminal 2: Test the endpoint
curl http://localhost:5000/api/healthz-smoke-cancel-537464696
# Expected response: {"ok":true,"variant":"537464696"}

# Clean up: Ctrl+C in Terminal 1
```

---

## Expected Outputs

### Successful Lint Output

```
No issues found.
```

### Successful Typecheck Output

```
src/pages/index.tsx
routes/api/hello.ts
routes/api/healthz-smoke-cancel-537464696.ts
... (and other files)
[no errors]
```

### Successful Test Output (Excerpt)

```
PASS  routes/api/healthz-smoke-cancel-537464696.test.ts
  GET /api/healthz-smoke-cancel-537464696
    ✓ returns HTTP 200 with correct response body
    ✓ responds in under 100ms

Test Files  XX passed (XX)
Tests  YYY passed (YYY)
```

### Successful Build Output (Excerpt)

```
✓ built in 5.2s
Nitro server bundled successfully
dist/ and .output/ directories created
```

---

## Failure Diagnosis Guide

If any gate fails, follow this flowchart:

**Lint Fails:**
→ Run `bun run lint` with full output
→ Identify the file and line with the issue
→ Typical causes: trailing whitespace, import order, formatting
→ Fix and commit a new change on the same ticket branch
→ Re-run `bun run lint`

**Typecheck Fails:**
→ Run `bun run typecheck` for full error list
→ Typical causes: missing type annotations, wrong imports, H3Event type mismatch
→ Check the new endpoint file has correct imports and types
→ Fix and commit
→ Re-run `bun run typecheck`

**Test Fails:**
→ Run `bun run test` with full output
→ Identify which test is failing
→ If it's the new test (healthz-smoke-cancel-537464696.test.ts):

- Check the handler returns exactly `{ ok: true, variant: "537464696" }`
- Check the test imports the right handler
- Check the URL in the test matches the endpoint path
  → If it's an existing test:
- Unlikely if VRTX-0056 and VRTX-0057 made only additive changes
- Check for accidental deletions or modifications
  → Fix and commit
  → Re-run `bun run test`

**Build Fails:**
→ Run `bun run build` for full error
→ Check if any new .ts/.tsx files have syntax errors
→ Typical causes: missing imports, typos in TypeScript
→ Fix and commit
→ Re-run `bun run build`

**CI Workflow Fails:**
→ Check the GitHub Actions workflow output
→ It will show which step failed (Lint, Type Check, Test, Build)
→ Follow the diagnosis guide above for that step
→ Make a new commit on the ticket branch to fix
→ Push and re-run the workflow (it triggers automatically)

---

## Dependencies

- **Blocks:** Nothing; this is the final gate
- **Blocked By:** VRTX-0057 (docs must be updated before final verification)
- **Related:** VRTX-0056 (endpoint implementation)

---

## Timeline

- **Start:** After VRTX-0057 is complete (docs updated)
- **Duration:** 10–20 minutes (mostly waiting for CI to run)
- **CI Runtime:** ~5–10 minutes (once workflow starts)

---

## Rollback Plan

If verification fails after commit:

1. **If the failure is due to VRTX-0056 or VRTX-0057:**
   - Revert the problematic commit: `git revert <commit-sha>`
   - Push the revert commit
   - Re-run verification (should pass after revert)
   - Work with the ticket owner to fix the issue on a new attempt

2. **If the failure is environmental (CI environment issue):**
   - Re-run the GitHub Actions workflow (manual retry button)
   - If it passes on retry, proceed with merge
   - If it fails repeatedly, escalate to infrastructure team

3. **If all gates pass locally but CI fails:**
   - Check CI environment setup (Bun version, Node version, etc.)
   - Compare local environment to CI environment (GitHub Actions runner)
   - File an issue for infrastructure team if there's a mismatch

---

## Sign-Off Criteria

✅ **Ready to Merge** when:

- All local gates pass (`bun run verify`, `bun run build`)
- GitHub Actions CI passes (all workflow steps green)
- New test passes and is included in test output
- No lint or type errors
- Commits are clean and follow project style
- Ticket branch is pushed and ready for merge

❌ **Not Ready to Merge** if:

- Any verification gate fails
- CI workflow fails
- Existing tests regressed (unlikely, but check)
- Commits contain unrelated changes

---

## Next Steps

1. Ensure both VRTX-0056 and VRTX-0057 are marked as done
2. Run `bun run verify` locally
3. Push ticket branches to remote
4. Monitor GitHub Actions workflow
5. Once CI is green, confirm in sprint status
6. Mark this ticket (VRTX-0058) as done
7. Sprint is complete and ready for merge to main branch
