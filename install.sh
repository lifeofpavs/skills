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

mkdir -p ~/.agents/skills ~/.claude ~/.codex

# Global instructions: Codex reads ~/.codex/AGENTS.md, Claude reads ~/.claude/CLAUDE.md
ln -sfn "$REPO/AGENTS.md" ~/.agents/AGENTS.md
ln -sfn ../.agents/AGENTS.md ~/.codex/AGENTS.md
ln -sfn "$REPO/CLAUDE.md" ~/.claude/CLAUDE.md

# Third-party skills install into ~/.agents/skills, which Codex reads directly
if command -v npx >/dev/null; then
  grep -v '^#' "$REPO/third-party-skills.txt" | while read -r source skills; do
    # shellcheck disable=SC2086 # $skills is a space-separated list
    npx -y skills add "$source" -g -y -a codex -s $skills </dev/null ||
      echo "Could not install skills from $source"
  done
else
  echo "npx not found: install Node, then re-run to add third-party skills."
fi

# Personal skills (memory-sync is a Claude command, not a skill)
personal=$(cd "$REPO" && ls -d */ | tr -d / | grep -vx memory-sync)
for s in $personal; do
  rm -rf ~/.agents/skills/"$s"
  ln -s "$REPO/$s" ~/.agents/skills/"$s"
done

# Every Claude profile (~/.claude plus any ~/.claude_<name>) gets the same skills
third_party=$(grep -v '^#' "$REPO/third-party-skills.txt" | cut -d' ' -f2-)
for profile in ~/.claude ~/.claude_*/; do
  [ -d "$profile" ] || continue
  profile=${profile%/}
  mkdir -p "$profile/skills" "$profile/commands"
  for s in $personal $third_party; do
    [ -e ~/.agents/skills/"$s" ] || continue
    rm -rf "${profile:?}/skills/$s"
    ln -s ~/.agents/skills/"$s" "$profile/skills/$s"
  done
  ln -sfn "$REPO/memory-sync/SKILL.md" "$profile/commands/memory-sync.md"
done

echo "Done. Run 'claude' and 'codex' once to log in."
