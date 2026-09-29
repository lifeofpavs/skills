# File Templates

Exact markdown templates for all generated project files. Copy and fill in during Phase 1 (Dry Implementation).

---

## PLAN.md

```markdown
# [Project Name] — Plan

## Vision
[1-2 paragraph description of what we're building and why]

## Architecture Overview
[High-level description of the system — components, how they interact]

## Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| [e.g., Backend] | [e.g., Rust + Axum] | [Why this choice] |
| [e.g., Frontend] | [e.g., TypeScript + React] | [Why this choice] |
| [e.g., Database] | [e.g., PostgreSQL] | [Why this choice] |
| [e.g., Infra] | [e.g., Docker + Railway] | [Why this choice] |

## Phases

### Phase 1: Foundation
[What gets built first — the minimal viable architecture]

### Phase 2: Core Features
[Primary functionality]

### Phase 3: Polish & Production
[Hardening, optimization, monitoring]

## Constraints
- [Hard constraints — deadlines, budget, platform limits]
- [Soft constraints — preferences, team familiarity]

## Open Questions
- [Unresolved decisions that need input]

## Out of Scope
- [Explicitly excluded features or concerns]
```

---

## TASKS.md

```markdown
# [Project Name] — Tasks

## Legend
- **Status:** Checkbox = done, no checkbox = pending
- **Blockers:** Tasks that must merge before this can start
- **PR:** Link to pull request when opened

---

## Phase 1: Foundation

- [ ] TASK-001: [Title]
  - **Assignee:** [Agent role]
  - **Blocked by:** None
  - **PR:** —
  - **Test criteria:** [What tests must pass]
  - **Acceptance:** [Definition of done]

- [ ] TASK-002: [Title]
  - **Assignee:** [Agent role]
  - **Blocked by:** TASK-001
  - **PR:** —
  - **Test criteria:** [What tests must pass]
  - **Acceptance:** [Definition of done]

## Phase 2: Core Features

- [ ] TASK-003: [Title]
  - **Assignee:** [Agent role]
  - **Blocked by:** TASK-001, TASK-002
  - **PR:** —
  - **Test criteria:** [What tests must pass]
  - **Acceptance:** [Definition of done]

---

## Completed

- [x] TASK-000: [Title] — PR #0 (merged [date])
```

---

## ARCHITECTURE.md

```markdown
# [Project Name] — Architecture

## System Diagram

```text
[ASCII diagram of major components and their relationships]
```

## Directory Structure

```text
project-root/
├── src/
│   ├── [component-a]/    # [Purpose]
│   ├── [component-b]/    # [Purpose]
│   └── [shared]/         # [Purpose]
├── tests/
│   ├── unit/
│   └── integration/
├── docs/
│   ├── PLAN.md
│   ├── TASKS.md
│   ├── ARCHITECTURE.md
│   ├── AGENTS.md
│   ├── progress/
│   └── guides/
└── [config files]
```

## Component Registry

| Component | Path | Owner | Purpose |
|-----------|------|-------|---------|
| [Name] | `src/[path]` | [Agent role] | [What it does] |

## Data Flow

```text
[ASCII diagram: Request → Component A → Component B → Response]
```

## API Contracts

### [Endpoint/Interface Name]
- **Method:** [GET/POST/etc.]
- **Path:** [/api/...]
- **Request:** [Schema or type]
- **Response:** [Schema or type]
- **Errors:** [Error codes and meanings]

## Conventions

### Naming
- Files: [convention, e.g., kebab-case]
- Functions: [convention]
- Types: [convention]
- Constants: [convention]

### Error Handling
[Pattern used for error handling across the project]

### Testing
[Testing strategy — unit, integration, e2e, what goes where]

## Changelog

| Date | Change | PR |
|------|--------|-----|
| [YYYY-MM-DD] | [What changed] | #[N] |
```

---

## AGENTS.md

