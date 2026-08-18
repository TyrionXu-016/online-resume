import { z } from "zod";
import { monthDateSchema } from "./shared";

export const educationItemSchema = z.object({
  id: z.string().uuid(),
  school: z.string().max(120).default(""),
  degree: z.string().max(80).default(""),
  field: z.string().max(80).default(""),
  location: z.string().max(80).default(""),
  startDate: monthDateSchema,
  endDate: monthDateSchema.nullable().default(null),
  current: z.boolean().default(false),
  description: z.string().max(2000).default(""),
});

export const educationDataSchema = z.object({
  items: z.array(educationItemSchema).default([]),
});

export type EducationItem = z.infer<typeof educationItemSchema>;
export type EducationData = z.infer<typeof educationDataSchema>;
