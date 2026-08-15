---
title: "Day 1 : Context Engineering: Stop Prompting, Start Controlling Context"
description: "Why better AI-assisted engineering starts by controlling what GitHub Copilot can see, separating repository discovery from implementation, and verifying its architectural model before code changes begin."
pubDate: 2026-08-08
tags: ["AI-assisted Dev", "GitHub Copilot", "Context Engineering", "Engineering Practice"]
draft: false
featured: false
---

## Table of contents

- [1. The shift from prompting to context engineering](#1-the-shift-from-prompting-to-context-engineering)
- [2. The model does not automatically understand your repository](#2-the-model-does-not-automatically-understand-your-repository)
- [3. A technically correct answer can still be architecturally wrong](#3-a-technically-correct-answer-can-still-be-architecturally-wrong)
- [4. Context bounding: control where the agent reasons from](#4-context-bounding-control-where-the-agent-reasons-from)
- [5. Separate discovery from implementation](#5-separate-discovery-from-implementation)
  - [5.1 Stage A: Discovery](#51-stage-a-discovery)
  - [5.2 Stage B: Architecture](#52-stage-b-architecture)
  - [5.3 Stage C: Challenge the design](#53-stage-c-challenge-the-design)
  - [5.4 Stage D: Implementation](#54-stage-d-implementation)
- [6. Generate, critique, verify, execute](#6-generate-critique-verify-execute)
- [7. A practical repository exercise](#7-a-practical-repository-exercise)
- [8. The team-lead lesson: move context into the repository](#8-the-team-lead-lesson-move-context-into-the-repository)
- [9. What I would remember](#9-what-i-would-remember)
- [10. Where to go next](#10-where-to-go-next)

When I started getting serious about AI-assisted software development, one of the easiest traps was to focus on the wording of the prompt.

How should I phrase this request?

Should I make it longer?

Should I tell Copilot to act as a senior engineer or architect?

Those things can affect the answer. But the more important question is usually simpler:

> **What information does the model actually have available when it makes this decision?**

That is the shift from **prompting** to **context engineering**.

A useful mental model is:

```text
Instructions + Context + Your Request
                ↓
         Generated Output
```

If the context is weak, incomplete or misleading, a beautifully worded request can still produce the wrong engineering decision.

For software teams, this matters much more than learning a collection of prompt tricks. Real repository work depends on architecture, existing abstractions, configuration, tests, dependency direction and team conventions. If the model cannot see enough evidence for those things, it has to fill the gaps somehow.

And that is where plausible code can become dangerous code.

## 1. The shift from prompting to context engineering

A beginner question is often:

> How do I write a better prompt?

A more useful engineering question is:

> **Does the model currently have enough evidence to understand how this repository expects the change to be implemented?**

Imagine asking GitHub Copilot:

```text
Refactor this class using our project's architecture.
```

The request sounds reasonable. But the phrase `our project's architecture` is only meaningful if the relevant architectural information is available to the model.

Depending on how the assistant gathers context, it may have access to some combination of:

```text
current file
+ open files
+ conversation
+ repository context retrieved by Copilot
+ repository instructions
+ files explicitly referenced
```

What it does **not** have is magical, perfect understanding of every relationship in the repository.

That distinction explains a lot of disappointing AI-assisted development.

The problem is not always that the model is incapable of producing the right code.

Sometimes the model was never given enough evidence to know what *right* means in this codebase.

## 2. The model does not automatically understand your repository

Consider a repository like this:

```text
pdi/
├── src/
│   ├── readers/
│   │   └── fixed_length_reader.py
│   ├── writers/
│   │   └── csv_writer.py
│   ├── state/
│   │   ├── interface.py
│   │   └── dynamodb.py
│   └── pipeline.py
├── tests/
├── config.json
└── README.md
```

Now ask:

```text
Add DynamoDB state tracking to the pipeline.
```

A model can easily generate something like:

```python
dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("processing-state")
table.put_item(...)
```

It may compile.

It may even work in isolation.

But that tells us almost nothing about whether it belongs in the architecture.

The repository may already define a state abstraction:

```python
class StateStore(ABC):
    @abstractmethod
    def is_processed(self, file):
        ...

    @abstractmethod
    def mark_processed(self, file):
        ...
```

If that abstraction exists, then the intended dependency direction may be:

```text
pipeline
   ↓
StateStore
   ↓
DynamoDBStateStore
   ↓
boto3
```

not:

```text
pipeline
   ↓
boto3
```

The difference is architectural, not syntactic.

The model may be perfectly capable of writing both versions. The question is whether its context gives it enough evidence to choose the version that fits the repository.

## 3. A technically correct answer can still be architecturally wrong

This was one of the most useful lessons for me because it changes how I judge AI output.

Code can be:

```text
syntactically valid
        ↓
functionally plausible
        ↓
locally testable
        ↓
still wrong for the repository
```

Why?

Because software engineering is constrained by more than local behavior.

A change may need to respect:

- existing interfaces;
- dependency direction;
- configuration flow;
- test structure;
- infrastructure boundaries;
- backward compatibility;
- conventions already encoded elsewhere in the repository.

If Copilot sees only `pipeline.py`, it can solve the task as if `pipeline.py` were the whole system.

If it sees the state interface, implementations, configuration and relevant tests, it can reason from a much better model of the system.

That leads to a practical rule:

> **Before improving the prompt, improve the evidence available to the model.**

## 4. Context bounding: control where the agent reasons from

One technique that immediately makes non-trivial Copilot work more reliable is **context bounding**.

Do not only tell the agent what to build.

Tell it what parts of the repository it should inspect before making an architectural decision.

For example:

```text
Analyze the repository before making changes.

For this task, inspect:

- src/state/
- src/pipeline.py
- config.json
- tests related to state management

Identify the existing abstraction for application state.

Do not introduce direct infrastructure dependencies into pipeline.py
if an abstraction already exists.

Before modifying code, explain:

1. current call flow
2. relevant interfaces
3. proposed files to change
4. why each file needs modification

Only then implement the change.
```

The important thing here is not the length of the prompt.

It is that we are controlling the **reasoning environment**.

We are telling the agent where architectural evidence should come from and giving ourselves a checkpoint before it edits anything.

This is especially useful in repositories where the obvious implementation point is not the correct architectural boundary.

## 5. Separate discovery from implementation

Another mistake is bundling too many cognitive tasks into a single request.

For example:

```text
Analyze my repository and implement DynamoDB state management.
```

That sounds efficient, but it combines several different problems:

```text
Repository discovery
        ↓
Architecture inference
        ↓
Change design
        ↓
Implementation
        ↓
Testing
```

If the first stage is wrong, every later stage can build confidently on the wrong model.

A better approach is to separate the work.

### 5.1 Stage A: Discovery

Start by asking the agent to understand the system without changing it.

```text
Analyze how application state is currently managed.

Do not modify any files.

Identify:
- relevant classes
- interfaces
- implementations
- callers
- configuration
- tests

Produce the current call graph.
```

Now you can inspect the agent's mental model before allowing edits.

This matters because **Copilot's model of the repository is not necessarily the same as yours**.

That gap is something an experienced engineer should actively manage.

### 5.2 Stage B: Architecture

Once discovery looks correct, ask for the proposed integration.

```text
Based only on the architecture you identified,
propose how DynamoDB state management should integrate.

Prefer existing abstractions over introducing new ones.

List files that would change.

Do not implement yet.
```

This keeps design visible and reviewable.

It also forces the agent to connect the proposed change to evidence it has already found in the repository.

### 5.3 Stage C: Challenge the design

This is the stage I think many developers skip.

Do not immediately accept the first design because it sounds coherent.

Ask the agent to attack its own proposal:

```text
Critique your proposed design.

Look specifically for:
- unnecessary coupling
- violation of existing abstractions
- AWS-specific logic leaking into domain logic
- testability problems
- backwards compatibility issues
- unnecessary complexity

Revise the design if necessary.
```

The value here is not that the model becomes an infallible reviewer of itself.

The value is that we deliberately introduce a second reasoning pass before code generation.

### 5.4 Stage D: Implementation

Only after discovery, architecture and critique should implementation begin.

```text
Implement the revised design.

Keep the change minimal.

Reuse existing abstractions.

Add or update tests for every changed behavior.
```

Now the generated code is downstream of an architectural process instead of being the first thing the model does.

## 6. Generate, critique, verify, execute

The broader pattern is simple:

```text
Generate
   ↓
Critique
   ↓
Verify
   ↓
Execute
```

not:

```text
Prompt
   ↓
Generate code
```

That distinction becomes increasingly important as coding assistants gain more autonomy.

A model that only explains code can be wrong and waste a few minutes.

An agent that can search the repository, modify several files and run commands can amplify a wrong architectural assumption much further before you notice it.

The answer is not to avoid agentic workflows.

It is to create deliberate checkpoints where the model's understanding can be inspected before responsibility increases.

## 7. A practical repository exercise

Take one reasonably complex repository that you know well.

Open Copilot Agent mode in Visual Studio Code.

Do **not** ask it to modify anything.

Give it this task:

```text
Analyze this repository as a senior software architect.

Do not modify any files.

Determine:

1. the primary application entry points
2. major components/modules
3. dependency direction between them
4. important interfaces/abstractions
5. external infrastructure dependencies
6. configuration flow
7. test architecture

Then produce a Mermaid call/dependency diagram showing the major runtime relationships.

For every architectural conclusion, mention the files that support it.

Explicitly distinguish facts discovered from the repository from assumptions.
```

Then compare its model with your own understanding of the repository.

Do not focus only on obvious mistakes. Look for missing relationships and hidden assumptions.

After that, ask it to challenge itself:

```text
Now challenge your own analysis.

Search the repository for evidence that contradicts your architectural model.

Specifically look for:
- alternate entry points
- dependency inversion
- factories
- adapters
- dependency injection
- runtime configuration
- dynamically selected implementations
- indirect callers

Return only corrections or missing relationships.
```

This exercise is valuable because it tests something more important than whether Copilot can generate code.

It tests whether the model can build a repository model that is good enough to support later engineering decisions.

## 8. The team-lead lesson: move context into the repository

For an individual developer, manually providing context can work.

For a team, it does not scale well if everyone has to remember the same architectural constraints in every conversation.

Eventually, knowledge such as this:

```text
Use existing interfaces.
Don't bypass the state abstraction.
Infrastructure belongs behind adapters.
Run tests after modifications.
Don't introduce new dependencies without justification.
```

should become durable repository context.

That is where repository-level guidance such as:

```text
.github/
    copilot-instructions.md
```

becomes important.

The direction of travel is:

```text
developer knows architecture
            ↓
developer repeatedly explains architecture to AI
            ↓
repository encodes durable engineering guidance
            ↓
developer + repository + AI share more of the same context
```

That is a much more scalable model for a team.

The objective is not to remove engineering judgment from developers. It is to stop requiring every developer to manually re-teach the same repository facts to the assistant on every task.

## 9. What I would remember

If I had to reduce this lesson to one line, it would be:

> **LLM output quality is often constrained more by context quality than prompt cleverness.**

Before asking Copilot to write code, I now want to know:

```text
What does the model know?
        ↓
What evidence is that knowledge based on?
        ↓
What important repository information is missing?
        ↓
Can I verify its architectural model before it edits?
```

If the answer is that the model does not have enough evidence, the first task is not to improve the wording of the implementation request.

The first task is to **fix the context**.

## 10. Where to go next

Context bounding helps on an individual task, but repeating the same architecture, coding standards and constraints manually is inefficient.

The natural next question is:

> How do we make Copilot automatically inherit more of the team's engineering expectations from the repository itself?

That leads directly to repository-level Copilot instructions: turning architecture rules, coding standards and engineering constraints into durable context rather than repeated prompt text.

**Next lesson:** [Day 2 : Turn Your Repository Into Part of the Prompt](/blog/repository-instructions-for-ai-agents/)
