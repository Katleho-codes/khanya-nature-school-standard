import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  API_PORT: z.coerce.number().int().positive().default(4002),
  WEB_ORIGIN: z.url().default("http://localhost:3002"),
  API_URL: z.url().default("http://localhost:4002"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  BETTER_AUTH_SECRET: z
    .string()
    .min(32, "BETTER_AUTH_SECRET must be at least 32 characters"),
  BETTER_AUTH_URL: z.url().default("http://localhost:4002"),
  SESSION_COOKIE_SECURE: z.enum(["true", "false"]).default("false"),
  SEED_ADMIN_PASSWORD: z.string().min(8).default("KhanyaAdmin2027!"),
  SEED_EDITOR_PASSWORD: z.string().min(8).default("KhanyaEditor2027!"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
  throw new Error(`Invalid environment configuration:\n${issues}`);
}

export const env = {
  ...parsed.data,
  isProduction: parsed.data.NODE_ENV === "production",
  sessionCookieSecure: parsed.data.SESSION_COOKIE_SECURE === "true",
};
