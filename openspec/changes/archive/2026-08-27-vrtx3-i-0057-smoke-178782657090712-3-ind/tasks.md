## 1. Probe A — /api/healthz-smoke-436511294-a

- [x] 1.1 Add `routes/api/healthz-smoke-436511294-a.ts`, copied from the pinned `healthz-smoke-528856326-a.ts` with the variant string changed (VRTX3-T-0316)
- [x] 1.2 Add `routes/api/healthz-smoke-436511294-a.test.ts` asserting the handler returns `{ ok: true, variant: "436511294" }`, with no wall-clock timing case (VRTX3-T-0316)
- [x] 1.3 Confirm the path answers `application/json` with the fixed body on a live server, and that the route module appears in the production build output (VRTX3-T-0316)

## 2. Probe B — /api/healthz-smoke-436511294-b

- [x] 2.1 Add `routes/api/healthz-smoke-436511294-b.ts`, copied from the pinned `healthz-smoke-528856326-a.ts` with the variant string changed (VRTX3-T-0317)
- [x] 2.2 Add `routes/api/healthz-smoke-436511294-b.test.ts` asserting the handler returns `{ ok: true, variant: "436511294" }`, with no wall-clock timing case (VRTX3-T-0317)
- [x] 2.3 Confirm the path answers `application/json` with the fixed body on a live server, and that the route module appears in the production build output (VRTX3-T-0317)

## 3. Probe C — /api/healthz-smoke-436511294-c

- [x] 3.1 Add `routes/api/healthz-smoke-436511294-c.ts`, copied from the pinned `healthz-smoke-528856326-a.ts` with the variant string changed (VRTX3-T-0318)
- [x] 3.2 Add `routes/api/healthz-smoke-436511294-c.test.ts` asserting the handler returns `{ ok: true, variant: "436511294" }`, with no wall-clock timing case (VRTX3-T-0318)
- [x] 3.3 Confirm the path answers `application/json` with the fixed body on a live server, and that the route module appears in the production build output (VRTX3-T-0318)
