---
Title: Integrate Geppetto LLM review with Pinocchio/Geppetto profile-registry bootstrap in css-visual-diff
Ticket: HAIR-020
Status: active
Topics:
    - tooling
    - browser-automation
    - visual-regression
    - geppetto
    - pinocchio
    - inference
    - llm
DocType: index
Intent: long-term
Owners: []
RelatedFiles:
    - Path: ttmp/2026/04/21/HAIR-020--integrate-geppetto-llm-review-with-pinocchio-geppetto-profile-registry-bootstrap-in-css-visual-diff/design-doc/01-geppetto-pinocchio-profile-backed-llm-review-integration-guide.md
      Note: Primary implementation analysis and guide
    - Path: ttmp/2026/04/21/HAIR-020--integrate-geppetto-llm-review-with-pinocchio-geppetto-profile-registry-bootstrap-in-css-visual-diff/reference/01-investigation-diary.md
      Note: Chronological investigation diary
ExternalSources: []
Summary: "Plan Geppetto-backed multimodal LLM review in css-visual-diff using Pinocchio/Geppetto profile-registry loading so model selection and inference settings come from the shared operator workflow."
LastUpdated: 2026-04-21T23:18:00-04:00
WhatFor: "Design the next implementation slice for live LLM review in css-visual-diff."
WhenToUse: "Use when implementing or reviewing profile-backed LLM functionality in css-visual-diff."
---

# Integrate Geppetto LLM review with Pinocchio/Geppetto profile-registry bootstrap in css-visual-diff

## Overview

This ticket covers the next architecture slice for `css-visual-diff`: replacing the current stubbed AI review path with a real Geppetto-backed LLM service while loading model/inference settings through the Pinocchio/Geppetto profile-registry workflow.

The important constraint is that `css-visual-diff` should not grow a standalone provider bootstrap model that diverges from the rest of the toolchain. The selected profile and registry stack need to influence the effective inference settings used to build the engine.

## Key Links

- **Related Files**: See frontmatter RelatedFiles field
- **External Sources**: See frontmatter ExternalSources field

## Status

Current status: **active**

## Topics

- tooling
- browser-automation
- visual-regression
- geppetto
- pinocchio
- inference
- llm

## Tasks

See [tasks.md](./tasks.md) for the current task list.

## Changelog

See [changelog.md](./changelog.md) for recent changes and decisions.

## Structure

- design/ - Architecture and design documents
- reference/ - Prompt packs, API contracts, context summaries
- playbooks/ - Command sequences and test procedures
- scripts/ - Temporary code and tooling
- various/ - Working notes and research
- archive/ - Deprecated or reference-only artifacts
