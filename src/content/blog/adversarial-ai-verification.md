---
title: "Make a Second GPT Try to Break the First GPT’s Code"
description: "How adversarial AI verification uses fresh context, evidence-driven findings and reproducible counterexamples to challenge AI-generated code."
pubDate: 2026-08-13
tags: ["AI-assisted Dev", "GitHub Copilot", "Code Review", "Verification"]
draft: false
featured: false
---

## Table of contents

- [1. Self-review is not independent verification](#1-self-review-is-not-independent-verification)
- [2. Change the objective from approval to attack](#2-change-the-objective-from-approval-to-attack)
- [3. Require evidence-driven findings](#3-require-evidence-driven-findings)
- [4. Ask for concrete failure scenarios](#4-ask-for-concrete-failure-scenarios)
- [5. Turn counterexamples into tests](#5-turn-counterexamples-into-tests)
- [6. Use stronger review as risk increases](#6-use-stronger-review-as-risk-increases)
- [7. Common adversarial-review mistakes](#7-common-adversarial-review-mistakes)
- [8. Today's repository exercise](#8-todays-repository-exercise)
- [9. Advanced challenge: Implementer vs Reviewer vs Judge](#9-advanced-challenge-implementer-vs-reviewer-vs-judge)
- [10. What this changes for engineering teams](#10-what-this-changes-for-engineering-teams)
- [11. Measure reviewer precision and counterexample conversion](#11-measure-reviewer-precision-and-counterexample-conversion)
- [12. Where to go next](#12-where-to-go-next)

The previous lesson introduced **Plan → Execute → Verify**.

That made one problem much more visible: verification is weak when the same agent that made the implementation decisions is also asked whether those decisions were correct.

If I ask in the same conversation:

```text
Is this implementation correct?
```

I am not getting an independent review.

I am asking the model to inspect a solution built on top of its own accumulated assumptions.

That led to the next pattern:

> **Do not ask the model that wrote the code whether its code is correct. Give a fresh model context the implementation and explicitly task it with finding evidence that the implementation is wrong.**

This is adversarial AI verification.

The key word is not “AI.”

It is **adversarial**.

The reviewer has a different objective from the implementer.

## 1. Self-review is not independent verification

Suppose Copilot Agent implements:

```python
def is_processed(file):
    return state_store.exists(file.sha256)
```

During the implementation conversation, the model may already have formed a chain of assumptions:

```text
requirement interpretation
        ↓
repository model
        ↓
architecture choices
        ↓
implementation plan
        ↓
code edits
        ↓
test adjustments
```

If the original interpretation was wrong, the rest of the conversation can remain anchored to it.

A fresh reviewer starts from a different position:

```text
Agent A
IMPLEMENTER
    │
    ▼
Code change
    │
    ▼
Fresh context
    │
    ▼
Agent B
ADVERSARIAL REVIEWER
    │
    ├── Find incorrect assumptions
    ├── Find missing edge cases
    ├── Find architecture violations
    ├── Find regression risks
    └── Construct failing scenarios
```

The reviewer is not asked to defend the design.

It is asked to challenge it.

That distinction changes the quality of the analysis.

## 2. Change the objective from approval to attack

Weak review request:

```text
Review this code. Is it good?
```

That invites broad commentary, stylistic suggestions and polite confirmation.

The adversarial objective is different:

> **How can this implementation fail?**

A stronger instruction is:

```text
Act as an adversarial senior reviewer.

Your objective is not to improve this implementation.
Your objective is to determine whether it is incorrect.

First reconstruct the intended behavior from repository evidence.
Then inspect the implementation.

Attempt to find:
- incorrect assumptions
- boundary-condition failures
- error-path failures
- state inconsistencies
- concurrency problems
- resource leaks
- backward compatibility regressions
- architecture violations
- incorrect configuration handling
- missing validation
- tests that pass while behavior remains incorrect

Do not modify files.
Do not report formatting or stylistic issues.
```

That creates a review task focused on correctness rather than taste.

## 3. Require evidence-driven findings

LLMs are very good at generating plausible criticism.

That is both useful and dangerous.

A model can produce something like:

```text
There may be a race condition here.
```

The sentence sounds technical, but it is not yet a finding.

A useful adversarial review should have a strict structure:

```text
CLAIM
What is wrong?

EVIDENCE
Which exact code and repository behavior support the claim?

FAILURE SCENARIO
How does the defect become observable?

EXISTING TEST COVERAGE
Would the current tests catch it?

CONFIDENCE
HIGH / MEDIUM / LOW
```

And I add one important instruction:

> **If you cannot demonstrate a plausible failure, do not classify something as a defect.**

That pushes the model away from generic commentary and toward falsifiable engineering claims.

## 4. Ask for concrete failure scenarios

Compare these two outputs.

Weak:

```text
Using filename as an identifier could be problematic.
```

Strong:

```text
CLAIM
State identity collides for different files with the same filename.

EVIDENCE
The lookup key uses file.name rather than content identity.

FAILURE SCENARIO
Run 1:
filename = customer.csv
SHA256   = AAA
→ processed successfully

Run 2:
filename = customer.csv
SHA256   = BBB
→ lookup finds customer.csv
→ incorrectly returns already processed

TEST COVERAGE
No existing test uses identical filenames with different content.

CONFIDENCE
HIGH
```

The second finding gives a human reviewer something concrete to validate.

This is the core principle:

```text
claim
  ↓
evidence
  ↓
failure scenario
  ↓
reproduction
```

Confidence alone is not evidence.

## 5. Turn counterexamples into tests

Counterexample generation is where this becomes more than code-review prose.

Suppose the reviewer identifies a possible defect.

Ask:

```text
Construct the smallest input or runtime scenario
that would cause this implementation to produce
an incorrect result.
```

Now convert that scenario into an automated test.

The workflow becomes:

```text
Implementation
      ↓
Adversarial review
      ↓
Counterexample
      ↓
Convert counterexample → test
      ↓
Run test
      ↓
FAIL?
  /       \
YES       NO
 │         │
real bug   investigate finding
```

This is a much stronger verification loop because the model's criticism has to survive contact with executable evidence.

The AI reviewer becomes a **test hypothesis generator**.

That is a role I trust much more than “automatic approver.”

## 6. Use stronger review as risk increases

Not every change needs a separate adversarial reviewer.

For a tiny edit, human review and normal CI may be enough.

As risk and complexity increase, stronger verification becomes more valuable.

Conceptually:

```text
Risk ↑
  │
  │        Adversarial verification
  │                ●
  │
  │       Structured AI review
  │             ●
  │
  │ Human review
  │      ●
  └────────────────────────→ Change complexity
```

Adversarial verification is especially useful for:

- AI-generated multi-file changes;
- bug fixes;
- refactoring;
- concurrency logic;
- data transformations;
- infrastructure code;
- state-management changes;
- security-sensitive logic;
- code where silent failure is expensive.

The principle remains the same as bounded agency:

> **Verification strength should rise with blast radius.**

## 7. Common adversarial-review mistakes

### 7.1 Asking for improvements instead of defects

```text
Review this and suggest improvements.
```

That combines correctness, style, architecture preferences and optional refactoring into one noisy output.

Separate correctness review from improvement review.

### 7.2 Reusing the implementer's full conversation

That imports the original assumptions into the reviewer.

Fresh context is preferable when practical.

### 7.3 Accepting sophisticated-sounding findings

A finding is not valid because it uses words like “race condition,” “idempotency” or “resource leak.”

Require a concrete failure path.

### 7.4 Automatically fixing every finding

Avoid:

```text
review
  ↓
automatically fix everything
```

Prefer:

```text
review
  ↓
validate finding
  ↓
convert to test
  ↓
test fails
  ↓
fix
```

That keeps the evidence chain intact.

### 7.5 Trusting agreement between models

Two models agreeing does not make a claim true.

The value of the second model is that it helps generate new evidence, not that it casts a second vote.

## 8. Today's repository exercise

Take one recently implemented feature, ideally one created partly with Copilot.

Start a completely fresh conversation.

Provide the requirement and point the reviewer to the changed code.

Use:

```text
Act as an adversarial senior reviewer.

Your objective is not to improve this implementation.
Your objective is to determine whether it is incorrect.

First reconstruct the intended behavior from repository evidence.
Then inspect the implementation.

Attempt to find:
- incorrect assumptions
- boundary-condition failures
- error-path failures
- state inconsistencies
- concurrency problems
- resource leaks
- backward compatibility regressions
- architecture violations
- incorrect configuration handling
- missing validation
- tests that pass while behavior remains incorrect

For each suspected defect provide:
CLAIM
EVIDENCE
FAILURE SCENARIO
EXISTING TEST COVERAGE
CONFIDENCE

Do not modify files.
Do not report formatting or stylistic issues.
Reject your own finding if you cannot construct
a realistic failure scenario.
```

Then inspect every HIGH-confidence finding yourself.

Do not ask Copilot to fix anything yet.

First determine whether the finding survives human scrutiny and, where possible, an executable test.

## 9. Advanced challenge: Implementer vs Reviewer vs Judge

For one meaningful change, create three independent contexts:

```text
             REQUIREMENT
                 │
                 ▼
         ┌──────────────┐
         │ IMPLEMENTER  │
         └──────┬───────┘
                │
              diff
                │
                ▼
         ┌──────────────┐
         │   REVIEWER   │
         │ Find defects │
         └──────┬───────┘
                │
             findings
                │
                ▼
         ┌──────────────┐
         │    JUDGE     │
         │ Verify each  │
         │ finding      │
         └──────┬───────┘
                │
         accepted defects
                │
                ▼
               tests
```

The Judge receives:

```text
requirement
+ relevant repository context
+ diff
+ reviewer findings
```

but not the implementer's reasoning.

Its task is:

```text
For each reviewer finding classify:

CONFIRMED
Repository evidence demonstrates the defect.

PLAUSIBLE
Could occur but evidence is insufficient.

REJECTED
Finding contradicts repository behavior.

For CONFIRMED findings, propose the smallest test
that reproduces the defect.

Do not modify production code.
```

This is a primitive multi-agent verification system, but the interesting part is not the number of agents.

It is the separation of roles:

```text
construct
challenge
judge
prove
```

## 10. What this changes for engineering teams

A mature AI-assisted workflow should not collapse generation and assurance into one opaque interaction.

A stronger pipeline looks like:

```text
Repository instructions
        ↓
Context discovery
        ↓
Implementation plan
        ↓
Agent implementation
        ↓
Independent adversarial review
        ↓
Counterexample generation
        ↓
Automated tests
        ↓
Human review
        ↓
CI/CD
```

The AI reviewer is not an approval authority.

Its job is to find hypotheses that deserve verification before the change reaches production.

That is a much more defensible organizational role.

## 11. Measure reviewer precision and counterexample conversion

Take ten Copilot-generated changes and review them adversarially.

Track:

```text
Total AI reviewer findings       = 28
Human-confirmed defects          = 17
Rejected findings                = 11
```

Then calculate:

```text
Reviewer precision
= confirmed defects / total findings
= 17 / 28
= 61%
```

Now track something even stronger:

```text
Counterexample conversion rate
=
findings reproduced by a failing test
─────────────────────────────────────
confirmed findings
```

This distinguishes “the reviewer said something useful” from “the reviewer helped produce executable evidence.”

The goal is not more comments.

It is fewer, higher-confidence, reproducible defects.

The principle I would teach the team is:

> **Never trust an AI because another AI agrees with it. Trust the evidence the second AI helps you produce.**

## 12. Where to go next

Counterexamples lead naturally into a deeper testing question.

Instead of asking GPT to invent a few unit-test examples, what if we ask:

> **What must always be true for this system, across many possible inputs and executions?**

That moves from example-based test generation toward **invariant discovery and property-based testing**.

The next lesson uses GPT not merely to write tests, but to help discover the behavioral properties the tests should defend.