#!/usr/bin/env bash
# Run on the Linux server from repo root, e.g.:
#   bash scripts/update-from-git.sh
# Requires a clean working tree (no local edits / untracked files that block pull).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "ERROR: You have staged or unstaged changes. Commit or stash them, then pull."
  git status --short
  exit 1
fi

UNTRACKED="$(git ls-files --others --exclude-standard)"
if [ -n "$UNTRACKED" ]; then
  echo "ERROR: Untracked files would conflict with incoming files from the remote:"
  echo "$UNTRACKED"
  echo "Move or remove them (or git add + commit), then pull."
  exit 1
fi

git pull
if command -v npm >/dev/null 2>&1; then
  if [ -f package-lock.json ]; then
    npm ci
  else
    npm install
  fi
  npm run build
fi

echo "OK: git pull and build finished. dist/ is a static build served directly by"
echo "nginx — no Node process to restart (dist/ is also committed to git, so this"
echo "local rebuild is just a safety check that the pulled dist/ matches sources)."
