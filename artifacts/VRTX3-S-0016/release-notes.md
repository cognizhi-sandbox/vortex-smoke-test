# Release Notes — VRTX3-S-0016

**Released:** 2026-08-10 · **Sprint goal:** `[smoke] /api/healthz-smoke-756246354-a endpoint` · **Idea:** VRTX3-I-0025

---

## ✨ Added

Three new independent health-probe endpoints. Each responds with HTTP 200, `Content-Type: application/json`, and the body:

```json
{ "ok": true, "variant": "756246354" }
```

| Endpoint                             | Ticket       |
| ------------------------------------ | ------------ |
| `GET /api/healthz-smoke-756246354-a` | VRTX3-T-0108 |
| `GET /api/healthz-smoke-756246354-b` | VRTX3-T-0109 |
| `GET /api/healthz-smoke-756246354-c` | VRTX3-T-0110 |

Each probe is fully self-contained — no auth, no database, no shared helper, and no code in common with the other two or with any of the 59 existing probes. They report only that the Nitro server is serving that route; they are **not** liveness or readiness checks of the database, disk or any downstream service.

**Behavior worth knowing:** like every probe in this family, these handlers declare no method guard, so `POST` / `PUT` / `DELETE` return the same 200 JSON body as `GET`. That is deliberate and consistent with the other 59 — not an oversight.

**How to check one correctly:** assert on the response **body and `Content-Type`**, never on the status code alone. An unmatched `/api/*` path is answered by the SPA `index.html` shell with `200 text/html`, so a status-code check passes whether or not the route exists.

```bash
curl -s -o /dev/null -w '%{http_code} %{content_type}\n' http://localhost:5000/api/healthz-smoke-756246354-a
# working route  → 200 application/json;charset=UTF-8
# missing route  → 200 text/html; charset=utf-8   (the SPA shell)
```

## 📝 Changed

- **Documentation only.** The probe-family count was updated 59 → 62 across the three root docs that carry it, each re-derived from the filesystem rather than incremented.
- The SPA-fallback guidance in the agent guide was **generalised, not just re-counted**. Every previous confirmation of that trap came from a defect report claiming `404`. This sprint was an additive enhancement with no such claim, and the baseline was measured anyway during planning: all three target paths returned `200 text/html` before implementation while the control returned `200 application/json`. The rule now reads "measure the body whenever you need to know whether an `/api/*` route exists" rather than "distrust `404`s in defect reports" — it is not a bugfix-only trap.

## 🐛 Fixed

Nothing — this release fixes no defects and none were found during integration QA.

## 🗑️ Removed

Nothing.

---

## Upgrade notes

**None required.** This release is purely additive: 6 new files, 0 existing source files modified, no new dependency, no configuration change, no schema or migration, and nothing in `src/`. No existing endpoint, page or contract changed behavior, so there is nothing for a consumer to migrate.

Nitro registers `routes/api/*.ts` by filename alone, so the new routes are live as soon as the build that contains them is deployed — there is no route table to update and no registration step.

## Verification at release

| Check                                      | Result                                                                       |
| ------------------------------------------ | ---------------------------------------------------------------------------- |
| `bun run verify` (lint → typecheck → test) | ✅ green, 0 warnings at `--max-warnings 0`                                   |
| Unit / integration suite                   | ✅ 69 files, 129 tests passed (+3 vs. sprint start)                          |
| Playwright E2E (Chromium)                  | ✅ 5 passed, 0 failed                                                        |
| Live HTTP vs. built production server      | ✅ all three return `200 application/json;charset=UTF-8` with the exact body |
| Build output                               | ✅ three route modules emitted; no module built from any `*.test.ts`         |

## Known issues

None. No defect was raised at any point in the sprint, and nothing was deferred or left open.

Two follow-ups were filed to the backlog. Neither affects this release:

- **VRTX3-T-0114** — investigate a transient, non-reproducing SPA-fallback seen on the very first cold start of a locally built server during QA. The shipped artifact was inspected and confirmed correct; a restart of the identical build resolved it and it did not recur across repeated restarts.
- **VRTX3-T-0111** — decide a retention policy for the probe family, now at 62 routes and growing ~3 per sprint with none ever retired.
