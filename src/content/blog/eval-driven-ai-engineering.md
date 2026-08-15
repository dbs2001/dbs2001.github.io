---
title: "Day 8 : Eval-Driven AI Engineering: Stop Judging Copilot by ‘Looks Good’"
description: "How golden task sets, objective scoring and hidden evals turn Copilot configuration changes into measurable engineering experiments instead of prompt opinions."
pubDate: 2026-08-15
tags: ["AI-assisted Dev", "GitHub Copilot", "LLM Evals", "Engineering Quality"]
draft: false
featured: false
---

## Table of contents

- [1. Stop evaluating AI by impression](#1-stop-evaluating-ai-by-impression)
- [2. Build a golden task set from real repository work](#2-build-a-golden-task-set-from-real-repository-work)
- [3. Score engineering dimensions separately](#3-score-engineering-dimensions-separately)
- [4. Establish a baseline before changing the system](#4-establish-a-baseline-before-changing-the-system)
- [5. Keep the answer key hidden from the agent](#5-keep-the-answer-key-hidden-from-the-agent)
- [6. Change one variable at a time](#6-change-one-variable-at-a-time)
- [7. Common evaluation mistakes](#7-common-evaluation-mistakes)
- [8. Today's repository exercise](#8-todays-repository-exercise)
- [9. Advanced challenge: model vs prompt vs context](#9-advanced-challenge-model-vs-prompt-vs-context)
- [10. What this changes for engineering leads](#10-what-this-changes-for-engineering-leads)
- [11. Measure AI Engineering Success Rate](#11-measure-ai-engineering-success-rate)
- [12. Where this takes the series](#12-where-this-takes-the-series)

The first seven lessons were mostly about improving the AI-assisted engineering workflow itself.

We controlled context.

We moved stable engineering knowledge into repository instructions.

We turned recurring procedures into prompt files.

We budgeted context, bounded agent execution, introduced independent adversarial verification and used invariant discovery to strengthen testing.

Then a different problem appeared:

> **How do we know whether any of those changes actually improved the workflow?**

It is easy to compare two prompts and say one feels clearer.

It is easy to add a repository instruction file and say Copilot seems more consistent.

It is easy to switch a model and conclude that the new one appears smarter.

But those are impressions.

The next maturity step is **evaluation engineering**, usually shortened to **evals**.

The core idea is simple:

> **Treat an AI coding workflow like any other engineering system: define a benchmark, run it repeatedly, measure outcomes, and only then change prompts, instructions or models.**

That shifts the question from:

```text
Does this configuration look better?
```

into:

```text
Does this configuration perform better
on engineering tasks we actually care about?
```

## 1. Stop evaluating AI by impression

Imagine two developers propose different repository instructions.

Version A:

```text
Use existing abstractions.
Keep changes minimal.
Add tests.
```

Version B:

```text
Before introducing a new abstraction,
search for an existing one.

Infrastructure dependencies must remain behind adapters.

Every behavioral change requires tests
covering success and failure paths.

Do not modify unrelated files.
```

Version B sounds more precise.

But that does not prove it produces better engineering outcomes.

A more useful comparison is:

```text
                    SAME TASK SET
                         │
            ┌────────────┴────────────┐
            ▼                         ▼
     Instructions A            Instructions B
            │                         │
            ▼                         ▼
        GPT workflow              GPT workflow
            │                         │
            ▼                         ▼
       Solutions A                Solutions B
            │                         │
            └────────────┬────────────┘
                         ▼
                       EVALS
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
        Tests       Architecture     Diff scope
        pass?        compliant?      correct?
```

Now the discussion changes.

We are no longer debating wording.

We are testing behavior.

That distinction matters for engineering leads because repository instructions, prompt files and agent workflows eventually become shared infrastructure. Shared infrastructure should be changed because evidence supports the change, not because someone wrote a more persuasive prompt.

## 2. Build a golden task set from real repository work

The most practical starting point is a **golden task set**.

Take roughly 10 to 20 previously completed tickets from one repository.

Choose tasks where you already understand the correct behavior and the relevant architectural constraints.

For example:

```text
T01  Add validation to parser
T02  Fix duplicate-file processing
T03  Add new configuration property
T04  Implement retry handling
T05  Add CSV output field
T06  Fix null handling
T07  Add new StateStore implementation
T08  Refactor duplicated transformation logic
T09  Fix incorrect exception propagation
T10  Add processing metric
```

For each task, preserve the information needed to reproduce the engineering problem:

```text
requirement
expected behavior
relevant starting commit
expected architectural constraints
tests that should pass
known correct implementation
```

This gives you something far more valuable than a generic benchmark.

It gives you a benchmark that represents **your actual engineering environment**.

A public coding benchmark can tell you something about general model capability.

A golden task set can tell you whether your team's Copilot setup handles your repository conventions, abstractions, test expectations and failure modes.

That is the evaluation I care about before rolling a workflow across a team.

## 3. Score engineering dimensions separately

A weak evaluation question is:

```text
Did Copilot do a good job?
```

That collapses several different engineering concerns into one subjective judgment.

Instead, score dimensions separately.

For example:

| Metric | Score |
| --- | ---: |
| Existing tests pass | 0/1 |
| Hidden tests pass | 0/1 |
| Requirement satisfied | 0-2 |
| Architecture respected | 0-2 |
| No unnecessary dependency | 0/1 |
| Diff within expected scope | 0-1 |
| Tests added appropriately | 0-1 |
| No regression introduced | 0-1 |

Total:

```text
10 points
```

Suppose ten tasks score:

```text
T01    9
T02    7
T03   10
T04    6
T05    9
T06    8
T07    5
T08    7
T09    8
T10    9

Average = 7.8 / 10
```

That number is not magically objective simply because it is numeric.

The rubric still needs engineering judgment.

But the important improvement is that the judgment is **defined before comparing configurations**.

A team can now discuss why architecture deserves two points, what constitutes an unnecessary dependency, or what amount of scope expansion should fail the task.

Those are useful engineering conversations.

## 4. Establish a baseline before changing the system

The baseline is the part people are most tempted to skip.

Suppose I want to introduce:

```text
.github/copilot-instructions.md
```

If I add it first and only then begin measuring, I have no reliable comparison point.

Instead:

```text
Current workflow
      ↓
Run golden tasks
      ↓
Record baseline
      ↓
Change one part of the AI setup
      ↓
Run the same tasks again
      ↓
Compare
```

Imagine the result is:

```text
WITHOUT repository instructions
Architecture score: 63%
Overall score:      78%

WITH repository instructions
Architecture score: 91%
Overall score:      87%
```

Now I can make a defensible statement:

> Repository instructions improved architecture compliance from 63% to 91% on our benchmark.

That claim is much stronger than:

> I think these instructions make Copilot better.

The benchmark is not universal truth.

It is evidence about the tasks we chose and the rubric we defined.

That is still a major improvement over intuition.

## 5. Keep the answer key hidden from the agent

There is a subtle problem with an evaluation repository.

Suppose each task contains:

```text
evals/task-001/
├── requirement.md
└── expected.md
```

If the agent can read `expected.md`, then the benchmark is contaminated.

The model is no longer solving the engineering problem under normal conditions. It can optimize directly against the answer key.

So separate what the agent may see from what the evaluator uses.

Visible to the agent:

```text
requirement.md
repository
repository instructions
normal task context
```

Hidden from the agent:

```text
expected behavior
hidden tests
architecture rubric
expected affected files
known failure cases
```

Conceptually:

```text
                  AGENT

Requirement ───────┐
Repository ────────┼──► GPT
Instructions ──────┘
                         │
                         ▼
                     solution
                         │
                         ▼
                ┌────────────────┐
                │  HIDDEN EVAL   │
                │                │
                │ tests          │
                │ invariants     │
                │ architecture   │
                │ scope          │
                └────────────────┘
```

This is the same principle we use elsewhere in engineering assurance:

> **The system being evaluated should not receive the evaluator's answer key.**

## 6. Change one variable at a time

Once a benchmark exists, it becomes tempting to improve everything at once.

For example:

```text
new model
+
new prompt
+
new repository instructions
+
new context strategy
```

Suppose the score improves by 15%.

What caused the improvement?

We do not know.

A better experiment is:

```text
Baseline
        ↓
change ONE variable
        ↓
rerun benchmark
        ↓
compare
```

Then repeat for the next variable.

This starts to look like A/B testing for AI-assisted engineering workflows.

The important thing is not the statistical terminology.

The important thing is isolating cause well enough that the team learns something reusable.

You may discover:

```text
Model change                 +4%
Better prompt                +5%
Repository instructions     +15%
Plan / Execute / Verify      +9%
```

Those numbers would change how I invest enablement effort.

Maybe the best next step is not paying for a larger model.

Maybe it is improving repository context.

Without evals, that distinction is easy to miss.

## 7. Common evaluation mistakes

### 7.1 Measuring only test pass rate

Tests are essential, but they are not the whole engineering outcome.

An agent can make tests pass while producing poor architecture, unnecessary dependencies or a much larger diff than the requirement justified.

Keep correctness and engineering quality as separate dimensions where appropriate.

### 7.2 Evaluating one task

One successful task proves very little.

LLM output varies, and engineering tasks vary.

Use a task set broad enough to expose different failure modes.

### 7.3 Changing several variables together

If model, prompt, instructions and context all change, attribution becomes weak.

Change one meaningful variable when you want to understand causality.

### 7.4 Letting the model see hidden evaluation material

If the agent can read expected output, hidden tests or your rubric, you are no longer measuring the same workflow developers will use.

Protect the evaluation boundary.

### 7.5 Using GPT as the only judge

LLM judges can be useful, especially for dimensions that are hard to encode mechanically.

But objective engineering signals should dominate wherever possible:

```text
Compiler
Tests
Static analysis
Linting
Security scanner
Architecture tests
Mutation tests
```

Use an LLM judge for the dimensions deterministic tools cannot evaluate cleanly.

The evaluator should be a system of evidence, not another chatbot saying “looks good.”

## 8. Today's repository exercise

Do not start with an evaluation platform.

Start with five historical tasks.

Create something conceptually like:

```text
evals/
├── task-001/
│   ├── requirement.md
│   └── expected.md
├── task-002/
├── task-003/
├── task-004/
└── task-005/
```

For each task, define a small rubric.

For example:

```text
TASK 1

Correctness          2/2
Architecture         2/2
Scope                1/1
Tests                1/1
Regression           1/1

TOTAL                 7/7
```

Run all five tasks manually through the current Copilot workflow.

Record the results before changing anything.

That is enough to create your first AI engineering baseline.

The purpose of today's exercise is not automation.

It is to establish the discipline of **reproducible comparison**.

Once the team agrees that the benchmark represents useful work, automation can come later.

## 9. Advanced challenge: model vs prompt vs context

Take five golden tasks and run four configurations.

```text
A
GPT + normal prompt

B
GPT + improved prompt

C
GPT + improved prompt
    + copilot-instructions.md

D
GPT + improved prompt
    + instructions
    + Plan → Execute → Verify
```

Record the results by dimension:

| Configuration | Correctness | Architecture | Scope | Tests | Overall |
| --- | ---: | ---: | ---: | ---: | ---: |
| A | 72% | 58% | 66% | 71% | 67% |
| B | 78% | 62% | 71% | 76% | 72% |
| C | 82% | 88% | 79% | 80% | 82% |
| D | 91% | 93% | 91% | 89% | 91% |

The exact numbers are not the point.

The useful question is:

> **Where does the improvement actually come from?**

That is knowledge an engineering lead can use across repositories.

## 10. What this changes for engineering leads

Once a team has an evaluation set, AI configuration stops being a collection of personal preferences.

Repository instructions can be evaluated.

Prompt files can be evaluated.

Agent workflows can be evaluated.

Model changes can be evaluated.

Context strategies can be evaluated.

The operating loop becomes:

```text
Repositories
     │
     ├── instructions
     ├── prompts
     └── agent workflows
              │
              ▼
           GPT models
              │
              ▼
          code changes
              │
              ▼
         Evaluation layer
      ┌───────┼─────────┐
      ▼       ▼         ▼
    Tests   Security   Architecture
      │       │         │
      └───────┼─────────┘
              ▼
           Metrics
              │
              ▼
       Improve AI setup
```

At that point, the team is no longer merely using Copilot.

It is operating an **AI-assisted software-engineering system**.

That changes the role of the engineering lead.

The job is not only to teach developers which prompts work.

It is to establish a controlled environment in which improvements can be demonstrated.

## 11. Measure AI Engineering Success Rate

For the first benchmark, keep the metric simple.

Define an acceptance threshold for each task.

For example:

```text
Task passes benchmark if score >= 80%
```

Then calculate:

```text
AI Engineering Success Rate
=
tasks meeting acceptance threshold
──────────────────────────
total tasks
```

If four of five tasks pass:

```text
Success rate = 4 / 5 = 80%
```

The measurable takeaway from this lesson is:

> **Create a five-task golden evaluation set for one repository and establish the baseline before making another major Copilot configuration change.**

From that point onward, do not approve a major change to team instructions, prompt files or agent workflow merely because it sounds better.

Run the eval set.

If the numbers do not improve, you have not demonstrated an improvement.

## 12. Where this takes the series

The series now has another control layer:

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
Invariant and property-based testing
        ↓
Evaluation engineering
```

The earlier lessons improved individual parts of the AI-assisted workflow.

Evals give us a way to determine whether those improvements survive repeated engineering tasks.

That is the difference between an AI practice that feels mature and one that can actually demonstrate progress.

**Next lesson:** This is currently the latest lesson in the series. The next lesson will be linked here when it is published.
