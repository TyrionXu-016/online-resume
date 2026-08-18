import { z } from "zod";
import { monthDateSchema } from "./shared";

export const experienceItemSchema = z.object({
  id: z.string().uuid(),
  company: z.string().max(120).default(""),
  position: z.string().max(120).default(""),
  location: z.string().max(80).default(""),
  startDate: monthDateSchema,
  endDate: monthDateSchema.nullable().default(null),
  current: z.boolean().default(false),
  description: z.string().max(2000).default(""),
  highlights: z.array(z.string().max(500)).default([]),
});

export const experienceDataSchema = z.object({
  items: z.array(experienceItemSchema).default([]),
});

export type ExperienceItem = z.infer<typeof experienceItemSchema>;
export type ExperienceData = z.infer<typeof experienceDataSchema>;
