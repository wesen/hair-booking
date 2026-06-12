---
Title: LLM review live smoke fixtures
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
DocType: reference
Intent: fixture-notes
Owners: []
RelatedFiles: []
ExternalSources: []
Summary: "Tiny left/right HTML fixtures used for the first live css-visual-diff llm-review smoke against the gpt-5-nano-low Pinocchio profile."
LastUpdated: 2026-04-21T23:55:00-04:00
WhatFor: "Keep reusable HTML smoke fixtures inside the ticket sources folder."
WhenToUse: "Use when rerunning the live llm-review smoke script or manual fixture-server checks."
---

# LLM review live smoke fixtures

These HTML files are the simple left/right test objects used for the first live `css-visual-diff llm-review` smoke run against the Pinocchio profile `gpt-5-nano-low`.

Files:

- `left.html`
- `right.html`

They are intentionally tiny and self-contained so they can be served from a temporary local HTTP server during future smoke runs.

Example pattern:

```bash
cd /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/04/21/HAIR-020--integrate-geppetto-llm-review-with-pinocchio-geppetto-profile-registry-bootstrap-in-css-visual-diff/sources/01-llm-review-live-smoke
python3 -m http.server 18080 --bind 127.0.0.1
```

Then from `css-visual-diff`:

```bash
GOWORK=off go run ./cmd/css-visual-diff llm-review \
  --profile gpt-5-nano-low \
  --url1 http://127.0.0.1:18080/left.html \
  --selector1 '#cta' \
  --url2 http://127.0.0.1:18080/right.html \
  --selector2 '#cta' \
  --viewport-w 390 \
  --viewport-h 844 \
  --question "What are the main visual differences and likely CSS causes?"
```
