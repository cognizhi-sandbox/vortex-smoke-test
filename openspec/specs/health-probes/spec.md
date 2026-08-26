# health-probes Specification

## Purpose
Health probes are trivially small GET endpoints that answer with a fixed JSON body, so an operator
can confirm that a deployed build is actually serving the Nitro API without involving
authentication, the database, or any application state. Each probe is also a standalone unit of
work, which makes the family the repository's standing evidence that independent changes merge in
parallel without conflict.

## Requirements

### Requirement: Health probe A for variant 992401223

The system SHALL serve `GET /api/healthz-smoke-992401223-a` with HTTP 200, a JSON content type,
and a response body deep-equal to `{"ok": true, "variant": "992401223"}`. The response MUST NOT
depend on the request's query string, headers, body, authenticated user or any stored data, and
the handler MUST NOT import any sibling probe or any database module.

#### Scenario: Probe answers the fixed body

- **GIVEN** the service is running
- **WHEN** a client sends `GET /api/healthz-smoke-992401223-a`
- **THEN** the response status is 200, its `Content-Type` is `application/json`, and its body is
  deep-equal to `{"ok": true, "variant": "992401223"}` with `variant` as a string

#### Scenario: Repeat calls return byte-identical JSON

- **GIVEN** the service is running
- **WHEN** a client sends two successive requests to `/api/healthz-smoke-992401223-a` that differ
  in query string, headers and request body
- **THEN** both responses carry the same bytes

#### Scenario: Probe module depends on nothing but the H3 handler factory

- **GIVEN** the file `routes/api/healthz-smoke-992401223-a.ts`
- **WHEN** its imports and handler body are inspected
- **THEN** its only import is `defineHandler` from `nitro/h3`, it reads no property of the event,
  and it references no sibling probe and no module under `db/`

#### Scenario: Colocated test asserts the handler's returned object

- **GIVEN** the file `routes/api/healthz-smoke-992401223-a.test.ts`
- **WHEN** the unit test tier runs
- **THEN** it constructs an `H3Event` for the probe path, invokes the module's default export,
  asserts the result equals `{ ok: true, variant: "992401223" }`, and contains no wall-clock
  timing assertion

#### Scenario: Route compiles into the production server

- **GIVEN** a production build of the server
- **WHEN** its route output is inspected
- **THEN** it contains the module `.output/server/_routes/api/healthz_smoke_992401223_a.mjs` and
  contains no `.test.ts` file

### Requirement: Health probe B for variant 992401223

The system SHALL serve `GET /api/healthz-smoke-992401223-b` with HTTP 200, a JSON content type,
and a response body deep-equal to `{"ok": true, "variant": "992401223"}`. The response MUST NOT
depend on the request's query string, headers, body, authenticated user or any stored data, and
the handler MUST NOT import any sibling probe or any database module.

#### Scenario: Probe answers the fixed body

- **GIVEN** the service is running
- **WHEN** a client sends `GET /api/healthz-smoke-992401223-b`
- **THEN** the response status is 200, its `Content-Type` is `application/json`, and its body is
  deep-equal to `{"ok": true, "variant": "992401223"}` with `variant` as a string

#### Scenario: Repeat calls return byte-identical JSON

- **GIVEN** the service is running
- **WHEN** a client sends two successive requests to `/api/healthz-smoke-992401223-b` that differ
  in query string, headers and request body
- **THEN** both responses carry the same bytes

#### Scenario: Probe module depends on nothing but the H3 handler factory

- **GIVEN** the file `routes/api/healthz-smoke-992401223-b.ts`
- **WHEN** its imports and handler body are inspected
- **THEN** its only import is `defineHandler` from `nitro/h3`, it reads no property of the event,
  and it references no sibling probe and no module under `db/`

#### Scenario: Colocated test asserts the handler's returned object

- **GIVEN** the file `routes/api/healthz-smoke-992401223-b.test.ts`
- **WHEN** the unit test tier runs
- **THEN** it constructs an `H3Event` for the probe path, invokes the module's default export,
  asserts the result equals `{ ok: true, variant: "992401223" }`, and contains no wall-clock
  timing assertion

#### Scenario: Route compiles into the production server

- **GIVEN** a production build of the server
- **WHEN** its route output is inspected
- **THEN** it contains the module `.output/server/_routes/api/healthz_smoke_992401223_b.mjs` and
  contains no `.test.ts` file

### Requirement: Health probe C for variant 992401223

The system SHALL serve `GET /api/healthz-smoke-992401223-c` with HTTP 200, a JSON content type,
and a response body deep-equal to `{"ok": true, "variant": "992401223"}`. The response MUST NOT
depend on the request's query string, headers, body, authenticated user or any stored data, and
the handler MUST NOT import any sibling probe or any database module.

