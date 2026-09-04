import { eq } from "drizzle-orm";
import { createError, defineHandler, readBody } from "nitro/h3";

import { db } from "../../../db/client";
import { loginAttempts, userCredentials, users } from "../../../db/schema";

function isValidBody(body: unknown): body is { email: string; password: string } {
  if (typeof body !== "object" || body === null) return false;
  const { email, password } = body as Record<string, unknown>;
  return (
    typeof email === "string" && email !== "" && typeof password === "string" && password !== ""
  );
}

export default defineHandler(async (event) => {
  const body = await readBody(event).catch(() => undefined);

  if (!isValidBody(body)) {
    throw createError({ statusCode: 400, statusMessage: "Invalid request" });
  }

  const { email, password } = body;

  const user = db.select().from(users).where(eq(users.email, email)).get();
  const credential = user
    ? db.select().from(userCredentials).where(eq(userCredentials.userId, user.id)).get()
    : undefined;

  const verified = credential
    ? await Bun.password.verify(password, credential.passwordHash)
    : false;

  if (verified && user) {
    db.insert(loginAttempts).values({ email, userId: user.id, outcome: "success" }).run();

    return {
      ok: true as const,
      outcome: "success" as const,
      user: { id: user.id, email: user.email, name: user.name },
    };
  }

  db.insert(loginAttempts)
    .values({ email, userId: user?.id ?? null, outcome: "invalid_credentials" })
    .run();

  throw createError({ statusCode: 401, statusMessage: "Invalid credentials" });
});
