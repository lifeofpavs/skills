---
name: pr-review-team
description: >
  Launch a multi-perspective PR review team with 5 specialized senior reviewers
  (LLM Engineer, Prompt Engineer, First Principles Architect, Software Architect,
  Devil's Advocate) running in parallel, then consolidate into a single unified
  review document. Use this skill whenever the user asks for a "thorough review",
  "team review", "multi-perspective review", "launch review team", "full PR review",
  "comprehensive review", "multi-agent review", "review from multiple angles",
  "review from every angle", "get the team to review this", "I want multiple
  opinions on this PR", "tear this apart", or any request that implies wanting
  more than a standard single-perspective code review. This is different from
  pr-review-toolkit which reviews functional aspects (tests, comments, errors,
  types) — this skill reviews from strategic and role-based perspectives.
  Also trigger when reviewing PRs that touch AI/LLM code, since the LLM Engineer
  and Prompt Engineer perspectives are especially valuable there.
---

# PR Review Team

A 5-agent review team that examines code from distinct senior perspectives, then consolidates into one unified review.

## The Team

| Role | Agent Source | Perspective |
|------|-------------|-------------|
| Senior LLM Engineer | `agents/senior-llm-engineer.md` (relative to this skill) | Token efficiency, streaming, AI API patterns, cost |
| Senior Prompt Engineer | `agents/senior-prompt-engineer.md` (relative to this skill) | Prompt construction, injection risks, template safety |
| First Principles Engineer | `agents/first-principles-architect.md` (relative to this skill) | Over-engineering, unnecessary complexity, minimal solutions |
| Senior Software Architect | `agents/senior-software-architect.md` (relative to this skill) | System design, API quality, scalability, boundaries |
| Devil's Advocate | `agents/asshole-code-reviewer.md` (relative to this skill) | Brutally honest, zero-filter, calls out slop |

## Workflow

Follow these steps exactly. Do not skip the consolidation step.

### Step 1: Gather PR Context

Before spawning any agents, collect the shared context that all reviewers need. Run these commands and capture their output:

1. **Get the diff.** Try in this order:
   - If the user provided a PR number/URL: `gh pr diff <number>`
   - If on a feature branch: `git diff main...HEAD` (or the appropriate base branch)
   - If there are staged changes: `git diff --cached`
   - Fallback: `git diff`

2. **Get the file summary:** `git diff --stat` (using the same range as above)

3. **Get PR metadata** (if a PR exists): `gh pr view --json title,body,baseRefName,headRefName,number,url`

4. **Read CLAUDE.md** files in affected directories if they exist — these contain project conventions the reviewers should respect.

Store all of this as the `PR_CONTEXT` block that gets injected into every agent prompt.

### Step 2: Check Applicability

Do a quick scan of the diff:
- Does it import or reference `anthropic`, `openai`, `langchain`, `@ai-sdk`, `claude`, or similar AI libraries?
- Does it contain prompt strings, system messages, model configuration, or token-related logic?

If **yes**: all 5 reviewers operate at full scope.

If **no**: the LLM Engineer and Prompt Engineer still run, but add this to their prompts:
> "This PR does not appear to touch LLM/AI code directly. If you find nothing relevant to your specialty, state that clearly in 2-3 sentences and note any tangential observations (e.g., error messages that could be improved, data handling that might interact with AI systems downstream). Do not force findings."

### Step 3: Launch 5 Reviewers in Parallel

Spawn all 5 agents in a **single message** so they run concurrently. Each agent gets:
1. Their role definition (read from agent file)
2. The `PR_CONTEXT` block
3. The standardized output format from their agent file

Use the `Agent` tool for each. The prompt for each agent should follow this template:

```
You are reviewing a pull request. Read your role definition below, then review the PR changes that follow.

## Your Role
[Contents of the agent's .md file, everything after the YAML frontmatter]

## PR Context
[PR_CONTEXT block from Step 1]

## Instructions
Review this PR from your specific perspective. Use the output format defined in your role definition. Be specific — reference exact files, line numbers, and function names. Focus on issues that matter from YOUR unique angle; don't try to cover everything.
```

For the two reused agents (First Principles and Devil's Advocate), read their files at:
- `agents/first-principles-architect.md`
- `agents/asshole-code-reviewer.md`

For the three new agents, read their files relative to this skill's directory:
- `agents/senior-llm-engineer.md`
- `agents/senior-prompt-engineer.md`
- `agents/senior-software-architect.md`

### Step 4: Consolidate

After all 5 agents return their reviews, spawn one final agent to consolidate. This agent receives all 5 review outputs and produces the unified review.

**Consolidation agent prompt:**

```
You are the lead reviewer consolidating 5 independent PR reviews into a single unified document. Your job is to synthesize, deduplicate, and prioritize — not to add your own opinions.

## Rules

1. **Deduplicate**: If multiple reviewers flagged the same issue, merge into one finding and note which reviewers agreed (consensus = higher confidence).
2. **Preserve disagreements**: If reviewers conflict, present both sides in the "Reviewer Disagreements" section. Don't pick a winner — let the PR author decide.
3. **Severity is the maximum**: If one reviewer calls something critical and another calls it a suggestion, it's critical.
4. **Credit sources**: Every finding should note which reviewer(s) raised it.
5. **Don't invent**: You may rephrase for clarity, but don't add findings no reviewer mentioned.
6. **Omit empty sections**: If no LLM/AI findings, drop that section entirely. If no disagreements, drop that section.

## The 5 Reviews

[Insert all 5 review outputs here]

## Output Format

Produce this exact structure:

# PR Review: [PR Title or branch name]
**Reviewed by:** Senior LLM Engineer, Senior Prompt Engineer, First Principles Architect, Senior Software Architect, Devil's Advocate
**PR:** [URL or branch info]

## Executive Summary
[2-3 sentences synthesizing the overall verdict across all reviewers. State the consensus clearly.]

## Consensus Findings
[Issues flagged by 2+ reviewers. These are the highest-confidence items.]
- **[Severity]** [Finding] — flagged by [Reviewer 1, Reviewer 2] | [file:line]

## Critical Issues
[MUST fix before merge. Include the reviewer source and specific fix suggestion.]
1. **[Issue]** — Source: [Reviewer] | [file:line]
   - Why: [explanation]
   - Fix: [concrete suggestion]

## Important Issues
[SHOULD fix before merge.]
1. **[Issue]** — Source: [Reviewer] | [file:line]
   - Why: [explanation]
   - Fix: [suggestion]

## Suggestions
[Nice to have improvements.]
1. **[Suggestion]** — Source: [Reviewer]

## Architectural Observations
[Structural insights from the Software Architect and First Principles reviewers. Long-term implications, not just current bugs.]

## LLM/AI-Specific Findings
[From the LLM Engineer and Prompt Engineer. Omit this section entirely if not applicable.]

## Reviewer Disagreements
[Where reviewers had conflicting opinions. Present both sides neutrally.]

## Verdict
[One of: **Ship** | **Fix and ship** | **Rework**]
[1-2 sentences justifying the verdict based on the severity and count of findings.]
```

### Step 5: Present the Review

After consolidation completes, present the unified review to the user. If the user wants to post it as a PR comment, offer to run:
```
gh pr comment <number> --body "<review content>"
```

## Tips

- For very large PRs (1000+ lines changed), consider telling agents to focus on the most impactful files rather than trying to cover everything
- The Devil's Advocate and First Principles reviewers tend to produce the most actionable feedback on non-AI PRs
- This skill complements `pr-review-toolkit` — you can run both for maximum coverage (this skill for strategic/role-based review, pr-review-toolkit for functional checks like test coverage and silent failures)
