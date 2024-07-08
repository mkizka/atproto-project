#!/usr/bin/env bash
set -euo pipefail

docker compose up -d --wait > /dev/null 2>&1
pnpm prisma db push --skip-generate
