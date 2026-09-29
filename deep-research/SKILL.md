---
name: deep-research
description: >
  Deep-research a topic and compile findings into the persistent LLM Wiki at
  /Users/pavs/agents-brain/Brain/, or query / lint the existing wiki. Use when the
  user asks to research, investigate, ingest a source, ask a question against prior
  research, or audit the wiki. Invocations:
    /deep-research <topic>            — research + ingest (default)
    /deep-research --query <question> — query the wiki
    /deep-research --lint             — health-check the wiki
metadata:
  author: pavs
  version: "2.0"
---

# Deep Research Skill

Maintain a compounding personal knowledge base. Every research session ingests a new source into a structured Obsidian-backed wiki — touching entity pages, concept pages, the index, and the log. Knowledge is **compiled once** and kept current, not re-derived per query.

Pattern reference: Karpathy's LLM Wiki (April 2026) — see `[[auto-research-patterns]]` in the wiki for context.

## Modes

| Mode | Trigger | Purpose |
|------|---------|---------|
| Ingest | `/deep-research <topic>` (or any "research / investigate / learn about" phrasing) | Research a topic and integrate it into the wiki |
| Query  | `/deep-research --query <question>` | Answer a question by reading existing wiki pages |
| Lint   | `/deep-research --lint` | Audit the wiki for orphans, contradictions, gaps |

When the user's invocation is ambiguous between modes, ask once.

## Wiki Layout (paths are absolute)

```
/Users/pavs/agents-brain/Brain/
├── SCHEMA.md            # Source of truth for all wiki rules
├── Research/            # Processed research notes (one per source)
└── Wiki/
    ├── index.md         # Catalog of every wiki page
    ├── log.md           # Append-only chronological record
    ├── Entities/        # People, companies, projects, products
    ├── Concepts/        # Ideas, patterns, technologies
    └── Synthesis/       # Cross-cutting analysis, comparisons, theses
```

`Raw/` is reserved for immutable source documents per `SCHEMA.md` and currently does not exist on disk. **Do not create `Raw/`.** Research notes go in `Brain/Research/`.

## Always-read-first

Before any mode does work, read these three files:

1. `/Users/pavs/agents-brain/Brain/SCHEMA.md` — conventions you must enforce.
2. `/Users/pavs/agents-brain/Brain/Wiki/index.md` — what already exists (avoid duplicates, find link targets).
3. `/Users/pavs/agents-brain/Brain/Wiki/log.md` — recent activity (avoid duplicate ingests; size the next log entry against prior shape).

---

## Mode 1 — Ingest (default)

### 1. Parse the topic

Extract the topic from the message. If vague, ask one clarifying question. Otherwise proceed.

### 2. Research

Use multiple sources. **At least 3 distinct queries.**

- **WebSearch** — current articles, docs, posts.
- **WebFetch** — read promising pages in full.
- **Context7** — library / framework / SDK docs (use over WebSearch for known libraries).
- **Grep / Glob / Read** — local codebase if the topic is project-related.

Cover: what it is · how it works · when to use · examples · gotchas · sources.

### 3. Read the index

Open `Brain/Wiki/index.md`. Note any existing entity, concept, or synthesis pages relevant to the topic. These are your link targets and your update candidates.

### 4. Discuss & propose (interactive checkpoint — do NOT skip)

Present to the user, in this exact shape:

```
**Key takeaways** (3–5 bullets)

**Proposed wiki touches:**
- Research source (new): Brain/Research/<slug>.md
- Entities (new):     Brain/Wiki/Entities/<name>.md
- Entities (update):  Brain/Wiki/Entities/<name>.md  — add: <one-line>
- Concepts (new):     Brain/Wiki/Concepts/<name>.md
- Concepts (update):  Brain/Wiki/Concepts/<name>.md  — add: <one-line>
- Synthesis (new/update): Brain/Wiki/Synthesis/<name>.md  (only if topic crosses ≥2 concepts)
- New cross-references: <page-A> → [[page-B]], …
```

**Wait for user confirmation or steer** before any wiki writes. The user may add, remove, rename, or skip items.

### 5. Write the research source

Create `/Users/pavs/agents-brain/Brain/Research/<kebab-slug>.md`:

```yaml
---
title: <Title Case>
created: <YYYY-MM-DD>
updated: <YYYY-MM-DD>
type: summary
tags: [<tag>, <tag>]
sources:
  - "<URL or [[Source Page]]>"
  - "<URL or [[Source Page]]>"
---
```

Body, in order, omitting any section that doesn't apply:

```
# <Title>

> Researched on <YYYY-MM-DD>

## Summary
2–3 sentences.

## Core Concepts
Key ideas, definitions, mental models.

## How It Works
Architecture, mechanisms, detail.

## When to Use
Use cases, trade-offs, decision criteria.

## Practical Guide
Code, configs, step-by-step.

## Gotchas and Pitfalls
Pitfalls, limitations, known issues.

## Comparisons
Alternatives and when to choose what.

## Sources
- [Title](URL) — brief description
```

### 6. Create / update entity pages

For every notable person, company, project, or product mentioned: create or update a page in `Brain/Wiki/Entities/`. Pattern: `Brain/Wiki/Entities/claude-code.md` (Description with `[[wikilinks]]` · Key Facts · Insights · Related).

- New page: full SCHEMA frontmatter (`type: entity`).
- Existing page: bump `updated:`. **Add new content; never delete prior claims.** If a new fact contradicts an old one, note both inline with date stamps:
  > As of 2026-04-27, X is now Y (previously Z, per `[[older-source]]`).

