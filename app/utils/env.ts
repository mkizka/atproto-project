import { z } from "zod";
import { fromZodError } from "zod-validation-error";

const envSchema = z.object({
  VITE_BSKY_USERNAME: z.string(),
  VITE_BSKY_PASSWORD: z.string(),
  VITE_BSKY_URL: z.string().url(),
});

export type EnvScheme = z.infer<typeof envSchema>;

export const env = (() => {
  if (!import.meta.env.VITE_SKIP_ENV_VALIDATION) {
    const parsed = envSchema.safeParse(import.meta.env);
    if (!parsed.success) {
      throw new Error(
        `❌ Invalid environment variables: ${fromZodError(parsed.error).toString()}`,
      );
    }
    return parsed.data;
  }
  return process.env as unknown as EnvScheme;
})();
