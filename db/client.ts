import path from "node:path";

import { Database } from "bun:sqlite";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";

import { loginAttempts, userCredentials, users } from "./schema";

// Vitest sets VITEST=true in every worker; an in-memory db keeps route
// integration tests isolated from the file-backed dev/prod db and from
// each other (each test module gets its own fresh Database instance).
// Paths are cwd-relative rather than import.meta.url-relative because Vite
// (dev server, Nitro build, Vitest) transforms this module, so its
// import.meta.url isn't a real file:// URL — cwd is always the project root
// across dev/build/test.
const sqlite = new Database(
  process.env.VITEST ? ":memory:" : path.join(process.cwd(), "sqlite.db"),
);

export const db = drizzle(sqlite, { schema: { users, userCredentials, loginAttempts } });

migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") });

// Seed the same two users the mock API used to hardcode, so the demo data
// (and the existing route tests) keep working out of the box.
if (db.select().from(users).all().length === 0) {
  db.insert(users)
    .values([
      { name: "John Doe", email: "john@example.com" },
      { name: "Jane Smith", email: "jane@example.com" },
    ])
    .run();

  // Seed a credential for the demo user so the login endpoint is
  // exercisable against a running server without a registration endpoint
  // (out of scope). This password is a public demo fixture, not a secret.
  const john = db.select().from(users).where(eq(users.email, "john@example.com")).get();
  if (john) {
    db.insert(userCredentials)
      .values({
        userId: john.id,
        passwordHash: Bun.password.hashSync("password123"),
      })
      .run();
  }
}