### 7. Create / update concept pages

Same procedure as entities, in `Brain/Wiki/Concepts/`. Pattern: `Brain/Wiki/Concepts/auto-research-patterns.md` (Definition · sub-patterns · Applications · Related). `type: concept`.

### 8. Create / update synthesis pages

Only if the source connects ≥2 existing concept areas. Pattern: `Brain/Wiki/Synthesis/the-agentic-stack.md`. `type: synthesis`.

### 9. Add cross-references — both directions

Every affected page gets outbound `[[wikilinks]]`. Then **read each linked page** and add inbound links where meaningful (e.g., if the new concept is now relevant under "Related" on an existing entity, add it). Cross-references are the value of the wiki — be thorough.

### 10. Update `Wiki/index.md`

- Add a row to the appropriate table (Entities / Concepts / Synthesis / Research Sources).
- Use a one-line summary in the same voice as existing rows.
- Bump the stats footer: `N entities · N concepts · N synthesis · N research sources = N pages`.

### 11. Append to `Wiki/log.md`

Single entry, parseable prefix, matching the 2026-04-13 entry shape:

```markdown
## [<YYYY-MM-DD>] ingest | <Title>

**Action:** <one line>

**Sources ingested:**
1. [[<research-page-slug>]] — <one line>

**Pages created:**
- <path>
- …

**Pages updated:**
- <path> — <what changed>
- …

**Notes:** <emergent themes, contradictions surfaced, gaps spotted>
```

### 12. Confirm to user

- Bullet list of paths created and updated.
- 3–5 key-finding bullets.
- One sentence pointing the user to Obsidian to review the graph view.

---

## Mode 2 — Query

### 1. Parse the question.
### 2. Read `Brain/Wiki/index.md` and pick candidate pages.
### 3. Read those pages. Follow `[[wikilinks]]` one hop deeper if the answer requires it.
### 4. If the wiki has insufficient coverage, surface the gap and offer to fall back to Mode 1 (ingest a new source). Do not invent.
### 5. Synthesize an answer with `[[citations]]` to every wiki page used.
### 6. Offer to file the answer

If the answer is non-trivial, ask: *"File this as a Synthesis page?"* On yes:
- Save to `Brain/Wiki/Synthesis/<slug>.md` with full SCHEMA frontmatter (`type: synthesis`).
- Update `Wiki/index.md` (new row in Synthesis table, bump stats).
- Append to `Wiki/log.md` with prefix `## [<YYYY-MM-DD>] query | <question>`.

---

## Mode 3 — Lint

### 1. Walk the wiki

Glob `Brain/Wiki/Entities/*.md`, `Brain/Wiki/Concepts/*.md`, `Brain/Wiki/Synthesis/*.md`. Build a quick adjacency map by scanning `[[wikilink]]` references in each page.

### 2. Report findings (do NOT auto-fix)

Bucketed report. Each finding is one line with the offending path.

- **Orphans** — pages with zero inbound links.
- **Missing pages** — `[[wikilinks]]` pointing to non-existent files.
- **Stale claims** — pages whose `updated:` predates ingests in `log.md` that mention the same entity/concept.
- **Concepts mentioned but no page** — recurring capitalized noun phrases across pages with no corresponding file.
- **Cross-reference gaps** — page A names topic B in plain text without a `[[link]]`.
- **Frontmatter drift** — pages missing `title`, `created`, `updated`, `type`, or `tags`.
- **Data gaps** — concrete factual claims with no `sources:` entry.

### 3. Suggest follow-ups

3–5 research topics or specific sources that would strengthen weak areas of the wiki.

### 4. Append to `Wiki/log.md`

```markdown
## [<YYYY-MM-DD>] lint | summary

- Orphans: N
- Missing pages: N
- Stale claims: N
- Concepts mentioned but no page: N
- Cross-reference gaps: N
- Frontmatter drift: N
- Data gaps: N

**Suggested follow-ups:** …
```

---

## Conventions (enforced on every write)

These mirror `Brain/SCHEMA.md`. SCHEMA wins if the two ever diverge.

- **Absolute paths only**, rooted at `/Users/pavs/agents-brain/Brain/`.
- **Filenames in kebab-case.** Display titles in frontmatter `title:` are Title Case.
- **Every wiki page has full frontmatter:** `title`, `created`, `updated`, `type` ∈ {`entity`, `concept`, `synthesis`, `summary`, `index`, `log`}, `tags` (YAML list, no `#`), `sources` (YAML list of `[[wikilinks]]` or URLs).
- **Cross-references use Obsidian `[[wikilinks]]`**, never markdown links.
- **One concept per page.** Split if a source covers multiple distinct ideas.
- **Updates are additive.** Never delete prior claims. Note contradictions inline with dates.
- **Kebab-cased slugs match filenames** so `[[wikilinks]]` resolve in Obsidian.

## Guardrails

- **`Raw/` is immutable** per SCHEMA. The skill never writes there. Today it does not exist; do not create it.
- **Don't write to `/Users/pavs/agents-brain/knowledge/`.** That's a legacy flat-file directory left for historical reference only.
- **No silent overwrites.** Read existing pages before editing. Preserve all prior content.
- **Source traceability.** Every claim added to a wiki page must be reachable to a `Brain/Research/` page or an external URL via `sources:`.
- **Skip the interactive checkpoint only if the user explicitly says "skip the checkpoint" or "ingest end-to-end".**
- **No edits to `SCHEMA.md`** unless the user explicitly asks.
