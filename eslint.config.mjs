import { configs } from "@mkizka/eslint-config";

export default [
  {
    ignores: ["build/", "atproto/", "app/generated/"],
  },
  ...configs.typescript(),
  ...configs.react(),
  ...configs.tailwind(),
];