```markdown
# [Project Name] — Agent Coordination

## Required Reading (EVERY session start)

**You MUST read these files before doing ANY work:**

1. **This file** (`AGENTS.md`) — team, workflow, rules
2. **`ARCHITECTURE.md`** — system design, conventions, component registry
3. **`progress/`** — current state of all tasks (`ls progress/`)
4. **Your assigned task in `TASKS.md`** — requirements, blockers, test criteria

**This is non-negotiable. Skipping required reading leads to wasted work.**

## Team Roster

| Role | Agent | Focus |
|------|-------|-------|
| Team Lead | [name] | Architecture, orchestration, PLAN/TASKS/ARCHITECTURE |
| Senior Reviewer 1 | [name] | Correctness, security, clarity, API design |
| Senior Reviewer 2 | [name] | Performance, test coverage, edge cases, resources |
| [Language] Engineer | [name] | [Specialty area] |
| [Language] Engineer | [name] | [Specialty area] |
| [Language] Engineer | [name] | [Specialty area] |

## Workflow Rules

### One PR Per Task
- Each task in TASKS.md gets exactly one PR
- Branch: `task/TASK-XXX-short-description` from latest main
- PR description MUST link blocking PRs and blocked PRs

### TDD — No Exceptions
1. Write failing test first
2. Confirm it fails for the right reason
3. Write minimal implementation
4. Refactor with green tests
5. Reviewers will reject PRs without TDD evidence

### Progress Files
Update progress file on EVERY status change:
```text
not-started-TASK-XXX.md → in-progress-TASK-XXX.md → review-TASK-XXX.md → merged-TASK-XXX.md
```

### Review Gates (ALL required to merge)
- [ ] Reviewer 1 approved
- [ ] Reviewer 2 approved
- [ ] CI green
- [ ] All blocking PRs merged
- [ ] ARCHITECTURE.md updated (if structural changes)

## Communication Protocol

### Notify Team Lead When:
- Blocked by unmerged dependency
- Found requirement not in TASKS.md
- Architectural decision needed
- Test reveals bug in merged code

### Update ARCHITECTURE.md When:
- New component added
- Data flow changed
- API contract modified
- New dependency introduced

## Red Flags — STOP and Notify Team Lead

- About to push directly to main
- Writing code without tests first
- PR covers more than one task
- Progress file is stale (>24h without update)
- Skipping required reading
- Ignoring reviewer feedback
```

---

## Progress File Template

```markdown
# TASK-XXX: [Title]

## Agent
[Agent name/role]

## Branch
task/TASK-XXX-description

## Status
not-started

## What Was Done
- [Nothing yet]

## Tests Written
- [None yet]

## Blockers
- [List any blocking tasks]

## Next Steps
- [First step to take]

## Updated
[YYYY-MM-DD HH:MM]
```

---

## Guide Templates

### guides/getting-started.md

```markdown
# Getting Started

## Prerequisites
- [Runtime/language versions needed]
- [Tools to install]

## Setup
1. Clone the repo
2. [Install dependencies]
3. [Configure environment]
4. [Run tests to verify]

## Project Structure
See `ARCHITECTURE.md` for full details.

## First Task
1. Read `AGENTS.md` (required reading protocol)
2. Check `TASKS.md` for your assignment
3. Check `progress/` for current state
4. Start with TDD — write your first failing test
```

### guides/pr-workflow.md

```markdown
# PR Workflow

## Opening a PR
1. Branch from latest main: `task/TASK-XXX-description`
2. Write tests first, then implement
3. Update progress file: rename to `review-TASK-XXX.md`
4. Open PR with description linking blockers

## PR Description Template
Subject: TASK-XXX: [Short description]

Body:
- What: [What this PR does]
- Why: [Which task/requirement it fulfills]
- How: [Brief technical approach]
- Tests: [What tests were added]
- Dependencies: Blocked by #[N], Blocks #[N]

## Review Process
- Both reviewers must approve
- Address all feedback before re-requesting review
- CI must be green

## Merging
- Squash merge to main
- Delete branch
- Rename progress file to `merged-TASK-XXX.md`
- Update TASKS.md (check off task)
```

### guides/testing-strategy.md

```markdown
# Testing Strategy

## TDD Protocol
1. Write failing test (RED)
2. Write minimal implementation (GREEN)
3. Refactor (REFACTOR)

## Test Organization
- `tests/unit/` — isolated component tests
- `tests/integration/` — cross-component tests
- Co-located tests acceptable for language conventions (e.g., Rust `#[cfg(test)]`)

## What to Test
- Every public function/method
- Happy path + at least 2 edge cases
- Error conditions and failure modes
- Boundary values

## What NOT to Test
- Private implementation details
- Framework internals
- Trivial getters/setters
```

### guides/coding-conventions.md

```markdown
# Coding Conventions

See `ARCHITECTURE.md` for project-specific conventions.

## Universal Rules
- Follow language idioms — write idiomatic code for the language
- Prefer clarity over cleverness
- Name things by what they ARE, not how they work
- Handle errors explicitly — no swallowed errors
- No TODO comments without a linked task in TASKS.md

## PR Conventions
- One task per PR
- Squash merge only
- Delete branch after merge
- Update ARCHITECTURE.md for structural changes
```
