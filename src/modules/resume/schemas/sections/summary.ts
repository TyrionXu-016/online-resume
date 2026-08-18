import { z } from "zod";

export const summaryDataSchema = z.object({
  content: z.string().max(300).default(""),
});

export type SummaryData = z.infer<typeof summaryDataSchema>;
