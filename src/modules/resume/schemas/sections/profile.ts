import { z } from "zod";
import { linkItemSchema } from "./shared";

export const profileDataSchema = z.object({
  fullName: z.string().max(80).default(""),
  headline: z.string().max(120).default(""),
  email: z.string().max(120).default(""),
  phone: z.string().max(40).default(""),
  location: z.string().max(80).default(""),
  avatarAssetId: z.string().uuid().nullable().default(null),
  website: z.string().max(500).default(""),
  links: z.array(linkItemSchema).default([]),
});

export type ProfileData = z.infer<typeof profileDataSchema>;
