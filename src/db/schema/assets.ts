import {
  bigint,
  integer,
  pgTable,
  timestamp,
  uuid,
  varchar,
  text,
} from "drizzle-orm/pg-core";
import { resumes } from "./resumes";
import { users } from "./users";

export const assets = pgTable("assets", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  resumeId: uuid("resume_id").references(() => resumes.id),
  kind: varchar("kind", { length: 30 }).notNull(),
  objectKey: text("object_key").notNull().unique(),
  originalFilename: varchar("original_filename", { length: 255 }),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  sizeBytes: bigint("size_bytes", { mode: "number" }).notNull(),
  width: integer("width"),
  height: integer("height"),
  status: varchar("status", { length: 20 }).notNull().default("PENDING"),
  visibility: varchar("visibility", { length: 20 }).notNull().default("private"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});
