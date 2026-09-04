import { H3Event } from "nitro/h3";
import { beforeEach, describe, expect, it } from "vitest";

import { db } from "../../../db/client";
import { loginAttempts } from "../../../db/schema";
import login from "./login.post";

/**
 * INTEGRATION TEST
 *
 * Bare-H3Event pattern from routes/api/users/index.get.test.ts, POSTing a
 * JSON body. Thrown errors are asserted the way routes/api/users/[id].test.ts
 * asserts its 404: try / expect.fail / toMatchObject({ status, message }) —
 * the property is `status`, not `statusCode`.
 */
function postEvent(body?: unknown) {
  return new H3Event(
    new Request("http://localhost/api/auth/login", {
      method: "POST",
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  );
}

describe("POST /api/auth/login", () => {
  // The in-memory db is a module-level singleton shared by every test in
  // this file, so login_attempts must be cleared between tests for the
  // "starting from an empty attempt store" scenarios to hold.
  beforeEach(() => {
    db.delete(loginAttempts).run();
  });

  it("returns the outcome for valid credentials", async () => {
    const event = postEvent({ email: "john@example.com", password: "password123" });

    const result = await login(event);

    expect(result).toEqual({
      ok: true,
      outcome: "success",
      user: { id: 1, email: "john@example.com", name: "John Doe" },
    });
  });

  it("records exactly one successful attempt", async () => {
    expect(db.select().from(loginAttempts).all()).toEqual([]);

    const event = postEvent({ email: "john@example.com", password: "password123" });
    await login(event);

    const attempts = db.select().from(loginAttempts).all();
    expect(attempts).toHaveLength(1);
    expect(attempts[0]).toMatchObject({
      email: "john@example.com",
      userId: 1,
      outcome: "success",
    });
    expect(attempts[0].createdAt).toBeTruthy();
  });

  it("rejects a wrong password and records it", async () => {
    const event = postEvent({ email: "john@example.com", password: "not-the-password" });

    try {
      await login(event);
      expect.fail("expected login to throw");
    } catch (error) {
      expect(error).toMatchObject({ status: 401, message: "Invalid credentials" });
    }

    const attempts = db.select().from(loginAttempts).all();
    expect(attempts).toHaveLength(1);
    expect(attempts[0]).toMatchObject({
      email: "john@example.com",
      userId: 1,
      outcome: "invalid_credentials",
    });
  });

  it("rejects an unknown email identically and records it without a user", async () => {
    const event = postEvent({ email: "nobody@example.com", password: "whatever" });

    try {
      await login(event);
      expect.fail("expected login to throw");
    } catch (error) {
      expect(error).toMatchObject({ status: 401, message: "Invalid credentials" });
    }

    const attempts = db.select().from(loginAttempts).all();
    expect(attempts).toHaveLength(1);
    expect(attempts[0]).toMatchObject({
      email: "nobody@example.com",
      userId: null,
      outcome: "invalid_credentials",
    });
  });

  it("rejects a request with no body and records nothing", async () => {
    const event = postEvent(undefined);

    try {
      await login(event);
      expect.fail("expected login to throw");
    } catch (error) {
      expect(error).toMatchObject({ status: 400, message: "Invalid request" });
    }

    expect(db.select().from(loginAttempts).all()).toEqual([]);
  });

  it("rejects a request missing the password and records nothing", async () => {
    const event = postEvent({ email: "john@example.com" });

    try {
      await login(event);
      expect.fail("expected login to throw");
    } catch (error) {
      expect(error).toMatchObject({ status: 400, message: "Invalid request" });
    }

    expect(db.select().from(loginAttempts).all()).toEqual([]);
  });

  it("carries no password material in the success response", async () => {
    const event = postEvent({ email: "john@example.com", password: "password123" });

    const result = await login(event);
    const serialized = JSON.stringify(result);

    expect(serialized).not.toContain("password");
    expect(serialized).not.toContain("passwordHash");
    expect(serialized).not.toContain("$argon2");
    expect(Object.keys(result.user)).toEqual(["id", "email", "name"]);
  });
});