#### Scenario: Probe answers the fixed body

- **GIVEN** the service is running
- **WHEN** a client sends `GET /api/healthz-smoke-992401223-c`
- **THEN** the response status is 200, its `Content-Type` is `application/json`, and its body is
  deep-equal to `{"ok": true, "variant": "992401223"}` with `variant` as a string

#### Scenario: Repeat calls return byte-identical JSON

- **GIVEN** the service is running
- **WHEN** a client sends two successive requests to `/api/healthz-smoke-992401223-c` that differ
  in query string, headers and request body
- **THEN** both responses carry the same bytes

#### Scenario: Probe module depends on nothing but the H3 handler factory

- **GIVEN** the file `routes/api/healthz-smoke-992401223-c.ts`
- **WHEN** its imports and handler body are inspected
- **THEN** its only import is `defineHandler` from `nitro/h3`, it reads no property of the event,
  and it references no sibling probe and no module under `db/`

#### Scenario: Colocated test asserts the handler's returned object

- **GIVEN** the file `routes/api/healthz-smoke-992401223-c.test.ts`
- **WHEN** the unit test tier runs
- **THEN** it constructs an `H3Event` for the probe path, invokes the module's default export,
  asserts the result equals `{ ok: true, variant: "992401223" }`, and contains no wall-clock
  timing assertion

#### Scenario: Route compiles into the production server

- **GIVEN** a production build of the server
- **WHEN** its route output is inspected
- **THEN** it contains the module `.output/server/_routes/api/healthz_smoke_992401223_c.mjs` and
  contains no `.test.ts` file

### Requirement: Health probe A for variant 812788042

The system SHALL serve `GET /api/healthz-smoke-812788042-a` with HTTP 200, a JSON content type,
and a response body deep-equal to `{"ok": true, "variant": "812788042"}`. The response MUST NOT
depend on the request's query string, headers, body, authenticated user or any stored data, and
the handler MUST NOT import any sibling probe or any database module.

#### Scenario: Probe answers the fixed body

- **GIVEN** the service is running
- **WHEN** a client sends `GET /api/healthz-smoke-812788042-a`
- **THEN** the response status is 200, its `Content-Type` is `application/json`, and its body is
  deep-equal to `{"ok": true, "variant": "812788042"}` with `variant` as a string

#### Scenario: Repeat calls return byte-identical JSON

- **GIVEN** the service is running
- **WHEN** a client sends two successive requests to `/api/healthz-smoke-812788042-a` that differ
  in query string, headers and request body
- **THEN** both responses carry the same bytes

#### Scenario: Probe module depends on nothing but the H3 handler factory

- **GIVEN** the file `routes/api/healthz-smoke-812788042-a.ts`
- **WHEN** its imports and handler body are inspected
- **THEN** its only import is `defineHandler` from `nitro/h3`, it reads no property of the event,
  and it references no sibling probe and no module under `db/`

#### Scenario: Colocated test asserts the handler's returned object

- **GIVEN** the file `routes/api/healthz-smoke-812788042-a.test.ts`
- **WHEN** the unit test tier runs
- **THEN** it constructs an `H3Event` for the probe path, invokes the module's default export,
  asserts the result equals `{ ok: true, variant: "812788042" }`, and contains no wall-clock
  timing assertion

#### Scenario: Route compiles into the production server

- **GIVEN** a production build of the server
- **WHEN** its route output is inspected
- **THEN** it contains the module `.output/server/_routes/api/healthz_smoke_812788042_a.mjs` and
  contains no `.test.ts` file

### Requirement: Health probe B for variant 812788042

The system SHALL serve `GET /api/healthz-smoke-812788042-b` with HTTP 200, a JSON content type,
and a response body deep-equal to `{"ok": true, "variant": "812788042"}`. The response MUST NOT
depend on the request's query string, headers, body, authenticated user or any stored data, and
the handler MUST NOT import any sibling probe or any database module.

#### Scenario: Probe answers the fixed body

- **GIVEN** the service is running
- **WHEN** a client sends `GET /api/healthz-smoke-812788042-b`
- **THEN** the response status is 200, its `Content-Type` is `application/json`, and its body is
  deep-equal to `{"ok": true, "variant": "812788042"}` with `variant` as a string

#### Scenario: Repeat calls return byte-identical JSON

- **GIVEN** the service is running
- **WHEN** a client sends two successive requests to `/api/healthz-smoke-812788042-b` that differ
  in query string, headers and request body
