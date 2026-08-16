import {
  boolean,
  integer,
  jsonb,
  pgTable,
  smallint,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { templates } from "./templates";

export const resumes = pgTable("resumes", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  title: varchar("title", { length: 160 }).notNull(),
  slug: varchar("slug", { length: 80 }).notNull().unique(),
  status: varchar("status", { length: 20 }).notNull().default("DRAFT"),
  visibility: varchar("visibility", { length: 20 }).notNull().default("public"),
  templateId: uuid("template_id").references(() => templates.id),
  contentVersion: integer("content_version").notNull().default(1),
  publishedVersionId: uuid("published_version_id"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const resumeSections = pgTable("resume_sections", {
  id: uuid("id").defaultRandom().primaryKey(),
  resumeId: uuid("resume_id")
    .notNull()
    .references(() => resumes.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 40 }).notNull(),
  schemaVersion: smallint("schema_version").notNull().default(1),
  sortOrder: integer("sort_order").notNull(),
  isVisible: boolean("is_visible").notNull().default(true),
  data: jsonb("data").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const resumeVersions = pgTable(
  "resume_versions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    resumeId: uuid("resume_id")
      .notNull()
      .references(() => resumes.id, { onDelete: "cascade" }),
    versionNo: integer("version_no").notNull(),
    snapshot: jsonb("snapshot").notNull(),
    templateId: uuid("template_id").references(() => templates.id),
    templateVersion: integer("template_version").notNull(),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique("resume_versions_resume_id_version_no").on(table.resumeId, table.versionNo)],
);
