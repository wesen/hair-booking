# Changelog

## 2026-03-19

- Initial workspace created
- Replaced the template repo with a real `hair-booking` Go module and CLI entrypoint.
- Implemented Keycloak OIDC login, signed browser sessions, `/api/info`, `/api/me`, and embedded frontend assets.
- Added verification tests, README instructions, and ticket documentation.

## 2026-03-19

Implemented the first working hair-booking Keycloak login bootstrap, including Glazed command wiring, signed cookie sessions, a minimal embedded UI, tests, and onboarding docs.

### Related Files

- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/cmd/hair-booking/cmds/serve.go — New server entrypoint
- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/auth/oidc.go — OIDC auth flow
- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/server/http.go — API and web routes


## 2026-03-19

Added an operator playbook, a detailed postmortem, and clearer README/start-stop-deploy guidance after live standalone Keycloak verification.

### Related Files

- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/Makefile — New local OIDC and tmux helper targets
- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/README.md — Expanded quick-start
- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/docs/operations-playbook.md — New repo-level start/stop/deploy playbook

