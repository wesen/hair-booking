---
Title: OpenAI Responses API source docs
Ticket: HAIR-020
Status: active
Topics:
  - tooling
  - geppetto
  - inference
  - llm
DocType: reference
Intent: source-bundle
Owners: []
RelatedFiles: []
ExternalSources: []
Summary: "Official OpenAI Responses API and image-input documentation downloaded for analyzing missing image support in Geppetto openai-responses handling."
LastUpdated: 2026-04-22T00:05:00-04:00
WhatFor: "Keep a local ticket-scoped source bundle of the relevant OpenAI Responses API docs."
WhenToUse: "Use when implementing or reviewing image support for Geppetto openai-responses integration."
---

# OpenAI Responses API source docs

This folder contains the source bundle used to analyze missing image support in Geppetto's `openai_responses` integration.

Contents:

- `00-kagi-search-openai-responses-image-input.md`
- `01-openai-responses-overview.md`
- `02-openai-images-and-vision-guide.md`
- `03-openai-create-model-response-reference.md`
- `04-openai-input-token-count-reference.md`

The key official claims captured in these docs are:

- Responses API supports text and image inputs.
- Image message content uses `type: input_image`.
- `image_url` accepts a fully qualified URL or a base64 data URL.
- `detail` supports `low`, `high`, `auto`, and `original`.
- Files can also be supplied with `input_file` / `file_id` / `file_data` / `file_url`.
