---
Title: Local Stylist Seed Workflow
Ticket: HAIR-006
Status: active
Topics:
    - backend
    - stylist
    - local-dev
    - seed-data
DocType: playbook
Intent: long-term
Owners: []
RelatedFiles:
    - Path: dev/sql/seed_stylist_workflows.sql
      Note: Deterministic local-only stylist workflow seed data
    - Path: scripts/seed_stylist_workflows.sh
      Note: Seed runner used by Make
    - Path: Makefile
      Note: `local-seed-stylist-workflows` target
ExternalSources: []
Summary: Manual playbook for loading and replaying local stylist workflow seed data.
LastUpdated: 2026-03-20T12:35:00-04:00
WhatFor: Use this to create realistic local data before exercising stylist backend or frontend flows.
WhenToUse: Use after resetting the local database or whenever stylist smoke checks need deterministic data.
---

# Local Stylist Seed Workflow

## Goal

Load a small deterministic dataset for the single-stylist MVP without polluting production migrations.

The seed data includes:

- three clients
- three intake submissions
- three intake reviews in different statuses
- three future appointments outside the 24-hour policy window
- one maintenance plan with items

## Why This Is Separate From Migrations

- baseline catalog and schedule data belong in always-on migrations
- stylist workflow fixtures do not
- local smoke and frontend integration need repeatable data, but production should start empty except for app configuration

## Command

From the repo root:

```bash
make local-seed-stylist-workflows
```

Equivalent direct command:

```bash
HAIR_BOOKING_DATABASE_URL="postgres://hair_booking:hair_booking@127.0.0.1:15432/hair_booking?sslmode=disable" \
./scripts/seed_stylist_workflows.sh
```

## Preconditions

- local Postgres is running
- schema migrations have already been applied
- `psql` is installed

## What To Check After Seeding

Run:

```bash
psql "postgres://hair_booking:hair_booking@127.0.0.1:15432/hair_booking?sslmode=disable" -c "select count(*) from clients;"
psql "postgres://hair_booking:hair_booking@127.0.0.1:15432/hair_booking?sslmode=disable" -c "select count(*) from intake_reviews;"
psql "postgres://hair_booking:hair_booking@127.0.0.1:15432/hair_booking?sslmode=disable" -c "select count(*) from appointments;"
```

Expected minimums after a fresh local database:

- `clients >= 3`
- `intake_reviews >= 3`
- `appointments >= 3`

## Idempotence

The seed SQL uses fixed UUIDs plus `on conflict do nothing`, so rerunning the command should not duplicate rows.

## Follow-Up

After seeding, the next useful checks are:

- [02-stylist-intake-review-smoke.md](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/ttmp/2026/03/20/HAIR-006--build-stylist-backend-operations-mvp/playbooks/02-stylist-intake-review-smoke.md)
- [03-stylist-dashboard-smoke.md](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/ttmp/2026/03/20/HAIR-006--build-stylist-backend-operations-mvp/playbooks/03-stylist-dashboard-smoke.md)
- [04-stylist-appointments-smoke.md](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/ttmp/2026/03/20/HAIR-006--build-stylist-backend-operations-mvp/playbooks/04-stylist-appointments-smoke.md)
- [05-stylist-clients-smoke.md](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/ttmp/2026/03/20/HAIR-006--build-stylist-backend-operations-mvp/playbooks/05-stylist-clients-smoke.md)
