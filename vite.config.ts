/// <reference types="vitest" />
import { vitePlugin as remix } from "@remix-run/dev";
import { installGlobals } from "@remix-run/node";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

installGlobals();

export default defineConfig({
  plugins: [remix(), tsconfigPaths()],
  test: {
    include: ["app/**/*.spec.ts?(x)"],
    coverage: {
      include: ["app/**/*.ts?(x)"],
      exclude: ["app/generated"],
    },
    // vitest-environment-vprisma
    globals: true,
    environment: "vprisma",
    setupFiles: [
      "vitest-environment-vprisma/setup",
      "./vitest/vitest.setup.ts",
    ],
    globalSetup: ["./vitest/global-setup.ts"],
  },
});
