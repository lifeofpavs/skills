# Global guidelines
- **A good codebase is one that anybody can easily understand and change.** This principle comes first when you plan and when you build. Choose the simplest approach that works, and avoid over-engineering, needless abstraction and clever solutions.
- Plan before implementing when the change touches more than 2 files. Smaller changes: state the change and how you'll check it, then do it.
- ALWAY look for gaps in the logic of the feature to be implemented
- ALWAYS avoid workarounds and think step by step to figure out the proper solution
- ALWAYS be radically simple in the approaches you take. Overengineering is penalized and simplicity makes systems work for longer
- Use smaller models (haiku, luna) as subagents for exploration and implementation, then audit their work thoroughly.

# Commits
- Always write commit messages and PR titles as Conventional Commits: `type(scope): plain-language summary` (e.g. `feat(token-intel): save like and retweet counts for news tweets`). PR titles count because squash merges turn them into the commit on `main`.

# Filling PRs
- Always use the `visual-pr` skill to write PR descriptions.
- Be concise and descriptive whenver you are writting a PR. The title and description should be human friendly and meaningful.
- Instead of listing what you did, explain it with the reasons behind it, in a huma-readable friendly format. 
- After opening or pushing to a PR in T3, hand the watching to a new T3 thread (`t3_thread_launch`, a small model such as Sonnet or Luna, auto mode) so wake-ups run on a small context. Its prompt is the PR URL, the branch, and this loop: call `watch_pull_request` and end the turn instead of polling; on wake, fetch new comments and CI results, triage them, fix the valid P0/P1 items, push, and reply on each thread. Never merge the PR or merge main into it unless I ask.

# Reviewing PRs
- Read a PR with `git diff --stat` first, then diff the in-scope files one at a time.
- Run the ponytail review, then a devil's advocate that verifies every finding.
- On a repeat review, review only the delta when the last review comment on the PR names its SHA, that SHA is an ancestor of HEAD, and no merge commits follow it. Otherwise, or when I ask, review in full. Either way, re-check every earlier P0/P1 finding.
- Add independent reviews with both Fable and Codex GPT-6.1-Sol (`gpt-6.1-sol`, medium reasoning effort) only when the PR changes agent/prompt behavior, money movement, auth or security, or when I ask. If either model is unavailable, report the missing review explicitly.
- Look for complexity that should not be there: the PR should take the simplest approach and avoid setups that won't scale.
- Check clean code and clean architecture best practices.
- Check for circular dependencies that can be split 
- Check for unneeded one-line functions or abstractions that are just syntactic sugar
- Check for magic strings and numbers that should be named constants.
- **Filter before presenting.** Drop false positives, edge cases no real caller can hit, and suggestions whose fix adds abstraction, indirection, or config. Report P0 and P1 only.
- **Write comments like a teammate.** Plain words, short sentences, severity stated, no praise padding. Reread before posting and cut anything that sounds generated.

## Responding to review comments on your PR
1. Fetch every unresolved comment on the PR, human and bot.
2. Triage each comment as valid, false positive, overengineered, or unreachable edge case. Human and bot reviewers both overreach.
3. Fix the valid P0 and P1 items with the smallest change that works.
4. Reply on each thread in one or two sentences: what changed, or why it stays.

## Implementing
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
- Launch every subagent with auto permissions so I never have to approve its tool calls: pass `runtimeMode: "auto"` to T3 `delegate_task` and `t3_thread_launch`, and the equivalent auto/full-auto mode in any other harness.
- The model that starts the thread orchestrates it. Give subagents bounded tasks; they return a verdict, changed paths and evidence, never full logs or transcripts.
- After the first compaction or a merged PR, stop and suggest a fresh thread with a 10-line handoff (branch, SHA, PR, next step, open findings). Resume work by PR or branch, not by thread ID.
- Reversible steps inside the agreed scope need no confirmation. Ask only for destructive or scope-changing actions. End every turn with a one-line status.
# Skills
- Every personal skill I create or edit lives in `~/workspace/pavs/skills` (github.com/lifeofpavs/skills, public). Never create one anywhere else.
- Install it with symlinks: `~/.agents/skills/<name>` → the repo folder (Codex reads this directly), and `~/.claude/skills/<name>` → `../../.agents/skills/<name>` (for Claude). Never put a personal skill in `~/.codex/skills`.
- Keep third-party and company-internal skills out of that repo. Commit and push new skills there.
- When I install a third-party skill, add its `<source> <skill>` to `third-party-skills.txt` in that repo so `install.sh` restores it on a new machine.
