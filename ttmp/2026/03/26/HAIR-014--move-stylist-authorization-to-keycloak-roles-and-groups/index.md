---
Title: Move stylist authorization to Keycloak roles and groups
Ticket: HAIR-014
Status: active
Topics:
    - auth
    - keycloak
    - backend
    - oidc
    - ops
DocType: index
Intent: long-term
Owners: []
RelatedFiles: []
ExternalSources: []
Summary: "Detailed design and implementation plan for replacing env-based stylist allowlists with Keycloak-native roles and groups conveyed through OIDC claims."
LastUpdated: 2026-03-26T12:50:00-04:00
WhatFor: "Use this ticket to understand the current auth/session architecture and implement Keycloak role/group-based stylist authorization safely."
WhenToUse: "Use when planning or implementing the migration from env allowlists to Keycloak roles/groups."
---

# Move stylist authorization to Keycloak roles and groups

## Overview

This ticket documents how `hair-booking` authentication works today and how to
migrate stylist authorization from app-level env allowlists to Keycloak-native
roles and groups.

The main guide is:

- [01-keycloak-role-and-group-based-stylist-auth-guide.md](./design/01-keycloak-role-and-group-based-stylist-auth-guide.md)

The supporting diary is:

- [01-investigation-diary.md](./reference/01-investigation-diary.md)

## Key Links

- Design guide: [01-keycloak-role-and-group-based-stylist-auth-guide.md](./design/01-keycloak-role-and-group-based-stylist-auth-guide.md)
- Investigation diary: [01-investigation-diary.md](./reference/01-investigation-diary.md)
- Task list: [tasks.md](./tasks.md)
- Changelog: [changelog.md](./changelog.md)

## Status

Current status: **active**

## Topics

- auth
- keycloak
- backend
- oidc
- ops

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
