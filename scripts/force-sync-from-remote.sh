#!/usr/bin/env bash
# DESTRUCTIVE: throws away ALL local commits, staged/unstaged edits, and untracked files.
# Working copy becomes identical to the remote branch. Use only when the server must match GitHub.
#
# Usage (from repo root on Linux):
#   FORCE_SYNC_FROM_REMOTE=1 bash scripts/force-sync-from-remote.sh
# Optional: pass remote branch name (default: current branch's upstream or main)
set -euo pipefail

if [ "${FORCE_SYNC_FROM_REMOTE:-}" != "1" ]; then
  echo "Refusing: this deletes local work. To continue, run:"
  echo "  FORCE_SYNC_FROM_REMOTE=1 bash scripts/force-sync-from-remote.sh [branch]"
  exit 1
fi

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

REMOTE_DEFAULT="$(git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@' || true)"
BRANCH="${1:-}"
if [ -z "$BRANCH" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || true)"
fi
if [ -z "$BRANCH" ] || [ "$BRANCH" = "HEAD" ]; then
  BRANCH="${REMOTE_DEFAULT:-main}"
fi

echo "Fetching origin, then reset --hard to origin/$BRANCH and git clean -fd ..."
git fetch origin
git reset --hard "origin/$BRANCH"
git clean -fd

if [ -f package-lock.json ]; then
  npm ci
else
  npm install
fi
npm run build

echo "OK: tree matches origin/$BRANCH. dist/ is served directly by nginx — no process manager to restart."
