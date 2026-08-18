import { z } from "zod";

export const customItemSchema = z.object({
  id: z.string().uuid(),
  title: z.string().max(120).default(""),
  content: z.string().max(2000).default(""),
});

export const customDataSchema = z.object({
  items: z.array(customItemSchema).default([]),
});

export type CustomItem = z.infer<typeof customItemSchema>;
export type CustomData = z.infer<typeof customDataSchema>;
