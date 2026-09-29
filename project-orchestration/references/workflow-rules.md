# Workflow Rules

Complete rules for PR dependencies, TDD enforcement, review gates, branching, and progress tracking.

---

## Branch Strategy

- **Main branch:** `main` — always deployable
- **Task branches:** `task/TASK-XXX-short-description` — branched from latest main
- **No long-lived feature branches** — every task merges independently
- **Always rebase on latest main** before opening PR

```
main ─────────────────────────────────────────►
  ├── task/TASK-001-setup-db ──► PR #1 ──► merge
  ├── task/TASK-002-auth-api ──► PR #2 ──► merge (after #1)
  └── task/TASK-003-user-model ──► PR #3 ──► merge (parallel with #2)
```

## PR Dependency Tracking

### In TASKS.md

Each task declares its blockers:

```markdown
- [ ] TASK-002: Auth API endpoints
  - **Blocked by:** TASK-001
  - **PR:** #2
```

### In PR Description

Every PR links its dependencies:

```markdown
## Dependencies
- Blocked by: #1 (setup database schema)
- Blocks: #5 (user registration flow)
```

### Rules

- An agent MUST NOT start work on a task until all blockers are merged
- If a blocker is in review, the agent should pick up a non-blocked task instead
- Team Lead is responsible for unblocking stalled dependency chains

## TDD Enforcement

### For Engineers

1. Write a failing test that captures the requirement
2. Run the test — confirm it fails for the RIGHT reason (not a syntax error)
3. Write the minimal implementation to make it pass
4. Refactor while tests stay green
5. Commit with test and implementation together

### For Reviewers

Reviewers MUST check for TDD evidence:

- Tests exist for every new behavior
- Test names describe the requirement, not the implementation
- Tests cover both happy path and edge cases
- If reviewer suspects tests-after (implementation matches test structure too perfectly, no iterative commits), flag it

### Violations

- PR with implementation but no tests → **reject immediately**
- PR where tests appear to be written after → **flag, request evidence**
- PR with only happy-path tests → **request edge case coverage**

## Review Gates

A PR can ONLY be merged when ALL conditions are met:

```
[ ] Senior Reviewer 1 approved (correctness, security, conventions)
[ ] Senior Reviewer 2 approved (performance, edge cases, resource mgmt)
[ ] CI pipeline green (all tests pass, linting clean, type checks pass)
[ ] All blocking PRs are merged
[ ] ARCHITECTURE.md updated (if structural changes were made)
[ ] Progress file renamed to review-TASK-XXX
```

### Review Protocol

1. Engineer opens PR → renames progress file to `review-TASK-XXX`
2. Both reviewers are notified (or check TASKS.md for PRs in review)
3. Reviewer 1 reviews for correctness/security focus
4. Reviewer 2 reviews for performance/edge case focus
5. If changes requested → engineer addresses → re-review
6. Both approve → merge

### Merge Process

1. Squash merge to main (clean history)
2. Delete task branch
3. Rename progress file to `merged-TASK-XXX`
4. Update TASKS.md (check off task, add PR link)
5. Team Lead assigns next task if engineer is free

## Progress File Lifecycle

### Status Transitions

```
not-started-TASK-XXX.md  →  Agent picks up task
in-progress-TASK-XXX.md  →  Agent opens PR
review-TASK-XXX.md       →  Both reviewers approve
merged-TASK-XXX.md       →  Done
```

Status is encoded in the FILENAME — `ls progress/` shows all states instantly.

### File Content Template

```markdown
# TASK-XXX: [Title]

## Agent
[Agent name/role]

## Branch
task/TASK-XXX-description

## Status
[not-started | in-progress | review | merged]

## What Was Done
- [Bullet points of completed work]

## Tests Written
- [List of test files and what they cover]

## Blockers
- [Any blocking issues or dependencies]

## Next Steps
- [What remains to be done]

## Updated
[YYYY-MM-DD HH:MM]
```

### Rules

- Engineer MUST rename progress file on every status change
- Content MUST be updated with each rename
- Stale progress files (>24h without update) are flagged by Team Lead
- Progress files are never deleted — they serve as audit trail

## Parallel Work Rules

- Tasks with NO dependency relationship can be worked on simultaneously
- Team Lead should maximize parallelism by assigning non-blocking tasks
- If two tasks modify the same files, they CANNOT be parallel (implicit dependency)
- Engineers must rebase on latest main before opening PR to catch conflicts early

### Conflict Resolution

1. First PR merged wins
2. Second PR must rebase on updated main
3. If conflicts are non-trivial, Team Lead mediates
4. Engineer resolves conflicts, re-runs tests, requests re-review

## Communication Protocol

### When to Notify Team Lead

- Task is blocked by an unmerged dependency
- Discovered requirement not in TASKS.md
- Architectural decision needed (not covered by ARCHITECTURE.md)
- Test reveals a bug in already-merged code
- PR has been in review for >2 review cycles without resolution

### When to Update ARCHITECTURE.md

- New component or module added
- Data flow changed
- API contract modified
- New dependency introduced
- Convention established or changed

The engineer making the change updates ARCHITECTURE.md in the same PR. Reviewers verify the update is accurate.
