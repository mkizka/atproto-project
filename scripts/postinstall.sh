#!/usr/bin/env bash
set -euo pipefail

# git submoduleを使うとRailwayで動作しないため、gigetを使ってatprotoを取得する
if [ ! -d atproto ]; then
  pnpm giget gh:bluesky-social/atproto atproto
fi
mkdir -p ./lexicons/com/atproto/repo
cp -r ./atproto/lexicons/com/atproto/repo ./lexicons/com/atproto/repo

LEXICONS=$(find ./lexicons -name '*.json' -type f)
echo y | pnpm lex gen-api ./app/generated/api $LEXICONS
echo y | pnpm lex gen-server ./app/generated/server $LEXICONS
