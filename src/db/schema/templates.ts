import { boolean, integer, jsonb, pgTable, uuid, varchar } from "drizzle-orm/pg-core";

export const templates = pgTable("templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: varchar("slug", { length: 80 }).notNull().unique(),
  name: varchar("name", { length: 120 }).notNull(),
  category: varchar("category", { length: 40 }).notNull().default("general"),
  version: integer("version").notNull().default(1),
  config: jsonb("config").notNull(),
  isActive: boolean("is_active").notNull().default(true),
});
