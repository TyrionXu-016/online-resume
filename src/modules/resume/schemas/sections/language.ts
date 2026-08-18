import { z } from "zod";

export const languageItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string().max(80).default(""),
  proficiency: z.string().max(40).default(""),
});

export const languageDataSchema = z.object({
  items: z.array(languageItemSchema).default([]),
});

export type LanguageItem = z.infer<typeof languageItemSchema>;
export type LanguageData = z.infer<typeof languageDataSchema>;
