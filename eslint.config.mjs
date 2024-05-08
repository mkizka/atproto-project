import { mkizka } from "@mkizka/eslint-config";

export default [
  {
    ignores: ["build/", "atproto/"],
  },
  ...mkizka(),
];
