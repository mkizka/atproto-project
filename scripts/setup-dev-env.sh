#!/usr/bin/env bash
set -euo pipefail

# git submoduleを使うとRailwayで動作しないため、gigetを使ってatprotoを取得する
if [ ! -d atproto ]; then
  pnpm giget gh:bluesky-social/atproto atproto
fi
cd atproto
make deps
make build
