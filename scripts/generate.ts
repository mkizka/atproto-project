import { execSync } from "child_process";
import fs from "fs";
import { globSync } from "glob";

const $ = (command: string) => execSync(command, { stdio: "inherit" });

if (!fs.existsSync("./atproto/lexicons")) {
  $(`git submodule update --init`);
}

const lexicons = [
  ...globSync("./lexicons/**/*.json"),
  ...globSync("./atproto/lexicons/com/atproto/repo/*.json"),
].join(" ");

$(`yes | pnpm lex gen-api ./app/generated/api ${lexicons}`);
$(`yes | pnpm lex gen-server ./app/generated/server ${lexicons}`);
