import { z } from "zod";

export const skillItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string().max(80).default(""),
  level: z.string().max(40).optional(),
  category: z.string().max(40).optional(),
});

export const skillDataSchema = z.object({
  items: z.array(skillItemSchema).default([]),
});

export type SkillItem = z.infer<typeof skillItemSchema>;
export type SkillData = z.infer<typeof skillDataSchema>;
