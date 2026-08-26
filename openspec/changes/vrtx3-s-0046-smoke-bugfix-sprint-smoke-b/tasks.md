# Tasks

## 1. Probe — /api/healthz-smoke-bugfix-769466328

- [ ] 1.1 Add `routes/api/healthz-smoke-bugfix-769466328.ts`, copied from the pinned `healthz-smoke-528856326-a.ts` with the variant string changed to `"769466328"` (VRTX3-T-0307)
- [ ] 1.2 Add `routes/api/healthz-smoke-bugfix-769466328.test.ts` asserting the handler returns `{ ok: true, variant: "769466328" }`, carrying the subfamily regression header comment and no wall-clock timing case (VRTX3-T-0307)
- [ ] 1.3 Confirm the path answers `application/json` with the fixed body on a live dev server, asserting on body and content type rather than status code (VRTX3-T-0307)

## 2. Probe — /api/healthz-smoke-bugfix2-101945976

- [ ] 2.1 Add `routes/api/healthz-smoke-bugfix2-101945976.ts`, copied from the pinned `healthz-smoke-528856326-a.ts` with the variant string changed to `"101945976"` (VRTX3-T-0308)
- [ ] 2.2 Add `routes/api/healthz-smoke-bugfix2-101945976.test.ts` asserting the handler returns `{ ok: true, variant: "101945976" }`, carrying the subfamily regression header comment and no wall-clock timing case (VRTX3-T-0308)
- [ ] 2.3 Confirm the path answers `application/json` with the fixed body on a live dev server, asserting on body and content type rather than status code (VRTX3-T-0308)

## 3. Probe — /api/healthz-smoke-bugfix3-238143877

- [ ] 3.1 Add `routes/api/healthz-smoke-bugfix3-238143877.ts`, copied from the pinned `healthz-smoke-528856326-a.ts` with the variant string changed to `"238143877"` (VRTX3-T-0309)
- [ ] 3.2 Add `routes/api/healthz-smoke-bugfix3-238143877.test.ts` asserting the handler returns `{ ok: true, variant: "238143877" }`, carrying the subfamily regression header comment and no wall-clock timing case (VRTX3-T-0309)
- [ ] 3.3 Confirm the path answers `application/json` with the fixed body on a live dev server, asserting on body and content type rather than status code (VRTX3-T-0309)
