# Global guidelines
- ALWAYS plan before implementing
- ALWAY look for gaps in the logic of the feature to be implemented
- ALWAYS avoid workarounds and think step by step to figure out the proper solution
- ALWAYS use smaller model as agents for code implementation
- ALWAYS be radically simple in the approaches you take. Overengineering is penalized and simplicity makes systems work for longer

## Context Management
- Always compact context when utilization passes 50%

# Filling PRs
- Be concise and descriptive whenver you are writting a PR. The title and description should be human friendly and meaningful.
- Instead of listing what you did, explain it with the reasons behind it, in a huma-readable friendly format. 

# Reviewing PRs
- Always review with a radically simple approach in mind, the PR should aim for the most simple approach for solving the problem and avoid complex setups that might not escale
- Check for circular dependencies that can be split 
- Check for unneded one-line functions that don't add any benefit to the whole
- Check for magic strings and numbers that should be named constants.
- **Filter before presenting.** Drop false positives, edge cases no real caller can hit, and suggestions whose fix adds abstraction, indirection, or config. Report P0 and P1 only.
- **Write comments like a teammate.** Plain words, short sentences, severity stated, no praise padding. Reread before posting and cut anything that sounds generated.

## Responding to review comments on your PR
1. Fetch every unresolved comment on the PR, human and bot.
2. Triage each comment as valid, false positive, overengineered, or unreachable edge case. Human and bot reviewers both overreach.
3. Fix the valid P0 and P1 items with the smallest change that works.
4. Reply on each thread in one or two sentences: what changed, or why it stays.

## Implementing
- Always use the radically most simple approach when planning for a new feature or fixing a bug. Avoiding complex indirections or circular dependencies
- Always audit the code you wrote from a junior software engineer point of view, so that even he can understand and follow all the code while being simple and clean. 

## Keep the change small
Ship the simplest version that works, then iterate. Every file and line in the diff needs a reason a reviewer would accept.

- **Commit only what the change needs.** Plans, `findings.md`, scratch notes, tool folders like `.humanlayer/`, and experiment output stay out of the repo. Attach artifacts to the PR description instead.
- **Add no new knobs.** No feature flags, rollout switches, gates, env vars, lint rules, or migrations unless the task asks for one.
- **Fix the finding, not the gate.** Clear lint warnings, type errors, and CI failures in the code. Never raise a warning budget, relax a rule, or edit a lint command to get green.
- **Delete what you replace.** When a PR removes a feature, grep code, prompts, tests, evals, and docs for leftover references and remove them in the same PR.

## Tests: write freely, ship few
Tests written while building are scaffolding. Write as many as help you work, then prune before the PR is ready for review.

- **While working:** add any test that pins down a behavior, reproduces a bug, or guards a refactor in progress. Calibration scripts and one-off checks are fine locally.
- **Before review:** keep a test only if it covers behavior that could break silently and no existing test or eval case already covers it.
- **Delete the rest.** Remove tests that restate the implementation, check what the type system already enforces, mock everything the code touches, or only served calibration.
- **Extend before adding.** A new case in an existing test file or eval suite beats a new file or suite.

# Working with me
- Talk to me as a colleague, not a supervisor. Short answers, tables or diagrams over prose.
- Ask decisions as numbered questions so I can answer "1. yes 2. no".
- On every PR review, also run the ponytail review and a second-model check (Fable, Codex or Opus).

# Skills
- Every personal skill I create or edit lives in `~/workspace/pavs/skills` (github.com/lifeofpavs/skills, public). Never create one anywhere else.
- Install it with symlinks: `~/.agents/skills/<name>` → the repo folder (Codex reads this directly), and `~/.claude/skills/<name>` → `../../.agents/skills/<name>` (for Claude). Never put a personal skill in `~/.codex/skills`.
- Keep third-party and company-internal skills out of that repo. Commit and push new skills there.
