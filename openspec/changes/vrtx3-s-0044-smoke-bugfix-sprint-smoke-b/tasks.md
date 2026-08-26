# Tasks

## 1. Probe — /api/healthz-smoke-bugfix-588991239

- [x] 1.1 Add `routes/api/healthz-smoke-bugfix-588991239.ts`, copied from the pinned `healthz-smoke-528856326-a.ts` with the variant string changed to `"588991239"` (VRTX3-T-0295)
- [x] 1.2 Add `routes/api/healthz-smoke-bugfix-588991239.test.ts` asserting the handler returns `{ ok: true, variant: "588991239" }`, carrying the subfamily regression header comment and no wall-clock timing case (VRTX3-T-0295)
- [x] 1.3 Confirm the path answers `application/json` with the fixed body on a live dev server, asserting on body and content type rather than status code (VRTX3-T-0295)

## 2. Probe — /api/healthz-smoke-bugfix2-369920394

- [ ] 2.1 Add `routes/api/healthz-smoke-bugfix2-369920394.ts`, copied from the pinned `healthz-smoke-528856326-a.ts` with the variant string changed to `"369920394"` (VRTX3-T-0296)
- [ ] 2.2 Add `routes/api/healthz-smoke-bugfix2-369920394.test.ts` asserting the handler returns `{ ok: true, variant: "369920394" }`, carrying the subfamily regression header comment and no wall-clock timing case (VRTX3-T-0296)
- [ ] 2.3 Confirm the path answers `application/json` with the fixed body on a live dev server, asserting on body and content type rather than status code (VRTX3-T-0296)

## 3. Probe — /api/healthz-smoke-bugfix3-1056287485

- [x] 3.1 Add `routes/api/healthz-smoke-bugfix3-1056287485.ts`, copied from the pinned `healthz-smoke-528856326-a.ts` with the variant string changed to `"1056287485"` (VRTX3-T-0297)
- [x] 3.2 Add `routes/api/healthz-smoke-bugfix3-1056287485.test.ts` asserting the handler returns `{ ok: true, variant: "1056287485" }`, carrying the subfamily regression header comment and no wall-clock timing case (VRTX3-T-0297)
- [x] 3.3 Confirm the path answers `application/json` with the fixed body on a live dev server, asserting on body and content type rather than status code (VRTX3-T-0297)
