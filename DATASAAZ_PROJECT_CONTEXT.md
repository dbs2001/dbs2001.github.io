# DataSaaz Blog Project Context

Last updated: 2026-08-15

This file is the durable project brief for humans and AI assistants working on the DataSaaz blog repository. Use it together with the repository code. For technical details, the current repository state is authoritative.

## 1. What DataSaaz is

DataSaaz is an engineering advisory and training company focused on helping software and data teams adopt AI-assisted engineering deliberately.

The core positioning is not generic AI consulting and not a news publication. DataSaaz focuses on practical engineering transformation:

- AI-assisted software and data engineering;
- developer and technical-lead enablement;
- repository readiness and context engineering;
- bounded agentic workflows;
- testing, review, validation and engineering controls;
- architecture, data platforms and delivery practices that make AI assistance safer and more useful.

The blog is both a thought-leadership publication and a practical learning resource. It should demonstrate engineering depth before asking readers to trust DataSaaz for advisory or training work.

## 2. Primary audience

Write primarily for:

- senior software engineers;
- data engineers;
- technical leads;
- engineering managers;
- platform and architecture leaders;
- teams introducing GitHub Copilot, LLMs and coding agents into real repositories.

Assume the reader is technically capable but may be new to modern AI-assisted engineering concepts.

Do not oversimplify the engineering problem. Explain unfamiliar AI concepts through software-engineering mental models, concrete repository examples and observable failure modes.

## 3. Source-of-truth order

When producing or revising content, use this order of authority:

1. The current repository code for technical implementation details.
2. User-provided lesson files, notes, transcripts or other source material for source-derived articles.
3. Existing published DataSaaz articles for editorial voice and formatting conventions.
4. External research or general model knowledge only when the task requires it.

When an article is based on a supplied training lesson, preserve the lesson's actual concept, examples, exercise, mistakes, challenge and measurement. Do not silently reconstruct a lesson from a curriculum outline when the original lesson exists.

If source material is missing, label an inferred structure as inference instead of presenting it as the original lesson.

## 4. Editorial voice

The preferred DataSaaz voice is practitioner-led, precise and reflective.

Use:

- first-person learning where it genuinely helps explain a shift in mental model;
- direct explanations of why a concept matters in real repositories;
- concrete engineering examples rather than abstract claims;
- explicit distinctions between concepts that are commonly conflated;
- measured claims rather than hype;
- practical language suitable for engineers and technical leaders;
- short paragraphs that make long technical articles easy to scan.

Typical narrative movement:

```text
initial assumption
      ↓
problem or failure mode
      ↓
new mental model
      ↓
concrete engineering pattern
      ↓
repository exercise
      ↓
team-level implication or metric
```

Avoid:

- generic AI enthusiasm;
- exaggerated productivity claims;
- marketing language without engineering substance;
- invented business requirements;
- unexplained jargon;
- treating an LLM as an authority when repository evidence or tests should decide the question.

## 5. Punctuation and prose conventions

Do not use Unicode U+2014 as sentence punctuation in DataSaaz prose, headings, descriptions or frontmatter.

Do not mechanically replace it with a hyphen. Rewrite the sentence naturally with:

- a comma;
- a colon;
- a semicolon;
- parentheses;
- `and`, `but`, `because`, `while`, `so` or another suitable conjunction;
- two shorter sentences.

Legitimate hyphenated compound words remain valid, for example:

- AI-assisted;
- property-based;
- repository-aware;
- source-derived;
- multi-file.

Existing named sequences that intentionally use another separator may remain when editorially appropriate.

Prefer sentence punctuation that reads naturally instead of decorative punctuation.

## 6. Long-form article structure

For substantial technical articles, use the established DataSaaz pattern when it improves clarity:

1. Astro frontmatter.
2. Table of contents.
3. A strong opening that introduces the problem or mental-model shift.
4. Numbered sections with descriptive headings.
5. Concrete code, repository or data examples.
6. ASCII or text diagrams when they explain architecture, flow or reasoning better than prose.
7. Common mistakes or failure modes.
8. A repository exercise or practical task.
9. An advanced challenge when useful.
10. Team-lead or organizational implications.
11. A measurable takeaway when the subject supports one.
12. A short transition to the next related concept.

Do not force every section into every article. The structure should serve the concept.

## 7. Short primer structure

Use a shorter format for prerequisite mental-model articles.

A good primer should usually:

- define the concept quickly;
- distinguish it from the nearest confusing concept;
- use one or two concrete examples;
- include a compact mental model;
- state an important boundary or caveat;
- end with a one-sentence takeaway or link to the deeper article.

A short primer does not require a table of contents when the article is easy to scan without one.

The invariant-discovery primer is the current reference pattern for this format.

## 8. Software and data examples

DataSaaz serves both software and data engineering audiences.

When a concept applies naturally to both domains, include examples from both rather than presenting AI-assisted engineering as only application-code work.

Useful software examples include:

- interfaces and adapters;
- dependency injection;
- state management;
- parsers and serializers;
- API behavior;
- concurrency and retries;
- repository refactoring.

Useful data examples include:

- deduplication;
- idempotent pipelines;
- schema evolution;
- data quality invariants;
- batch state progression;
- key and grain preservation;
- transformations and validation.

