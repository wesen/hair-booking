// Package admindsl contains the host-owned fluent builder and validation layer
// for backend-authored Admin DSL pages.
//
// The long-term architecture is intentionally Go-host authoritative: Go builders
// construct and validate the JSON page tree, while Goja scripts may receive thin
// fluent wrappers around these builders. This keeps schema evolution, required
// fields, action semantics, and serialization rules under runtime control instead
// of duplicating validity logic in browser or script-only helper code.
//
// Frontend TypeScript builders remain valuable for Storybook fixtures and rapid
// prototyping, but backend-driven Admin DSL flows should emit pages through this
// package or modules backed by it.
package admindsl
