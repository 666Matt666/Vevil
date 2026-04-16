#!/bin/sh
# Husky Linux/macOS script
set -e

# Check GIT_DIR
if [ -z "$GIT_DIR" ]; then
  GIT_DIR="$(git rev-parse --git-dir 2>/dev/null || echo '.git')"
  export GIT_DIR
fi

# Husky root
HUSKY_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# Add node_modules/.bin to PATH
if [ -d "$HUSKY_ROOT/node_modules/.bin" ]; then
  PATH="$HUSKY_ROOT/node_modules/.bin:$PATH"
  export PATH
fi

# Run hook from _/hooks
HOOK_NAME="$(basename "$0")"
HOOK_PATH="$HUSKY_ROOT/_/hooks/$HOOK_NAME"

if [ -f "$HOOK_PATH" ]; then
  . "$HOOK_PATH"
else
  echo "⚠️  Husky hook $HOOK_NAME not found in $HOOK_PATH"
  exit 1
fi
