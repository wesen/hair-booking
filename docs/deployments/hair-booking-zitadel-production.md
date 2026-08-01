# Hair Booking production authentication with ZITADEL

## Purpose

Production Hair Booking uses a dedicated ZITADEL organization as its OIDC identity broker. The application trusts only ZITADEL; Google, Apple, and Facebook are configured as organization-scoped external providers in ZITADEL. Password and passkey authentication are ZITADEL-native flows.

This document is the operator runbook for configuration changes and production smoke checks. It does not contain credentials.

## Ownership and boundaries

- Application: this repository. It starts OIDC login, validates the authorization-code callback with PKCE, creates its HTTP-only session cookie, and maps the ZITADEL subject to a Hair Booking client record.
- Identity configuration: `/home/manuel/code/wesen/terraform/zitadel/hair-booking/envs/prod`.
- Provider credentials: Vault at `kv/apps/hair-booking/prod/zitadel-idp`.
- Runtime OIDC configuration: Vault at `kv/apps/hair-booking/prod/runtime`, delivered through GitOps.
- Production app: `https://hair-booking.yolo.scapegoat.dev`.

Do not add provider credentials to this repository, Terraform variables, browser notes, or Git history.

## OIDC contract

- Issuer: `https://zitadel.yolo.scapegoat.dev`
- Authentication flow: authorization code with S256 PKCE.
- Browser callback: `https://hair-booking.yolo.scapegoat.dev/auth/callback`
- Logout callback: `https://hair-booking.yolo.scapegoat.dev/auth/logout/callback`
- Required scopes: `openid`, `profile`, `email`, plus the Hair Booking organization scope configured by Terraform.

Hair Booking has no long-lived OIDC client secret: its ZITADEL client is configured for public authorization-code login with PKCE.

## External-provider callback contract

ZITADEL currently sends external-provider callbacks to:

```text
https://zitadel.yolo.scapegoat.dev/idps/callback
```

Register that exact HTTPS URI with every external provider. Do not substitute the OIDC application callback or the historical `/oauth/v2/callback` URI.

- Google: add it to the OAuth client’s authorized redirect URIs.
- Apple: add it to the Services ID Website URLs configuration for `dev.scapegoat.yolo.hair-booking`.
- Facebook: add it to Valid OAuth Redirect URIs. Facebook remains a generic OAuth provider; do not change its protocol merely to obtain a stock icon.

Keep legacy provider redirect URIs only while actively required for rollback. Remove them deliberately after the cutover is accepted.

## Terraform procedure

1. Load the local Terraform environment:

   ```bash
   cd /home/manuel/code/wesen/terraform
   direnv allow
   ```

2. Supply public provider identifiers from Vault at execution time; provider secrets are read by the Terraform configuration using Vault. Never paste secret values into shell history.
3. Run a full plan from `zitadel/hair-booking/envs/prod` and inspect every action. If recovering a single urgent client setting, use a targeted plan only for that resource, document why, and run a full reconciliation plan afterward.
4. Apply only an approved plan.

If the backend reports missing AWS credentials, ensure `AWS_PROFILE=manuel` is present through direnv. The state backend is S3-compatible and must not be bypassed with local state.

## Browser smoke checks

Use an isolated browser session. Do not complete provider consent or create test accounts unless the operator explicitly authorizes it.

1. Visit `/auth/login?return_to=%2Fportal` and confirm the ZITADEL page selects the Hair Booking organization and displays Google, Apple, and Facebook.
2. Start each external provider. Confirm the provider authorization page receives `https://zitadel.yolo.scapegoat.dev/idps/callback`; for Facebook, also confirm `code_challenge_method=S256`.
3. Complete one authorized real login. Verify `GET /api/me` returns a Hair Booking client whose `auth_issuer` is the ZITADEL issuer and whose `auth_subject` is the ZITADEL user subject.
4. Visit `/auth/logout?return_to=%2Fportal`, select the active account on the ZITADEL logout page, and verify `/api/me` returns `not-authenticated` afterward.
5. Separately test password registration/login, passkey enrollment/login, and stylist authorization before removing old Keycloak resources.

## Incident diagnosis

- **Provider reports redirect URI mismatch:** compare its registered URI with ZITADEL’s `/idps/callback`, including scheme, host, and path.
- **ZITADEL reports `post_logout_redirect_uri invalid`:** ensure Terraform allows `/auth/logout/callback`, apply the OIDC client change, then repeat logout.
- **`/api/me` is unauthenticated after a successful provider login:** inspect the Hair Booking callback/session logs and confirm the runtime issuer, client ID, redirect URL, and organization scope are from the runtime Vault secret.
- **Terraform proposes unrelated login-text changes:** do not bundle them with an urgent client redirect fix; investigate the provider/state drift in a separate change.
