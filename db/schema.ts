import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
});

export const userCredentials = sqliteTable("user_credentials", {
  userId: integer("user_id")
    .primaryKey()
    .references(() => users.id),
  passwordHash: text("password_hash").notNull(),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const loginAttempts = sqliteTable("login_attempts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull(),
  userId: integer("user_id"),
  outcome: text("outcome").notNull(),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});
