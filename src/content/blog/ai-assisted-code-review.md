---
title: "AI Code Review Is Not Asking a Model: Does This Look Good?"
description: "How to use AI as a structured code-review assistant for correctness, architecture, tests and risk without outsourcing engineering judgment."
pubDate: 2026-08-14
tags: ["AI-assisted Dev", "Code Review", "Testing", "Engineering Leadership"]
draft: false
featured: false
---

## Table of contents

- [1. Review is a different task from generation](#1-review-is-a-different-task-from-generation)
- [2. Give the reviewer a review contract](#2-give-the-reviewer-a-review-contract)
- [3. Review in layers](#3-review-in-layers)
- [4. Ask for evidence, not opinions](#4-ask-for-evidence-not-opinions)
- [5. Tests deserve their own review](#5-tests-deserve-their-own-review)
- [6. AI is useful for adversarial questions](#6-ai-is-useful-for-adversarial-questions)
- [7. Separate findings from fixes](#7-separate-findings-from-fixes)
- [8. Where AI review is weak](#8-where-ai-review-is-weak)
- [9. Reviewing AI-generated code needs extra discipline](#9-reviewing-ai-generated-code-needs-extra-discipline)
- [10. A team-level review workflow](#10-a-team-level-review-workflow)
- [11. A repository exercise](#11-a-repository-exercise)
- [12. What I would teach the team](#12-what-i-would-teach-the-team)

Once coding assistants started producing larger changes for me, a second question became more important than generation:

> **How should I review work that was produced quickly, confidently and across files I may not have touched myself?**

The obvious answer is to use AI for code review too.

But there is a trap.

This prompt is not a serious review process:

```text
Review this code. Does it look good?
```

The model will often produce something that sounds like a review: a few compliments, a few possible improvements and perhaps a warning about an edge case.

That is useful as a conversation.

It is not yet an engineering control.

A better approach is to treat AI review the same way we treated AI generation: define the task, provide relevant context, establish criteria and ask for evidence.

## 1. Review is a different task from generation

When generating a change, the model is trying to construct a solution.

When reviewing, the useful mindset is almost the opposite:

```text
GENERATE
“How can this work?”

REVIEW
“How can this be wrong?”
```

A reviewer should look for:

- incorrect assumptions;
- missing cases;
- unintended behavior;
- architecture violations;
- weak validation;
- security consequences;
- operational risk;
- unnecessary scope.

This is why I avoid asking the same agent simply to praise or confirm the solution it just produced.

Even when the same tool is used, the review prompt should deliberately create a different objective.

## 2. Give the reviewer a review contract

A useful review request names what matters.

For example:

```text
Review this change against the stated task and repository conventions.

Focus on:
- behavioral correctness;
- regressions;
- architecture boundaries;
- error handling;
- test coverage and test quality;
- unnecessary scope;
- security or operational implications.

For each material finding:
- identify the file/area;
- explain the failure scenario;
- state why it matters;
- distinguish confirmed defects from uncertain risks.

Do not rewrite the code yet.
```

This is much stronger than asking whether the code is “clean.”

## 3. Review in layers

I find layered review more reliable than one giant request.

### 3.1 Task alignment

Did the patch implement what was requested?

Did it also implement things that were not requested?

### 3.2 Behavioral correctness

What inputs, states and failure paths could produce the wrong behavior?

### 3.3 Architecture

Does the change respect existing boundaries?

Did infrastructure leak into domain code? Did a new dependency bypass an established abstraction?

### 3.4 Tests

Do the tests actually prove the behavior, or merely mirror the implementation?

### 3.5 Operational concerns

Does the change affect:

- retries;
- idempotency;
- concurrency;
- logging;
- configuration;
- deployment;
- permissions;
- data migration;
- performance?

Not every patch needs every layer. The review surface should follow the risk.

## 4. Ask for evidence, not opinions

Weak review feedback:

```text
This could potentially have a race condition.
```

Better review feedback:

```text
Two concurrent requests can both observe cacheEntry === undefined before
either write completes. Both then call the provider, so the new cache does
not enforce the intended single-fetch behavior under concurrency.
```

The second finding describes a mechanism.

That makes it reviewable by a human.

A useful instruction is:

> **For each finding, explain the concrete failure path.**

This filters out many generic model observations.

## 5. Tests deserve their own review

AI-generated tests can create false confidence.

A model may write a test that passes because it reproduces the implementation rather than checking the intended behavior.

Review tests for questions such as:

```text
Does this test fail against the old defect?
Does it test public behavior or internal mechanics?
Are important edge cases absent?
Are mocks hiding integration problems?
Are assertions strong enough?
Was an existing test weakened to make the change pass?
```

For bug fixes, one of my favorite checks is:

> **Would the new regression test fail before the fix?**

If not, it may not be proving the bug was fixed at all.

## 6. AI is useful for adversarial questions

A model can be particularly helpful when asked to attack assumptions.

Examples:

```text
What input would make this implementation behave incorrectly?
```

```text
Which invariant does this change assume but never enforce?
```

```text
What happens if the external call succeeds but persistence fails?
```

```text
How could two concurrent executions interact?
```

```text
Which existing callers could observe a behavior change?
```

These questions turn the model into a hypothesis generator for the human reviewer.

The human still decides whether the hypothesis is relevant and true.

## 7. Separate findings from fixes

I prefer the first review pass to identify problems without immediately editing code.

Why?

Because automatic fixing can hide the original reasoning.

A clean workflow is:

```text
PATCH
 ↓
AI REVIEW FINDINGS
 ↓
HUMAN TRIAGE
 ↓
SELECTED FIXES
 ↓
VALIDATION
```

The engineer decides which findings are real, important and in scope.

Only then should fixes be applied.

This also makes AI review much less noisy in pull requests.

## 8. Where AI review is weak

AI reviewers have predictable limitations.

### 8.1 Missing business context

The code may violate a rule that exists only in product knowledge or operational experience.

### 8.2 Plausible false positives

The model can invent risks that sound technically sophisticated but are impossible in the actual execution model.

### 8.3 Architecture ambiguity

If repository boundaries are undocumented, the model may approve a pattern the team considers unacceptable.

### 8.4 Large diff dilution

As changes grow, important details compete with a lot of context.

### 8.5 Security certainty

AI can help identify suspicious patterns but should not be treated as a security guarantee.

This is why AI review is best used as an additional reasoning layer, not an approval authority.

## 9. Reviewing AI-generated code needs extra discipline

There is a psychological problem with AI-generated changes: they appear faster than we can fully understand them.

A developer can ask for a feature and receive 300 lines across eight files in a minute.

That creates pressure to review at the speed of generation.

Do not.

The cost of producing the code has fallen. The cost of owning incorrect code has not.

For AI-generated changes, I explicitly check:

- Can I explain the architecture of the change?
- Can I explain why each modified file needed to change?
- Which assumptions did the agent make?
- What validation actually ran?
- Are the tests independent enough to catch a wrong implementation?
- Did the agent introduce a new abstraction or dependency unnecessarily?

If I cannot explain the code after review, I am not ready to own it.

## 10. A team-level review workflow

A practical team workflow could be:

```text
1. Developer defines task + acceptance criteria
2. AI/human implements change
3. Automated repository checks run
4. AI performs structured pre-review
5. Developer triages findings
6. Human peer reviews the final diff
7. CI remains authoritative for automated checks
```

The AI pre-review can reduce obvious mistakes before another engineer spends attention on the patch.

That is a useful role: improve the quality of the artifact that reaches human review.

It should not become:

```text
AI generated it
      ↓
AI reviewed it
      ↓
therefore ship it
```

That is circular confidence, not independent assurance.

## 11. A repository exercise

Take a pull request or local diff you already understand.

Ask the model to review it in three separate passes.

### Pass 1: correctness

```text
Find concrete behavior defects or regressions. For each finding, describe
the failure path. Ignore style.
```

### Pass 2: architecture

```text
Compare the diff with existing repository patterns and boundaries. Flag
only material deviations and cite the relevant code/context.
```

### Pass 3: tests

```text
Assess whether the tests would catch a plausible wrong implementation.
Identify missing cases and weak assertions.
```

Then classify every finding:

```text
confirmed defect
useful risk
not relevant
false positive
```

The measurable takeaway is not how many comments the AI produces.

It is:

> **How many material issues did the AI surface before human peer review, and how many of its findings were actually useful?**

## 12. What I would teach the team

After this first sequence of AI-assisted engineering concepts, the pattern is becoming clear.

The important skills are not isolated prompt tricks.

They connect:

```text
clear task specification
        ↓
repository instructions
        ↓
context engineering
        ↓
bounded agentic execution
        ↓
controlled external tools
        ↓
repeatable evaluation
        ↓
structured review
```

The model is only one layer in that system.

For engineering teams, the real opportunity is to design the entire workflow so AI can contribute without making engineering standards less explicit.

That is the difference between giving developers an AI coding tool and building an **AI-assisted engineering capability**.