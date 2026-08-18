import { z } from "zod";

export const linkItemSchema = z.object({
  label: z.string().max(80).default(""),
  url: z.string().max(500).default(""),
});

export const monthDateSchema = z
  .string()
  .max(7)
  .regex(/^\d{4}-\d{2}$|^$/, "日期格式应为 YYYY-MM")
  .default("");

export function createItemId() {
  return crypto.randomUUID();
}
