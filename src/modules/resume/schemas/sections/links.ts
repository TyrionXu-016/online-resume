import { z } from "zod";

export const linksItemSchema = z.object({
  id: z.string().uuid(),
  label: z.string().max(80).default(""),
  url: z.string().max(500).default(""),
});

export const linksDataSchema = z.object({
  items: z.array(linksItemSchema).default([]),
});

export type LinksItem = z.infer<typeof linksItemSchema>;
export type LinksData = z.infer<typeof linksDataSchema>;
