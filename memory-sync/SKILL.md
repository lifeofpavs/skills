---
name: memory-sync
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(ls:*), Bash(pwd:*), Bash(git log:*), Bash(git diff:*), Bash(cat package.json:*), Bash(cat Cargo.toml:*), Bash(cat pyproject.toml:*), Bash(cat go.mod:*), Bash(date:*), Bash(wc:*)
description: Analyze current project and sync findings to Second Brain memory (context, decisions, changes)
---

## Context

- Current working directory: !`pwd`
- Today's date: !`date "+%Y-%m-%d"`
- Memory directory: ~/.claude/projects/-Users-pavs/memory/

## Your Task

Analyze the current project and populate its Second Brain memory files (`context.md`, `decisions.md`, `changes.md`). This skill is used to bootstrap memory for a project or refresh it with new findings.

**User args:** $ARGUMENTS
- If empty: do a full scan — populate all three files
- If `context`: only update `context.md`
- If `decisions`: only update `decisions.md`
- If `changes`: only update `changes.md`

## Step 1: Identify the Project

1. Get the current working directory
2. Read `~/.claude/projects/-Users-pavs/memory/MEMORY.md` to find the matching project in the index
3. If no match exists:
   - Derive a folder name from the directory (e.g. `my-app`)
   - Create `memory/<folder>/changes.md`, `memory/<folder>/decisions.md`, `memory/<folder>/context.md` with standard headers
   - Append the new project to the Project Index table in `MEMORY.md`
   - Tell the user a new project was registered

## Step 2: Read Existing Memory

Read the project's existing memory files to understand what's already recorded. Don't duplicate information that's already there.

## Step 3: Analyze the Project

Investigate the project codebase to discover:

### For `context.md` — Tech Stack, Conventions, Gotchas
- **Tech stack**: Check `package.json`, `Cargo.toml`, `pyproject.toml`, `go.mod`, or equivalent for language/framework/dependencies
- **Project structure**: Run `ls` on the root and key directories to understand the layout
- **Conventions**: Look for linter configs (`.eslintrc`, `biome.json`, `.prettierrc`), tsconfig, build configs
- **Key patterns**: Scan a few source files for architectural patterns (e.g. component structure, API patterns, state management)
- **Gotchas**: Check for monorepo tools (`turbo.json`, `nx.json`, `pnpm-workspace.yaml`), special build steps, environment requirements

### For `decisions.md` — Architecture & Design Decisions
- **Git history**: Run `git log --oneline -30` to see recent commit themes
- **Architecture signals**: Look for patterns that imply deliberate choices (e.g. specific state management, API layer design, testing strategy, deployment setup)
- **Only record decisions you're confident about** — it's better to leave this sparse than to guess wrong

### For `changes.md` — Recent Changes
- **Git log**: Run `git log --oneline -20 --format="%ad %s" --date=short` to get recent dated commits
- **Summarize by date**: Group commits into daily summaries
- **Only add entries not already in the file**

## Step 4: Write Updates

Edit (don't overwrite) the memory files, preserving any existing content. Append or fill in sections.

### `context.md` format:
```markdown
## Tech Stack
- **Language:** TypeScript / Rust / Python / etc.
- **Framework:** Next.js / Actix / FastAPI / etc.
- **Key deps:** list of important dependencies
- **Build:** turbo / vite / cargo / etc.
- **Testing:** vitest / jest / pytest / etc.

## Conventions
- Monorepo structure: apps/ and packages/
- Component pattern: ...
- State management: ...
- (whatever is relevant)

## Gotchas
- Must run X before Y
- Environment variable Z is required
- (real quirks discovered from the codebase)
```

### `decisions.md` format:
```markdown
### [YYYY-MM-DD] Decision title
**Context:** What prompted this decision
**Choice:** What was decided
**Reasoning:** Why this over alternatives
```

### `changes.md` format:
```markdown
- [YYYY-MM-DD] Brief description of what was done
```

## Step 5: Report

After syncing, print a summary:

```
★ Memory synced for <project-name>

  context.md  — <what was added/updated, or "already up to date">
  decisions.md — <what was added, or "no new decisions found">
  changes.md  — <N new entries added, or "already up to date">
```

## Important Rules

- **Be accurate over comprehensive** — only write things you're confident about from the codebase
- **Don't overwrite** — always edit/append, never replace existing content
- **Keep it concise** — these files are read into context windows, so brevity matters
- **Use the comment templates** in the files as guides for format
