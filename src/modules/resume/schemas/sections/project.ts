import { z } from "zod";
import { monthDateSchema } from "./shared";

export const projectItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string().max(120).default(""),
  role: z.string().max(120).default(""),
  url: z.string().max(500).default(""),
  startDate: monthDateSchema,
  endDate: monthDateSchema,
  description: z.string().max(2000).default(""),
  highlights: z.array(z.string().max(500)).default([]),
  assetIds: z.array(z.string().uuid()).default([]),
});

export const projectDataSchema = z.object({
  items: z.array(projectItemSchema).default([]),
});

export type ProjectItem = z.infer<typeof projectItemSchema>;
export type ProjectData = z.infer<typeof projectDataSchema>;
