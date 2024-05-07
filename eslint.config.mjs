import { mkizka } from "@mkizka/eslint-config";

export default [
  {
    ignores: ["atproto/", "packages/lexicon/generated/", "packages/frontend/vite.config.ts"],
  },
  ...mkizka(),
];
