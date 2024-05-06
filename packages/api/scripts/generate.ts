import { execSync } from "child_process";
import { globbySync } from "globby";

const serviceLexicons = globbySync("./lexicons/**/*.json");
const atprotoLexicons = globbySync("../../atproto/lexicons/com/atproto/**/*.json");
const lexicons = [...serviceLexicons, ...atprotoLexicons].join(" ");

execSync(`yes | pnpm lex gen-api src/api ${lexicons}`, {
  stdio: "inherit",
});
execSync(`yes | pnpm lex gen-server src/server ${lexicons}`, {
  stdio: "inherit",
});
