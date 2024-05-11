import * as v from "valibot";

const envSchema = v.object({
  NODE_ENV: v.picklist(["development", "production", "test"]),
  BSKY_USERNAME: v.string(),
  BSKY_PASSWORD: v.string(),
  BSKY_URL: v.string([v.url()]),
});

export type EnvOutput = v.Output<typeof envSchema>;

const formatValibotErrorMessage = (issues: v.SchemaIssues) => {
  return issues
    .map((issue) => {
      return `${issue.path?.join(".") ?? "unknown"} ${issue.message}`;
    })
    .join(", ");
};

export const serverEnv = (() => {
  if (!process.env.SKIP_ENV_VALIDATION) {
    const parsed = v.safeParse(envSchema, process.env);
    if (!parsed.success) {
      throw new Error(
        `❌ Invalid environment variables: ${formatValibotErrorMessage(parsed.issues)}`,
      );
    }
    return parsed.output;
  }
  return process.env as unknown as EnvOutput;
})();