- **THEN** both responses carry the same bytes

#### Scenario: Probe module depends on nothing but the H3 handler factory

- **GIVEN** the file `routes/api/healthz-smoke-812788042-b.ts`
- **WHEN** its imports and handler body are inspected
- **THEN** its only import is `defineHandler` from `nitro/h3`, it reads no property of the event,
  and it references no sibling probe and no module under `db/`

#### Scenario: Colocated test asserts the handler's returned object

- **GIVEN** the file `routes/api/healthz-smoke-812788042-b.test.ts`
- **WHEN** the unit test tier runs
- **THEN** it constructs an `H3Event` for the probe path, invokes the module's default export,
  asserts the result equals `{ ok: true, variant: "812788042" }`, and contains no wall-clock
  timing assertion

#### Scenario: Route compiles into the production server

- **GIVEN** a production build of the server
- **WHEN** its route output is inspected
- **THEN** it contains the module `.output/server/_routes/api/healthz_smoke_812788042_b.mjs` and
  contains no `.test.ts` file

### Requirement: Health probe C for variant 812788042

The system SHALL serve `GET /api/healthz-smoke-812788042-c` with HTTP 200, a JSON content type,
and a response body deep-equal to `{"ok": true, "variant": "812788042"}`. The response MUST NOT
depend on the request's query string, headers, body, authenticated user or any stored data, and
the handler MUST NOT import any sibling probe or any database module.

#### Scenario: Probe answers the fixed body

- **GIVEN** the service is running
- **WHEN** a client sends `GET /api/healthz-smoke-812788042-c`
- **THEN** the response status is 200, its `Content-Type` is `application/json`, and its body is
  deep-equal to `{"ok": true, "variant": "812788042"}` with `variant` as a string

#### Scenario: Repeat calls return byte-identical JSON

- **GIVEN** the service is running
- **WHEN** a client sends two successive requests to `/api/healthz-smoke-812788042-c` that differ
  in query string, headers and request body
- **THEN** both responses carry the same bytes

#### Scenario: Probe module depends on nothing but the H3 handler factory

- **GIVEN** the file `routes/api/healthz-smoke-812788042-c.ts`
- **WHEN** its imports and handler body are inspected
- **THEN** its only import is `defineHandler` from `nitro/h3`, it reads no property of the event,
  and it references no sibling probe and no module under `db/`

#### Scenario: Colocated test asserts the handler's returned object

- **GIVEN** the file `routes/api/healthz-smoke-812788042-c.test.ts`
- **WHEN** the unit test tier runs
- **THEN** it constructs an `H3Event` for the probe path, invokes the module's default export,
  asserts the result equals `{ ok: true, variant: "812788042" }`, and contains no wall-clock
  timing assertion

#### Scenario: Route compiles into the production server

- **GIVEN** a production build of the server
- **WHEN** its route output is inspected
- **THEN** it contains the module `.output/server/_routes/api/healthz_smoke_812788042_c.mjs` and
  contains no `.test.ts` file

### Requirement: Health probe A for variant 503463873

The system SHALL serve `GET /api/healthz-smoke-503463873-a` with HTTP 200, a JSON content type,
and a response body deep-equal to `{"ok": true, "variant": "503463873"}`. The response MUST NOT
depend on the request's query string, headers, body, authenticated user or any stored data, and
the handler MUST NOT import any sibling probe or any database module.

#### Scenario: Probe answers the fixed body

- **GIVEN** the service is running
- **WHEN** a client sends `GET /api/healthz-smoke-503463873-a`
- **THEN** the response status is 200, its `Content-Type` is `application/json`, and its body is
  deep-equal to `{"ok": true, "variant": "503463873"}` with `variant` as a string

#### Scenario: Repeat calls return byte-identical JSON

- **GIVEN** the service is running
- **WHEN** a client sends two successive requests to `/api/healthz-smoke-503463873-a` that differ
  in query string, headers and request body
- **THEN** both responses carry the same bytes

#### Scenario: Probe module depends on nothing but the H3 handler factory

- **GIVEN** the file `routes/api/healthz-smoke-503463873-a.ts`
- **WHEN** its imports and handler body are inspected
- **THEN** its only import is `defineHandler` from `nitro/h3`, it reads no property of the event,
  and it references no sibling probe and no module under `db/`

#### Scenario: Colocated test asserts the handler's returned object

- **GIVEN** the file `routes/api/healthz-smoke-503463873-a.test.ts`
- **WHEN** the unit test tier runs
- **THEN** it constructs an `H3Event` for the probe path, invokes the module's default export,
  asserts the result equals `{ ok: true, variant: "503463873" }`, and contains no wall-clock
  timing assertion

