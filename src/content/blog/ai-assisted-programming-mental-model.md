---
title: "I Thought GitHub Copilot and GPT Were the Same Thing"
description: "A software engineer's mental model for LLMs, coding assistants, agents, context, and the first steps into AI-assisted software development."
pubDate: 2026-08-09
tags: ["AI-assisted Dev", "GitHub Copilot", "LLMs", "Agentic coding"]
draft: false
featured: true
---

If you have spent years writing software without AI assistance, the first few weeks with modern coding tools can be unexpectedly confusing.

You open Visual Studio Code. GitHub Copilot is installed. A model selector offers GPT and Claude. Another engineer tells you to try Claude Code. Someone else says the model matters less than the agent. Suddenly a tool that was supposed to make programming easier has introduced an entirely new vocabulary.

My first useful realization was surprisingly basic:

> **GitHub Copilot and the LLM behind it are not the same thing.**

That distinction is the foundation for understanding modern AI-assisted software development.

This article builds the mental model I wish I had before comparing models, subscriptions, prompts, and coding agents.

## The four layers

Start with four separate layers:

```text
YOU
 ↓
IDE
 ↓
CODING ASSISTANT / AGENT HARNESS
 ↓
LLM
```

A concrete example might be:

```text
Developer
   ↓
Visual Studio Code
   ↓
GitHub Copilot
   ↓
GPT
```

Or:

```text
Developer
   ↓
Terminal / VS Code
   ↓
Claude Code
   ↓
Claude
```

Once you separate these layers, comparisons become much easier.

### 1. The IDE

The IDE is your engineering workspace: Visual Studio Code, JetBrains, Visual Studio, and so on.

It owns ordinary development concerns such as files, source control integration, terminals, debugging, extensions, language servers, and navigation.

VS Code is not the AI model. It is the environment in which the AI tooling operates.

### 2. The coding assistant or agent harness

GitHub Copilot, Claude Code, and similar products sit above the raw model.

This layer can decide:

- what repository context to send to the model;
- which files the model may read;
- which tools it may invoke;
- how edits are proposed or applied;
- whether terminal commands can be executed;
- how test failures are fed back into the next reasoning cycle;
- which repository instructions are injected;
- how many agent iterations are allowed.

This is why the word **harness** is useful. The model provides intelligence; the harness provides an operating environment around that intelligence.

### 3. The LLM

The large language model is the reasoning and generation engine.

Examples include GPT-family and Claude-family models. Depending on the product, you may be able to switch models while keeping the same coding assistant.

For example:

```text
GitHub Copilot
├── GPT model
├── Claude model
└── other supported models
```

Changing the model can change reasoning quality, latency, style, context capacity, and cost. But you have not necessarily changed the surrounding agent system.

### 4. The tools available to the model

A modern coding agent becomes dramatically more useful when it can do more than generate text.

Useful tools include:

- repository search;
- reading and writing files;
- Git operations;
- terminal execution;
- test execution;
- linters and formatters;
- browser or documentation access;
- issue trackers;
- MCP servers and organization-specific tools.

The difference between a chatbot and an engineering agent is often less about eloquence and more about **what the system is allowed to observe and do**.

## Why the same model can behave differently

Suppose Claude is available in both GitHub Copilot and Claude Code.

It is tempting to conclude that the experiences should be identical because the underlying model is Claude.

They are not necessarily identical.

Consider two simplified flows.

### Claude through a general coding assistant

```text
Your request
   ↓
Coding assistant gathers context
   ↓
Claude reasons over that context
   ↓
Coding assistant applies tools and edits
```

### Claude through Claude Code

```text
Your request
   ↓
Claude-oriented agent harness
   ↓
Claude reasons
   ↓
Harness reads files / runs commands / edits
   ↓
Claude evaluates the results
   ↓
Repeat until the task is complete
```

Even if the model were identical, the context selection, system instructions, available tools, iteration loop, and permissions can differ.

A useful analogy is:

```text
LLM = engine
Agent harness = car
IDE = road environment / cockpit
```

A powerful engine does not tell you everything about how the complete vehicle performs.

## Chat, autocomplete, and agents are different modes of assistance

Another source of confusion is treating every AI feature as "Copilot."

There are at least three distinct workflows.

### Autocomplete

You type:

```python
def calculate_checksum(path):
```

and the system predicts the next lines.

This is local, fast, and useful for boilerplate or predictable implementation patterns.

### Chat

You ask:

> Explain why this function is producing duplicate records.

The AI gives you an answer, perhaps using selected files as context.

You remain the primary executor.

### Agentic work

You ask:

> Trace how application state is currently handled, introduce a DynamoDB-backed state implementation behind the existing interface, update configuration and tests, run the test suite, and fix failures without changing public behavior.

Now the system may need to perform a sequence:

```text
inspect repository
      ↓
understand architecture
      ↓
form implementation plan
      ↓
edit multiple files
      ↓
run tests
      ↓
inspect failures
      ↓
modify implementation
      ↓
run tests again
```

That is much closer to **agentic software development** than traditional code completion.

## The real skill is becoming context-aware

New users often focus almost entirely on prompting:

> What is the perfect prompt?

Prompt quality matters, but professional software engineering quickly becomes a **context engineering** problem.

Imagine asking an agent to implement state persistence.

The model might need to know:

- where configuration is defined;
- which interface represents application state;
- which implementations currently exist;
- which classes depend on the interface;
- how tests are structured;
- which architectural conventions the team follows;
- whether backward compatibility is mandatory;
- which cloud services are approved;
- which files must not be modified.

A beautifully worded two-line prompt cannot compensate for missing architectural context.

