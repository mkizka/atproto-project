import { execSync } from "child_process";
import { downloadTemplate } from "giget";
import { globSync } from "glob";

const $ = (command: string) => execSync(command, { stdio: "inherit" });

await downloadTemplate(
  "github:bluesky-social/atproto/lexicons/com/atproto/repo",
  {
    dir: "./lexicons/com/atproto/repo",
    forceClean: true,
  },
);

const lexicons = globSync("./lexicons/**/*.json").join(" ");

$(`yes | pnpm lex gen-api ./app/generated/api ${lexicons}`);
$(`yes | pnpm lex gen-server ./app/generated/server ${lexicons}`);