#### Scenario: Route compiles into the production server

- **GIVEN** a production build of the server
- **WHEN** its route output is inspected
- **THEN** it contains the module `.output/server/_routes/api/healthz_smoke_503463873_a.mjs` and
  contains no `.test.ts` file

### Requirement: Health probe B for variant 503463873

The system SHALL serve `GET /api/healthz-smoke-503463873-b` with HTTP 200, a JSON content type,
and a response body deep-equal to `{"ok": true, "variant": "503463873"}`. The response MUST NOT
depend on the request's query string, headers, body, authenticated user or any stored data, and
the handler MUST NOT import any sibling probe or any database module.

#### Scenario: Probe answers the fixed body

- **GIVEN** the service is running
- **WHEN** a client sends `GET /api/healthz-smoke-503463873-b`
- **THEN** the response status is 200, its `Content-Type` is `application/json`, and its body is
  deep-equal to `{"ok": true, "variant": "503463873"}` with `variant` as a string

#### Scenario: Repeat calls return byte-identical JSON

- **GIVEN** the service is running
- **WHEN** a client sends two successive requests to `/api/healthz-smoke-503463873-b` that differ
  in query string, headers and request body
- **THEN** both responses carry the same bytes

#### Scenario: Probe module depends on nothing but the H3 handler factory

- **GIVEN** the file `routes/api/healthz-smoke-503463873-b.ts`
- **WHEN** its imports and handler body are inspected
- **THEN** its only import is `defineHandler` from `nitro/h3`, it reads no property of the event,
  and it references no sibling probe and no module under `db/`

#### Scenario: Colocated test asserts the handler's returned object

- **GIVEN** the file `routes/api/healthz-smoke-503463873-b.test.ts`
- **WHEN** the unit test tier runs
- **THEN** it constructs an `H3Event` for the probe path, invokes the module's default export,
  asserts the result equals `{ ok: true, variant: "503463873" }`, and contains no wall-clock
  timing assertion

#### Scenario: Route compiles into the production server

- **GIVEN** a production build of the server
- **WHEN** its route output is inspected
- **THEN** it contains the module `.output/server/_routes/api/healthz_smoke_503463873_b.mjs` and
  contains no `.test.ts` file

### Requirement: Health probe C for variant 503463873

The system SHALL serve `GET /api/healthz-smoke-503463873-c` with HTTP 200, a JSON content type,
and a response body deep-equal to `{"ok": true, "variant": "503463873"}`. The response MUST NOT
depend on the request's query string, headers, body, authenticated user or any stored data, and
the handler MUST NOT import any sibling probe or any database module.

#### Scenario: Probe answers the fixed body

- **GIVEN** the service is running
- **WHEN** a client sends `GET /api/healthz-smoke-503463873-c`
- **THEN** the response status is 200, its `Content-Type` is `application/json`, and its body is
  deep-equal to `{"ok": true, "variant": "503463873"}` with `variant` as a string

#### Scenario: Repeat calls return byte-identical JSON

- **GIVEN** the service is running
- **WHEN** a client sends two successive requests to `/api/healthz-smoke-503463873-c` that differ
  in query string, headers and request body
- **THEN** both responses carry the same bytes

#### Scenario: Probe module depends on nothing but the H3 handler factory

- **GIVEN** the file `routes/api/healthz-smoke-503463873-c.ts`
- **WHEN** its imports and handler body are inspected
- **THEN** its only import is `defineHandler` from `nitro/h3`, it reads no property of the event,
  and it references no sibling probe and no module under `db/`

#### Scenario: Colocated test asserts the handler's returned object

- **GIVEN** the file `routes/api/healthz-smoke-503463873-c.test.ts`
- **WHEN** the unit test tier runs
- **THEN** it constructs an `H3Event` for the probe path, invokes the module's default export,
  asserts the result equals `{ ok: true, variant: "503463873" }`, and contains no wall-clock
  timing assertion

#### Scenario: Route compiles into the production server

- **GIVEN** a production build of the server
- **WHEN** its route output is inspected
- **THEN** it contains the module `.output/server/_routes/api/healthz_smoke_503463873_c.mjs` and
  contains no `.test.ts` file

### Requirement: Health probe A for variant 865643533

The system SHALL serve `GET /api/healthz-smoke-865643533-a` with HTTP 200, a JSON content type,
and a response body deep-equal to `{"ok": true, "variant": "865643533"}`. The response MUST NOT
depend on the request's query string, headers, body, authenticated user or any stored data, and
the handler MUST NOT import any sibling probe or any database module.

