#!/usr/bin/env bash
set -euo pipefail

# Usage: ./ai/worktree-setup.sh <root-repo-path>
# Run from inside the worktree directory.
# Copies env files from root repo, installs deps, builds.

ROOT_PATH="${1:?Usage: worktree-setup.sh <root-repo-path>}"

# Copy env files from root repo to worktree
echo "Copying env files..."
cp "$ROOT_PATH/.env.local" .env.local

# Install dependencies
echo "Installing dependencies..."
pnpm install

echo "Worktree setup complete."
