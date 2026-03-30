# Changelog

## 2026-03-26

- Initial workspace created
- Added a detailed analysis/design guide for the hosted logout redirect failure and the brokered login re-entry UX problem
- Added a step-by-step investigation diary with the concrete shell commands and code references used to trace the issue
- Captured the current best fix plan: plain allowlisted logout callback URI plus server-controlled final redirect handoff, followed by explicit Keycloak browser-flow inspection for Google re-entry behavior
- Implemented the protocol half of the fix in `pkg/auth/oidc.go`: logout now stores the final return target in a short-lived app cookie and sends Keycloak a plain `/auth/logout/callback` URI
- Added regression coverage in `pkg/auth/oidc_test.go` for the plain callback URL, logout cookie handoff, and logout callback redirect behavior