#### Scenario: Probe answers the fixed body

- **GIVEN** the service is running
- **WHEN** a client sends `GET /api/healthz-smoke-865643533-a`
- **THEN** the response status is 200, its `Content-Type` is `application/json`, and its body is
  deep-equal to `{"ok": true, "variant": "865643533"}` with `variant` as a string

#### Scenario: Repeat calls return byte-identical JSON

- **GIVEN** the service is running
- **WHEN** a client sends two successive requests to `/api/healthz-smoke-865643533-a` that differ
  in query string, headers and request body
- **THEN** both responses carry the same bytes

#### Scenario: Probe module depends on nothing but the H3 handler factory

- **GIVEN** the file `routes/api/healthz-smoke-865643533-a.ts`
- **WHEN** its imports and handler body are inspected
- **THEN** its only import is `defineHandler` from `nitro/h3`, it reads no property of the event,
  and it references no sibling probe and no module under `db/`

#### Scenario: Colocated test asserts the handler's returned object

- **GIVEN** the file `routes/api/healthz-smoke-865643533-a.test.ts`
- **WHEN** the unit test tier runs
- **THEN** it constructs an `H3Event` for the probe path, invokes the module's default export,
  asserts the result equals `{ ok: true, variant: "865643533" }`, and contains no wall-clock
  timing assertion

#### Scenario: Route compiles into the production server

- **GIVEN** a production build of the server
- **WHEN** its route output is inspected
- **THEN** it contains the module `.output/server/_routes/api/healthz_smoke_865643533_a.mjs` and
  contains no `.test.ts` file

### Requirement: Health probe B for variant 865643533

The system SHALL serve `GET /api/healthz-smoke-865643533-b` with HTTP 200, a JSON content type,
and a response body deep-equal to `{"ok": true, "variant": "865643533"}`. The response MUST NOT
depend on the request's query string, headers, body, authenticated user or any stored data, and
the handler MUST NOT import any sibling probe or any database module.

#### Scenario: Probe answers the fixed body

- **GIVEN** the service is running
- **WHEN** a client sends `GET /api/healthz-smoke-865643533-b`
- **THEN** the response status is 200, its `Content-Type` is `application/json`, and its body is
  deep-equal to `{"ok": true, "variant": "865643533"}` with `variant` as a string

#### Scenario: Repeat calls return byte-identical JSON

- **GIVEN** the service is running
- **WHEN** a client sends two successive requests to `/api/healthz-smoke-865643533-b` that differ
  in query string, headers and request body
- **THEN** both responses carry the same bytes

#### Scenario: Probe module depends on nothing but the H3 handler factory

- **GIVEN** the file `routes/api/healthz-smoke-865643533-b.ts`
- **WHEN** its imports and handler body are inspected
- **THEN** its only import is `defineHandler` from `nitro/h3`, it reads no property of the event,
  and it references no sibling probe and no module under `db/`

#### Scenario: Colocated test asserts the handler's returned object

- **GIVEN** the file `routes/api/healthz-smoke-865643533-b.test.ts`
- **WHEN** the unit test tier runs
- **THEN** it constructs an `H3Event` for the probe path, invokes the module's default export,
  asserts the result equals `{ ok: true, variant: "865643533" }`, and contains no wall-clock
  timing assertion

#### Scenario: Route compiles into the production server

- **GIVEN** a production build of the server
- **WHEN** its route output is inspected
- **THEN** it contains the module `.output/server/_routes/api/healthz_smoke_865643533_b.mjs` and
  contains no `.test.ts` file

### Requirement: Health probe C for variant 865643533

The system SHALL serve `GET /api/healthz-smoke-865643533-c` with HTTP 200, a JSON content type,
and a response body deep-equal to `{"ok": true, "variant": "865643533"}`. The response MUST NOT
depend on the request's query string, headers, body, authenticated user or any stored data, and
the handler MUST NOT import any sibling probe or any database module.

#### Scenario: Probe answers the fixed body

- **GIVEN** the service is running
- **WHEN** a client sends `GET /api/healthz-smoke-865643533-c`
- **THEN** the response status is 200, its `Content-Type` is `application/json`, and its body is
  deep-equal to `{"ok": true, "variant": "865643533"}` with `variant` as a string

#### Scenario: Repeat calls return byte-identical JSON

- **GIVEN** the service is running
- **WHEN** a client sends two successive requests to `/api/healthz-smoke-865643533-c` that differ
  in query string, headers and request body
- **THEN** both responses carry the same bytes

#### Scenario: Probe module depends on nothing but the H3 handler factory

