import { z } from "zod";
import { normalizeEmail } from "./profile";

export const credentialsSchema = z.object({
  email: z.email("请输入有效邮箱").transform(normalizeEmail),
  password: z.string().min(8, "密码至少 8 位"),
});

export const emailSchema = z.object({
  email: z.email("请输入有效邮箱").transform(normalizeEmail),
});

export const passwordSchema = z.object({
  password: z.string().min(8, "密码至少 8 位"),
});

export type CredentialsInput = z.input<typeof credentialsSchema>;
