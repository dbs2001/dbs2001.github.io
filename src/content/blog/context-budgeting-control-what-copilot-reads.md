---
title: "Control What Copilot Reads Before It Reasons"
description: "Why context budgeting, which constructs the smallest sufficient evidence set, improves repository-aware AI decisions more than simply giving a model more files."
pubDate: 2026-08-11
tags: ["AI-assisted Dev", "GitHub Copilot", "Context Engineering", "Repository Analysis"]
draft: false
featured: false
---

## Table of contents

- [1. More repository context is not automatically better](#1-more-repository-context-is-not-automatically-better)
- [2. Context budgeting is a signal-to-noise problem](#2-context-budgeting-is-a-signal-to-noise-problem)
- [3. Use progressive context expansion](#3-use-progressive-context-expansion)
- [4. Think like a compiler, not a search engine](#4-think-like-a-compiler-not-a-search-engine)
- [5. Architectural relevance matters more than semantic similarity](#5-architectural-relevance-matters-more-than-semantic-similarity)
- [6. Make the agent expose its context boundary](#6-make-the-agent-expose-its-context-boundary)
- [7. Common context failures](#7-common-context-failures)
- [8. Today's repository exercise](#8-todays-repository-exercise)
- [9. Advanced challenge: create a Context Manifest](#9-advanced-challenge-create-a-context-manifest)
- [10. What this changes for engineering leads](#10-what-this-changes-for-engineering-leads)
- [11. Measure context selection, not just generated code](#11-measure-context-selection-not-just-generated-code)
- [12. Where to go next](#12-where-to-go-next)

The first three lessons changed how I thought about AI-assisted development.

First, I stopped treating prompting as the main skill and started thinking about **context**. Then I moved stable engineering knowledge into repository instructions. After that, I turned repeatable tasks into version-controlled prompt files.

The next problem was less obvious:

> **How much repository context should an AI receive for a particular engineering decision?**

My initial instinct was the same one many developers have: more context must be better.

If a model can inspect the whole repository, why would I deliberately give it less?

Because repository work is not only a token-capacity problem. It is a **signal-to-noise problem**.

A large context window can hold more information. It does not tell you which information deserves to be there.

That distinction led me to a useful concept: **context budgeting**.

> **Give the model the smallest sufficient set of evidence required to make the engineering decision correctly.**

That is different from starving the model of context. The objective is not minimal context at any cost. The objective is **high-value context with explicit boundaries**.

## 1. More repository context is not automatically better

Imagine a change to:

```text
src/state/dynamodb.py
```

One approach is to expose the repository indiscriminately:

```text
Entire repository
      │
      ▼
400 source files
old migrations
generated code
documentation
test fixtures
deprecated implementations
      │
      ▼
     GPT
```

Another approach is to construct a working set deliberately:

```text
Requirement
    +
StateStore interface
    +
DynamoDB implementation
    +
Factory / wiring
    +
Caller
    +
Relevant tests
    +
Repository instructions
        │
        ▼
       GPT
```

The second context is dramatically smaller, but it may produce a better engineering decision because the evidence is more authoritative and coherent.

Consider a repository such as:

```text
src/
├── pipeline.py
├── state/
│   ├── interface.py
│   ├── local.py
│   └── dynamodb.py
├── aws/
│   └── client_factory.py
└── config.py

legacy/
└── pipeline_old.py

docs/
└── migration-prototype.md
```

Now ask:

```text
Change state tracking so a file is considered processed
using its SHA-256 checksum.
```

The repository contains several signals:

```text
src/state/interface.py       ← current abstraction
legacy/pipeline_old.py       ← obsolete implementation
docs/migration-prototype.md  ← potentially stale design
```

A senior engineer may immediately know that `legacy/` is non-authoritative and that the prototype document is historical.

The model may not know that unless the repository makes it explicit or the working context is constructed carefully.

This is why larger context windows do not eliminate context engineering.

They increase capacity. They do not automatically increase **relevance**.

## 2. Context budgeting is a signal-to-noise problem

I now think of context as an engineering budget.

Every item in the model's working set should earn its place by helping answer a specific question.

For a state-management change, the important evidence might be:

```text
interface
implementations
construction / factory
callers
configuration
tests
repository constraints
```

The important question is not:

> How many files can Copilot read?

It is:

> **Which files are necessary to understand the system boundary being changed?**

Too little context creates **context starvation**.

Too much unfiltered context creates **context dilution**.

The target sits between them.

## 3. Use progressive context expansion

For consequential changes, I prefer three passes.

### 3.1 Pass 1: Locate

Do not ask for implementation yet.

Ask the model to identify the likely evidence set:

```text
Do not modify anything.

Identify only the files relevant to determining
whether a file has already been processed.

Find:
- interfaces
- implementations
- callers
- factories
- configuration
- tests

Return the relevant files and explain why each matters.
```

Suppose Copilot returns:

```text
src/state/interface.py
src/state/dynamodb.py
src/state/factory.py
src/pipeline.py
tests/state/test_dynamodb.py
```

That is the **candidate context set**.

### 3.2 Pass 2: Verify

Now ask it to challenge that set:

```text
Using these files as the primary context,
search for any additional callers or implementations
that would be affected by changing the state identity.

Specifically look for:
- indirect construction
- dependency injection
- alternate StateStore implementations

Do not modify anything.
```

The context expands because discovered dependencies justify the expansion.

### 3.3 Pass 3: Execute

Only after the working set looks credible do I allow implementation:

```text
Implement SHA-256 based state identity.

Primary implementation context:
- src/state/interface.py
- src/state/dynamodb.py
- src/state/factory.py
- src/pipeline.py
- tests/state/test_dynamodb.py

Do not modify unrelated files.

If implementation requires changing something outside this set,
explain why before doing so.

Preserve the StateStore abstraction.
```

Now the agent has a visible **context boundary** as well as a change boundary.

## 4. Think like a compiler, not a search engine

The naive flow is:

```text
Question
   │
   ▼
Search entire repository
   │
   ▼
Collect similar text
   │
   ▼
Generate answer
```

For code, a better model is closer to dependency traversal:

```text
Requirement
    │
    ▼
Identify symbol / behavior
    │
    ▼
Find interface
    │
    ▼
Find implementations
    │
    ▼
Find construction
    │
    ▼
Find callers
    │
    ▼
Find configuration
    │
    ▼
Find tests
    │
    ▼
Construct working context
    │
    ▼
Reason
```

The repository is not a bag of text. It is a graph of relationships.

## 5. Architectural relevance matters more than semantic similarity

Repository search is useful, but similarity is not the same as authority.

Imagine search retrieves:

```text
docs/old_state_design.md
```

because it contains twenty mentions of "state."

Meanwhile:

```text
src/state/factory.py
```

contains only a few lines but determines which implementation is actually constructed at runtime.

The document may be more semantically similar to the question.

The factory may be more **architecturally relevant**.

> **Semantic relevance ≠ architectural relevance.**

This is why I want agents to trace relationships, not merely return text matches.

## 6. Make the agent expose its context boundary

A useful practice is to ask the model to classify files explicitly:

```text
Starting from StateStore, construct the minimum context
required for safely modifying it.

Trace:
1. definition
2. implementations
3. direct callers
4. indirect callers
5. construction/factory logic
6. configuration
7. tests
8. external dependencies

Classify each discovered file as:
CRITICAL
SUPPORTING
IRRELEVANT

For every CRITICAL file explain exactly why it belongs.
```

This makes **context selection itself reviewable**.

Before asking whether the generated code is good, I can ask whether Copilot identified the correct parts of the system.

## 7. Common context failures

### 7.1 Context dumping

```text
@workspace
Understand everything and fix this.
```

Repository-wide search can be useful, but maximum context by default makes it difficult to know which evidence drove the answer.

### 7.2 Context starvation

Showing only `dynamodb.py` while omitting the interface, factory, caller and tests can produce locally correct code that violates the system design.

### 7.3 Trusting semantic similarity too much

A file can contain similar words while being irrelevant to the runtime path.

### 7.4 Mixing discovery and modification

For significant work, prefer:

```text
DISCOVER
   ↓
VERIFY CONTEXT
   ↓
PLAN
   ↓
MODIFY
```

### 7.5 Treating a large context window as repository knowledge

A context window is capacity.

Repository knowledge is the result of selecting, retrieving and relating the right evidence.

## 8. Today's repository exercise

Pick a repository with enough size that manual inspection is non-trivial.

Choose one important class or interface and ask Copilot:

```text
Do not modify any files.

Starting from <CLASS_OR_INTERFACE>,
construct the minimum context required for safely modifying it.

Trace:
1. definition
2. implementations
3. direct callers
4. indirect callers
5. construction/factory logic
6. configuration
7. tests
8. external dependencies

Classify discovered files as:
CRITICAL
SUPPORTING
IRRELEVANT

For every CRITICAL file explain exactly why it belongs.
Then produce a dependency graph.
Do not propose implementation changes.
```

Compare the **CRITICAL** set with the files you would have chosen yourself.

You are evaluating Copilot's repository understanding before asking it to generate code.

## 9. Advanced challenge: create a Context Manifest

For a meaningful change, ask Copilot to produce a formal manifest:

```text
CONTEXT MANIFEST

Requirement:
Use SHA-256 to identify processed files.

Authoritative:
src/state/interface.py
src/state/dynamodb.py
src/state/factory.py

Callers:
src/pipeline.py

Tests:
tests/state/test_dynamodb.py
tests/test_pipeline.py

Supporting:
config.json

Excluded:
legacy/pipeline_old.py
docs/migration-prototype.md

Unknown:
Whether another application directly consumes
the DynamoDB state table.
```

Then add a gate:

```text
Do not implement until every UNKNOWN that could affect
backward compatibility has been investigated.
```

This forces the agent to expose what evidence it is using and what important uncertainty remains.

## 10. What this changes for engineering leads

At team level, context budgeting is not about teaching developers to manually attach the perfect files every time.

The broader goal is to make repository-aware workflows better at selecting their own evidence.

That means improving module boundaries, interface discoverability, test organization, repository instructions, architecture-document quality and dead-code hygiene.

An AI-friendly repository is often simply a repository whose architecture is easier to discover.

## 11. Measure context selection, not just generated code

Take five completed changes where you already know the correct affected context.

Give Copilot only the requirement and ask it to construct the **CRITICAL** set.

Measure:

```text
Context recall =
correct required files identified
─────────────────────────────────
actual required files
```

and:

```text
Context precision =
correct required files identified
─────────────────────────────────
all files marked CRITICAL
```

Recall asks whether the agent missed something important.

Precision asks whether it pulled unnecessary noise into the working set.

The target is **high recall with a small, authoritative context set**.

## 12. Where to go next

The progression is now:

```text
Context engineering
        ↓
Repository instructions
        ↓
Reusable prompt workflows
        ↓
Context budgeting
```

The next change is more consequential.

Instead of only asking the model to reason, we let an agent act: inspect files, edit code, run commands, react to failures and iterate.

That increases leverage, but also blast radius.

The next lesson therefore moves from **controlled context** to **controlled agency**.