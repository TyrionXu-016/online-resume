import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;

const client = databaseUrl
  ? postgres(databaseUrl, { prepare: false, max: 1 })
  : null;

export const db = client ? drizzle(client, { schema }) : null;

export function requireDb() {
  if (!db) {
    throw new Error("DATABASE_URL 未配置");
  }

  return db;
}