- **GIVEN** the file `routes/api/healthz-smoke-865643533-c.ts`
- **WHEN** its imports and handler body are inspected
- **THEN** its only import is `defineHandler` from `nitro/h3`, it reads no property of the event,
  and it references no sibling probe and no module under `db/`

#### Scenario: Colocated test asserts the handler's returned object

- **GIVEN** the file `routes/api/healthz-smoke-865643533-c.test.ts`
- **WHEN** the unit test tier runs
- **THEN** it constructs an `H3Event` for the probe path, invokes the module's default export,
  asserts the result equals `{ ok: true, variant: "865643533" }`, and contains no wall-clock
  timing assertion

#### Scenario: Route compiles into the production server

- **GIVEN** a production build of the server
- **WHEN** its route output is inspected
- **THEN** it contains the module `.output/server/_routes/api/healthz_smoke_865643533_c.mjs` and
  contains no `.test.ts` file

### Requirement: Health probe A for variant 613529736

The system SHALL serve `GET /api/healthz-smoke-613529736-a` with HTTP 200, a JSON content type,
and a response body deep-equal to `{"ok": true, "variant": "613529736"}`. The response MUST NOT
depend on the request's query string, headers, body, authenticated user or any stored data, and
the handler MUST NOT import any sibling probe or any database module.

#### Scenario: Probe answers the fixed body

- **GIVEN** the service is running
- **WHEN** a client sends `GET /api/healthz-smoke-613529736-a`
- **THEN** the response status is 200, its `Content-Type` is `application/json`, and its body is
  deep-equal to `{"ok": true, "variant": "613529736"}` with `variant` as a string

#### Scenario: Repeat calls return byte-identical JSON

- **GIVEN** the service is running
- **WHEN** a client sends two successive requests to `/api/healthz-smoke-613529736-a` that differ
  in query string, headers and request body
- **THEN** both responses carry the same bytes

#### Scenario: Probe module depends on nothing but the H3 handler factory

- **GIVEN** the file `routes/api/healthz-smoke-613529736-a.ts`
- **WHEN** its imports and handler body are inspected
- **THEN** its only import is `defineHandler` from `nitro/h3`, it reads no property of the event,
  and it references no sibling probe and no module under `db/`

#### Scenario: Colocated test asserts the handler's returned object

- **GIVEN** the file `routes/api/healthz-smoke-613529736-a.test.ts`
- **WHEN** the unit test tier runs
- **THEN** it constructs an `H3Event` for the probe path, invokes the module's default export,
  asserts the result equals `{ ok: true, variant: "613529736" }`, and contains no wall-clock
  timing assertion

#### Scenario: Route compiles into the production server

- **GIVEN** a production build of the server
- **WHEN** its route output is inspected
- **THEN** it contains the module `.output/server/_routes/api/healthz_smoke_613529736_a.mjs` and
  contains no `.test.ts` file

### Requirement: Health probe B for variant 613529736

The system SHALL serve `GET /api/healthz-smoke-613529736-b` with HTTP 200, a JSON content type,
and a response body deep-equal to `{"ok": true, "variant": "613529736"}`. The response MUST NOT
depend on the request's query string, headers, body, authenticated user or any stored data, and
the handler MUST NOT import any sibling probe or any database module.

#### Scenario: Probe answers the fixed body

- **GIVEN** the service is running
- **WHEN** a client sends `GET /api/healthz-smoke-613529736-b`
- **THEN** the response status is 200, its `Content-Type` is `application/json`, and its body is
  deep-equal to `{"ok": true, "variant": "613529736"}` with `variant` as a string

#### Scenario: Repeat calls return byte-identical JSON

- **GIVEN** the service is running
- **WHEN** a client sends two successive requests to `/api/healthz-smoke-613529736-b` that differ
  in query string, headers and request body
- **THEN** both responses carry the same bytes

#### Scenario: Probe module depends on nothing but the H3 handler factory

- **GIVEN** the file `routes/api/healthz-smoke-613529736-b.ts`
- **WHEN** its imports and handler body are inspected
- **THEN** its only import is `defineHandler` from `nitro/h3`, it reads no property of the event,
  and it references no sibling probe and no module under `db/`

#### Scenario: Colocated test asserts the handler's returned object

- **GIVEN** the file `routes/api/healthz-smoke-613529736-b.test.ts`
- **WHEN** the unit test tier runs
- **THEN** it constructs an `H3Event` for the probe path, invokes the module's default export,
  asserts the result equals `{ ok: true, variant: "613529736" }`, and contains no wall-clock
  timing assertion

#### Scenario: Route compiles into the production server

