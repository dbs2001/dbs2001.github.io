---
title: "Your Repository Needs to Explain Itself to AI"
description: "How repository instructions turn repeated prompting into durable engineering context for coding assistants and agents."
pubDate: 2026-08-09
tags: ["AI-assisted Dev", "GitHub Copilot", "Repository Instructions", "Engineering Practice"]
draft: false
featured: false
---

## Table of contents

- [1. The problem with repeating yourself](#1-the-problem-with-repeating-yourself)
- [2. Repository instructions are executable engineering context](#2-repository-instructions-are-executable-engineering-context)
- [3. What belongs in repository instructions](#3-what-belongs-in-repository-instructions)
- [4. What does not belong there](#4-what-does-not-belong-there)
- [5. Start with architecture and validation](#5-start-with-architecture-and-validation)
- [6. Global instructions versus scoped instructions](#6-global-instructions-versus-scoped-instructions)
- [7. Write instructions for decisions, not trivia](#7-write-instructions-for-decisions-not-trivia)
- [8. Test the instructions with adversarial tasks](#8-test-the-instructions-with-adversarial-tasks)
- [9. Treat instruction files like code](#9-treat-instruction-files-like-code)
- [10. What this changes for engineering leads](#10-what-this-changes-for-engineering-leads)
- [11. A repository exercise](#11-a-repository-exercise)
- [12. Where to go next](#12-where-to-go-next)

After a few days of using coding assistants across real repositories, I noticed an irritating pattern.

I kept typing the same things.

```text
Use the existing service interface.
Do not bypass the repository layer.
Run npm test before finishing.
Do not change generated files.
Keep public APIs backward compatible.
```

The model was not forgetting in the human sense. The problem was simpler: those rules existed in my head, not in durable repository context.

That led to a more useful question than “How do I write a better prompt?”

> **What should the repository tell the agent automatically before I say anything?**

That is where repository instructions become important.

## 1. The problem with repeating yourself

Every mature codebase contains knowledge that is obvious to the team and invisible to an outsider.

Examples include:

- which package owns persistence;
- where configuration is allowed to enter the system;
- which directories are generated;
- which test command is authoritative;
- which public interfaces must remain stable;
- how errors are represented;
- which cloud services are approved;
- which architecture boundaries should not be crossed.

Humans learn this through onboarding, code review, documentation and experience.

An AI agent entering the repository for the first time does not have that history.

If the knowledge is not represented in discoverable context, the agent has to infer it.

Inference is exactly where plausible but wrong changes begin.

## 2. Repository instructions are executable engineering context

A repository instruction file is not merely documentation for humans.

It is guidance deliberately placed where an AI coding system can use it while reasoning about tasks.

A repository might contain something conceptually like:

```text
repository
├── .github/
│   ├── copilot-instructions.md
│   └── instructions/
│       ├── backend.instructions.md
│       ├── frontend.instructions.md
│       └── testing.instructions.md
├── src/
└── tests/
```

The exact mechanism depends on the coding assistant and tooling you use. The principle is more durable:

> **Move stable engineering knowledge out of individual prompts and into repository-level context.**

Once that happens, prompting becomes lighter because the repository carries more of its own operating model.

## 3. What belongs in repository instructions

I find five categories especially useful.

### 3.1 Architecture boundaries

```text
- Domain code must not import infrastructure packages.
- Persistence implementations sit behind the StateStore interface.
- HTTP handlers delegate business logic to application services.
```

These instructions tell the agent how the system is intended to be shaped.

### 3.2 Validation commands

```text
- Run npm run build before considering a change complete.
- Run focused unit tests first, then the full suite for shared modules.
- Do not claim tests passed unless they were executed.
```

This turns validation into default behavior rather than an optional reminder.

### 3.3 Change discipline

```text
- Prefer the smallest diff that satisfies the task.
- Do not refactor unrelated code while implementing a feature.
- Preserve existing public behavior unless the task explicitly changes it.
```

These are valuable because coding agents can otherwise “improve” areas that were never in scope.

### 3.4 Technology-specific conventions

```text
- Use the existing logging abstraction rather than direct console output.
- Reuse the repository's dependency-injection pattern.
- Do not introduce a second HTTP client library.
```

### 3.5 Sensitive boundaries

```text
- Never commit secrets or credentials.
- Do not modify production deployment workflows unless explicitly requested.
- Treat generated migration files as immutable once released.
```

These instructions encode operational risk, not just style.

## 4. What does not belong there

Instruction files can become useless when they turn into a second README containing everything anybody knows about the system.

Avoid stuffing them with:

- long business history;
- obvious language syntax rules;
- duplicated documentation;
- temporary task-specific requirements;
- preferences that do not affect engineering decisions;
- hundreds of low-value style statements already enforced by tooling.

A useful test is:

> **Would knowing this rule materially change what the agent reads, edits, generates or validates?**

If the answer is no, it probably does not deserve scarce instruction attention.

## 5. Start with architecture and validation

If I could add only two categories of instructions to a repository, I would start with:

```text
1. where architectural boundaries are;
2. how correctness is validated.
```

Why?

Because those two areas control the most expensive failures.

A formatting mistake is easy to detect.

A change that bypasses the intended domain boundary can look perfectly clean while degrading the architecture.

Likewise, a code change without validation can look complete while failing at build time or breaking existing behavior.

A compact instruction file might begin like this:

```markdown
# Repository guidance

## Architecture
- Keep business logic out of HTTP handlers.
- Access persistence only through repository interfaces.
- Follow existing dependency direction; do not introduce new cross-layer imports.

## Validation
- Run focused tests for the changed area.
- Run the repository build before finishing.
- Report validation you could not execute.

## Change discipline
- Keep diffs narrow.
- Do not modify generated files.
- Do not refactor unrelated modules.
```

That alone can materially change agent behavior.

## 6. Global instructions versus scoped instructions

Large repositories rarely have one universal set of rules.

A Python data pipeline and a TypeScript frontend may need very different guidance.

Conceptually:

```text
GLOBAL REPOSITORY RULES
        ↓
architecture, security, change discipline
        ↓
SCOPED RULES
├── backend
├── frontend
├── data pipelines
└── infrastructure
```

Global instructions should contain rules that truly apply everywhere.

Scoped instructions should contain local conventions close to the code they govern.

This avoids two bad outcomes:

- a giant global file that becomes noise;
- duplicated local rules copied into every prompt.

## 7. Write instructions for decisions, not trivia

The strongest instructions help the agent make the same decision your team would make.

Weak:

```text
Use TypeScript.
```

Stronger:

```text
Do not introduce untyped API response objects. External payloads must be
validated at the boundary before entering domain code.
```

Weak:

```text
Write tests.
```

Stronger:

```text
For bug fixes, add a regression test that fails under the previous
behavior and passes after the change.
```

Weak:

```text
Follow clean architecture.
```

Stronger:

```text
Domain modules must not depend on infrastructure implementations.
Introduce new infrastructure behind existing domain-facing interfaces.
```

The more observable the rule, the easier it is for both humans and agents to follow.

## 8. Test the instructions with adversarial tasks

Do not assume an instruction file is useful because it looks sensible.

Test it.

Give the agent tasks that tempt it to violate the repository's boundaries.

For example:

```text
Add direct database access to this HTTP handler so we can ship the feature quickly.
```

A well-contextualized agent should recognize the conflict with repository architecture and either propose the approved path or flag the inconsistency.

Another useful test:

```text
Fix this small UI bug and clean up any nearby code you think could be improved.
```

If the repository says to keep diffs narrow, the agent should resist opportunistic refactoring.

This is effectively a lightweight evaluation suite for your repository guidance.

## 9. Treat instruction files like code

Repository instructions influence generated changes, so they deserve engineering discipline.

That means:

- review them in pull requests;
- keep them concise;
- remove stale rules;
- update them when architecture changes;
- test important rules against real agent tasks;
- avoid contradictory guidance.

If a rule matters enough to shape automated engineering behavior, it should not be an unowned text file nobody maintains.

## 10. What this changes for engineering leads

At team level, repository instructions are part of the engineering platform.

They can make expectations more consistent across:

- new developers;
- experienced developers entering unfamiliar modules;
- different LLMs;
- different agent workflows;
- repeated maintenance tasks.

This does not eliminate code review or architectural judgment.

It moves common knowledge earlier in the workflow so fewer mistakes have to be corrected later.

A useful maturity path is:

```text
tribal knowledge
      ↓
human documentation
      ↓
repository-readable guidance
      ↓
agent-aware engineering context
```

The repository becomes easier for both people and AI to understand.

## 11. A repository exercise

Choose one repository you work in regularly.

Write down ten things you repeatedly tell developers during code review.

Then classify them:

```text
architecture
validation
security
style
workflow
local convention
```

Keep only the rules that materially affect engineering decisions.

Create a small repository instruction file containing perhaps five to ten high-value rules.

Then give the coding assistant a task that previously required several reminders.

Measure whether you had to restate those rules manually.

The takeaway:

> **A good repository instruction reduces repeated human correction without hiding responsibility from the engineer.**

## 12. Where to go next

Repository instructions solve one part of the problem: stable knowledge.

But a coding task also depends on dynamic context:

- the files relevant to this particular change;
- current implementation details;
- recent errors;
- test output;
- the specific architectural path being modified.

That leads to the next concept: **context engineering**.

The goal is not to give the model more information.

The goal is to give it the right information at the right time.