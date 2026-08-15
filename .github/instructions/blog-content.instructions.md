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

For source-grounded daily training lessons, use the visible title format:

```text
Day N : <lesson title>
```

Keep the slug focused on the concept rather than the day number so URLs remain stable if chronology changes.

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

If the source file contains a day number that conflicts with the established repository chronology, preserve the lesson content but use the repository's sequential Day numbering unless the user explicitly asks to preserve the source number.

## Daily lesson navigation

Treat the numbered training articles as a continuous learning path.

Every published lesson except the latest one must end with a direct forward link:

```markdown
**Next lesson:** [Day N+1 : <next lesson title>](/blog/<next-article-id>/)
```

When adding a new lesson:

1. assign the next sequential `Day N :` title;
2. add the new article with a concept-focused slug;
3. update the previous latest lesson so it links to the new lesson;
4. keep all earlier forward links intact;
5. update any supporting primer whose visible link text uses an older lesson title;
6. leave the new latest lesson without a fake future link.

The latest lesson may end with:

```text
**Next lesson:** This is currently the latest lesson in the series. The next lesson will be linked here when it is published.
```

Supporting primers and the flagship mental-model article are not Day-numbered unless explicitly added to the daily curriculum.

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
- mutation detection;
- AI Engineering Success Rate.

## Internal linking

Use internal links in this form:

```text
/blog/<article-id>/
```

If a deeper article assumes a prerequisite idea, link to the primer near the beginning. If useful, link from the primer back to the deeper article.

Do not create a link until the destination article exists.

## Punctuation

Do not use Unicode U+2014 as sentence punctuation anywhere in blog content or frontmatter.

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

For Day-numbered training lessons, the explicit `Next lesson` navigation rule takes precedence over a generic closing transition.

## Editorial checks before finishing

Verify:

- the article is faithful to its source material;
- the title matches the actual concept;
- Day numbering is sequential for daily training lessons;
- every non-latest daily lesson links directly to the next lesson;
- the latest daily lesson does not link to a nonexistent future article;
- the description is specific;
- headings follow a coherent hierarchy;
- code fences are balanced;
- internal links resolve to existing article IDs;
- no U+2014 characters remain;
- examples are technically meaningful;
- AI claims are bounded by evidence;
- the article adds practical value beyond a generic explanation.
