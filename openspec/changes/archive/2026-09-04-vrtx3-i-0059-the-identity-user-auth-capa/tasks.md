# Tasks

## 1. Credential storage

- [x] 1.1 Add a `user_credentials` table to `db/schema.ts`, keyed by user id with a foreign key to `users.id`, holding the password hash and an updated-at column (VRTX3-T-0332)
- [x] 1.2 Add a `login_attempts` table to `db/schema.ts` holding the attempted email, a nullable user id, the outcome and a creation time (VRTX3-T-0332)
- [x] 1.3 Generate the Drizzle migration for both tables and commit the resulting file under `drizzle/`, so a checkout with no database file gets the schema on first start (VRTX3-T-0332)
- [x] 1.4 Seed an argon2id credential for the existing `john@example.com` demo user inside `db/client.ts`'s existing seed block, keeping the block synchronous (VRTX3-T-0332)
- [x] 1.5 Confirm `GET /api/users` still answers the unchanged two-row body with no hash field, and that `routes/api/users/index.get.test.ts` needed no edit (VRTX3-T-0332)

## 2. Password login

- [x] 2.1 Add `routes/api/auth/login.post.ts` reading the JSON body, rejecting a malformed request with a 400 `Invalid request` before any record is written (VRTX3-T-0332)
- [x] 2.2 Look the user up by email, verify the supplied password against the stored hash with the async `Bun.password.verify`, and treat unknown email, missing credential and wrong password as one indistinguishable outcome (VRTX3-T-0332)
- [x] 2.3 Insert exactly one `login_attempts` row for every evaluated attempt, before responding and before throwing on the rejection path (VRTX3-T-0332)
- [x] 2.4 Return HTTP 200 with `{ ok, outcome, user: { id, email, name } }` on success and throw a 401 `Invalid credentials` otherwise, with no password material in either response (VRTX3-T-0332)
- [x] 2.5 Add `routes/api/auth/login.post.test.ts` covering success, wrong password, unknown email, both malformed-body shapes, the recorded rows and the absence of password material — using the bare-`H3Event` pattern and asserting thrown errors as `{ status, message }` (VRTX3-T-0332)
- [x] 2.6 Against a running dev server, confirm `POST /api/auth/login` answers `application/json` while a `GET` to the same path and a `POST` to an unrouted `/api/` path both answer `200 text/html`, asserting on body and content type rather than status code (VRTX3-T-0332)
