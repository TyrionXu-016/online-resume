import { z } from "zod";
import { monthDateSchema } from "./shared";

export const certificateItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string().max(120).default(""),
  issuer: z.string().max(120).default(""),
  date: monthDateSchema,
  url: z.string().max(500).default(""),
});

export const certificateDataSchema = z.object({
  items: z.array(certificateItemSchema).default([]),
});

export type CertificateItem = z.infer<typeof certificateItemSchema>;
export type CertificateData = z.infer<typeof certificateDataSchema>;
