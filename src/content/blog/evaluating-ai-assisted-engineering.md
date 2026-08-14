---
title: "How Do You Know the AI Change Is Actually Good?"
description: "A practical evaluation framework for AI-assisted engineering using acceptance criteria, tests, static checks, diff review and repeatable task benchmarks."
pubDate: 2026-08-13
tags: ["AI-assisted Dev", "Evaluation", "Testing", "Engineering Practice"]
draft: false
featured: false
---

## Table of contents

- [1. A demo is not an evaluation](#1-a-demo-is-not-an-evaluation)
- [2. Correctness has layers](#2-correctness-has-layers)
- [3. Start with task-level acceptance criteria](#3-start-with-task-level-acceptance-criteria)
- [4. Use deterministic checks wherever possible](#4-use-deterministic-checks-wherever-possible)
- [5. Evaluate the diff, not only the output](#5-evaluate-the-diff-not-only-the-output)
- [6. Track failure modes, not just pass rates](#6-track-failure-modes-not-just-pass-rates)
- [7. Build a small repository benchmark](#7-build-a-small-repository-benchmark)
- [8. Model comparisons need identical conditions](#8-model-comparisons-need-identical-conditions)
- [9. Measure engineering outcomes](#9-measure-engineering-outcomes)
- [10. What this changes for engineering leads](#10-what-this-changes-for-engineering-leads)
- [11. A repository exercise](#11-a-repository-exercise)
- [12. Where to go next](#12-where-to-go-next)

AI coding demonstrations are easy to make impressive.

Choose a clean problem. Give the model the right files. Ask for a feature. Watch several files change in seconds.

It looks productive.

But an engineering organization needs to answer a harder question:

> **Was the result actually correct, maintainable and appropriate for this repository?**

That is an evaluation problem.

The more responsibility we give coding agents, the less useful subjective impressions become. “This model feels better” may be a starting observation, but it is not enough to design team standards or choose workflows.

## 1. A demo is not an evaluation

A demonstration answers:

```text
Can the system do this once under favorable conditions?
```

An evaluation asks:

```text
How reliably does the system perform representative work under defined
conditions, and what kinds of mistakes does it make?
```

Those are different questions.

A useful evaluation has:

- a defined task;
- stable starting code;
- explicit acceptance criteria;
- known validation commands;
- repeatable conditions;
- recorded failure modes.

Without those, model comparison becomes anecdotal.

## 2. Correctness has layers

For AI-generated engineering changes, “works” is too broad.

I separate correctness into layers.

### 2.1 Syntactic correctness

Does it compile, parse or type-check?

### 2.2 Behavioral correctness

Does it satisfy the requested behavior?

### 2.3 Regression correctness

Did existing behavior remain intact where it should?

### 2.4 Architectural correctness

Does the change respect repository boundaries and conventions?

### 2.5 Operational correctness

Will it behave appropriately in deployment, failure, security and observability contexts?

A model can pass the first layer and fail badly at the fourth.

That is why “the build passed” is useful evidence but not a complete evaluation.

## 3. Start with task-level acceptance criteria

Evaluation begins before generation.

If you cannot define what success means, you cannot evaluate whether AI achieved it.

Suppose the task is:

```text
Add caching to the product lookup service.
```

A stronger definition might include:

```text
- repeated reads for the same product use the cache;
- cache misses fall back to the existing repository;
- repository errors are not cached as successful values;
- public service interfaces do not change;
- existing tests remain green;
- focused cache behavior tests are added.
```

Now there is something to test.

## 4. Use deterministic checks wherever possible

Software engineering has an advantage over many AI tasks: much of the result can be evaluated by tools.

Useful signals include:

```text
compiler / type checker
unit tests
integration tests
linters
formatters
security scanners
schema validation
contract tests
performance checks
```

The principle is:

> **Prefer executable evidence over prose assertions whenever the repository can provide it.**

If the agent says “I preserved backward compatibility,” that is a claim.

If contract tests prove the old interface still behaves correctly, that is evidence.

## 5. Evaluate the diff, not only the output

Two changes can both pass tests and still differ substantially in engineering quality.

Review dimensions should include:

- unnecessary files changed;
- duplicate abstractions introduced;
- dependency additions;
- architecture boundary violations;
- error-handling quality;
- test quality;
- readability;
- hidden behavior changes;
- operational complexity.

I like to ask:

```text
Did the agent solve the task?
Did it solve only the task?
Did it solve it in the way this repository expects?
```

That second question catches a surprising amount of AI-generated overreach.

## 6. Track failure modes, not just pass rates

A single score can hide important behavior.

Imagine two models each succeed on 80% of tasks.

Model A fails mostly by stopping and asking for clarification.

Model B fails by making confident, architecture-breaking changes that pass superficial tests.

The percentages are identical. The operational risk is not.

Useful failure categories might include:

```text
wrong repository assumption
scope expansion
missing validation
incorrect test
architecture violation
unnecessary dependency
silent behavior change
fabricated API / configuration
```

Over time, this becomes much more informative than “developers like model X.”

## 7. Build a small repository benchmark

You do not need a research lab to evaluate coding agents.

Start with five to ten representative tasks from your own repositories.

For example:

```text
1. explain a cross-module call path;
2. fix a known bug with a regression test;
3. add a small feature behind an existing interface;
4. perform a bounded refactor;
5. diagnose a failing test;
6. update configuration without changing behavior;
7. review a deliberately flawed patch.
```

For each task, record:

- starting commit;
- prompt/task contract;
- allowed tools;
- expected behavior;
- validation commands;
- review criteria.

Now you have a small but meaningful benchmark tied to actual engineering work.

## 8. Model comparisons need identical conditions

If you compare models, keep the surrounding conditions stable.

Otherwise you may accidentally compare agent harnesses, context selection or permissions rather than model capability.

Control where possible:

```text
same repository state
same task
same instructions
same available tools
same acceptance criteria
same validation
```

Then inspect differences in:

- correctness;
- number of iterations;
- scope discipline;
- reasoning quality;
- latency;
- token/cost profile where relevant;
- amount of human correction required.

This produces a much better model-selection conversation than brand preference.

## 9. Measure engineering outcomes

At organizational level, the metric should not be “lines of AI-generated code.”

That is output, not value.

More meaningful signals include:

- cycle time for bounded tasks;
- review time;
- defect escape rate;
- rework after AI-generated changes;
- test quality;
- developer ability to explain the resulting code;
- percentage of tasks requiring substantial correction;
- time spent gathering context manually;
- adoption across appropriate task categories.

An AI workflow that generates twice as much code but doubles review burden is not obviously a productivity win.

## 10. What this changes for engineering leads

Leads should think about AI adoption as an experimental engineering programme.

A sensible rollout looks like:

```text
choose representative workflows
        ↓
define expected outcomes
        ↓
run controlled trials
        ↓
record failure modes
        ↓
improve context + instructions
        ↓
expand only where evidence supports it
```

This replaces two extremes:

```text
“AI is amazing; use it everywhere.”
```

and:

```text
“AI made one mistake; ban it.”
```

Both are poor engineering responses to a probabilistic tool.

## 11. A repository exercise

Pick one completed engineering task with a known good solution.

Reset a branch to the commit before the fix.

Give the same task to your coding agent with explicit acceptance criteria.

Score the result against five dimensions:

```text
1. behavioral correctness
2. regression safety
3. architecture fit
4. scope discipline
5. validation completeness
```

Use a simple scale such as 0–2 for each.

Then repeat with a different prompt or model while holding the rest constant.

The measurable takeaway:

> **You should be able to compare AI-assisted engineering approaches using repository-specific evidence rather than memory or preference.**

## 12. Where to go next

Evaluation tells us whether a generated change is acceptable.

But in normal software delivery, every meaningful change still passes through review.

That raises another question:

Can AI help review AI-generated and human-generated code without turning code review into a superficial second opinion?

The answer is yes—but only if we treat review as an evidence-gathering engineering activity rather than asking a model, “Does this look good?”