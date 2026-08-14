---
title: "Context Engineering Matters More Than Prompt Tricks"
description: "A practical way to think about context selection, repository understanding and feedback loops when using coding agents on real software."
pubDate: 2026-08-10
tags: ["AI-assisted Dev", "Context Engineering", "GitHub Copilot", "LLMs"]
draft: false
featured: false
---

## Table of contents

- [1. More context is not automatically better](#1-more-context-is-not-automatically-better)
- [2. Context has different jobs](#2-context-has-different-jobs)
- [3. Static context and task context are different](#3-static-context-and-task-context-are-different)
- [4. Build context progressively](#4-build-context-progressively)
- [5. The retrieval question matters](#5-the-retrieval-question-matters)
- [6. Tests and errors are context too](#6-tests-and-errors-are-context-too)
- [7. Context can be wrong](#7-context-can-be-wrong)
- [8. A practical context workflow](#8-a-practical-context-workflow)
- [9. Common failure modes](#9-common-failure-modes)
- [10. What this means for repository design](#10-what-this-means-for-repository-design)
- [11. A repository exercise](#11-a-repository-exercise)
- [12. Where to go next](#12-where-to-go-next)

The phrase **context engineering** sounded abstract to me at first.

Then I noticed that most disappointing AI coding sessions had the same root cause.

The model was not necessarily incapable of solving the problem.

It was solving a different problem because it had the wrong picture of the repository.

That changed how I think about AI-assisted development:

> **The quality of a coding agent is constrained by the quality of the context it is reasoning over.**

A stronger prompt cannot compensate for a missing interface, an unseen test, an outdated architecture document or an error message the model never received.

## 1. More context is not automatically better

It is tempting to think of context as a quantity problem.

If ten files help, perhaps one hundred files help more.

In practice, indiscriminate context can create its own problems:

- irrelevant implementations compete for attention;
- old code looks authoritative;
- generated files obscure source files;
- similarly named abstractions are confused;
- the model spends reasoning capacity on noise;
- the important constraint becomes one detail among hundreds.

The objective is not:

```text
MAXIMUM CONTEXT
```

It is:

```text
RELEVANT CONTEXT
      +
DURABLE RULES
      +
CURRENT FEEDBACK
```

That is a much more useful engineering target.

## 2. Context has different jobs

I find it helpful to separate context into four categories.

### 2.1 Intent context

What are we trying to achieve?

```text
Add idempotency to payment submission without changing the public API.
```

### 2.2 Repository context

How does this codebase work today?

```text
request handler
      ↓
application service
      ↓
payment gateway interface
      ↓
provider implementation
```

### 2.3 Constraint context

What rules must shape the solution?

```text
- persistence goes through repository interfaces;
- retries must not create duplicate payments;
- current API contracts remain unchanged.
```

### 2.4 Feedback context

What happened when the proposed change met reality?

```text
test failure
compiler error
lint error
runtime trace
review comment
```

A serious agentic workflow moves through all four.

## 3. Static context and task context are different

Some knowledge changes slowly.

Examples:

- architecture boundaries;
- coding standards;
- test commands;
- security expectations.

That belongs in durable repository instructions and documentation.

Other knowledge exists only for the current task:

- this bug report;
- this stack trace;
- these three relevant files;
- this failing test;
- this migration constraint.

A useful mental model is:

```text
DURABLE CONTEXT
(repository instructions, architecture, standards)
             +
TASK CONTEXT
(files, issue, errors, acceptance criteria)
             ↓
CURRENT WORKING CONTEXT
```

If you put everything into every prompt, the workflow becomes repetitive.

If you put nothing into durable context, the model repeatedly rediscovers the repository.

## 4. Build context progressively

For non-trivial work, I prefer progressive context gathering.

Start narrow:

```text
Find the entry point for payment submission and trace the call path to
external provider invocation. Do not modify files.
```

Then expand only where the architecture requires it:

```text
Now inspect how retries and persistence are handled along that path.
Identify the existing tests that cover duplicate requests.
```

Only after the model has a credible map should implementation begin.

This pattern has two benefits.

First, it reduces noise.

Second, it gives the engineer checkpoints where incorrect assumptions can be caught before edits start.

## 5. The retrieval question matters

When an agent can search a repository, the wording of the investigation affects what it finds.

Weak:

```text
Look at the payment code.
```

Stronger:

```text
Trace payment submission from the HTTP entry point to the provider call.
Identify where request identifiers are created, where persistence occurs
and which tests exercise retry behavior.
```

The second request gives the search a topology.

It tells the agent what relationships matter, not just what keyword to find.

This is one reason experienced engineers often get more value from AI agents: they know what architectural questions to ask.

## 6. Tests and errors are context too

One of the most useful shifts in agentic coding is treating execution output as fresh context.

Suppose the model edits a function and a test fails:

```text
Expected: 1 provider call
Actual:   2 provider calls
```

That failure is not simply a red light.

It is new information about the system.

A healthy loop looks like this:

```text
repository context
       ↓
reasoning
       ↓
change
       ↓
test execution
       ↓
new evidence
       ↓
updated reasoning
```

This is why an agent with tool access can outperform a chat-only workflow on multi-step tasks even when both use the same underlying model.

The agent can acquire new context from the environment.

## 7. Context can be wrong

More dangerous than missing context is **misleading context**.

Examples:

- an architecture document describes the old system;
- a test encodes behavior that should be removed;
- a commented-out implementation looks like the current pattern;
- duplicate utilities exist and the agent selects the obsolete one;
- repository instructions contradict actual build tooling.

This means context engineering is not merely about making information available.

It is also about maintaining the quality of that information.

A repository with abundant stale documentation can be harder for an agent than a smaller repository with concise, accurate guidance.

## 8. A practical context workflow

For a medium-sized engineering task, I use something like this:

### Step 1: define the question

```text
What behavior must change, and what must remain stable?
```

### Step 2: identify architectural anchors

```text
Which interface, entry point, configuration object or test suite defines
this area of the system?
```

### Step 3: ask the agent to trace relationships

```text
Follow the relevant call/data flow. Do not edit yet.
```

### Step 4: inspect the agent's model

Does its explanation match what you know?

### Step 5: add missing context deliberately

Point it toward an ADR, issue, test fixture or operational constraint only if needed.

### Step 6: execute within explicit bounds

Give acceptance criteria and validation commands.

### Step 7: feed results back into reasoning

Let test failures, build output and review findings update the next iteration.

The process is iterative because the repository itself teaches the agent what it needs to know.

## 9. Common failure modes

### 9.1 Attaching half the repository

The model receives volume instead of relevance.

### 9.2 Assuming the active file is sufficient

Many real behaviors cross interfaces, configuration, tests and infrastructure.

### 9.3 Hiding the error

Developers summarize a failure instead of giving the model the actual relevant output, losing details that may matter.

### 9.4 Trusting repository search blindly

Search retrieves matches, not architectural truth. The engineer still has to evaluate whether the selected files represent the right system path.

### 9.5 Letting context become permanent accidentally

Task-specific instructions are copied into durable repository guidance even though they apply only once.

## 10. What this means for repository design

The more AI-assisted engineering matures, the more repository design itself matters.

AI-friendly repositories tend to make important relationships discoverable:

- clear module boundaries;
- stable interfaces;
- explicit configuration;
- meaningful test organization;
- architecture decision records where useful;
- predictable commands;
- concise repository instructions;
- less duplicated or dead code.

This is not about designing code *for the AI* at the expense of humans.

The same characteristics generally make a repository easier for engineers to navigate.

That leads to a broader principle:

> **AI often exposes documentation and architecture debt that humans learned to work around.**

## 11. A repository exercise

Choose a change that spans at least three files.

Do not ask the agent to implement it immediately.

Ask it to produce a context map:

```text
For this change, identify:
- the entry point;
- relevant interfaces;
- implementations;
- configuration;
- tests;
- repository instructions or architecture docs that constrain the work.
Explain why each item matters. Do not edit anything.
```

Review the map.

Then ask:

```text
What important information is still missing before you could implement
this safely?
```

That second question is particularly revealing. A strong workflow does not pretend uncertainty does not exist.

The measurable takeaway:

> **Before a multi-file change starts, you should be able to explain why each major piece of context is present.**

## 12. Where to go next

Once the system can gather context, edit files and receive execution feedback, the interaction changes character.

You are no longer using AI only as a conversational assistant.

You are giving it a bounded objective and allowing it to operate through a sequence of actions.

That is the transition into **agentic coding**—and it requires a different way of thinking about responsibility, permissions and review.