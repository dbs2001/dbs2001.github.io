# DataSaaz repository instructions

Read `DATASAAZ_PROJECT_CONTEXT.md` before making material changes. Treat the current repository code as the technical source of truth.

## Project intent

DataSaaz is an AI-assisted engineering advisory, training and thought-leadership site for software and data engineering audiences.

Preserve the current lightweight Astro architecture and the existing Astroplate-derived design. Do not introduce new frameworks, redesign the site or expand infrastructure unless the task requires it.

## Scope discipline

Before editing:

1. identify the files required for the task;
2. inspect the relevant implementation and nearby conventions;
3. keep the change inside the requested scope;
4. avoid unrelated refactors or cleanup.

If a content task can be completed entirely under `src/content/blog/` or `src/pages/`, do not modify analytics, deployment, styles or framework configuration.

## Technical conventions

Current stack:

- Astro 7;
- TypeScript;
- Tailwind CSS 4;
- Astro content collections;
- GitHub Pages;
- production domain `https://blog.datasaaz.com`.

The brand accent is `#740601` and is defined in the current style layer. Preserve existing layout, typography and responsive behavior unless the task explicitly changes design.

Blog content schema is defined in `src/content.config.ts`. Do not invent unsupported frontmatter fields without updating the schema deliberately.

## Validation

Use:

```bash
npm run build
```

before claiming a repository change is fully validated.

The command runs `astro check` and `astro build`.

Do not report a successful build unless the command actually completed successfully. If local execution is unavailable, state the limitation.

For content work, also check internal links, frontmatter, Markdown fences and heading structure.

## Editorial source grounding

When content is derived from user-provided lessons, transcripts, notes or files:

- treat those materials as authoritative for that article;
- preserve their actual concept and progression;
- do not replace source-specific content with a reconstructed curriculum;
- distinguish CONFIRMED source content from inference when necessary;
- use external knowledge only when requested or clearly needed, and keep it distinct from source-derived claims.

## Writing style shared across pages and articles

Use a precise, practitioner-led engineering voice.

Prefer:

- concrete examples;
- explicit tradeoffs;
- observable failure modes;
- practical mental models;
- clear distinctions between similar concepts;
- concise paragraphs;
- measured language rather than hype.

Do not use the em dash character `—` in prose, headings, descriptions or frontmatter.

Do not replace it mechanically with `-`. Rewrite with commas, colons, semicolons, parentheses, conjunctions or shorter sentences.

Legitimate hyphenated compound words such as `AI-assisted`, `property-based`, `repository-aware` and `multi-file` are valid.

## Site copy

Pages under `src/pages/` should present DataSaaz as an engineering advisory and training company, not a generic AI vendor.

Keep the positioning centered on:

- engineering outcomes;
- developer and lead capability;
- repository and context readiness;
- safe and bounded agentic workflows;
- software and data engineering practice;
- architecture, testing, review and governance.

Avoid unsupported claims about customer outcomes, adoption scale, certifications or commercial traction.

## Analytics and privacy

Do not broaden tracking as part of unrelated work.

The current production analytics client sends page path, referrer and UTM fields and omits credentials.

Do not introduce raw IP collection, fingerprinting or hidden personal identifiers without an explicit analytics/privacy requirement and review.

## Git and pull requests

Prefer atomic commits for one conceptual change.

Do not merge pull requests unless explicitly asked.

When the scope of an open PR changes materially, update its description so reviewers can understand the current change set.

Do not claim checks or build validation that were not actually run.
