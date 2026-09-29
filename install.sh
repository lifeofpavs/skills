#!/usr/bin/env bash
# Sets up a new machine: installs Claude Code and Codex, clones this repo,
# and links its instructions and skills into both tools. Safe to re-run.
set -euo pipefail

REPO=~/workspace/pavs/skills
REPO_URL=https://github.com/lifeofpavs/skills.git

if ! command -v claude >/dev/null; then
  curl -fsSL https://claude.ai/install.sh | bash
fi

if ! command -v codex >/dev/null; then
  if command -v brew >/dev/null; then
    brew install --cask codex
  else
    npm install -g @openai/codex
  fi
fi

if [ ! -d "$REPO" ]; then
  git clone "$REPO_URL" "$REPO"
fi

mkdir -p ~/.agents/skills ~/.claude/skills ~/.claude/commands ~/.codex

# Global instructions: Codex reads ~/.codex/AGENTS.md, Claude reads ~/.claude/CLAUDE.md
ln -sfn "$REPO/AGENTS.md" ~/.agents/AGENTS.md
ln -sfn ../.agents/AGENTS.md ~/.codex/AGENTS.md
ln -sfn "$REPO/CLAUDE.md" ~/.claude/CLAUDE.md

# Skills: Codex reads ~/.agents/skills directly, Claude reads ~/.claude/skills
for dir in "$REPO"/*/; do
  s=$(basename "$dir")
  [ "$s" = memory-sync ] && continue
  rm -rf ~/.agents/skills/"$s" ~/.claude/skills/"$s"
  ln -s "$REPO/$s" ~/.agents/skills/"$s"
  ln -s ../../.agents/skills/"$s" ~/.claude/skills/"$s"
done

# memory-sync is a Claude command, not a skill
ln -sfn "$REPO/memory-sync/SKILL.md" ~/.claude/commands/memory-sync.md

echo "Done. Run 'claude' and 'codex' once to log in."
