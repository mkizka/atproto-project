#!/usr/bin/env bash
set -euo pipefail

mkdir -p ./lexicons/com/atproto/repo
cp -r ./atproto/lexicons/com/atproto/repo ./lexicons/com/atproto/repo

LEXICONS=$(find ./lexicons -name '*.json' -type f)
echo y | pnpm lex gen-api ./app/generated/api $LEXICONS
echo y | pnpm lex gen-server ./app/generated/server $LEXICONS
