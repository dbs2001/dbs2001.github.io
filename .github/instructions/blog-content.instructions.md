---
applyTo: "src/content/blog/**/*.md"
---

# DataSaaz blog editorial instructions

Use `DATASAAZ_PROJECT_CONTEXT.md` as the editorial reference and preserve the established voice of `src/content/blog/ai-assisted-programming-mental-model.md`.

## Frontmatter

Use the existing Astro schema:

```yaml
---
title: "Article title"
description: "Concise article-card and SEO description."
pubDate: 2026-08-15
tags: ["Tag 1", "Tag 2"]
draft: false
featured: false
---
```

`updatedDate` is optional.

Keep descriptions specific to the article and avoid generic AI marketing language.

Keep slugs descriptive, lowercase and stable once published.

## Voice

Write as an experienced engineer explaining what changed in their mental model after confronting a real engineering problem.

The tone should be:

- practical;
- technically precise;
- reflective without becoming autobiographical;
- useful to senior engineers and leads;
- skeptical of unsupported claims;
- clear about where evidence comes from.

First-person framing is welcome when it carries the argument, for example:

```text
My initial assumption was...

That exposed a different problem...

The distinction that helped me was...
```

Do not force first-person language into every paragraph.

## Preferred article movement

For a substantial article, prefer a progression such as:

```text
problem or misconception
        ↓
why it fails in real repositories
        ↓
new mental model
        ↓
concrete pattern
        ↓
example
        ↓
common mistakes
        ↓
exercise or challenge
        ↓
team implication or metric
```

Use numbered headings and a table of contents for long articles when it improves navigation.

Short prerequisite primers may omit the table of contents.

## Examples

Prefer examples that expose architecture or behavior, not decorative snippets.

Useful formats include:

```text
repository trees
call flows
dependency graphs
state transitions
context manifests
change budgets
claim/evidence/failure-scenario structures
```

Use fenced code blocks for prompts, code and structured text.

Use ASCII diagrams when they explain a relationship more directly than prose.

When the concept naturally spans both domains, include a software example and a data-engineering example.

Do not add a second-domain example if it does not clarify the concept.

## Source-derived training articles

When an article is based on a supplied lesson file, the lesson is authoritative.

Preserve, where present:

- the lesson's main concept;
- why it matters;
- when to use it;
- the repository exercise;
- common mistakes;
- advanced challenge;
- related concepts;
- measurable team takeaway;
- concrete examples and terminology.

The blog article may improve narrative flow and formatting, but it must not replace the lesson with an inferred topic.

If the source and an older draft disagree, revise the draft to match the source.

## Evidence language

Keep the distinction between model hypothesis and engineering truth explicit.

Useful patterns include:

```text
CONFIRMED
INFERRED
UNKNOWN
```

or:

```text
CLAIM
EVIDENCE
FAILURE SCENARIO
CONFIDENCE
```

Do not present GPT output as proof when repository evidence, tests, CI or human review should decide the issue.

## Practicality

Whenever the subject supports it, include something the reader can try in a real repository.

Good exercises are:

- bounded;
- measurable;
- safe to run without modifying production systems;
- designed to test the model's understanding, not only its ability to generate code.

Team-level metrics should measure engineering quality rather than raw AI usage. Examples include:

- context recall and precision;
- architecture compliance;
- plan adherence;
- reviewer precision;
- counterexample conversion;
- mutation detection.

## Internal linking

Use internal links in this form:

```text
/blog/<article-id>/
```

If a deeper article assumes a prerequisite idea, link to the primer near the beginning. If useful, link from the primer back to the deeper article.

Do not create a link until the destination article exists.

## Punctuation

Do not use the em dash character `—` anywhere in blog content or frontmatter.

Do not replace it with a plain hyphen as sentence punctuation.

Rewrite naturally with commas, colons, semicolons, parentheses, conjunctions or shorter sentences.

Legitimate compound terms remain hyphenated where standard, including:

- AI-assisted;
- property-based;
- repository-aware;
- source-grounded;
- multi-file;
- data-engineering when used adjectivally.

## Endings

Avoid generic conclusions that merely repeat the introduction.

Prefer one of:

- a measurable takeaway;
- a principle the reader can teach a team;
- a transition into the next concept;
- a link to a prerequisite or deeper article;
- a concrete question that changes how the reader approaches the next engineering task.

## Editorial checks before finishing

Verify:

- the article is faithful to its source material;
- the title matches the actual concept;
- the description is specific;
- headings follow a coherent hierarchy;
- code fences are balanced;
- internal links resolve to existing article IDs;
- no em dash characters remain;
- examples are technically meaningful;
- AI claims are bounded by evidence;
- the article adds practical value beyond a generic explanation.
