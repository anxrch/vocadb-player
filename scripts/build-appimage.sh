#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

export NO_STRIP=1

npm install
npm run tauri build -- --bundles appimage
