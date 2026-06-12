# hair-booking devctl setup

This repo uses `devctl` to supervise the local hair-booking development stack.

## Default profile

The default profile is `live-dsl` and starts:

- `hair-booking-backend` on `http://127.0.0.1:19080`
- `hair-booking-web` on `http://127.0.0.1:5175`

The live Goja DSL route is:

```text
http://127.0.0.1:5175/dsl-goja-demo
```

## Common commands

```bash
devctl plugins list
devctl plan
devctl up --force
devctl status
devctl logs --service hair-booking-backend --stderr --follow
devctl logs --service hair-booking-web --follow
devctl down
```

## Profiles

```bash
devctl up --profile live-dsl --force
devctl up --profile backend-only --force
devctl up --profile web-only --force
devctl up --profile storybook --force
```

The `storybook` profile starts only Storybook on:

```text
http://127.0.0.1:6006
```

Useful Admin DSL review URLs:

```text
http://127.0.0.1:6006/?path=/story/admin-dsl-rendered-pages--services-pricing
http://127.0.0.1:6006/?path=/story/admin-dsl-rendered-pages--dashboard
http://127.0.0.1:6006/?path=/story/admin-dsl-rendered-pages--calendar
http://127.0.0.1:6006/?path=/story/admin-dsl-rendered-pages--json-contract
```

To refresh cropped mobile Admin DSL screenshots for HAIR-039, start Storybook and run:

```bash
devctl up --profile storybook --force
./ttmp/2026/05/15/HAIR-039--admin-design-system-and-dsl-for-one-stylist-salon-management/scripts/01-capture-mobile-admin-dsl.sh
```

## Port overrides

The plugin reads these environment variables:

```bash
HAIR_BOOKING_DEVCTL_BACKEND_HOST=127.0.0.1
HAIR_BOOKING_DEVCTL_BACKEND_PORT=19080
HAIR_BOOKING_DEVCTL_WEB_HOST=127.0.0.1
HAIR_BOOKING_DEVCTL_WEB_PORT=5175
HAIR_BOOKING_BACKEND_URL=http://127.0.0.1:19080
HAIR_BOOKING_DEVCTL_SERVICES=backend,web
```

Example:

```bash
HAIR_BOOKING_DEVCTL_BACKEND_PORT=19180 \
HAIR_BOOKING_DEVCTL_WEB_PORT=5176 \
HAIR_BOOKING_BACKEND_URL=http://127.0.0.1:19180 \
devctl up --force
```

## Implementation

The plugin is `plugins/devctl/hair_booking.py`. It implements:

- `config.mutate`
- `validate.run`
- `launch.plan`

The plugin only writes NDJSON protocol frames to stdout. Human-readable diagnostics must go to stderr.
