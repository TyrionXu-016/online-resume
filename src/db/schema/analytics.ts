import {
  bigint,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { resumes } from "./resumes";
import { users } from "./users";

export const resumeVisits = pgTable("resume_visits", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  resumeId: uuid("resume_id")
    .notNull()
    .references(() => resumes.id),
  visitorHash: varchar("visitor_hash", { length: 64 }).notNull(),
  sessionHash: varchar("session_hash", { length: 64 }).notNull(),
  referrer: text("referrer"),
  utmSource: varchar("utm_source", { length: 120 }),
  utmMedium: varchar("utm_medium", { length: 120 }),
  deviceType: varchar("device_type", { length: 20 }),
  durationMs: integer("duration_ms"),
  visitedAt: timestamp("visited_at", { withTimezone: true }).notNull().defaultNow(),
});

export const customDomains = pgTable("custom_domains", {
  id: uuid("id").defaultRandom().primaryKey(),
  resumeId: uuid("resume_id")
    .notNull()
    .references(() => resumes.id),
  hostname: varchar("hostname", { length: 255 }).notNull().unique(),
  status: varchar("status", { length: 20 }).notNull().default("PENDING"),
  verificationTokenHash: varchar("verification_token_hash", { length: 128 }),
  verifiedAt: timestamp("verified_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const auditLogs = pgTable("audit_logs", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  userId: uuid("user_id").references(() => users.id),
  resumeId: uuid("resume_id"),
  action: varchar("action", { length: 60 }).notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
