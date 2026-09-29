---
name: checkpoint
description: Use when user runs /checkpoint to save session progress, decisions, and conversation highlights to ~/.Codex/checkpoints/. Creates timestamped markdown files for session continuity.
---

# Checkpoint

Save current session progress and conversation highlights to a timestamped markdown file.

## Trigger

Run when user types `/checkpoint` or `/checkpoint <description>`.

## Workflow

### 1. Generate Filename

Format: `{YYYY-MM-DD}_{HH-MM-SS}_{description}.md`

- Use current timestamp
- If user provides description, slugify it (lowercase, hyphens)
- If no description, use "session" as default

Examples:
- `/checkpoint` → `2025-02-10_14-30-45_session.md`
- `/checkpoint auth flow done` → `2025-02-10_14-30-45_auth-flow-done.md`

### 2. Collect Session Data

Review the conversation and extract:

1. **Summary**: What was accomplished (2-3 sentences)
2. **Key Decisions**: Important choices made with reasoning
3. **Conversation Highlights**: 3-5 key exchanges that led to decisions
   - Quote the actual messages (user question → assistant response)
   - Focus on decision points, not routine steps
4. **Files Changed**: List files created/modified this session
5. **Current State**: Where things stand now
6. **Next Steps**: What remains to be done

### 3. Write Checkpoint File

Path: `~/.Codex/checkpoints/{filename}`

```markdown
# Session Checkpoint

**Saved:** {YYYY-MM-DD HH:MM:SS}
**Working Directory:** {current working directory}

## Summary

{2-3 sentences on what was accomplished}

## Key Decisions

- **Decision**: {what was decided}
  - **Why**: {reasoning}

## Conversation Highlights

> **User**: {key question or request}
>
> **Assistant**: {key response or decision}

{Repeat for 3-5 important exchanges}

## Files Changed

- `path/to/file.ts` - {brief description of change}
- `path/to/new-file.md` - Created

## Current State

{Where the project/task stands now}

## Next Steps

- {What needs to be done next}
- {Any pending tasks}

## Context for Future Sessions

{Notes that would help when resuming this work later}
```

### 4. Confirm Save

After writing, confirm:
```
✓ Checkpoint saved: ~/.Codex/checkpoints/{filename}
```

## Usage with Memory Systems

- **agent-memory**: Reference checkpoints for detailed session history
- **memory.md**: Checkpoints contain session-specific details
- **AGENTS.md**: Move important patterns from checkpoints to AGENTS.md

## Viewing Checkpoints

To list recent checkpoints:
```bash
ls -la ~/.Codex/checkpoints/ | head -20
```

To read a specific checkpoint:
```bash
cat ~/.Codex/checkpoints/{filename}
```

## Best Practices

1. **Save frequently**: Create checkpoints after significant progress
2. **Use descriptions**: `/checkpoint api tests passing` is more useful than `/checkpoint`
3. **Include context**: Future you won't remember details - write them down
4. **Quote conversations**: The actual exchange often captures nuance better than summary
