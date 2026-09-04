# identity-user-auth Specification

## Purpose

`identity-user-auth` is the capability that proves a person is who they claim to be. It owns the
storage of password material and the operation that verifies it, and it keeps a durable record of
every verification attempt so that an operator can answer "did this account's login succeed, and
when" from stored data rather than from logs. It does not establish or carry a session — proving a
credential and representing a logged-in request are separate concerns.

## Requirements

### Requirement: Password login

The system SHALL expose `POST /api/auth/login`, accepting a JSON body of `{ "email": string,
"password": string }`. For each request carrying both fields, the system MUST persist exactly one
record of the attempt — the email supplied, the matched user's id where one was matched, the outcome,
and the time — before responding, and MUST then return that outcome to the caller.

When the email matches a user that has a stored credential and the supplied password verifies against
it, the system SHALL record the outcome `success` and respond with HTTP 200 and a JSON body of
`{ "ok": true, "outcome": "success", "user": { "id": number, "email": string, "name": string } }`.

When the email matches no user, matches a user with no stored credential, or matches a user whose
stored credential the supplied password does not verify against, the system SHALL record the outcome
`invalid_credentials` and respond with HTTP 401 and the status message `Invalid credentials`. These
three cases MUST be indistinguishable to the caller.

When the request body is absent, is not an object, or omits either field as a non-empty string, the
system SHALL respond with HTTP 400 and the status message `Invalid request`, and MUST NOT record an
attempt.

No response from this endpoint may contain stored password material.

#### Scenario: Valid credentials return the outcome

- **GIVEN** a user exists with the email `john@example.com` and a stored credential for the password
  it was seeded with

- **WHEN** a client sends `POST /api/auth/login` with that email and that password
- **THEN** the response is HTTP 200 with `Content-Type: application/json` and a body deep-equal to
  `{ "ok": true, "outcome": "success", "user": { "id": 1, "email": "john@example.com", "name": "John Doe" } }`

#### Scenario: A successful attempt is recorded

- **GIVEN** the attempt record store is empty
- **WHEN** a client completes a successful `POST /api/auth/login` for `john@example.com`
- **THEN** the store holds exactly one record, whose email is `john@example.com`, whose user id is
  that user's id, whose outcome is `success`, and whose creation time is populated

#### Scenario: A wrong password is rejected and recorded

- **GIVEN** a user exists with the email `john@example.com` and a stored credential
- **WHEN** a client sends `POST /api/auth/login` with that email and a password that is not the
  stored one

- **THEN** the call fails with status 401 and the message `Invalid credentials`, and exactly one
  record is stored carrying that email, that user's id, and the outcome `invalid_credentials`

#### Scenario: An unknown email is rejected identically and recorded without a user

- **GIVEN** no user exists with the email `nobody@example.com`
- **WHEN** a client sends `POST /api/auth/login` with that email and any password
- **THEN** the call fails with status 401 and the message `Invalid credentials` — the same status and
  message a wrong password produces — and exactly one record is stored carrying that email, no user
  id, and the outcome `invalid_credentials`

#### Scenario: A malformed request is rejected without being recorded

- **GIVEN** the attempt record store is empty
- **WHEN** a client sends `POST /api/auth/login` with no body, and again with a body that omits the
  password

- **THEN** both calls fail with status 400 and the message `Invalid request`, and the store is still
  empty

#### Scenario: The success response carries no password material

- **GIVEN** a successful login response
- **WHEN** its body is inspected
- **THEN** it contains no `password`, no `passwordHash` and no value beginning `$argon2`, and its
  `user` object has exactly the keys `id`, `email` and `name`

#### Scenario: Only POST reaches the login handler

- **GIVEN** the service is running
- **WHEN** a client sends `GET /api/auth/login`
- **THEN** the response is the SPA shell — `Content-Type: text/html` — and not the login JSON body,
  which is how every unrouted method on an `/api/*` path behaves in this system

#### Scenario: The route is distinguishable from an unrouted path by body, not status

- **GIVEN** the service is running
- **WHEN** a client sends `POST /api/auth/login` with a well-formed body and, for comparison, `POST`
  to a path under `/api/` that has no handler file

- **THEN** the login path answers `application/json`, the unrouted path answers `200 text/html` with
  the SPA shell, and the two are not distinguishable by status code alone

### Requirement: Credential storage

The system SHALL store password material in a table separate from `users`, keyed by user id, holding
a hash and never the plaintext. The hash MUST be produced by argon2id. No handler that returns user
records may include the stored hash in its response, and the schema change MUST arrive as a migration
file committed to the repository so that a database created from an empty directory carries the table.

#### Scenario: A stored credential is an argon2id hash, not the password

- **GIVEN** a seeded credential for `john@example.com`
- **WHEN** the stored credential row is read directly
- **THEN** its hash begins with `$argon2id$`, is not equal to the plaintext password, and verifying
  the plaintext against it succeeds while verifying any other string against it fails

#### Scenario: The existing user listing is unchanged

- **GIVEN** the credential table exists and is populated
- **WHEN** a client sends `GET /api/users`
- **THEN** the response is deep-equal to
  `{ "users": [ { "id": 1, "name": "John Doe", "email": "john@example.com" }, { "id": 2, "name": "Jane Smith", "email": "jane@example.com" } ] }`,
  carrying no hash field

#### Scenario: The schema change is applied by a committed migration

- **GIVEN** a checkout with no database file present
- **WHEN** the application starts and runs its pending migrations
- **THEN** the credential table and the attempt record table both exist, and the migration that
  creates them is a file tracked in the repository under `drizzle/`
