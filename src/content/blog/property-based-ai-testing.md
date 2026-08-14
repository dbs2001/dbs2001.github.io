---
title: "Make GPT Discover What Must Always Be True"
description: "How AI-assisted invariant discovery and property-based testing can reveal behavioral guarantees that example-based unit tests often miss."
pubDate: 2026-08-14
tags: ["AI-assisted Dev", "Testing", "Property-Based Testing", "Engineering Quality"]
draft: false
featured: false
---

> **New to invariants and property-based testing?** Start with [Invariant Discovery and Property-Based Testing: The 5-Minute Mental Model](/blog/invariant-discovery-and-property-based-testing/) for a short explanation with one software example and one data-engineering example, then continue here for the AI-assisted workflow.

## Table of contents

- [1. Stop asking only for example tests](#1-stop-asking-only-for-example-tests)
- [2. Ask what must always remain true](#2-ask-what-must-always-remain-true)
- [3. GPT is a hypothesis generator, not the source of truth](#3-gpt-is-a-hypothesis-generator-not-the-source-of-truth)
- [4. Where invariant discovery is especially useful](#4-where-invariant-discovery-is-especially-useful)
- [5. Turn invariants into property-based tests](#5-turn-invariants-into-property-based-tests)
- [6. Distinguish examples from properties](#6-distinguish-examples-from-properties)
- [7. Common mistakes](#7-common-mistakes)
- [8. Today's repository exercise](#8-todays-repository-exercise)
- [9. Advanced challenge: mutation-driven GPT testing](#9-advanced-challenge-mutation-driven-gpt-testing)
- [10. What this changes for engineering teams](#10-what-this-changes-for-engineering-teams)
- [11. Measure mutation detection](#11-measure-mutation-detection)
- [12. The larger progression](#12-the-larger-progression)

Most developers who start using Copilot for testing do something perfectly reasonable:

```text
Write unit tests for calculate_total().
```

The model then produces examples:

```python
def test_total():
    assert calculate_total([10, 20]) == 30


def test_empty():
    assert calculate_total([]) == 0
```

That is useful.

It is also only the beginning.

After working through context control, bounded agents and adversarial verification, a more interesting testing question emerged:

> **Can GPT help us discover what must always be true, rather than merely generate a few examples?**

That is the idea behind **AI-assisted invariant discovery**.

The model proposes behavioral properties. Executable tests then determine whether the implementation actually satisfies them.

This moves AI-assisted testing from:

```text
more test cases
```

into:

```text
better understanding of system guarantees
```

## 1. Stop asking only for example tests

Consider a file-processing workflow:

```python
def process(file):
    if state.is_processed(file.sha256):
        return SKIPPED

    result = transform(file)
    writer.write(result)
    state.mark_processed(file.sha256)

    return SUCCESS
```

A normal unit-test request might generate:

```text
processes a new file
skips an existing file
returns success
```

Those examples matter.

But the system also contains deeper properties.

For example:

```text
Invariant 1
The same file content must never be successfully processed twice.

Invariant 2
Two files with different content must not collide merely because
their filenames are identical.

Invariant 3
A failed transformation must never mark the file as processed.

Invariant 4
A failed write must never mark the file as processed.

Invariant 5
Retrying after failure must remain possible.

Invariant 6
Changing storage implementation must not change processing semantics.
```

Those statements describe the **behavioral contract of the system**, not one particular example.

## 2. Ask what must always remain true

The useful shift is from:

```text
Given input X, expect output Y.
```

into:

```text
Across all valid executions, which properties must never be violated?
```

That changes the model's task.

Instead of mirroring implementation branches, it has to reason across:

```text
requirements
+
interfaces
+
callers
+
error paths
+
state transitions
+
existing tests
+
domain behavior
```

and propose higher-level guarantees.

For a data-processing system, possible invariants might include:

```text
rerunning the same batch is idempotent

failed batches do not advance processing state

primary-key uniqueness remains preserved

record count does not increase unexpectedly

nullability constraints remain preserved

schema mapping does not silently discard fields
```

Those are much closer to production guarantees than “input A produces output B.”

## 3. GPT is a hypothesis generator, not the source of truth

There is an important boundary here.

GPT can inspect the repository and propose:

> This appears to be an invariant.

That does not make it a requirement.

The model may infer behavior that sounds reasonable but was never promised by the system.

So I want every proposed invariant to come with evidence.

A useful format is:

```text
INVARIANT
The property that should always hold.

EVIDENCE
Repository evidence suggesting this is intended behavior.

VIOLATION
A concrete scenario that would violate it.

CURRENT COVERAGE
Whether existing tests already verify it.

TESTABILITY
How it could be tested automatically.

CONFIDENCE
HIGH / MEDIUM / LOW
```

The model proposes the hypothesis.

The engineer evaluates whether the repository actually supports it.

The test suite then provides executable evidence.

That separation is essential:

> **GPT proposes the invariant. Tests establish whether the implementation satisfies it.**

## 4. Where invariant discovery is especially useful

This technique is most interesting where behavior has a large input or state space.

Examples include:

- data pipelines;
- parsers;
- transformations;
- state machines;
- caching;
- retry logic;
- deduplication;
- financial calculations;
- serialization/deserialization;
- concurrency;
- migration code;
- APIs with rich validation rules.

It is less compelling for trivial CRUD behavior that is already exhaustively enumerated.

For data engineering, invariant thinking is particularly natural.

Consider:

```text
source
  ↓
parse
  ↓
transform
  ↓
validate
  ↓
write
```

At every boundary, there are properties that may need to survive:

```text
identity
cardinality
uniqueness
ordering
schema compatibility
idempotency
state progression
error isolation
```

AI can help surface these relationships because it can inspect code and tests together rather than generate tests from one function in isolation.

## 5. Turn invariants into property-based tests

Once a high-confidence invariant is accepted, the next step is to test it over a class of inputs.

For example, instead of only checking:

```python
assert normalize("ABC") == "abc"
```

we can test an idempotence property:

```text
normalize(normalize(x)) == normalize(x)
```

for many generated values of `x`.

Other classic properties include:

```text
deserialize(serialize(x)) == x
```

```text
decrypt(encrypt(x)) == x
```

```text
sort(sort(x)) == sort(x)
```

The point is not that every function has a mathematical property.

The point is that many systems contain **behavioral relationships** that are stronger than individual examples.

For each accepted invariant, ask the model to design:

```text
generated inputs
constraints on those inputs
property being asserted
edge cases
shrinking value
expected failure interpretation
```

In Python, a framework such as Hypothesis can generate broad input spaces and shrink failures toward a minimal counterexample.

The value is not “random testing.”

It is systematic exploration of a domain property.

## 6. Distinguish examples from properties

This distinction is easy to blur.

Example:

```text
SHA256("file1") != SHA256("file2")
```

That is one observation about two inputs.

Property:

```text
Different content identities must not be treated as identical
by application state merely because metadata such as filename matches.
```

The property describes a class of behavior.

A good property-based test generates many valid instances from that class.

Similarly:

Example:

```text
serialize(user1) can be deserialized.
```

Property:

```text
For every valid User object x,
deserialize(serialize(x)) preserves the relevant fields of x.
```

This is where AI can help developers move from branch coverage toward behavioral reasoning.

## 7. Common mistakes

### 7.1 Treating GPT-generated invariants as requirements

A model may invent plausible business rules.

Require repository evidence before accepting them.

### 7.2 Calling an example a property

A single input/output pair does not define a general guarantee.

### 7.3 Generating meaningless randomness

Purely random input often produces invalid garbage that teaches very little.

Generators should reflect the domain's valid and interesting space.

### 7.4 Duplicating unit tests hundreds of times

Property tests should explore classes of behavior, not replay the same assertion with random values.

### 7.5 Ignoring failure interpretation

A failed property test should tell you which system guarantee may be broken.

The property needs a clear semantic meaning, not just an opaque assertion.

## 8. Today's repository exercise

Choose one important function, component or pipeline.

Ask Copilot:

```text
Analyze this component and its callers, tests, interfaces
and documented requirements.

Do not modify code.

Identify behavioral invariants that should hold for
all valid executions.

For each proposed invariant provide:

INVARIANT
The property that must always hold.

EVIDENCE
Repository evidence suggesting this is intended behavior.

VIOLATION
A concrete scenario that would violate the invariant.

CURRENT COVERAGE
Whether existing tests verify the property.

TESTABILITY
How the invariant could be tested automatically.

CONFIDENCE
HIGH / MEDIUM / LOW.

Do not infer business requirements without repository evidence.
```

Review the proposed invariants yourself.

Suppose it returns twelve:

```text
7 genuinely important
3 already covered
2 speculative
```

The seven important ones become candidates for stronger tests.

Then ask:

```text
For the HIGH-confidence invariants,
design property-based tests.

Do not modify production code.

For each property identify:
- generated inputs
- constraints on those inputs
- property being asserted
- edge cases
- shrinking value
- expected failure interpretation
```

That turns the model from a test writer into a **behavioral hypothesis generator**.

## 9. Advanced challenge: mutation-driven GPT testing

The strongest exercise in this lesson is to deliberately introduce a subtle defect on a local branch.

For example, change:

```python
if state.is_processed(file.sha256):
```

into:

```python
if state.is_processed(file.name):
```

Do not tell Copilot what changed.

Ask it to derive invariants and property tests from the repository.

Then run the tests.

The question is:

> **Can the AI-derived test strategy detect the mutation?**

Conceptually:

```text
Correct implementation
        │
        ▼
Introduce controlled defect
        │
        ▼
Run test suite
      /     \
   FAIL     PASS
    │        │
    │        └── Test suite failed to detect defect
    │
    └── Mutation killed
```

This introduces a more rigorous standard than coverage percentage.

A test suite may execute every line and still fail to detect meaningful behavioral mistakes.

Mutation testing asks whether the tests can **distinguish correct behavior from plausible wrong behavior**.

The longer-term loop becomes:

```text
GPT invariant discovery
        ↓
GPT property generation
        ↓
Mutation testing
        ↓
Coverage gaps
        ↓
GPT generates new hypotheses
```

That is much closer to engineering assurance than “write me more tests.”

## 10. What this changes for engineering teams

AI-assisted testing is often sold as a productivity feature:

```text
write tests faster
increase coverage faster
```

Those benefits are real, but they are not the most interesting part.

The deeper opportunity is to use AI to help teams ask better questions about behavior:

```text
What must remain invariant?
What input classes have we ignored?
What state transitions are unsafe?
What failure paths violate idempotency?
What mutation would our current tests fail to detect?
```

That changes the quality conversation.

The model is not replacing test design.

It is broadening the hypothesis space engineers can investigate.

## 11. Measure mutation detection

Choose one critical component and have the team establish five HIGH-confidence invariants with Copilot.

Then introduce five controlled behavioral mutations.

Measure:

```text
Mutation detection rate
=
mutations detected by tests
───────────────────────────
total mutations introduced
```

Example:

```text
Mutations introduced:   5
Tests caught:            4

Detection rate:         80%
```

This is more meaningful than simply counting generated test cases.

It asks whether the test strategy actually notices important wrong behavior.

The principle I would teach the team is:

> **Do not use Copilot merely to write more tests. Use it to discover properties of the system that your existing tests never thought to verify.**

## 12. The larger progression

Looking back at this first sequence, the lessons form a coherent engineering path:

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
```

The progression matters because each layer controls a different failure mode.

Context engineering improves what the model sees.

Repository instructions encode durable engineering policy.

Prompt files standardize repeatable procedures.

Context budgeting controls the working set.

Plan–Execute–Verify controls agent scope.

Adversarial review challenges implementation assumptions.

Property-based testing turns those challenges into stronger behavioral guarantees.

That is the direction I find much more useful than treating AI adoption as a collection of prompt tricks.

The real objective is to build an **AI-assisted engineering system** in which models can do more work while architecture, evidence and accountability remain explicit.