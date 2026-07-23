#!/usr/bin/env bash

# Navigate to repo root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(dirname "$SCRIPT_DIR")"

cd "$REPO_DIR"

echo "Running VR post-rebuild bridge injection and auto-commit..."
node "$SCRIPT_DIR/post_rebuild.js" "$@"
