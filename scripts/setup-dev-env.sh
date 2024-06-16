#!/usr/bin/env bash
set -euo pipefail

cd atproto
make deps
make build
