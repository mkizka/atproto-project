import { mkizka } from "@mkizka/eslint-config";
import tailwindcss from "eslint-plugin-tailwindcss";

export default [
  {
    ignores: ["build/", "atproto/", "app/generated/"],
  },
  {
    plugins: { tailwindcss },
    rules: {
      ...tailwindcss.configs.recommended.rules,
      "tailwindcss/classnames-order": "error",
      "tailwindcss/no-custom-classname": [
        "error",
        {
          callees: ["cn", "cva"],
        },
      ],
      "tailwindcss/migration-from-tailwind-2": "error",
    },
  },
  ...mkizka(),
];
