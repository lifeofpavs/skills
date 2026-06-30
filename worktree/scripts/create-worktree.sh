#!/usr/bin/env bash
#
# create-worktree.sh — create an isolated git worktree off the default branch
# and symlink the repo's root .env into it.
#
# Usage: create-worktree.sh [branch-name]
#   branch-name  optional. If omitted, an auto-generated name (wt-<timestamp>) is used.
#
# The worktree is created at ~/worktrees/<repo>/<branch>, branched off the
# freshly-fetched remote default branch. This branches off origin/<default>
# directly, so the caller's current checkout is never touched.

set -euo pipefail

# --- branch name -------------------------------------------------------------
BRANCH="${1:-}"
if [ -z "$BRANCH" ]; then
  BRANCH="wt-$(date +%Y%m%d-%H%M%S)"
  echo "No branch name given — auto-generating: $BRANCH"
fi
# Directory name mirrors the branch but with slashes flattened so nested refs
# (e.g. feature/foo) don't create surprise subdirectories.
DIRNAME="${BRANCH//\//-}"

# --- repo discovery ----------------------------------------------------------
if ! REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null)"; then
  echo "Error: not inside a git repository. Run this from within the repo you want to branch from." >&2
  exit 1
fi
REPO_NAME="$(basename "$REPO_ROOT")"

# --- default branch detection ------------------------------------------------
# Prefer the remote's advertised HEAD; fall back to main, then master. This
# keeps the skill working whether a repo uses "main" or "master".
HAS_ORIGIN=false
if git remote get-url origin >/dev/null 2>&1; then
  HAS_ORIGIN=true
fi

DEFAULT_BRANCH=""
if ref="$(git symbolic-ref --quiet --short refs/remotes/origin/HEAD 2>/dev/null)"; then
  DEFAULT_BRANCH="${ref#origin/}"
elif git show-ref --verify --quiet refs/remotes/origin/main; then
  DEFAULT_BRANCH="main"
elif git show-ref --verify --quiet refs/remotes/origin/master; then
  DEFAULT_BRANCH="master"
elif git show-ref --verify --quiet refs/heads/main; then
  DEFAULT_BRANCH="main"
elif git show-ref --verify --quiet refs/heads/master; then
  DEFAULT_BRANCH="master"
else
  echo "Error: could not determine a default branch (no origin/HEAD, main, or master found)." >&2
  exit 1
fi

# --- fetch + choose base -----------------------------------------------------
if [ "$HAS_ORIGIN" = true ]; then
  echo "Fetching origin/$DEFAULT_BRANCH ..."
  git fetch origin "$DEFAULT_BRANCH"
  BASE="origin/$DEFAULT_BRANCH"
else
  echo "Warning: no 'origin' remote — branching off local '$DEFAULT_BRANCH', which may be stale."
  BASE="$DEFAULT_BRANCH"
fi

# --- target path -------------------------------------------------------------
WORKTREE_PARENT="$HOME/worktrees/$REPO_NAME"
WORKTREE_PATH="$WORKTREE_PARENT/$DIRNAME"
mkdir -p "$WORKTREE_PARENT"

# --- safety checks -----------------------------------------------------------
if git show-ref --verify --quiet "refs/heads/$BRANCH"; then
  echo "Error: branch '$BRANCH' already exists. Choose a different name." >&2
  exit 1
fi
if [ -e "$WORKTREE_PATH" ]; then
  echo "Error: target path already exists: $WORKTREE_PATH. Choose a different name." >&2
  exit 1
fi

# --- create worktree ---------------------------------------------------------
git worktree add "$WORKTREE_PATH" -b "$BRANCH" "$BASE"

# --- symlink root .env -------------------------------------------------------
ENV_STATUS="no root .env found — skipped"
if [ -f "$REPO_ROOT/.env" ]; then
  ln -s "$REPO_ROOT/.env" "$WORKTREE_PATH/.env"
  ENV_STATUS="symlinked $REPO_ROOT/.env -> $WORKTREE_PATH/.env"
fi

# --- report ------------------------------------------------------------------
echo ""
echo "Worktree ready:"
echo "  repo:      $REPO_NAME"
echo "  base:      $BASE"
echo "  branch:    $BRANCH"
echo "  path:      $WORKTREE_PATH"
echo "  .env:      $ENV_STATUS"
echo ""
echo "  cd $WORKTREE_PATH"
