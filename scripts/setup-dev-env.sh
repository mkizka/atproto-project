#!/usr/bin/env bash
set -euo pipefail

if [ ! -d ./atproto/node_modules ]; then
  cd atproto
  make deps
  make build
  cd ..
fi