Do not add a data example merely for symmetry. It should clarify the concept.

## 9. Internal linking and daily lesson navigation

Use internal links to make the content corpus behave like a learning path.

Use repository-relative blog URLs:

```text
/blog/<article-id>/
```

When an article depends on a prerequisite concept, place the prerequisite link near the beginning, before the table of contents when that is the clearest reader experience.

Where useful, link back from the primer to the deeper article.

Do not create links to articles that do not exist in the repository.

The source-grounded daily training series uses explicit day numbering in each article title:

```text
Day 1 : <lesson title>
Day 2 : <lesson title>
...
```

Every published daily lesson except the current latest lesson must end with a direct link to the next lesson:

```markdown
**Next lesson:** [Day N+1 : <next lesson title>](/blog/<next-article-id>/)
```

The current latest lesson should not link to a nonexistent article. It may state that it is the latest lesson and that the next link will be added when the next lesson is published. When a new lesson is added, update the previous latest lesson to link forward to it.

Supporting primers and the flagship mental-model article are not part of the Day numbering unless explicitly promoted into the daily training sequence.

## 10. Current editorial corpus

The flagship article is:

```text
src/content/blog/ai-assisted-programming-mental-model.md
```

It remains the primary reference for the long-form DataSaaz voice and is currently the featured article.

The source-grounded AI-assisted engineering training sequence is:

```text
Day 1 : context-engineering-stop-prompting-start-controlling-context.md
Day 2 : repository-instructions-for-ai-agents.md
Day 3 : prompt-files-version-controlled-engineering-workflows.md
Day 4 : context-budgeting-control-what-copilot-reads.md
Day 5 : plan-execute-verify-bounded-agency.md
Day 6 : adversarial-ai-verification.md
Day 7 : property-based-ai-testing.md
Day 8 : eval-driven-ai-engineering.md
```

Supporting prerequisite primer:

```text
invariant-discovery-and-property-based-testing.md
```

Conceptual progression:

```text
Context engineering
        ↓
Persistent repository instructions
        ↓
Reusable prompt workflows
        ↓
Context budgeting
        ↓
Bounded agent execution
        ↓
Adversarial verification
        ↓
Invariant discovery and property-based testing
        ↓
Evaluation engineering
```

Preserve this sequence when adding cross-links or references unless the curriculum itself changes.

## 11. Astro content conventions

Blog posts live under:

```text
src/content/blog/
```

The current content schema requires:

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

Supported optional field:

```yaml
updatedDate: 2026-08-15
```

The Markdown filename becomes the article ID and URL slug.

Keep slugs descriptive, lowercase and stable once published.

For daily training lessons, use the visible title format `Day N : <lesson title>` while keeping the slug focused on the concept rather than the day number. This allows the chronology to remain visible without making URLs brittle.

Only one article should normally be `featured: true` unless the rendering logic is intentionally changed.

## 12. Technical baseline

Current implementation:

- Astro 7;
- TypeScript;
- Tailwind CSS 4 through Vite;
- Astro content collections;
- GitHub Pages deployment;
- RSS feed;
- sitemap generation;
- custom production domain `https://blog.datasaaz.com`.

The DataSaaz brand accent is `#740601`. Preserve the existing Astroplate-derived layout and design unless a task explicitly requires a design change.

Avoid broad redesigns or framework migrations for content tasks.

## 13. Analytics and privacy

The production client sends page-view analytics only on `blog.datasaaz.com`.

The client payload currently contains:

- page path;
- referrer;
- UTM source;
- UTM medium;
- UTM campaign.

Requests omit credentials.

Do not add raw IP collection, fingerprinting, hidden personal identifiers or unnecessary tracking as part of ordinary blog work.

Changes to analytics should be treated as a separate technical/privacy task, not bundled into editorial work.

## 14. Validation requirements

The production validation command is:

```bash
npm run build
```

It runs Astro checking and the production build.

Before claiming a technical or content change is fully validated, run the build successfully.

If the environment prevents running it, state that clearly. Do not imply a build passed when it was not executed.

For editorial changes, also verify:

- frontmatter conforms to the content schema;
- internal links point to existing article IDs;
- daily lesson numbering remains sequential;
- every non-latest daily lesson links directly to the next lesson;
- the latest daily lesson does not link to a nonexistent future article;
- Markdown fences are balanced;
- headings are coherent;
- no accidental U+2014 characters remain;
- changed articles remain readable on narrow screens where possible.

## 15. Change-management rules

Prefer small, reviewable changes.

For repository work:

- inspect before modifying;
- keep changes inside the requested scope;
- use atomic commits when a set of files represents one conceptual change;
- avoid unrelated cleanup;
- preserve existing architecture and styling unless the user asks to change them;
- update PR descriptions when the scope materially changes;
- do not merge a pull request without explicit authorization.

If a task is content-only, do not modify framework, analytics, deployment or styles unless required by the content change.

## 16. Strategic content direction

The site already has a stable technical and visual foundation. Near-term value should come primarily from:

- a coherent thought-leadership corpus;
- useful internal learning paths;
- software and data engineering depth;
- practical exercises and measurable techniques;
- stronger evidence of DataSaaz expertise;
- clearer paths from useful content to advisory and training conversations.

Prefer adding depth, evidence and practical utility over broad visual redesign.
