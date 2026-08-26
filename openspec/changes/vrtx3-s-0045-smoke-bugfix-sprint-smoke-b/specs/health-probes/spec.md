# health-probes

## ADDED Requirements

### Requirement: Health probe for bugfix variant 1022589408

The system SHALL serve `GET /api/healthz-smoke-bugfix-1022589408` with HTTP 200, a JSON content
type, and a response body deep-equal to `{"ok": true, "variant": "1022589408"}`. The response MUST
NOT depend on the request's query string, headers, body, authenticated user or any stored data, and
the handler MUST NOT import any sibling probe or any database module.

#### Scenario: Probe answers the fixed body

- **GIVEN** the service is running
- **WHEN** a client sends `GET /api/healthz-smoke-bugfix-1022589408`
- **THEN** the response `Content-Type` is `application/json` and its body is deep-equal to
  `{"ok": true, "variant": "1022589408"}` with `variant` as a string

#### Scenario: An unrouted path is distinguishable only by body, not by status

- **GIVEN** the service is running
- **WHEN** a client sends `GET /api/healthz-smoke-bugfix-1022589408` and compares the result against
  a path under `/api/` that has no handler file
- **THEN** both responses carry HTTP 200, the unrouted path answers `text/html` with the SPA shell,
  and the probe answers `application/json` with its fixed body

#### Scenario: Repeat calls return byte-identical JSON

- **GIVEN** the service is running
- **WHEN** a client sends two successive requests to `/api/healthz-smoke-bugfix-1022589408` that
  differ in query string, headers and request body
- **THEN** both responses carry the same bytes

#### Scenario: Probe module depends on nothing but the H3 handler factory

- **GIVEN** the file `routes/api/healthz-smoke-bugfix-1022589408.ts`
- **WHEN** its imports and handler body are inspected
- **THEN** its only import is `defineHandler` from `nitro/h3`, it reads no property of the event,
  and it references no sibling probe and no module under `db/`

#### Scenario: Colocated test asserts the handler's returned object

- **GIVEN** the file `routes/api/healthz-smoke-bugfix-1022589408.test.ts`
- **WHEN** the unit test tier runs
- **THEN** it constructs an `H3Event` for the probe path, invokes the module's default export,
  asserts the result equals `{ ok: true, variant: "1022589408" }`, and contains no wall-clock timing
  assertion

#### Scenario: Route compiles into the production server

- **GIVEN** a production build of the server
- **WHEN** its route output is inspected
- **THEN** it contains a compiled route module serving `/api/healthz-smoke-bugfix-1022589408` and
  contains no `.test.ts` file

### Requirement: Health probe for bugfix variant 448657707

The system SHALL serve `GET /api/healthz-smoke-bugfix2-448657707` with HTTP 200, a JSON content
type, and a response body deep-equal to `{"ok": true, "variant": "448657707"}`. The response MUST
NOT depend on the request's query string, headers, body, authenticated user or any stored data, and
the handler MUST NOT import any sibling probe or any database module.

#### Scenario: Probe answers the fixed body

- **GIVEN** the service is running
- **WHEN** a client sends `GET /api/healthz-smoke-bugfix2-448657707`
- **THEN** the response `Content-Type` is `application/json` and its body is deep-equal to
  `{"ok": true, "variant": "448657707"}` with `variant` as a string

#### Scenario: An unrouted path is distinguishable only by body, not by status

- **GIVEN** the service is running
- **WHEN** a client sends `GET /api/healthz-smoke-bugfix2-448657707` and compares the result against
  a path under `/api/` that has no handler file
- **THEN** both responses carry HTTP 200, the unrouted path answers `text/html` with the SPA shell,
  and the probe answers `application/json` with its fixed body

#### Scenario: Repeat calls return byte-identical JSON

- **GIVEN** the service is running
- **WHEN** a client sends two successive requests to `/api/healthz-smoke-bugfix2-448657707` that
  differ in query string, headers and request body
- **THEN** both responses carry the same bytes

#### Scenario: Probe module depends on nothing but the H3 handler factory

- **GIVEN** the file `routes/api/healthz-smoke-bugfix2-448657707.ts`
- **WHEN** its imports and handler body are inspected
- **THEN** its only import is `defineHandler` from `nitro/h3`, it reads no property of the event,
  and it references no sibling probe and no module under `db/`

#### Scenario: Colocated test asserts the handler's returned object

- **GIVEN** the file `routes/api/healthz-smoke-bugfix2-448657707.test.ts`
- **WHEN** the unit test tier runs
- **THEN** it constructs an `H3Event` for the probe path, invokes the module's default export,
  asserts the result equals `{ ok: true, variant: "448657707" }`, and contains no wall-clock timing
  assertion

#### Scenario: Route compiles into the production server

- **GIVEN** a production build of the server
- **WHEN** its route output is inspected
- **THEN** it contains a compiled route module serving `/api/healthz-smoke-bugfix2-448657707` and
  contains no `.test.ts` file

### Requirement: Health probe for bugfix variant 583276571

The system SHALL serve `GET /api/healthz-smoke-bugfix3-583276571` with HTTP 200, a JSON content
type, and a response body deep-equal to `{"ok": true, "variant": "583276571"}`. The response MUST
NOT depend on the request's query string, headers, body, authenticated user or any stored data, and
the handler MUST NOT import any sibling probe or any database module.

#### Scenario: Probe answers the fixed body

- **GIVEN** the service is running
- **WHEN** a client sends `GET /api/healthz-smoke-bugfix3-583276571`
- **THEN** the response `Content-Type` is `application/json` and its body is deep-equal to
  `{"ok": true, "variant": "583276571"}` with `variant` as a string

#### Scenario: An unrouted path is distinguishable only by body, not by status

- **GIVEN** the service is running
- **WHEN** a client sends `GET /api/healthz-smoke-bugfix3-583276571` and compares the result against
  a path under `/api/` that has no handler file
- **THEN** both responses carry HTTP 200, the unrouted path answers `text/html` with the SPA shell,
  and the probe answers `application/json` with its fixed body

#### Scenario: Repeat calls return byte-identical JSON

- **GIVEN** the service is running
- **WHEN** a client sends two successive requests to `/api/healthz-smoke-bugfix3-583276571` that
  differ in query string, headers and request body
- **THEN** both responses carry the same bytes

#### Scenario: Probe module depends on nothing but the H3 handler factory

- **GIVEN** the file `routes/api/healthz-smoke-bugfix3-583276571.ts`
- **WHEN** its imports and handler body are inspected
- **THEN** its only import is `defineHandler` from `nitro/h3`, it reads no property of the event,
  and it references no sibling probe and no module under `db/`

#### Scenario: Colocated test asserts the handler's returned object

- **GIVEN** the file `routes/api/healthz-smoke-bugfix3-583276571.test.ts`
- **WHEN** the unit test tier runs
- **THEN** it constructs an `H3Event` for the probe path, invokes the module's default export,
  asserts the result equals `{ ok: true, variant: "583276571" }`, and contains no wall-clock timing
  assertion

#### Scenario: Route compiles into the production server

- **GIVEN** a production build of the server
- **WHEN** its route output is inspected
- **THEN** it contains a compiled route module serving `/api/healthz-smoke-bugfix3-583276571` and
  contains no `.test.ts` file
