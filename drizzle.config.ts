import { defineConfig } from "drizzle-kit";

try {
  process.loadEnvFile(".env.local");
} catch {
  // .env.local is optional in CI.
}

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "",
  },
});
