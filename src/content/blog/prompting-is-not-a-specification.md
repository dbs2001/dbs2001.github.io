---
title: "The Prompt Is Not the Specification"
description: "Why useful AI-assisted engineering starts by turning vague requests into bounded tasks with context, constraints, acceptance criteria and validation."
pubDate: 2026-08-08
tags: ["AI-assisted Dev", "GitHub Copilot", "Prompt Engineering", "Engineering Practice"]
draft: false
featured: false
---

## Table of contents

- [1. The first mistake: treating the prompt like a magic incantation](#1-the-first-mistake-treating-the-prompt-like-a-magic-incantation)
- [2. A coding request is really an engineering contract](#2-a-coding-request-is-really-an-engineering-contract)
- [3. The five parts of a useful task](#3-the-five-parts-of-a-useful-task)
- [4. Start by asking the agent to understand before it changes](#4-start-by-asking-the-agent-to-understand-before-it-changes)
- [5. Separate intent from implementation](#5-separate-intent-from-implementation)
- [6. Acceptance criteria are more valuable than adjectives](#6-acceptance-criteria-are-more-valuable-than-adjectives)
- [7. Validation belongs inside the task](#7-validation-belongs-inside-the-task)
- [8. A practical prompt pattern for real repositories](#8-a-practical-prompt-pattern-for-real-repositories)
- [9. Common failure modes](#9-common-failure-modes)
- [10. What this changes for engineering teams](#10-what-this-changes-for-engineering-teams)
- [11. A repository exercise](#11-a-repository-exercise)
- [12. Where to go next](#12-where-to-go-next)

When I first started using coding assistants seriously, I assumed better results would come from learning better prompts.

That is partly true.

Clear instructions help. Ambiguous requests produce ambiguous results. But the more I used AI inside real repositories, the less useful the phrase **prompt engineering** felt on its own.

The important shift was this:

> **A prompt for software engineering is not a clever sentence. It is a compact engineering specification.**

That distinction changes how you work with GitHub Copilot, coding agents and LLMs generally.

If the task contains no scope, no constraints and no definition of done, a powerful model can still produce a polished solution to the wrong problem.

## 1. The first mistake: treating the prompt like a magic incantation

A weak request often looks like this:

```text
Refactor this service to make it better.
```

There is nothing technically wrong with the English. The problem is that almost every engineering decision is unspecified.

What does *better* mean?

- lower latency?
- fewer dependencies?
- easier testing?
- smaller classes?
- clearer ownership?
- no public API changes?
- no database migration?

An experienced engineer automatically asks these questions before changing a production system. An AI agent needs the same boundaries.

The model cannot recover requirements that were never expressed.

## 2. A coding request is really an engineering contract

A useful agent task establishes a contract between the engineer and the system.

At minimum, it should answer:

```text
What are we trying to achieve?
        ↓
What part of the system is in scope?
        ↓
What must remain unchanged?
        ↓
What evidence proves the task is complete?
```

For example:

```text
Introduce a DynamoDB-backed StateStore implementation.

Scope:
- implement behind the existing StateStore interface;
- keep the local-file implementation;
- add configuration that selects the implementation.

Constraints:
- do not change the public interface;
- do not change unrelated modules;
- preserve existing local behavior.

Validation:
- add unit tests for the new implementation;
- run the existing StateStore tests;
- run the project build before finishing.
```

This is not longer because AI needs ceremony.

It is longer because the task contains real engineering information.

## 3. The five parts of a useful task

I now think of a strong AI engineering task as having five parts.

### 3.1 Objective

What outcome do we want?

```text
Add a second persistence implementation for application state.
```

### 3.2 Context

What should the agent inspect before deciding how to work?

```text
Start from the StateStore interface, its current implementation,
configuration loading and the tests around state persistence.
```

### 3.3 Constraints

What boundaries must not be crossed?

```text
Do not alter the public interface.
Do not remove the local implementation.
Do not introduce a new dependency unless necessary.
```

### 3.4 Acceptance criteria

What observable behavior must be true?

```text
Configuration can select either implementation.
Existing local-state behavior remains unchanged.
The new implementation has automated tests.
```

### 3.5 Validation

What should the agent run or inspect before claiming success?

```text
Run the relevant unit tests and the normal repository build.
Report anything you could not validate.
```

This pattern is simple enough to use every day and strong enough to scale to multi-file work.

## 4. Start by asking the agent to understand before it changes

One of the highest-leverage habits is separating **repository understanding** from **repository modification**.

Before asking for a large change, ask questions such as:

```text
Trace how state persistence currently works.
Identify the interface, implementations, configuration path and tests.
Do not change any files yet.
```

This gives you a chance to inspect the model's mental model before it starts editing.

If the analysis is wrong, correcting the misunderstanding is cheap.

If the agent has already modified twelve files based on the wrong assumption, correction becomes expensive.

A useful workflow is therefore:

```text
UNDERSTAND
   ↓
PLAN
   ↓
EXECUTE
   ↓
VALIDATE
```

rather than:

```text
ASK
   ↓
GENERATE A LOT OF CODE
   ↓
HOPE
```

## 5. Separate intent from implementation

Experienced engineers often know *how* they would implement a change, so it is tempting to prescribe every step to the model.

Sometimes that is correct. Sometimes it prevents the agent from finding a simpler solution already supported by the repository.

Compare:

```text
Create a new AbstractFactory class, add a singleton provider,
then use it to instantiate the storage implementation.
```

with:

```text
Allow configuration to select the existing local store or a new
DynamoDB-backed store. Preserve the current public interfaces and follow
the repository's existing construction pattern.
```

The second version communicates intent and constraints while allowing the agent to inspect the codebase before choosing mechanics.

That is usually closer to how I would delegate work to an experienced engineer.

## 6. Acceptance criteria are more valuable than adjectives

AI prompts often contain words such as:

- clean;
- robust;
- scalable;
- production-ready;
- elegant.

These words sound useful but are difficult to verify.

Prefer observable conditions.

Instead of:

```text
Make the parser robust.
```

use:

```text
The parser must reject malformed headers, preserve the current behavior
for valid files and include tests for empty input, duplicate headers and
invalid encoding.
```

Now the model has something concrete to satisfy, and the reviewer has something concrete to verify.

## 7. Validation belongs inside the task

A coding agent that can run tools should not stop at generating code.

If the repository already has tests, linters, type checks or build commands, they are part of the engineering loop.

The task should say so.

```text
After making the change:
1. run the focused unit tests;
2. run the normal build;
3. fix failures caused by your change;
4. report any failures that appear unrelated rather than hiding them.
```

The important idea is:

> **Generated code is an intermediate artifact. Validated behavior is the outcome.**

This becomes even more important as coding assistants become more agentic.

## 8. A practical prompt pattern for real repositories

Here is the pattern I now use for non-trivial repository work:

```text
Goal
----
<what outcome should exist when this is finished?>

Inspect first
-------------
<which parts of the repository should be understood before editing?>

Constraints
-----------
<what must not change? what boundaries matter?>

Acceptance criteria
-------------------
<what observable behavior must be true?>

Validation
----------
<what tests/build/checks should be run?>

Working style
-------------
Keep the change narrow. Follow existing repository patterns. Do not
modify unrelated files. If an assumption is uncertain, identify it
rather than silently inventing architecture.
```

This is not a mandatory template. The value is the thinking behind it.

## 9. Common failure modes

### 9.1 Giving only the desired implementation

The agent follows your prescribed mechanics even when the repository already has a better pattern.

### 9.2 Giving only the desired outcome

The agent has too much freedom and makes architectural decisions you never intended to delegate.

### 9.3 Omitting negative constraints

The model changes public interfaces, dependencies or unrelated modules because nobody told it those boundaries mattered.

### 9.4 Asking for too much at once

A task combines architecture redesign, migration, implementation, tests and documentation into one giant request. Review quality collapses because too many decisions move together.

### 9.5 Trusting a success statement

The agent says the task is complete, but no build or test was actually executed.

A useful rule is:

> **Never confuse a confident summary with evidence.**

## 10. What this changes for engineering teams

At team scale, this stops being an individual prompting technique.

Teams can standardize how AI-assisted changes are framed:

- state the objective;
- identify relevant context;
- preserve architectural boundaries;
- define acceptance criteria;
- require validation;
- keep diffs narrow enough for human review.

That creates a shared engineering workflow rather than seven developers inventing seven different styles of AI delegation.

The interesting part is that these practices are good even without AI.

AI simply exposes how much engineering intent was previously implicit.

## 11. A repository exercise

Pick one real task from a repository you know well. Do not choose a toy problem.

Try it in three stages.

First, ask the coding assistant:

```text
Explain how this part of the system works. Do not modify files.
```

Second, ask for a plan:

```text
Propose the smallest change that achieves <goal> while preserving
<constraints>. Identify the files you expect to change and why.
```

Third, give the execution contract:

```text
Implement the agreed change. Satisfy these acceptance criteria: ...
Run these validations: ...
Do not modify unrelated files.
```

Then compare the result with what you would have received from a one-line request.

The measurable takeaway is simple:

> **Before delegating a non-trivial task to AI, you should be able to name the objective, scope, constraints, acceptance criteria and validation path.**

## 12. Where to go next

Once tasks are better specified, the next limitation becomes obvious.

You still have to repeat the same repository facts again and again:

- architecture rules;
- testing conventions;
- preferred commands;
- naming standards;
- files that should not be touched;
- team-specific engineering expectations.

That knowledge should not live in every prompt.

The next step is to make the repository itself a source of durable instructions for the coding assistant.