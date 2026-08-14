---
title: "When Chat Stops Being Enough: A Practical Guide to Agentic Coding"
description: "What changes when an AI system can inspect repositories, edit files, run commands and iterate—and how to increase autonomy without giving up engineering control."
pubDate: 2026-08-11
tags: ["AI-assisted Dev", "Agentic Coding", "GitHub Copilot", "Engineering Practice"]
draft: false
featured: false
---

## Table of contents

- [1. The important change is action, not conversation](#1-the-important-change-is-action-not-conversation)
- [2. An agent is a loop](#2-an-agent-is-a-loop)
- [3. Autonomy is not one switch](#3-autonomy-is-not-one-switch)
- [4. Scope the objective before granting tools](#4-scope-the-objective-before-granting-tools)
- [5. Tests become part of the reasoning loop](#5-tests-become-part-of-the-reasoning-loop)
- [6. The engineer still owns the decision boundary](#6-the-engineer-still-owns-the-decision-boundary)
- [7. A practical autonomy ladder](#7-a-practical-autonomy-ladder)
- [8. Where agents fail](#8-where-agents-fail)
- [9. Review the diff, not the confidence](#9-review-the-diff-not-the-confidence)
- [10. What this changes for teams](#10-what-this-changes-for-teams)
- [11. A repository exercise](#11-a-repository-exercise)
- [12. Where to go next](#12-where-to-go-next)

The first time a coding assistant changed several files, ran tests, noticed a failure and fixed its own mistake, the experience felt qualitatively different from chat.

The underlying model was still generating language and code.

But the workflow had changed.

Instead of this:

```text
question
   ↓
answer
```

I now had something closer to this:

```text
objective
   ↓
inspect repository
   ↓
reason
   ↓
change files
   ↓
run tools
   ↓
observe result
   ↓
reason again
```

That is the important mental model for **agentic coding**.

> **The defining capability is not that the AI talks more intelligently. It is that the system can take actions, observe consequences and continue.**

That creates leverage—and a very different risk profile.

## 1. The important change is action, not conversation

In chat, the AI can suggest a command:

```bash
npm test
```

You decide whether to run it.

An agent may be able to run it itself.

In chat, the AI can propose a patch.

An agent may edit the files directly.

In chat, you carry the result of a failed test back into the conversation.

An agent may receive that failure automatically and make another change.

This is why agentic systems should be evaluated partly by their **tool environment**:

- what can they read?
- what can they write?
- what can they execute?
- what requires approval?
- what feedback returns to the model?
- when does the loop stop?

The model matters, but the surrounding operating system matters just as much.

## 2. An agent is a loop

A simple agent loop can be represented as:

```text
GOAL
 ↓
OBSERVE
 ↓
PLAN / REASON
 ↓
ACT
 ↓
OBSERVE RESULT
 ↓
CONTINUE OR STOP
```

For software engineering, that could become:

```text
Add pagination to the API
        ↓
inspect route + service + tests
        ↓
form a change plan
        ↓
edit implementation
        ↓
run focused tests
        ↓
see failure
        ↓
inspect contract
        ↓
correct implementation
        ↓
run tests again
```

The loop is valuable because software provides unusually rich feedback: compilers, tests, linters, type systems, runtime errors and diffs.

A good agent can use those signals as evidence.

## 3. Autonomy is not one switch

People sometimes discuss AI autonomy as though the choices are:

```text
manual
or
autonomous
```

Real engineering workflows have many dimensions.

An agent might have permission to:

- search all repository files;
- edit only the current workspace;
- run tests;
- run arbitrary shell commands;
- access external documentation;
- create branches;
- modify infrastructure;
- contact external systems.

These permissions are not equivalent.

A useful model is:

```text
SCOPE × TOOLS × PERMISSIONS × VALIDATION
```

You can grant high autonomy inside a very narrow, reversible task while remaining conservative around production infrastructure or external side effects.

## 4. Scope the objective before granting tools

Tool access does not fix an underspecified task.

If you tell an agent:

```text
Improve this repository.
```

and give it broad write access, you have created a large search space with weak success criteria.

A better agent task is bounded:

```text
Fix the duplicate-record bug in CSV import.

Constraints:
- preserve the public import API;
- do not change database schema;
- keep the patch limited to import logic and tests.

Validation:
- add a regression test reproducing the duplicate case;
- run the import test suite;
- run the standard build.
```

The agent has room to investigate, but not permission to redefine the problem.

## 5. Tests become part of the reasoning loop

With traditional code generation, tests verify code after it is produced.

With an agent, tests can become part of the iterative reasoning process.

```text
hypothesis
   ↓
implementation
   ↓
test
   ↓
evidence
   ↓
revised hypothesis
```

This makes test quality even more important.

If tests are weak, the agent can converge on a solution that satisfies incomplete signals.

If tests encode the important behavior, the environment can steer the agent toward correctness.

This leads to an important organizational implication:

> **The value of coding agents increases with the quality of the engineering feedback system around them.**

Repositories with good tests, clear builds and fast validation loops are easier to automate safely.

## 6. The engineer still owns the decision boundary

Agentic coding does not eliminate engineering judgment.

It moves the human to a different layer.

The engineer should still own questions such as:

- Is this the right architecture?
- Are these acceptance criteria sufficient?
- Is this task safe to delegate?
- Which actions should require approval?
- Does the diff preserve business invariants?
- Are the tests proving the right thing?
- Does the resulting system remain operable?

A model can generate a migration plan.

That does not make it accountable for a failed production migration.

A useful principle is:

> **Delegate execution before you delegate accountability.**

## 7. A practical autonomy ladder

I prefer increasing agent responsibility gradually.

### Level 1: explain

```text
Trace this code path and explain the likely defect. Do not edit files.
```

### Level 2: propose

```text
Suggest the smallest fix and identify the files you would change.
```

### Level 3: edit

```text
Implement the agreed change, but do not run external commands.
```

### Level 4: validate

```text
Implement the change and run the focused test suite and build.
```

### Level 5: iterate

```text
Fix failures caused by the change and rerun validation until the
acceptance criteria pass or you encounter an unresolved blocker.
```

The important point is not these exact levels.

It is the discipline of increasing autonomy when the repository, task and validation system justify it.

## 8. Where agents fail

### 8.1 They optimize for visible acceptance criteria

If the task says “tests pass,” an agent may satisfy the tests without preserving an unstated business invariant.

### 8.2 They make plausible architectural assumptions

A missing piece of context can cause the agent to invent a convention that sounds reasonable but does not belong in your system.

### 8.3 They expand scope

A small task becomes a refactor because the agent identifies nearby code it considers untidy.

### 8.4 They trust misleading feedback

A weak test suite can reward an incorrect implementation.

### 8.5 They perform an allowed but inappropriate action

Permission to run a tool is not proof that every use of the tool is safe for every task.

## 9. Review the diff, not the confidence

Agent summaries are useful, but they are not the artifact that ships.

The diff is.

A disciplined review should inspect:

```text
what changed?
why did it change?
what else could this affect?
what assumptions are encoded?
what validation actually ran?
what was not validated?
```

I particularly watch for:

- unrelated cleanup;
- duplicated abstractions;
- silent behavior changes;
- overly broad exception handling;
- tests that merely reproduce the implementation;
- dependency additions that were unnecessary;
- configuration changes with deployment implications.

The agent can accelerate implementation. It cannot replace review responsibility.

## 10. What this changes for teams

As teams adopt agentic workflows, they need more than a model-access policy.

They need engineering rules around:

- acceptable task scope;
- tool permissions;
- repository instructions;
- mandatory validation;
- human approval boundaries;
- code review expectations;
- production side effects;
- auditability where required.

This is why enterprise AI adoption is not just a license rollout.

The organization is introducing a new class of engineering actor—one that can act quickly but does not own consequences.

The operating model has to reflect that.

## 11. A repository exercise

Choose a bug with a reproducible test case.

Run the task through the autonomy ladder.

First:

```text
Explain the defect. Do not edit.
```

Then:

```text
Propose the smallest fix.
```

Then:

```text
Implement it and add a regression test.
```

Finally:

```text
Run the focused tests and normal build. Fix only failures caused by the
change. Stop and report if the task requires expanding scope.
```

Compare where human intervention was valuable.

The measurable takeaway:

> **For every agentic task, you should be able to state what the agent may change, what it may execute and what evidence must exist before you accept the result.**

## 12. Where to go next

Repository tools give agents access to local engineering context.

But useful engineering work often depends on systems outside the repository:

- documentation;
- issue trackers;
- internal APIs;
- databases;
- observability platforms;
- company-specific tools.

Connecting those systems safely is where **MCP—the Model Context Protocol—starts to become practically interesting**.