- **GIVEN** a production build of the server
- **WHEN** its route output is inspected
- **THEN** it contains the module `.output/server/_routes/api/healthz_smoke_613529736_b.mjs` and
  contains no `.test.ts` file

### Requirement: Health probe C for variant 613529736

The system SHALL serve `GET /api/healthz-smoke-613529736-c` with HTTP 200, a JSON content type,
and a response body deep-equal to `{"ok": true, "variant": "613529736"}`. The response MUST NOT
depend on the request's query string, headers, body, authenticated user or any stored data, and
the handler MUST NOT import any sibling probe or any database module.

#### Scenario: Probe answers the fixed body

- **GIVEN** the service is running
- **WHEN** a client sends `GET /api/healthz-smoke-613529736-c`
- **THEN** the response status is 200, its `Content-Type` is `application/json`, and its body is
  deep-equal to `{"ok": true, "variant": "613529736"}` with `variant` as a string

#### Scenario: Repeat calls return byte-identical JSON

- **GIVEN** the service is running
- **WHEN** a client sends two successive requests to `/api/healthz-smoke-613529736-c` that differ
  in query string, headers and request body
- **THEN** both responses carry the same bytes

#### Scenario: Probe module depends on nothing but the H3 handler factory

- **GIVEN** the file `routes/api/healthz-smoke-613529736-c.ts`
- **WHEN** its imports and handler body are inspected
- **THEN** its only import is `defineHandler` from `nitro/h3`, it reads no property of the event,
  and it references no sibling probe and no module under `db/`

#### Scenario: Colocated test asserts the handler's returned object

- **GIVEN** the file `routes/api/healthz-smoke-613529736-c.test.ts`
- **WHEN** the unit test tier runs
- **THEN** it constructs an `H3Event` for the probe path, invokes the module's default export,
  asserts the result equals `{ ok: true, variant: "613529736" }`, and contains no wall-clock
  timing assertion

#### Scenario: Route compiles into the production server

- **GIVEN** a production build of the server
- **WHEN** its route output is inspected
- **THEN** it contains the module `.output/server/_routes/api/healthz_smoke_613529736_c.mjs` and
  contains no `.test.ts` file

### Requirement: Health probe for bugfix variant 769466328

The system SHALL serve `GET /api/healthz-smoke-bugfix-769466328` with HTTP 200, a JSON content
type, and a response body deep-equal to `{"ok": true, "variant": "769466328"}`. The response MUST
NOT depend on the request's query string, headers, body, authenticated user or any stored data, and
the handler MUST NOT import any sibling probe or any database module.

#### Scenario: Probe answers the fixed body

- **GIVEN** the service is running
- **WHEN** a client sends `GET /api/healthz-smoke-bugfix-769466328`
- **THEN** the response `Content-Type` is `application/json` and its body is deep-equal to
  `{"ok": true, "variant": "769466328"}` with `variant` as a string

#### Scenario: An unrouted path is distinguishable only by body, not by status

- **GIVEN** the service is running
- **WHEN** a client sends `GET /api/healthz-smoke-bugfix-769466328` and compares the result against
  a path under `/api/` that has no handler file
- **THEN** both responses carry HTTP 200, the unrouted path answers `text/html` with the SPA shell,
  and the probe answers `application/json` with its fixed body

#### Scenario: Repeat calls return byte-identical JSON

- **GIVEN** the service is running
- **WHEN** a client sends two successive requests to `/api/healthz-smoke-bugfix-769466328` that
  differ in query string, headers and request body
- **THEN** both responses carry the same bytes

#### Scenario: Probe module depends on nothing but the H3 handler factory

- **GIVEN** the file `routes/api/healthz-smoke-bugfix-769466328.ts`
- **WHEN** its imports and handler body are inspected
- **THEN** its only import is `defineHandler` from `nitro/h3`, it reads no property of the event,
  and it references no sibling probe and no module under `db/`

#### Scenario: Colocated test asserts the handler's returned object

- **GIVEN** the file `routes/api/healthz-smoke-bugfix-769466328.test.ts`
- **WHEN** the unit test tier runs
- **THEN** it constructs an `H3Event` for the probe path, invokes the module's default export,
  asserts the result equals `{ ok: true, variant: "769466328" }`, and contains no wall-clock timing
  assertion

#### Scenario: Route compiles into the production server

- **GIVEN** a production build of the server
- **WHEN** its route output is inspected
- **THEN** it contains a compiled route module serving `/api/healthz-smoke-bugfix-769466328` and
  contains no `.test.ts` file

### Requirement: Health probe for bugfix variant 101945976

