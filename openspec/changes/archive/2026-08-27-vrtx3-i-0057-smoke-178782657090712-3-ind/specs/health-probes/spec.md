# health-probes

## ADDED Requirements

### Requirement: Health probe A for variant 436511294

The system SHALL serve `GET /api/healthz-smoke-436511294-a` with HTTP 200, a JSON content type,
and a response body deep-equal to `{"ok": true, "variant": "436511294"}`. The response MUST NOT
depend on the request's query string, headers, body, authenticated user or any stored data, and
the handler MUST NOT import any sibling probe or any database module.

#### Scenario: Probe answers the fixed body

- **GIVEN** the service is running
- **WHEN** a client sends `GET /api/healthz-smoke-436511294-a`
- **THEN** the response status is 200, its `Content-Type` is `application/json`, and its body is
  deep-equal to `{"ok": true, "variant": "436511294"}` with `variant` as a string

#### Scenario: Repeat calls return byte-identical JSON

- **GIVEN** the service is running
- **WHEN** a client sends two successive requests to `/api/healthz-smoke-436511294-a` that differ
  in query string, headers and request body
- **THEN** both responses carry the same bytes

#### Scenario: Probe module depends on nothing but the H3 handler factory

- **GIVEN** the file `routes/api/healthz-smoke-436511294-a.ts`
- **WHEN** its imports and handler body are inspected
- **THEN** its only import is `defineHandler` from `nitro/h3`, it reads no property of the event,
  and it references no sibling probe and no module under `db/`

#### Scenario: Colocated test asserts the handler's returned object

- **GIVEN** the file `routes/api/healthz-smoke-436511294-a.test.ts`
- **WHEN** the unit test tier runs
- **THEN** it constructs an `H3Event` for the probe path, invokes the module's default export,
  asserts the result equals `{ ok: true, variant: "436511294" }`, and contains no wall-clock
  timing assertion

#### Scenario: Route compiles into the production server

- **GIVEN** a production build of the server
- **WHEN** its route output is inspected
- **THEN** it contains the module `.output/server/_routes/api/healthz_smoke_436511294_a.mjs` and
  contains no `.test.ts` file

### Requirement: Health probe B for variant 436511294

The system SHALL serve `GET /api/healthz-smoke-436511294-b` with HTTP 200, a JSON content type,
and a response body deep-equal to `{"ok": true, "variant": "436511294"}`. The response MUST NOT
depend on the request's query string, headers, body, authenticated user or any stored data, and
the handler MUST NOT import any sibling probe or any database module.

#### Scenario: Probe answers the fixed body

- **GIVEN** the service is running
- **WHEN** a client sends `GET /api/healthz-smoke-436511294-b`
- **THEN** the response status is 200, its `Content-Type` is `application/json`, and its body is
  deep-equal to `{"ok": true, "variant": "436511294"}` with `variant` as a string

#### Scenario: Repeat calls return byte-identical JSON

- **GIVEN** the service is running
- **WHEN** a client sends two successive requests to `/api/healthz-smoke-436511294-b` that differ
  in query string, headers and request body
- **THEN** both responses carry the same bytes

#### Scenario: Probe module depends on nothing but the H3 handler factory

- **GIVEN** the file `routes/api/healthz-smoke-436511294-b.ts`
- **WHEN** its imports and handler body are inspected
- **THEN** its only import is `defineHandler` from `nitro/h3`, it reads no property of the event,
  and it references no sibling probe and no module under `db/`

#### Scenario: Colocated test asserts the handler's returned object

- **GIVEN** the file `routes/api/healthz-smoke-436511294-b.test.ts`
- **WHEN** the unit test tier runs
- **THEN** it constructs an `H3Event` for the probe path, invokes the module's default export,
  asserts the result equals `{ ok: true, variant: "436511294" }`, and contains no wall-clock
  timing assertion

#### Scenario: Route compiles into the production server

- **GIVEN** a production build of the server
- **WHEN** its route output is inspected
- **THEN** it contains the module `.output/server/_routes/api/healthz_smoke_436511294_b.mjs` and
  contains no `.test.ts` file

### Requirement: Health probe C for variant 436511294

The system SHALL serve `GET /api/healthz-smoke-436511294-c` with HTTP 200, a JSON content type,
and a response body deep-equal to `{"ok": true, "variant": "436511294"}`. The response MUST NOT
depend on the request's query string, headers, body, authenticated user or any stored data, and
the handler MUST NOT import any sibling probe or any database module.

#### Scenario: Probe answers the fixed body

- **GIVEN** the service is running
- **WHEN** a client sends `GET /api/healthz-smoke-436511294-c`
- **THEN** the response status is 200, its `Content-Type` is `application/json`, and its body is
  deep-equal to `{"ok": true, "variant": "436511294"}` with `variant` as a string

#### Scenario: Repeat calls return byte-identical JSON

- **GIVEN** the service is running
- **WHEN** a client sends two successive requests to `/api/healthz-smoke-436511294-c` that differ
  in query string, headers and request body
- **THEN** both responses carry the same bytes

#### Scenario: Probe module depends on nothing but the H3 handler factory

- **GIVEN** the file `routes/api/healthz-smoke-436511294-c.ts`
- **WHEN** its imports and handler body are inspected
- **THEN** its only import is `defineHandler` from `nitro/h3`, it reads no property of the event,
  and it references no sibling probe and no module under `db/`

#### Scenario: Colocated test asserts the handler's returned object

- **GIVEN** the file `routes/api/healthz-smoke-436511294-c.test.ts`
- **WHEN** the unit test tier runs
- **THEN** it constructs an `H3Event` for the probe path, invokes the module's default export,
  asserts the result equals `{ ok: true, variant: "436511294" }`, and contains no wall-clock
  timing assertion

#### Scenario: Route compiles into the production server

- **GIVEN** a production build of the server
- **WHEN** its route output is inspected
- **THEN** it contains the module `.output/server/_routes/api/healthz_smoke_436511294_c.mjs` and
  contains no `.test.ts` file
