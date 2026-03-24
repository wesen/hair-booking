# Tasks

## Research And Product Decisions

- [x] Confirm the current hosted app still points at the shared `smailnail` realm
- [x] Confirm official Keycloak support for self-registration and identity brokering
- [x] Confirm official Keycloak support status for Google, Facebook, and Instagram providers
- [ ] Decide whether Instagram is actually required for MVP despite the deprecation warning

## Realm Separation

- [ ] Create hosted realm `hair-booking`
- [ ] Create local realm import `hair-booking-dev`
- [ ] Create confidential client `hair-booking-web` in the new realm
- [ ] Configure hosted redirect URI for `https://hair-booking.app.scapegoat.dev/auth/callback`
- [ ] Configure local redirect URI for `http://127.0.0.1:8080/auth/callback`
- [ ] Configure matching web origins

## Local Signup Flow

- [ ] Enable `User Registration`
- [ ] Enable `Forgot Password`
- [ ] Enable `Remember Me`
- [ ] Enable `Verify Email`
- [ ] Configure SMTP for outbound auth email
- [ ] Test new registration
- [ ] Test password reset
- [ ] Test verified-email login path

## Social Login

- [ ] Configure Google identity provider
- [ ] Test first broker login with Google
- [ ] Test repeat login with Google
- [ ] Configure Facebook identity provider
- [ ] Test first broker login with Facebook
- [ ] Test repeat login with Facebook
- [ ] Decide whether to enable the `instagram-broker` feature
- [ ] If Instagram stays in scope, configure and test Instagram identity provider

## App Integration

- [ ] Update hosted app env to use the `hair-booking` realm issuer
- [ ] Update local app defaults to use `hair-booking-dev`
- [ ] Update local Keycloak realm import files
- [ ] Update smoke tests for registration and social login

## Validation

- [ ] Confirm hosted `/auth/login` uses the new realm
- [ ] Confirm new local signup works end to end
- [ ] Confirm Google login works end to end
- [ ] Confirm Facebook login works end to end
- [ ] Confirm no duplicate local client records are created for the same human account
