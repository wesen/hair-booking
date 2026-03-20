# hair-booking Keycloak Terraform

This directory is no longer the canonical hosted Terraform location.

Use the shared infra repo instead:

- [keycloak/README.md](/home/manuel/code/wesen/terraform/keycloak/README.md)
- [apps/hair-booking/envs/local](/home/manuel/code/wesen/terraform/keycloak/apps/hair-booking/envs/local/main.tf)
- [apps/hair-booking/envs/hosted](/home/manuel/code/wesen/terraform/keycloak/apps/hair-booking/envs/hosted/main.tf)

The original repo-local scaffold remains as historical context for how the app
was first bootstrapped.

This directory manages the Keycloak browser client used by `hair-booking`.

It follows the same broad pattern as `smailnail`, but with one important
difference:

- local Terraform can create a sandbox realm plus the `hair-booking-web` client
- hosted Terraform manages the `hair-booking-web` client inside an existing
  shared realm, so `hair-booking` can reuse the same Keycloak deployment as
  `smailnail` without taking ownership of the whole hosted realm

## Layout

- `modules/realm-base`
- `modules/browser-client`
- `envs/local`
- `envs/hosted`

## Local sandbox verification

The local Terraform environment creates a sandbox realm so it does not collide
with the JSON-imported `hair-booking-dev` realm from `docker-compose.local.yml`.

From:

```bash
cd /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/deployments/terraform/keycloak/envs/local
```

Run:

```bash
terraform init -backend=false
terraform validate
terraform plan \
  -var='keycloak_url=http://127.0.0.1:18090' \
  -var='realm_name=hair-booking-dev-tf' \
  -var='realm_display_name=hair-booking-dev-tf' \
  -var='web_client_secret=hair-booking-web-secret'
terraform apply -auto-approve \
  -var='keycloak_url=http://127.0.0.1:18090' \
  -var='realm_name=hair-booking-dev-tf' \
  -var='realm_display_name=hair-booking-dev-tf' \
  -var='web_client_secret=hair-booking-web-secret'
```

Verify:

```bash
curl -fsS \
  http://127.0.0.1:18090/realms/hair-booking-dev-tf/.well-known/openid-configuration \
  | jq -r '.issuer'
```

Expected output:

```text
http://127.0.0.1:18090/realms/hair-booking-dev-tf
```

## Hosted verification

The hosted Terraform environment assumes:

- Keycloak already exists
- the shared hosted realm already exists
- `hair-booking` only needs its own confidential browser client

From:

```bash
cd /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/deployments/terraform/keycloak/envs/hosted
```

Run:

```bash
terraform init -backend=false
terraform validate
terraform plan \
  -var='keycloak_url=https://auth.example.com' \
  -var='realm_name=smailnail' \
  -var='public_app_url=https://hair-booking.example.com' \
  -var='web_client_secret=replace-with-generated-secret' \
  -var='keycloak_username=replace-with-admin-username' \
  -var='keycloak_password=replace-with-admin-password'
```

This will manage a client with:

- client ID: `hair-booking-web`
- redirect URI: `https://hair-booking.example.com/auth/callback`
- web origin: `https://hair-booking.example.com`
