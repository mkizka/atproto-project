import { execSync } from "child_process";
import { globSync } from "glob";

const lexicons = [
  ...globSync("./lexicons/**/*.json"),
  ...globSync("./atproto/lexicons/**/*.json"),
].join(" ");

const $ = (command: string) => execSync(command, { stdio: "inherit" });

$(`yes | pnpm lex gen-api ./app/generated/api ${lexicons}`);
$(`yes | pnpm lex gen-server ./app/generated/server ${lexicons}`);
