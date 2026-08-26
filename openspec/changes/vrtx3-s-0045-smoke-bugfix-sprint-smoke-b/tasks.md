# Tasks

## 1. Probe — /api/healthz-smoke-bugfix-1022589408

- [x] 1.1 Add `routes/api/healthz-smoke-bugfix-1022589408.ts`, copied from the pinned `healthz-smoke-528856326-a.ts` with the variant string changed to `"1022589408"` (VRTX3-T-0301)
- [x] 1.2 Add `routes/api/healthz-smoke-bugfix-1022589408.test.ts` asserting the handler returns `{ ok: true, variant: "1022589408" }`, carrying the subfamily regression header comment and no wall-clock timing case (VRTX3-T-0301)
- [x] 1.3 Confirm the path answers `application/json` with the fixed body on a live dev server, asserting on body and content type rather than status code (VRTX3-T-0301)

## 2. Probe — /api/healthz-smoke-bugfix2-448657707

- [ ] 2.1 Add `routes/api/healthz-smoke-bugfix2-448657707.ts`, copied from the pinned `healthz-smoke-528856326-a.ts` with the variant string changed to `"448657707"` (VRTX3-T-0302)
- [ ] 2.2 Add `routes/api/healthz-smoke-bugfix2-448657707.test.ts` asserting the handler returns `{ ok: true, variant: "448657707" }`, carrying the subfamily regression header comment and no wall-clock timing case (VRTX3-T-0302)
- [ ] 2.3 Confirm the path answers `application/json` with the fixed body on a live dev server, asserting on body and content type rather than status code (VRTX3-T-0302)

## 3. Probe — /api/healthz-smoke-bugfix3-583276571

- [ ] 3.1 Add `routes/api/healthz-smoke-bugfix3-583276571.ts`, copied from the pinned `healthz-smoke-528856326-a.ts` with the variant string changed to `"583276571"` (VRTX3-T-0303)
- [ ] 3.2 Add `routes/api/healthz-smoke-bugfix3-583276571.test.ts` asserting the handler returns `{ ok: true, variant: "583276571" }`, carrying the subfamily regression header comment and no wall-clock timing case (VRTX3-T-0303)
- [ ] 3.3 Confirm the path answers `application/json` with the fixed body on a live dev server, asserting on body and content type rather than status code (VRTX3-T-0303)
