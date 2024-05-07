import { execSync } from "child_process";
// @ts-ignore
import { globbySync } from "globby";

const serviceLexicons = globbySync("./lexicons/**/*.json");
const atprotoLexicons = globbySync("../../atproto/lexicons/com/atproto/**/*.json");
const lexicons = [...serviceLexicons, ...atprotoLexicons].join(" ");

execSync(`yes | pnpm lex gen-api ./generated/api ${lexicons}`, {
  stdio: "inherit",
});
execSync(`yes | pnpm lex gen-server ./generated/server ${lexicons}`, {
  stdio: "inherit",
});
