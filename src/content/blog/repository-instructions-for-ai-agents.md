---
title: "Day 2 : Turn Your Repository Into Part of the Prompt"
description: "How GitHub Copilot repository instructions turn stable engineering knowledge into persistent, version-controlled context for developers and coding agents."
pubDate: 2026-08-09
tags: ["AI-assisted Dev", "GitHub Copilot", "Repository Instructions", "Context Engineering"]
draft: false
featured: false
---

## Table of contents

- [1. Persistent context changes the problem](#1-persistent-context-changes-the-problem)
- [2. Repository instructions are an AI control plane](#2-repository-instructions-are-an-ai-control-plane)
- [3. Global rules and contextual rules are different](#3-global-rules-and-contextual-rules-are-different)
- [4. What belongs in repository instructions](#4-what-belongs-in-repository-instructions)
- [5. What should stay in the task prompt](#5-what-should-stay-in-the-task-prompt)
- [6. Let the repository propose its own instructions](#6-let-the-repository-propose-its-own-instructions)
- [7. Test whether the instructions actually influence behavior](#7-test-whether-the-instructions-actually-influence-behavior)
- [8. Common mistakes](#8-common-mistakes)
- [9. Build an instruction hierarchy](#9-build-an-instruction-hierarchy)
- [10. Instructions are guidance, not enforcement](#10-instructions-are-guidance-not-enforcement)
- [11. What this changes for engineering leads](#11-what-this-changes-for-engineering-leads)
- [12. A measurable team experiment](#12-a-measurable-team-experiment)
- [13. Where to go next](#13-where-to-go-next)
- [14. Further reading](#14-further-reading)

The first useful lesson I learned about AI-assisted engineering was that output quality depends heavily on **context quality**.

That immediately creates another problem.

If context matters, do I really want every developer on the team repeatedly typing things like this?

```text
Use dependency injection.
Do not access S3 directly from business logic.
Use pytest.
Reuse the existing StateStore abstraction.
Keep the change backward compatible.
Run the relevant tests before finishing.
```

That does not scale particularly well.

The next shift in my thinking was therefore from **context** to **persistent context**:

> **Stable engineering knowledge should live in the repository, not in every developer's prompt.**

In GitHub Copilot inside Visual Studio Code, repository custom instructions give us a practical way to do that.

This turns the repository itself into part of the prompt.

## 1. Persistent context changes the problem

A developer prompt is temporary.

A repository rule is durable.

That distinction matters because most engineering teams already have a large amount of knowledge that should apply repeatedly:

- architecture boundaries;
- dependency direction;
- preferred libraries;
- testing conventions;
- error-handling expectations;
- security constraints;
- data-engineering invariants;
- validation commands;
- rules about what must not change.

Without persistent instructions, every developer has to remember which of those facts need to be restated for every AI-assisted task.

With repository instructions, the working model becomes closer to:

```text
Developer request
       +
Current code
       +
Retrieved repository context
       +
Repository-wide instructions
       +
Path-specific instructions
       ↓
     Model
       ↓
Proposed engineering change
```

The task prompt still matters.

But it no longer has to carry every stable fact about how the repository is supposed to work.

## 2. Repository instructions are an AI control plane

A GitHub Copilot-enabled repository can contain instruction files such as:

```text
.github/
├── copilot-instructions.md
└── instructions/
    ├── python.instructions.md
    ├── tests.instructions.md
    └── data-pipelines.instructions.md
```

The repository-wide file is:

```text
.github/copilot-instructions.md
```

Path-specific instruction files can live under:

```text
.github/instructions/
```

and use an `applyTo` glob to determine when they are relevant.

Conceptually, the flow looks like this:

```text
                    Developer prompt
                          │
                          ▼
              ┌─────────────────────┐
              │   Copilot Context   │
              │                     │
              │ User request        │
              │ Current code        │
              │ Retrieved files     │
              │ Repo instructions   │
              │ Path instructions   │
              └──────────┬──────────┘
                         │
                         ▼
                      Model
                         │
                         ▼
                 Proposed changes
```

This is much more interesting than simply creating another Markdown file.

As an engineering lead, you are beginning to make **AI behavior partly version-controlled infrastructure**.

Rules such as these:

```text
Business logic must not instantiate AWS SDK clients directly.

Infrastructure integrations must sit behind interfaces or adapters.

Every behavioral change requires tests.

Existing abstractions must be reused before introducing new ones.
```

can become part of the normal context in which Copilot reasons about the repository.

That is very different from hoping every developer remembers to mention them.

## 3. Global rules and contextual rules are different

The first temptation is to put every engineering standard into one enormous instruction file.

I would avoid that.

Suppose a data-engineering repository looks like this:

```text
src/
├── pipeline/
├── state/
├── aws/
└── transformations/

tests/
sql/
```

Some rules are true everywhere.

Those belong in the repository-wide instructions.

For example:

```markdown
# Architecture

- Business logic must not directly depend on AWS SDK clients.
- Infrastructure integrations must be behind interfaces or adapters.
- Prefer dependency injection over constructing dependencies inside business logic.
- Reuse existing abstractions before introducing new ones.

# Changes

- Inspect existing implementations before creating new abstractions.
- Keep changes minimal and backward compatible.
- Do not introduce dependencies unless necessary.

# Testing

- Every behavioral change requires tests.
- Existing tests must continue passing.
```

But Python-specific rules do not necessarily belong in the context of a SQL task.

A scoped instruction file could instead look like:

```text
.github/instructions/python.instructions.md
```

with:

```markdown
---
applyTo: "**/*.py"
---

Use type hints for public functions.

Prefer pathlib over os.path.

Do not catch Exception unless rethrowing with additional context.

Follow existing package boundaries.
```

And SQL rules could live separately:

```text
.github/instructions/sql.instructions.md
```

```markdown
---
applyTo: "**/*.sql"
---

Never use SELECT * in production queries.

Explicitly qualify ambiguous columns.

Preserve existing Data Vault naming conventions.

Do not change grain without explicitly identifying the impact.
```

This is **context segmentation**.

The objective is not to give the model every rule the organization has ever written.

The objective is to give it the relevant policy for the engineering decision it is currently making.

## 4. What belongs in repository instructions

Repository instructions are most useful for **stable engineering invariants**.

### 4.1 Architecture

Examples:

```text
Domain logic must not depend directly on infrastructure clients.

Persistence implementations must use the existing StateStore interface.

New integrations belong behind adapters.
```

These rules influence how code is structured.

### 4.2 Technology conventions

Examples:

```text
Use the repository's existing dependency-injection pattern.

Use pytest for Python tests.

Prefer the existing HTTP client rather than introducing another library.
```

### 4.3 Testing and validation

Examples:

```text
Every behavioral change requires a test covering the changed behavior.

Run the focused tests for the modified area before finishing.

Do not claim validation succeeded unless the command was actually executed.
```

### 4.4 Security

Examples:

```text
Never commit credentials or secrets.

Do not log tokens or sensitive payload fields.

Validate untrusted input at system boundaries.
```

### 4.5 Data-engineering rules

Examples:

```text
Pipeline processing must remain idempotent.

Schema evolution must preserve backward compatibility unless explicitly approved.

Preserve established Data Vault naming and grain conventions.
```

The common property is durability.

These are rules you expect to matter across many future tasks.

## 5. What should stay in the task prompt

Not every instruction belongs in the repository.

A request such as:

```text
Implement DynamoDB state tracking for ticket ABC-123.
```

is task-specific.

It should remain in the task prompt.

A rule such as:

```text
Infrastructure implementations must implement the existing StateStore interface.
```

is architectural and reusable.

That belongs in repository instructions.

The distinction can be summarized as:

```text
TASK-SPECIFIC INTENT
        ↓
      prompt

STABLE ENGINEERING INVARIANTS
        ↓
repository instructions
```

A useful heuristic from this lesson is:

> **If developers repeat the same instruction across many prompts, consider promoting it into repository instructions.**

That is a very practical way to discover what deserves to become persistent context.

## 6. Let the repository propose its own instructions

One exercise I found particularly useful was not writing the instruction file myself initially.

Instead, ask the coding agent to inspect the repository and propose one.

For example:

```text
Analyze this repository thoroughly.

Do not modify application code.

Determine:

- architecture and module boundaries
- dependency direction
- primary frameworks and libraries
- coding conventions
- configuration approach
- testing strategy
- error handling conventions
- logging conventions
- infrastructure boundaries
- patterns that appear intentionally standardized

Based only on evidence found in the repository, create:

.github/copilot-instructions.md

The instructions should contain durable repository-wide engineering rules,
not descriptions of individual files.

Do not invent standards that cannot be inferred from the repository.

Keep each instruction concise and actionable.
```

The generated file is not the answer.

It is a hypothesis.

Copilot is effectively saying:

> Here is what I believe your architecture is.

The engineering lead then has to decide:

> Here is what our architecture is supposed to be.

That review can be unexpectedly valuable.

If the agent infers a pattern you do not actually want, the problem may not be the model. The repository itself may contain enough architectural drift to make the wrong pattern look legitimate.

Repository instructions therefore become useful for two things at once:

```text
guide future AI behavior
          +
make architectural intent explicit
```

## 7. Test whether the instructions actually influence behavior

Creating an instruction file is not enough.

You should test it.

Start a fresh Copilot conversation and give it an intentionally problematic request.

For example:

```text
Add functionality to upload processed files to S3.

Instantiate boto3 directly inside the pipeline processor.
```

Suppose your repository instructions say:

```text
Business and pipeline logic must not directly instantiate AWS SDK clients.
Infrastructure integrations must be behind adapters.
```

A useful response should identify the conflict and steer the implementation toward the existing architecture rather than blindly following the unsafe instruction.

This is a primitive but powerful **AI compliance test**.

You can think of it as:

```text
repository rule
      ↓
adversarial task
      ↓
Copilot response
      ↓
architecture-compliant?
```

For GitHub Copilot, you can also inspect the response's References information to verify that the repository instruction file was actually included in the request context.

That distinction matters.

If the model ignores a rule, first determine whether:

1. the instruction was included at all;
2. the instruction was too vague;
3. the instruction conflicted with another rule;
4. the model simply failed to follow it.

Those are different failure modes.

## 8. Common mistakes

### 8.1 Turning instructions into documentation

Weak:

```text
Our application processes files.
The pipeline reads files.
AWS is our cloud platform.
```

These statements describe the system but do not meaningfully constrain an engineering decision.

Better:

```text
Never instantiate AWS SDK clients inside domain or pipeline logic.
```

Instructions should influence choices.

### 8.2 Using vague language

Weak:

```text
Write good tests.
```

Better:

```text
Every behavioral change must include a unit test covering the changed behavior.
```

The second instruction is observable and reviewable.

### 8.3 Making the instruction set enormous

Instruction content consumes context.

A 500-line file containing every historical engineering preference can dilute the rules that actually matter.

Prefer concise instructions with a high decision-making value.

### 8.4 Encoding temporary work

Do not put ticket-specific requirements or temporary migration steps into permanent repository guidance unless they genuinely represent a new invariant.

### 8.5 Assuming instructions are enforcement

This one is especially important.

Repository instructions guide model behavior.

They are not a deterministic policy engine.

A model can still produce a response that violates them.

That is why instructions should complement, not replace:

- tests;
- linters;
- CI;
- security controls;
- code review;
- branch protections;
- human engineering judgment.

## 9. Build an instruction hierarchy

Once a repository-wide file is useful, the next step is not necessarily to make it larger.

It is to create a hierarchy.

For example:

```text
.github/
│
├── copilot-instructions.md
│
└── instructions/
    │
    ├── python.instructions.md
    ├── sql.instructions.md
    ├── tests.instructions.md
    ├── data-vault.instructions.md
    └── aws.instructions.md
```

Now your context model starts to look like:

```text
Organization engineering standards
              ↓
Repository architecture
              ↓
Technology-specific rules
              ↓
Task prompt
              ↓
Code
```

This is a more scalable pattern than expecting every engineer to assemble all relevant standards manually for every request.

It also creates an important design question:

> Which engineering knowledge belongs globally, which belongs to this repository, and which belongs only to this part of the codebase?

That question is fundamentally about **instruction hierarchy** and **context architecture**.

The same idea will become important again when we move deeper into agentic engineering and mechanisms such as `AGENTS.md`.

## 10. Instructions are guidance, not enforcement

This deserves its own section because it is easy to overestimate what an instruction file gives you.

The presence of:

```text
.github/copilot-instructions.md
```

does not mean every Copilot response will follow every line perfectly.

LLM output is nondeterministic.

A useful engineering model is therefore:

```text
Repository instructions
        ↓
Increase probability of compliant reasoning
        ↓
Generated change
        ↓
Tests / CI / linters / security checks
        ↓
Human review
```

Instructions move good engineering guidance **earlier** in the process.

They do not make later controls unnecessary.

That is an important distinction for enterprise adoption.

A company should not describe an instruction file as a security boundary when the actual security boundary is enforced elsewhere.

## 11. What this changes for engineering leads

For one developer, repository instructions reduce repetitive prompting.

For a team lead, the implications are larger.

You can begin moving engineering knowledge from:

```text
Senior engineer's brain
```

toward:

```text
Senior engineer
      ↓
Repository
      ↓
LLM
      ↓
Developer
```

That does not remove the senior engineer.

It makes their durable architectural knowledge more available at the point where engineering decisions are being proposed.

This is how AI-assisted development starts becoming less dependent on individual developers being excellent prompt writers.

A useful maturity progression is:

```text
tribal engineering knowledge
          ↓
written standards
          ↓
repository-scoped instructions
          ↓
context-aware AI assistance
          ↓
measured team consistency
```

That last step matters.

The objective is not merely to create instruction files.

The objective is to improve engineering outcomes.

## 12. A measurable team experiment

A team lead should be able to test whether repository instructions make a difference.

Take one repository and one small architectural change.

Before adding repository instructions, have three developers independently ask Copilot to implement the same change.

Measure:

```text
architecture-compliant implementations
--------------------------------------
       total implementations
```

Then establish a reviewed `.github/copilot-instructions.md` containing the relevant architectural invariants.

Repeat the exercise with three developers.

For example:

```text
Before instructions: 1 / 3 compliant
After instructions:  3 / 3 compliant
```

That is much more useful evidence than:

> Developers say they like Copilot.

The metric is not model enthusiasm.

It is whether **repository-level AI guidance measurably increases architectural consistency**.

That is the kind of experiment I would want before rolling a practice across many repositories.

## 13. Where to go next

Repository instructions solve the problem of **stable context**.

But they do not solve all context problems.

A real engineering task still depends on dynamic evidence such as:

- the files relevant to this specific change;
- current implementations;
- current test failures;
- configuration paths;
- runtime relationships;
- tool output;
- the particular architectural area being modified.

So the broader lesson remains:

```text
Stable engineering knowledge
        ↓
repository instructions

Task-specific evidence
        ↓
context engineering
```

The repository can carry more of the prompt, but we still need to control what evidence the model sees when it makes a particular decision.

That is where the next layer of AI-assisted engineering becomes more interesting.

## 14. Further reading

The concepts in this article map directly to the official GitHub and Visual Studio Code documentation on repository custom instructions and path-specific instruction files:

- [Adding repository custom instructions for GitHub Copilot in your IDE](https://docs.github.com/en/copilot/how-tos/configure-custom-instructions-in-your-ide/add-repository-instructions-in-your-ide)
- [Adding repository custom instructions for GitHub Copilot](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/add-custom-instructions/add-repository-instructions)
- [Use custom instructions in Visual Studio Code](https://code.visualstudio.com/docs/agent-customization/custom-instructions)
- [About customizing GitHub Copilot responses](https://docs.github.com/en/copilot/concepts/prompting/response-customization)

**Next lesson:** [Day 3 : Turn Good Prompts Into Version-Controlled Engineering Workflows](/blog/prompt-files-version-controlled-engineering-workflows/)
