import * as v from "valibot";

const envSchema = v.object({
  VITE_BSKY_USERNAME: v.string(),
  VITE_BSKY_PASSWORD: v.string(),
  VITE_BSKY_URL: v.string([v.url()]),
});

export type EnvOutput = v.Output<typeof envSchema>;

const formatValibotErrorMessage = (issues: v.SchemaIssues) => {
  return issues
    .map((issue) => {
      return `${issue.path?.join(".") ?? "unknown"} ${issue.message}`;
    })
    .join(", ");
};

export const env = (() => {
  if (!import.meta.env.VITE_SKIP_ENV_VALIDATION) {
    const parsed = v.safeParse(envSchema, import.meta.env);
    if (!parsed.success) {
      throw new Error(
        `❌ Invalid environment variables: ${formatValibotErrorMessage(parsed.issues)}`,
      );
    }
    return parsed.output;
  }
  return process.env as unknown as EnvOutput;
})();