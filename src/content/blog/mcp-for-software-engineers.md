---
title: "MCP Made More Sense When I Stopped Thinking of It as an AI Feature"
description: "A software engineer's mental model for Model Context Protocol: tools, resources, boundaries and why standardized access matters for engineering agents."
pubDate: 2026-08-12
tags: ["AI-assisted Dev", "MCP", "Agentic Coding", "Engineering Architecture"]
draft: false
featured: false
---

## Table of contents

- [1. The problem MCP is trying to solve](#1-the-problem-mcp-is-trying-to-solve)
- [2. Think protocol, not magic](#2-think-protocol-not-magic)
- [3. Model, host, client and server](#3-model-host-client-and-server)
- [4. Resources and tools are different](#4-resources-and-tools-are-different)
- [5. Why this matters in software engineering](#5-why-this-matters-in-software-engineering)
- [6. MCP does not remove security boundaries](#6-mcp-does-not-remove-security-boundaries)
- [7. Start read-only](#7-start-read-only)
- [8. Design tool contracts like APIs](#8-design-tool-contracts-like-apis)
- [9. Common misconceptions](#9-common-misconceptions)
- [10. What this changes for engineering organizations](#10-what-this-changes-for-engineering-organizations)
- [11. A practical exercise](#11-a-practical-exercise)
- [12. Where to go next](#12-where-to-go-next)

When I first encountered **MCP**, the Model Context Protocol, it sounded like another piece of AI terminology I was expected to memorize.

Then I reframed it as a software integration problem.

That made it much easier.

A coding agent is useful when it can interact with the systems where engineering work actually happens. Repository files are only one part of that world.

Engineers also depend on:

- issue trackers;
- internal documentation;
- APIs;
- databases;
- deployment systems;
- observability platforms;
- architecture catalogs;
- custom company tooling.

Without some common integration pattern, every AI product would need a custom adapter for every external system.

That leads to the mental model I find most useful:

> **MCP is an integration protocol that gives AI applications a standardized way to discover and use external context and capabilities.**

The interesting part is not the acronym. It is the boundary it creates between an AI host and the systems around it.

## 1. The problem MCP is trying to solve

Imagine a coding agent that needs to investigate a production defect.

The relevant information might be distributed like this:

```text
Git repository
    ├── application code
    └── tests

Issue tracker
    └── defect report

Documentation
    └── service ownership + runbook

Observability
    └── logs + traces
```

A chat model with only pasted text sees fragments.

An engineering agent becomes more useful when it can query those systems through controlled interfaces.

Historically, that can lead to a large integration matrix:

```text
AI Tool A × GitHub
AI Tool A × Jira
AI Tool A × internal docs
AI Tool B × GitHub
AI Tool B × Jira
AI Tool B × internal docs
...
```

A protocol creates the possibility of a cleaner shape:

```text
AI HOST
   ↓
standard protocol
   ↓
MCP SERVERS
├── source control
├── documentation
├── issue tracking
└── internal engineering systems
```

That is a familiar software architecture idea: standardize the integration boundary.

## 2. Think protocol, not magic

MCP does not make a model smarter by itself.

It does not automatically know your architecture.

It does not guarantee that an external tool is safe.

It does not make every connected data source relevant.

What it provides is a structured way for a host application to interact with capabilities exposed by an MCP server.

That means the normal engineering questions still apply:

- what is the contract?
- who controls the server?
- what data can be read?
- what actions can be performed?
- how is access authenticated?
- what failures are possible?
- what permissions should the host grant?

Once you ask those questions, MCP starts looking much more like ordinary integration engineering.

## 3. Model, host, client and server

A simplified mental model is:

```text
USER
 ↓
AI HOST / AGENT APPLICATION
 ↓
MCP CLIENT
 ↓
MCP SERVER
 ↓
EXTERNAL SYSTEM
```

The **host** is the application in which the AI experience runs.

The **client** handles the protocol connection from that host.

The **server** exposes capabilities backed by some external system or local environment.

The model reasons about the task, but the surrounding host decides how capabilities are presented and governed.

This distinction matters because the model should not be treated as though it directly owns every integration.

## 4. Resources and tools are different

The most useful conceptual distinction is between **information the agent can consume** and **actions the agent can invoke**.

A resource-like capability might expose:

```text
architecture documentation
repository metadata
service catalog entries
runbooks
```

A tool-like capability might allow:

```text
search incidents
query a service API
create an issue
run a diagnostic command
```

The risk profile changes dramatically when the system moves from reading to acting.

A read-only documentation server and a tool that can modify production infrastructure should not be governed the same way simply because both use MCP.

## 5. Why this matters in software engineering

Consider a debugging workflow.

Without connected tools:

```text
Developer copies issue
      ↓
Developer copies logs
      ↓
Developer points model at files
      ↓
Model reasons over snapshot
```

With controlled integrations, the workflow can become:

```text
Agent reads issue
      ↓
Agent identifies service
      ↓
Agent inspects relevant code
      ↓
Agent queries approved diagnostic data
      ↓
Agent correlates evidence
      ↓
Engineer reviews conclusion
```

That can reduce mechanical context gathering.

But the gain comes from **better access to evidence**, not from bypassing engineering judgment.

## 6. MCP does not remove security boundaries

This is one of the most important points.

A standardized protocol can make integrations easier to build and discover. That does not mean every integration should be enabled.

For each server or tool, ask:

```text
What data is exposed?
Who is authorized to access it?
Can the tool mutate anything?
Are side effects reversible?
Does the model need this capability for the task?
What audit trail exists?
```

The principle I use is:

> **Protocol compatibility is not permission.**

A tool being available does not mean an agent should be able to invoke it automatically.

## 7. Start read-only

When introducing external agent integrations, read-only capabilities are a good place to learn.

Examples:

- search engineering documentation;
- inspect issue metadata;
- retrieve service ownership;
- query non-sensitive development environment information;
- read API schemas.

This lets a team evaluate whether the additional context actually improves engineering outcomes before introducing mutation or production side effects.

A maturity path might be:

```text
READ
 ↓
READ + LOCAL ACTION
 ↓
BOUNDED WRITE
 ↓
APPROVAL-GATED EXTERNAL ACTION
```

Autonomy should follow evidence, not enthusiasm.

## 8. Design tool contracts like APIs

A poorly designed tool is difficult for humans and models alike.

Prefer narrow, explicit operations.

Weak:

```text
do_infrastructure_thing(input: string)
```

Stronger:

```text
get_deployment_status(service, environment)
```

or:

```text
restart_development_service(service)
```

Narrow contracts help because they:

- constrain possible actions;
- make intent clearer;
- improve validation;
- simplify authorization;
- reduce ambiguous model-generated parameters;
- make logging more meaningful.

This is standard API design applied to agent tools.

## 9. Common misconceptions

### 9.1 “MCP gives the model access to everything”

Only the capabilities configured and exposed through the surrounding system are available.

### 9.2 “If a tool is connected, the agent should use it”

Availability and appropriateness are different questions.

### 9.3 “MCP replaces APIs”

An MCP server may itself wrap APIs, databases, files or other systems. The underlying integration still exists.

### 9.4 “More connected systems always improve results”

More tools can increase noise, latency, cost and risk. Useful capability should be task-driven.

### 9.5 “The protocol solves governance”

Governance remains an organizational responsibility: access, approval, audit, data boundaries and acceptable use still need decisions.

## 10. What this changes for engineering organizations

MCP makes one organizational question increasingly important:

> **Which parts of our engineering environment should be machine-accessible, under what contracts and with what permissions?**

That touches platform engineering, security and developer experience.

The organization may eventually need a curated tool layer rather than allowing every developer or agent to connect arbitrary systems independently.

A mature pattern could look like:

```text
engineering agents
       ↓
approved tool catalog
       ↓
controlled MCP servers
       ↓
internal systems
```

The exact architecture will vary, but the principle is familiar: centralize high-risk integration concerns without destroying developer usability.

## 11. A practical exercise

Do not start by connecting production systems.

Pick one low-risk engineering information source that is currently tedious to access.

For example:

```text
service ownership documentation
```

Define what an ideal agent-facing contract would look like:

```text
find_service_owner(service_name)
get_service_runbook(service_name)
```

Then answer:

- what data should this expose?
- what should it explicitly not expose?
- who can call it?
- is it read-only?
- what happens when the service name is ambiguous?
- how would you verify the answer is current?

The measurable takeaway:

> **You should be able to describe an MCP capability as an ordinary software contract with explicit data, actions and permissions.**

If you cannot, the integration is probably too vague.

## 12. Where to go next

Once agents can gather context, edit code, run tools and reach external systems, another problem becomes unavoidable.

How do we know the result is actually good?

Not “the model sounded convincing.”

Not “the diff looked large and sophisticated.”

Not even “one test passed.”

We need repeatable ways to evaluate AI-assisted engineering work.

That means moving from demonstrations to **evaluation loops**.