# sbcap Diff Gym

Small, deterministic fixture cases to exercise `sbcap` without Storybook.

This is intended to support a high-quality feedback loop:
- run `capture` to get element/section screenshots,
- run `pixeldiff` to immediately see where differences are,
- run `cssdiff` + `matched-styles` to explain the “what” and “why”.

## How to run

Use the runner script (it starts a local HTTP server and writes outputs to `/tmp`):

```bash
./scripts/run-sbcap-diff-gym.sh
```

Each case has:
- `original.html`
- `react.html`
- `sbcap.yaml.tmpl` (uses placeholders; the runner generates a concrete config per run)

## Notes

- `sbcap` currently requires absolute URLs with scheme+host; we serve fixtures via a local `python3 -m http.server`.
- `sbcap.yaml.tmpl` uses placeholders:
  - `__BASE_URL__` → e.g. `http://127.0.0.1:12345`
  - `__OUT_DIR__` → e.g. `/tmp/sbcap-diff-gym/20260125_010203/case-01-spacing`