This is where repository-level instruction files become useful.

For GitHub Copilot, a repository might contain instructions under `.github/`. Claude-oriented workflows may use a `CLAUDE.md` file and related configuration.

A mature repository can deliberately document the constraints an agent should follow:

```text
repository
├── .github/
│   ├── copilot-instructions.md
│   └── instructions/
│       ├── python.instructions.md
│       ├── testing.instructions.md
│       └── architecture.instructions.md
├── CLAUDE.md
├── src/
└── tests/
```

The important idea is not the filename. It is that **engineering knowledge should not live only in people's heads** if you expect an agent to operate safely inside the repository.

## Do not start by asking AI to build entire systems

A common first experiment is something like:

> Build me a complete application.

That demonstrates generation, but it does not teach you how AI fits into professional engineering.

A better progression is to increase the agent's responsibility gradually.

### Stage 1 — explanation

Ask the AI to explain code you already understand reasonably well.

Compare its mental model with yours.

### Stage 2 — bounded implementation

Ask for one function, one test, one SQL query, or one configuration change.

Review every line.

### Stage 3 — repository analysis

Ask questions whose answers require navigating several files:

> Trace the call path from the CLI entry point to file parsing.

> Which classes implement the state interface?

> Where can this configuration value originate?

Now you are testing contextual understanding rather than raw code generation.

### Stage 4 — multi-file change

Give the agent a well-scoped engineering task with explicit constraints and acceptance criteria.

For example:

```text
Introduce a DynamoDB-backed state repository behind the existing StateStore
interface.

Constraints:
- do not change the public interface;
- keep the existing local implementation;
- configuration must select the implementation;
- add unit tests;
- do not modify unrelated modules;
- run the relevant test suite before finishing.
```

### Stage 5 — controlled agentic execution

Allow the agent to run tests and iterate on failures.

At this stage you stop treating AI as a code generator and start treating it as a **junior execution engine operating under senior engineering constraints**.

That wording is deliberate: responsibility remains with the engineer.

## Model selection should follow the task

Do not automatically choose the most expensive or most capable model for every interaction.

Use a faster model for repetitive, low-risk work such as:

- straightforward boilerplate;
- simple tests;
- syntax conversion;
- explaining a small function;
- predictable refactors.

Use stronger reasoning for tasks such as:

- architecture analysis;
- debugging non-obvious failures;
- cross-module refactoring;
- concurrency and distributed systems reasoning;
- migration planning;
- security-sensitive changes;
- evaluating trade-offs with incomplete information.

The engineering question becomes:

> **What is the cheapest level of intelligence that can reliably complete this class of task?**

That is a much better model-selection strategy than loyalty to a single vendor.

## What you should never outsource

AI assistance changes execution speed. It does not remove engineering accountability.

You should still own:

### Architecture

The agent can propose options. You decide which trade-offs are appropriate for your system.

### Correctness criteria

The agent cannot infer every business invariant from source code.

### Security boundaries

Secrets, production access, permissions, regulated data, and destructive operations require explicit controls.

### Review

Generated code deserves the same review standards as human-written code, sometimes higher standards because it can look convincing while being subtly wrong.

### Production responsibility

"The AI wrote it" is not an incident-management strategy.

If your team deploys the change, your team owns the change.

## A practical workflow for experienced engineers

Here is the workflow I recommend when beginning serious AI-assisted development.

### Before the task

Define:

1. the desired outcome;
2. the scope;
3. architectural constraints;
4. files or modules that should not change;
5. validation commands;
6. acceptance criteria.

### During the task

Let the agent inspect before it edits.

A strong request often starts with:

> First inspect the relevant architecture and identify the current execution path. Then make the smallest change that satisfies the requirements.

For large changes, ask it to state the intended modifications before applying them.

### After the task

Do not review only the final diff.

Check:

- what assumptions the agent made;
- whether the tests actually exercise the new behavior;
- whether error handling changed;
- whether configuration remains backward-compatible;
- whether dependencies were added unnecessarily;
- whether generated abstractions match the repository's existing style.

Then run the same CI checks that human-authored code must pass.

## A useful mental model for team leads

For an individual engineer, AI can feel like a productivity tool.

For a team lead, it is closer to a new execution layer in the development system.

That means your questions change from:

> Which model writes the best Python?

into:

> What repository context do our agents receive?

> Which commands may they execute?

> How do we encode team conventions?

> Which changes require human confirmation?

> How do we ensure AI-written code goes through the same quality gates?

> How do developers understand the code rather than simply accept generated patches?

This is why adopting AI-assisted development is partly a tooling project, but also a **software-engineering governance project**.

## Where to go next

If you remember only one diagram, make it this one:

```text
                  AI-ASSISTED SOFTWARE DEVELOPMENT

                             YOU
                              │
                              ▼
                            IDE
                         (VS Code)
                              │
                              ▼
                    ASSISTANT / AGENT HARNESS
                 (Copilot, Claude Code, etc.)
                              │
                              ▼
                             LLM
                    (GPT, Claude, etc.)
                              │
                              ▼
                            TOOLS
             files · git · terminal · tests · APIs
```

Understanding those layers prevents a surprising amount of confusion.

The next level is learning **context engineering**: how to give coding agents enough durable knowledge about your repository, architecture, standards, and task constraints that they can produce reliable work repeatedly.

That is where AI-assisted programming starts becoming AI-assisted **software engineering**.

## Further reading

- [GitHub Copilot documentation](https://docs.github.com/en/copilot)
- [Anthropic Claude Code documentation](https://docs.anthropic.com/en/docs/claude-code/overview)
- [Astro documentation](https://docs.astro.build/)
