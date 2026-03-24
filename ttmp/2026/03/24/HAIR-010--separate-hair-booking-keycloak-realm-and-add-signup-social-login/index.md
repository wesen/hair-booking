---
Title: Separate hair-booking Keycloak realm and add signup/social login
Ticket: HAIR-010
Status: active
Topics:
    - auth
    - backend
    - keycloak
    - deploy
DocType: index
Intent: long-term
Owners: []
RelatedFiles: []
ExternalSources: []
Summary: ""
LastUpdated: 2026-03-24T22:40:00-04:00
WhatFor: Use this ticket to design and later execute the migration from the shared smailnail realm to a dedicated hair-booking realm with local signup and social login.
WhenToUse: Use when planning or implementing hosted auth separation.
---

# Separate hair-booking Keycloak realm and add signup/social login

## Overview

This ticket scopes the next real authentication milestone for `hair-booking`.

The app should move off the shared `smailnail` realm and into a dedicated `hair-booking` realm, while supporting:

- first-party signup with login/password
- Google sign-in
- Facebook sign-in
- cautious evaluation of Instagram sign-in

## Key Links

- Main guide: [design/01-hair-booking-keycloak-realm-and-social-login-guide.md](./design/01-hair-booking-keycloak-realm-and-social-login-guide.md)
- Investigation diary: [reference/01-investigation-diary.md](./reference/01-investigation-diary.md)
- Tasks: [tasks.md](./tasks.md)
- Changelog: [changelog.md](./changelog.md)

## Status

Current status: **active**

## Topics

- auth
- backend
- keycloak
- deploy

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
