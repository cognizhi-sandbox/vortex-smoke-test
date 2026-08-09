# Release Notes — VRTX3-S-0013

**Released:** 2026-08-09 · **Sprint goal:** `[smoke] /api/healthz-smoke-841017405-a endpoint` · **Idea:** VRTX3-I-0022

---

## ✨ Added

Three new independent health-probe endpoints. Each responds with HTTP 200, `Content-Type: application/json`, and the body:

```json
{ "ok": true, "variant": "841017405" }
```

| Endpoint                             | Ticket       |
| ------------------------------------ | ------------ |
| `GET /api/healthz-smoke-841017405-a` | VRTX3-T-0086 |
| `GET /api/healthz-smoke-841017405-b` | VRTX3-T-0087 |
| `GET /api/healthz-smoke-841017405-c` | VRTX3-T-0088 |

Each probe is fully self-contained — no auth, no database, no shared helper, and no code in common with the other two or with any of the 50 existing probes. They report only that the Nitro server is serving that route; they are **not** liveness or readiness checks of the database, disk or any downstream service.

**Behavior worth knowing:** like every probe in this family, these handlers declare no method guard, so `POST` / `PUT` / `DELETE` return the same 200 JSON body as `GET`. That is deliberate and consistent with the other 50 — not an oversight.

## 📝 Changed

- **Documentation only.** The probe-family count was updated 50 → 53 across the root docs, and the probe "how to add one" recipe now points at `healthz-smoke-528856326-a` as the copy source instead of `healthz-smoke-302960562-a`. The older source's test carries a machine-dependent `expect(elapsed).toBeLessThan(100)` assertion that had already been dropped from the house pattern; the recipe was still pointing at it, so the flaky case could have been reintroduced by any future copy-paste. All three new probes use the clean single-assertion shape.

## 🐛 Fixed

Nothing — this release fixes no defects and none were found during integration QA.

## 🗑️ Removed

Nothing.

---

## Upgrade notes

**None required. This release is backward-compatible and purely additive.**

- No new dependency, no `package.json` change, no lockfile change.
- No database schema change and no migration — nothing to run before or after deploying.
- No configuration change: `vite.config.ts`, `vitest.config.ts` and the CI workflow are untouched. Nitro registers the new routes by filename alone.
- No change to any existing endpoint, page, component or middleware. No frontend change at all.
- Runtime requirement is unchanged: the production server (`.output/server/index.mjs`) still needs **Bun**, because `db/client.ts` imports `bun:sqlite`.

**Verifying the deploy.** Check the response **body and `Content-Type`**, not the status code:

```bash
curl -s -o /dev/null -w '%{http_code} %{content_type}\n' https://<host>/api/healthz-smoke-841017405-a
# expected:  200 application/json;charset=UTF-8
```

An unmatched `/api/*` path in this application returns `200 text/html` — the SPA `index.html` shell — so **a 200 alone does not prove the route exists**. If you see `text/html`, the route did not register.

---

## Quality gates

| Gate                          | Result                                                                         |
| ----------------------------- | ------------------------------------------------------------------------------ |
| Lint (ESLint 10, 0 warnings)  | ✅ pass                                                                        |
| Typecheck (`tsc --build`)     | ✅ pass                                                                        |
| Unit / integration (Vitest)   | ✅ 60 files, 120 tests passed (+3 new, no existing test changed)               |
| Production build              | ✅ all three routes compiled to `.output/server/_routes/api/`                  |
| Live HTTP (built prod server) | ✅ 3/3 exact body + `Content-Type`; control route correctly returned SPA shell |
| E2E (Playwright, chromium)    | ✅ 5 passed, 0 failed                                                          |
| Defects found                 | **0**                                                                          |

Full detail: `qa-test-report.md`, `integration-test-result.md`, `integration-defects-resolution.md`, and `sprint-summary.md` in this directory.
