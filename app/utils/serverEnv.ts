import { z } from "zod";
import { fromZodError } from "zod-validation-error";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default(process.env.NODE_ENV),
  DATABASE_URL: z.string(),
});

export type EnvScheme = z.infer<typeof envSchema>;

export const serverEnv = (() => {
  if (!process.env.VITE_SKIP_ENV_VALIDATION) {
    const parsed = envSchema.safeParse(process.env);
    if (!parsed.success) {
      throw new Error(
        `❌ Invalid environment variables: ${fromZodError(parsed.error).toString()}`,
      );
    }
    return parsed.data;
  }
  return process.env as unknown as EnvScheme;
})();
