# skills

My personal agent skills and global agent instructions, shared by Claude Code and Codex. This repo is the only copy; every tool loads from it through symlinks.

## Skills

| Skill | What it does |
|---|---|
| `checkpoint` | Saves session progress, decisions and highlights to a timestamped file |
| `collaborative-planning` | Builds a plan by asking questions and agreeing on an outline first |
| `deep-research` | Researches a topic into my LLM wiki, or queries and lints it |
| `memory-sync` | Syncs a project's context, decisions and changes into Claude memory (Claude only) |
| `posthog-llm-sql-analytics` | Pulls PostHog LLM traces and sessions with HogQL |
| `pr-review-team` | Parallel multi-perspective PR review, consolidated into one review |
| `project-orchestration` | Plans and coordinates multi-agent projects with file-based handoffs |
| `prompt-engineering` | Prompt-writing practices for Claude, GPT, Gemini and Grok |
| `publish-artifact` | Uploads agent-made files and returns a shareable link |
| `socratic` | Socratic tutor that checks you understand what the agent built |
| `worktree` | Creates an isolated git worktree off a freshly fetched default branch |
| `writing-great-prompts` | Clarity, weighting and no-op removal in prompt instructions |

## Global instructions

`AGENTS.md` holds my global instructions. `CLAUDE.md` is a symlink to it.

## Setup on a new machine

```sh
curl -fsSL https://raw.githubusercontent.com/lifeofpavs/skills/master/install.sh | bash
```

`install.sh` installs Claude Code and Codex if missing, clones this repo to `~/workspace/pavs/skills`, and links `AGENTS.md`, `CLAUDE.md` and every skill into both tools. It is safe to re-run after adding a skill.

## Adding a skill

1. Create `<name>/SKILL.md` here. Never create a personal skill anywhere else, including `~/.codex/skills`.
2. Run `./install.sh` to link it, or symlink it by hand: `~/.agents/skills/<name>` → this folder and `~/.claude/skills/<name>` → `../../.agents/skills/<name>`.
3. Commit and push.

This repo is public: third-party and company-internal skills stay out.
