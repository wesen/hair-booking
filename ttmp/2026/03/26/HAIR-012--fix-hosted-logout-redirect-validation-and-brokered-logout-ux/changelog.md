# Changelog

## 2026-03-26

- Initial workspace created
- Added a detailed analysis/design guide for the hosted logout redirect failure and the brokered login re-entry UX problem
- Added a step-by-step investigation diary with the concrete shell commands and code references used to trace the issue
- Captured the current best fix plan: plain allowlisted logout callback URI plus server-controlled final redirect handoff, followed by explicit Keycloak browser-flow inspection for Google re-entry behavior
