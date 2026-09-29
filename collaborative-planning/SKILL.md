---
name: collaborative-planning
description: Create plans through iterative collaboration — asks clarifying questions and builds an outline before writing the full plan. Use this skill whenever the user needs to plan a multi-step effort of ANY kind, including but not limited to: software features, system migrations, product launches, hiring plans, event planning (offsites, weddings, conferences), business rollouts, personal projects (moves, renovations), disaster recovery, onboarding programs, or organizational changes. Trigger phrases include "plan", "map out", "think through", "figure out how to", "I need a strategy for", "help me organize", or any request that involves coordinating multiple steps, people, or phases toward a goal. This skill is domain-agnostic and complements writing-plans (which handles detailed code-level implementation plans with TDD steps). If the user's request involves planning or strategizing rather than direct code writing, debugging, or explaining concepts — use this skill.
---

# Collaborative Planning

You are about to help the user create a plan. Before you do anything else, internalize this:

**Work back and forth with me, starting with your open questions and outline before writing the plan.**

This is the most important instruction in this skill. Do not write a plan on your first response. Plans written without collaboration are plans written with assumptions — and assumptions are where plans fail.

## Why This Matters

When someone asks for a plan, the natural instinct is to start writing one immediately. Resist this. The user has context in their head that hasn't made it into their request yet. They may not even know what they don't know. Your job is to pull that context out through questions, build a shared mental model via an outline, and only then write the plan — so the final document reflects both your analytical ability and their domain knowledge.

## The Workflow

### Round 1: Open Questions

Read the user's request carefully. Then respond with:

1. **A brief restatement** of what you understand they want to accomplish (2-3 sentences max). This lets them correct any misunderstanding early.

2. **Open questions** — things you genuinely need to know to write a good plan. These are not performative questions. They should target:
   - **Scope boundaries**: What's in and what's out?
   - **Constraints**: Timeline, budget, dependencies, team size, existing commitments?
   - **Success criteria**: How will they know this worked?
   - **Risks**: What could go wrong? What has gone wrong before in similar efforts?
   - **Stakeholders**: Who else cares about this? Who needs to approve?
   - **Prior art**: Has something like this been tried before? What happened?

Don't ask all of these every time — pick the ones that actually matter for this specific request. Aim for 3-7 questions. Too few means you're not thinking hard enough; too many means you're stalling.

3. **Initial assumptions** you're making, stated explicitly so the user can correct them.

### Round 2: Outline

After the user answers your questions, synthesize everything into a **structured outline** of the plan. This is not the plan itself — it's the skeleton. Present it as:

- **Goal**: One sentence
- **Phases/Sections**: The major chunks of work, in order
  - Under each: 2-3 bullet points of what it covers
- **Key decisions**: Any forks in the road you've identified
- **Open items**: Anything still unresolved

Ask the user to review the outline. Are the phases right? Is something missing? Should the order change?

### Round 3+: Refinement (if needed)

If the user has significant feedback on the outline, incorporate it and present a revised version. If the feedback is minor, you can proceed to writing the full plan.

### Final: Write the Plan

Once the user approves the outline (or says something like "looks good", "go ahead", "write it up"), produce the full plan as a markdown file. Save it to the project's plan directory if one exists, or ask the user where they'd like it saved.

The plan document should include:

```markdown
# [Plan Title]

## Goal
[One clear sentence about what this plan achieves]

## Context
[Why this plan exists — the problem, the opportunity, the trigger]

## Scope
[What's included and explicitly what's NOT included]

## Phases

### Phase 1: [Name]
**Objective**: [What this phase accomplishes]
**Steps**:
- [ ] Step with enough detail to act on
- [ ] ...

**Deliverable**: [What's produced at the end of this phase]

### Phase 2: [Name]
...

## Dependencies & Risks
[What could block progress, what could go wrong, and mitigation strategies]

## Success Criteria
[How to know the plan worked — specific, measurable where possible]

## Open Questions
[Anything still unresolved that will need to be figured out during execution]
```

Adapt this structure to the domain. A software migration plan needs different sections than a wedding plan. Use your judgment — the template is a starting point, not a straitjacket.

## What NOT to Do

- **Don't write the plan on your first response.** This is the whole point of the skill. Ask questions first.
- **Don't ask questions you could answer yourself.** If the user said "I want to migrate from Postgres to MySQL", don't ask "What database are you migrating from?" Read what they gave you.
- **Don't present a 20-question interrogation.** Be selective. Ask what matters.
- **Don't skip the outline.** Even if you think you have enough context, the outline is where misalignments surface. It takes 30 seconds to review and can save hours of rework.
- **Don't over-structure simple plans.** If someone needs a plan for a weekend project, they don't need a risk matrix. Match the formality to the stakes.
