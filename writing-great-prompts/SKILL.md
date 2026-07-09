---
name: writing-great-prompts
description: >
  Craft and economics of writing the instruction prose in a prompt — making
  instructions clear, correctly weighted, and free of no-ops. Use when authoring,
  editing, or reviewing a system/agent prompt and deciding what an instruction should
  say, how forcefully to say it, what order it goes in, and what to cut. Complements
  prompt-engineering (which owns the mechanics: context engineering, output format,
  tool design, injection defense).
license: MIT
metadata:
  author: lifeofpavs
  version: "1.0.0"
---

# Writing Great Prompts

This skill is about the *prose* of a prompt — the craft and economics of the instructions
themselves. It answers: what should an instruction say, how forcefully should it say it, what
order should it go in, and what should be cut. It does **not** cover mechanics — context
engineering, output-format techniques, tool design, injection defense, structured outputs,
parallelism, and state management all live in the `prompt-engineering` skill. **For mechanics, see
`prompt-engineering`.**

## When to use

- Authoring a new system or agent prompt from scratch
- Editing or tightening an existing prompt
- Reviewing a prompt and deciding whether an instruction earns its place
- A prompt behaves inconsistently and you suspect the *wording*, not the mechanics

## Predictability is the goal

A prompt exists to wrangle determinism out of a stochastic system. You are not writing prose for a
reader — you are shaping the *process* the model follows so its behavior is consistent across
inputs you will never see. Every instruction is judged by one question: does it make the model's
behavior more predictable? If it doesn't, it is dead weight (see **Pruning & no-ops**). This is the
lens for every section below.

## Action vs. suggestion

An instruction's *force* is set by its verb, and models read force literally. "You may verify the
balance" and "consider checking the docs" read as optional — the model will skip them under
pressure. "Verify the balance" and "Always check the docs first" read as mandatory. Decide the
force you actually want, then pick the verb to match.

Prefer positive instructions — say what to do, not only what to avoid. A prompt full of "don't"
leaves the model guessing what "do" looks like.

```
Weak:   You might want to confirm the transaction succeeded before replying.
Strong: Confirm the transaction succeeded before replying. Never claim success you
        have not verified.
```

## Weighting instructions

Not every instruction deserves equal force, and a flat prompt is one the model cannot triage. Give
force a legible hierarchy:

- **Absolute constraints** — the few safety/correctness rules that must never break. Mark them so
  they stand out from the page: all-caps labels (`HARD RULE`, `CRITICAL`), numbered, and — when it
  matters — enumerate the forbidden outputs verbatim so there is no room to paraphrase.
- **Defaults** — what to do absent a reason otherwise ("Default to X unless the user asks for Y").
- **Soft guidance** — preferences, tone, nice-to-haves.

The anti-pattern is **weight inflation**: marking everything CRITICAL until nothing is. If the
whole prompt shouts, the model has no signal for the three rules that actually matter. Reserve top
weight for the vital few; let everything else sit at normal force.

## Information hierarchy

Order instructions by immediacy — how soon and how often the model needs them:

1. **Role and scope** — who the model is and what is in/out of bounds. Frames everything after it.
2. **Every-turn rules** — the constraints that apply to every response.
3. **Situational detail** — rules that fire only in specific branches.
4. **Reference material** — long lookups, tables, examples the model consults occasionally.

Put long, fixed context (large reference blocks, knowledge bases) near the top where it anchors the
rest, and keep the rules that fire on every turn close to where the model starts reasoning. A rule
buried in the middle of a paragraph three-quarters down the prompt will be missed — hierarchy is
itself a form of weighting.

## Steps & workflows

When behavior is a *procedure* — do A, then B, then C — make the sequence explicit. Numbered steps
remove ordering ambiguity that flowing prose hides, and they give the model a checklist it can
follow the same way every time. Reserve this for genuinely multi-step behavior; single-shot
behavior stays as prose (numbering one thing is a no-op).

```
Vague:    Look up the token, and you'll want the price and to check it's verified
          before you tell the user anything.

Explicit: 1. Resolve the symbol with the lookup tool.
          2. Confirm the match is a verified token. If not, stop and say so.
          3. Report the verified match's live price in plain text.
```

## Leading words

A **leading word** is a single pretrained concept that accumulates a distributed definition across
the prompt. Choose one precise anchor term for a recurring idea and reuse it, instead of
re-explaining the idea each time it appears. Every restatement is tokens spent and a chance for the
two explanations to drift apart. Name it once, name it well, then lean on the name — the model
carries the meaning forward for you.

## Failure modes

| Symptom | Likely prose cause | Fix |
| --- | --- | --- |
| Model ignores a rule | Buried mid-paragraph, or under-weighted as a suggestion | Hoist it up the hierarchy and raise its force |
| Model over-refuses / is rigid | Weight inflation — soft guidance flattened to CRITICAL | Re-tier: demote guidance to defaults |
| Inconsistent multi-step behavior | Procedure written as flowing prose | Convert to numbered steps |
| Model paraphrases a forbidden output | Constraint stated abstractly | Enumerate the forbidden phrasing verbatim |
| Prompt is long but behavior doesn't improve | No-op instructions paying load to say nothing | Prune (run the removal test below) |
| Two rules seem to contradict | Same idea explained twice, drifted apart | Collapse to one leading word |

## Quick-reference checklist

- [ ] Every instruction is either an action or an explicitly-marked suggestion — no accidental optionality.
- [ ] Instruction force is legible: absolute constraints stand out; defaults and soft guidance sit lower.
- [ ] Top weight is reserved for the vital few — no weight inflation.
- [ ] Instructions are ordered by immediacy (role/scope → every-turn rules → situational → reference).
- [ ] Multi-step behavior is numbered; single-shot behavior stays as prose.
- [ ] Recurring ideas use one leading word, defined once and reused.
- [ ] Ran the removal test on every line: *does deleting this change any output?* If not, cut it.