The system SHALL serve `GET /api/healthz-smoke-bugfix2-101945976` with HTTP 200, a JSON content
type, and a response body deep-equal to `{"ok": true, "variant": "101945976"}`. The response MUST
NOT depend on the request's query string, headers, body, authenticated user or any stored data, and
the handler MUST NOT import any sibling probe or any database module.

#### Scenario: Probe answers the fixed body

- **GIVEN** the service is running
- **WHEN** a client sends `GET /api/healthz-smoke-bugfix2-101945976`
- **THEN** the response `Content-Type` is `application/json` and its body is deep-equal to
  `{"ok": true, "variant": "101945976"}` with `variant` as a string

#### Scenario: An unrouted path is distinguishable only by body, not by status

- **GIVEN** the service is running
- **WHEN** a client sends `GET /api/healthz-smoke-bugfix2-101945976` and compares the result against
  a path under `/api/` that has no handler file
- **THEN** both responses carry HTTP 200, the unrouted path answers `text/html` with the SPA shell,
  and the probe answers `application/json` with its fixed body

#### Scenario: Repeat calls return byte-identical JSON

- **GIVEN** the service is running
- **WHEN** a client sends two successive requests to `/api/healthz-smoke-bugfix2-101945976` that
  differ in query string, headers and request body
- **THEN** both responses carry the same bytes

#### Scenario: Probe module depends on nothing but the H3 handler factory

- **GIVEN** the file `routes/api/healthz-smoke-bugfix2-101945976.ts`
- **WHEN** its imports and handler body are inspected
- **THEN** its only import is `defineHandler` from `nitro/h3`, it reads no property of the event,
  and it references no sibling probe and no module under `db/`

#### Scenario: Colocated test asserts the handler's returned object

- **GIVEN** the file `routes/api/healthz-smoke-bugfix2-101945976.test.ts`
- **WHEN** the unit test tier runs
- **THEN** it constructs an `H3Event` for the probe path, invokes the module's default export,
  asserts the result equals `{ ok: true, variant: "101945976" }`, and contains no wall-clock timing
  assertion

#### Scenario: Route compiles into the production server

- **GIVEN** a production build of the server
- **WHEN** its route output is inspected
- **THEN** it contains a compiled route module serving `/api/healthz-smoke-bugfix2-101945976` and
  contains no `.test.ts` file

### Requirement: Health probe for bugfix variant 238143877

The system SHALL serve `GET /api/healthz-smoke-bugfix3-238143877` with HTTP 200, a JSON content
type, and a response body deep-equal to `{"ok": true, "variant": "238143877"}`. The response MUST
NOT depend on the request's query string, headers, body, authenticated user or any stored data, and
the handler MUST NOT import any sibling probe or any database module.

#### Scenario: Probe answers the fixed body

- **GIVEN** the service is running
- **WHEN** a client sends `GET /api/healthz-smoke-bugfix3-238143877`
- **THEN** the response `Content-Type` is `application/json` and its body is deep-equal to
  `{"ok": true, "variant": "238143877"}` with `variant` as a string

#### Scenario: An unrouted path is distinguishable only by body, not by status

- **GIVEN** the service is running
- **WHEN** a client sends `GET /api/healthz-smoke-bugfix3-238143877` and compares the result against
  a path under `/api/` that has no handler file
- **THEN** both responses carry HTTP 200, the unrouted path answers `text/html` with the SPA shell,
  and the probe answers `application/json` with its fixed body

#### Scenario: Repeat calls return byte-identical JSON

- **GIVEN** the service is running
- **WHEN** a client sends two successive requests to `/api/healthz-smoke-bugfix3-238143877` that
  differ in query string, headers and request body
- **THEN** both responses carry the same bytes

#### Scenario: Probe module depends on nothing but the H3 handler factory

- **GIVEN** the file `routes/api/healthz-smoke-bugfix3-238143877.ts`
- **WHEN** its imports and handler body are inspected
- **THEN** its only import is `defineHandler` from `nitro/h3`, it reads no property of the event,
  and it references no sibling probe and no module under `db/`

#### Scenario: Colocated test asserts the handler's returned object

- **GIVEN** the file `routes/api/healthz-smoke-bugfix3-238143877.test.ts`
- **WHEN** the unit test tier runs
- **THEN** it constructs an `H3Event` for the probe path, invokes the module's default export,
  asserts the result equals `{ ok: true, variant: "238143877" }`, and contains no wall-clock timing
  assertion

#### Scenario: Route compiles into the production server

- **GIVEN** a production build of the server
- **WHEN** its route output is inspected
- **THEN** it contains a compiled route module serving `/api/healthz-smoke-bugfix3-238143877` and
  contains no `.test.ts` file
