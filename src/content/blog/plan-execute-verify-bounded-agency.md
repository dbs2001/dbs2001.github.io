---
title: "Day 5 : Plan–Execute–Verify: Stop Letting Copilot Agent Improvise"
description: "How bounded agency turns AI coding from open-ended improvisation into a controlled engineering workflow with explicit plans, scope gates and verification."
pubDate: 2026-08-12
tags: ["AI-assisted Dev", "GitHub Copilot", "Agentic Coding", "Engineering Controls"]
draft: false
featured: false
---

## Table of contents

- [1. Agent mode changes the operating model](#1-agent-mode-changes-the-operating-model)
- [2. The plan should become a contract](#2-the-plan-should-become-a-contract)
- [3. Separate discover, plan, execute and verify](#3-separate-discover-plan-execute-and-verify)
- [4. Give autonomy according to blast radius](#4-give-autonomy-according-to-blast-radius)
- [5. Make plans falsifiable](#5-make-plans-falsifiable)
- [6. Use a fresh context for verification](#6-use-a-fresh-context-for-verification)
- [7. Passing tests is not the same as satisfying the requirement](#7-passing-tests-is-not-the-same-as-satisfying-the-requirement)
- [8. Today's repository exercise](#8-todays-repository-exercise)
- [9. Advanced challenge: introduce a Change Budget](#9-advanced-challenge-introduce-a-change-budget)
- [10. What this changes for engineering leads](#10-what-this-changes-for-engineering-leads)
- [11. Measure plan adherence](#11-measure-plan-adherence)
- [12. Where to go next](#12-where-to-go-next)

The previous lessons were mostly about improving what the model knows before it acts.

This one changes the stakes.

In GitHub Copilot Agent mode, the system can do more than return text. It can inspect files, choose where to make changes, edit multiple files, run commands, react to failures and iterate.

That is useful precisely because it can carry more of the execution burden.

But the same capability creates a new engineering problem:

> **How much decision-making authority should the agent receive before it has demonstrated that it understands the task?**

The answer I am converging on is **bounded agency**.

> **Do not give an AI agent a goal and unlimited freedom. Separate planning, execution and verification, and put explicit gates between them.**

The point is not merely to ask GPT to “think first.”

The point is to turn its plan into something that later execution can be measured against.

## 1. Agent mode changes the operating model

A naive agent workflow can look like this:

```text
"Implement DynamoDB state management"
                │
                ▼
         Agent explores repo
                │
         Agent chooses design
                │
         Agent edits files
                │
         Agent runs tests
                │
         Agent fixes failures
                │
                ▼
          14 files changed
```

The problem is not necessarily that the final code is wrong.

The problem is that several different engineering decisions have been delegated at once:

```text
What does the requirement mean?
What architecture should be used?
Which files are in scope?
Which abstractions should survive?
How should the change be validated?
```

That is too much hidden authority for a consequential change.

A more controlled flow is:

```text
REQUIREMENT
    │
    ▼
 DISCOVER
    │
    ▼
  PLAN
    │
    ├── affected files
    ├── architectural decisions
    ├── risks
    └── tests
    │
    ▼
  GATE
    │
    ▼
 EXECUTE
    │
    ▼
 VERIFY
    │
    ├── tests
    ├── lint/type checks
    ├── diff inspection
    └── requirement check
    │
    ▼
  REVIEW
```

That workflow gives the engineer several places to intervene before the agent's assumptions become code.

## 2. The plan should become a contract

Suppose the requirement is:

> Persist file-processing state in DynamoDB.

An unconstrained implementation might directly introduce AWS logic into the pipeline:

```python
class Pipeline:
    def process(self, file):
        table = boto3.resource("dynamodb").Table("state")
        ...
```

The code may work.

It may also violate the repository architecture.

A bounded workflow first asks the agent to state what it believes should happen:

```text
Implementation Plan

1. Preserve StateStore interface.
2. Add DynamoDBStateStore implementation.
3. Extend StateStoreFactory.
4. Add DynamoDB configuration.
5. Inject StateStore into Pipeline.
6. Add unit tests.
7. Add integration tests for DynamoDB adapter.

Expected files changed: 6
```

Now something important exists that did not exist before:

**an explicit prediction of the change.**

If execution suddenly modifies:

```text
src/parser.py
src/writer.py
src/reader.py
```

we can ask why.

The discrepancy itself becomes evidence:

```text
PLAN ≠ EXECUTION
```

That does not prove the implementation is wrong.

It proves the original model of the work was incomplete, and therefore deserves scrutiny.

## 3. Separate discover, plan, execute and verify

For a non-trivial change, I now prefer four distinct cognitive stages.

### 3.1 Discover

The agent investigates the repository without editing.

It should identify:

- current behavior;
- relevant interfaces;
- implementation boundaries;
- construction/wiring;
- tests;
- configuration;
- unknowns.

### 3.2 Plan

The agent proposes the smallest coherent change.

A useful plan should include:

```text
exact files expected to change
responsibility of each change
architectural decisions
tests required
backward compatibility risks
assumptions
unknowns
```

### 3.3 Execute

The implementation is constrained by the approved plan.

The working rule is:

> If execution needs to exceed the agreed plan, expose the discrepancy rather than silently expanding scope.

### 3.4 Verify

A separate pass compares what actually happened with what was authorized.

Verification should ask both:

```text
Did the implementation satisfy the plan?
Did the plan satisfy the requirement?
```

Those are different questions.

## 4. Give autonomy according to blast radius

This process is not necessary for every edit.

For:

```text
rename variable
fix typo
add docstring
```

it would be ceremony without value.

Bounded agency becomes useful when the change involves:

- multiple files;
- architectural decisions;
- external infrastructure;
- database/schema changes;
- dependency changes;
- security-sensitive code;
- substantial refactoring;
- unfamiliar repositories.

A useful heuristic is:

> **The greater the blast radius, the less autonomy you give the agent before it demonstrates understanding.**

That is not anti-automation.

It is how I would delegate to a human engineer too: autonomy grows with demonstrated understanding and bounded risk.

## 5. Make plans falsifiable

A vague plan is almost useless:

```text
1. Update state handling.
2. Update tests.
3. Ensure everything works.
```

Nothing in that plan can really fail.

A stronger plan contains statements that can later be tested:

```text
Pipeline must depend only on StateStore,
not DynamoDBStateStore.
```

```text
No public interface changes are required.
```

```text
The local implementation remains available.
```

```text
The implementation should require changes to six files or fewer.
```

Once the plan is falsifiable, verification can produce meaningful outcomes:

```text
PASS
PARTIAL
FAIL
NOT VERIFIABLE
```

That is much better than a generic “looks good.”

## 6. Use a fresh context for verification

One of the strongest techniques in the lesson is surprisingly simple:

**verify in a fresh Copilot conversation.**

Why?

Because the implementation conversation contains the agent's accumulated reasoning:

```text
initial interpretation
architecture choices
implementation plan
code edits
test fixes
```

A verifier in the same context can become anchored to those decisions.

A fresh verifier should instead receive:

```text
requirement
approved plan
repository state / diff
relevant instructions
```

and then ask:

```text
Compare the implementation against the approved plan.

Verify:
- every planned requirement was implemented
- no unplanned behavior was introduced
- architectural boundaries were preserved
- error paths are handled
- backward compatibility is maintained
- tests validate behavior rather than implementation details
- no unnecessary files changed

Classify each planned item:
PASS
PARTIAL
FAIL
NOT VERIFIABLE

Then inspect the diff for changes not justified by the plan.
```

The goal is not perfect independence.

The goal is to reduce anchoring and create a distinct review objective.

## 7. Passing tests is not the same as satisfying the requirement

One common failure mode is:

```text
implement
   ↓
run tests
   ↓
all green
   ↓
"everything looks good"
```

Passing tests prove one thing:

**the tests that ran passed.**

They do not prove:

- the requirement was interpreted correctly;
- the architecture stayed intact;
- no important behavior changed unintentionally;
- the tests cover the relevant failure modes;
- the agent did not weaken tests to accommodate its implementation.

A failing test is also ambiguous.

It may mean:

```text
implementation bug
        OR
wrong architecture
        OR
incorrect assumption
        OR
existing regression
        OR
test environment problem
```

This is why “keep editing until green” is a dangerous agent instruction.

The agent can accidentally make the tests agree with the implementation rather than make the implementation satisfy the intended behavior.

## 8. Today's repository exercise

Choose a real backlog item that should touch at least three to five files.

Start with a planning-only task:

```text
Analyze this requirement and repository.

DO NOT modify files.

Produce an implementation plan containing:
1. Current behavior
2. Relevant architecture
3. Interfaces involved
4. Exact files expected to change
5. Responsibility of each change
6. Tests required
7. Backward compatibility risks
8. Assumptions
9. Unknowns requiring repository investigation

For every architectural conclusion, cite repository evidence.

Do not propose a new abstraction if an appropriate one already exists.
```

Review the plan yourself.

Then execute:

```text
Implement the approved plan.

Constraints:
- Modify only files identified by the plan unless technically necessary.
- Preserve existing abstractions.
- Do not introduce dependencies without justification.
- Keep the diff minimal.
- Add the planned tests.

If additional files must be changed, stop implementation of that part
and explain why the plan was incomplete.
```

Finally, open a fresh conversation and verify the implementation against the plan.

The exercise is not about producing more process documentation.

It is about making the agent's **scope assumptions visible before code is written**.

## 9. Advanced challenge: introduce a Change Budget

The most concrete control in this lesson is a change budget.

Before execution, define limits such as:

```text
CHANGE BUDGET

Maximum expected files changed: 6
New production dependencies: 0
Public API changes: 0
Database schema changes: 0
Existing tests modified: <= 2
New tests required: >= 4
```

Then compare actual execution:

```text
                    Planned    Actual

Files changed           6         9       FAIL
Dependencies            0         0       PASS
Public APIs              0         1       FAIL
Existing tests edited  <=2        1       PASS
New tests              >=4        6       PASS
```

This gives AI-assisted development something I find extremely valuable:

> **blast-radius observability.**

The review is no longer only “does this code look acceptable?”

It also asks:

> Did the agent stay within the engineering scope it was authorized to change?

## 10. What this changes for engineering leads

At team level, bounded agency provides a practical middle ground between two extremes:

```text
AI only suggests snippets
```

and

```text
AI receives a ticket and owns the entire change
```

The better model is:

```text
Human owns requirement
Human/AI establish context
AI proposes plan
Human approves boundaries
AI executes
Independent verification checks scope and behavior
Human reviews ownership-critical decisions
CI validates automated controls
```

The model can carry more execution without quietly inheriting architecture authority.

That is the point.

## 11. Measure plan adherence

For the next ten non-trivial AI-assisted changes, record:

```text
Plan adherence =
planned changed files
that actually required modification
───────────────────────────────────
total files modified
```

Also track unplanned changes separately.

For example:

```text
Planned files:        5
Actual files:         7
Planned + required:   5
Unplanned files:      2

Plan adherence = 5 / 7 = 71%
```

The number itself is less important than the review conversation it creates.

Why were two files unplanned?

Was the plan weak?
Was repository context incomplete?
Did the agent expand scope unnecessarily?
Did the implementation reveal a real dependency?

Those are useful engineering questions.

The principle I would teach a team is:

> **Before Copilot Agent earns permission to change the system, it must demonstrate that it understands the intended change.**

## 12. Where to go next

Once the agent can plan and execute within explicit boundaries, the next weakness becomes obvious.

The same conversation that implemented the code is still a poor independent judge of whether the implementation is correct.

So the next step is to strengthen verification:

```text
IMPLEMENTER
     ↓
code change
     ↓
fresh context
     ↓
ADVERSARIAL REVIEWER
     ↓
concrete failure scenarios
```

That moves us from **bounded execution** into **evidence-driven adversarial verification**.

**Next lesson:** [Day 6 : Make a Second GPT Try to Break the First GPT’s Code](/blog/adversarial-ai-verification/)
