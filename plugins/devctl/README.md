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
