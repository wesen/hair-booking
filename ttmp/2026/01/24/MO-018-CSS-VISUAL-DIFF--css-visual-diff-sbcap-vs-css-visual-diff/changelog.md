# Changelog

## 2026-01-24

- Initial workspace created


## 2026-01-24

Authored comparative report and research diary: sbcap status, css-visual-diff review, critical pixel-diff overflow defect, and proposed fixture-driven feedback cycle.

### Related Files

- /home/manuel/workspaces/2026-01-18/hair-booking-start/hair-booking/ttmp/2026/01/24/MO-018-CSS-VISUAL-DIFF--css-visual-diff-sbcap-vs-css-visual-diff/design-doc/01-sbcap-vs-css-visual-diff-comparative-report.md — main report


## 2026-01-24

Implemented ergonomic sbcap compare command (no AI): screenshots, computed diffs, matched-style winner diffs, pixel-diff overlays (commit 79d5c32).

### Related Files

- /home/manuel/workspaces/2026-01-18/hair-booking-start/hair-booking/internal/sbcap/modes/compare.go — new compare engine and pixel-diff implementation (commit 79d5c32)


## 2026-01-24

Added pixeldiff mode to sbcap run (batch from capture.json) + run flag --pixeldiff-threshold (commit 7914245).

### Related Files

- /home/manuel/workspaces/2026-01-18/hair-booking-start/hair-booking/internal/sbcap/modes/pixeldiff.go — pixeldiff mode implementation (commit 7914245)


## 2026-01-24

Added per-target selector mapping (selector_original/selector_react) across capture/cssdiff/matched-styles (commit 8a84e9f).

### Related Files

- /home/manuel/workspaces/2026-01-18/hair-booking-start/hair-booking/internal/sbcap/config/config.go — schema+validation for per-target selectors (commit 8a84e9f)


## 2026-01-24

Added sbcap diff-gym fixtures + runner script; smoke-tested end-to-end outputs.

### Related Files

- /home/manuel/workspaces/2026-01-18/hair-booking-start/hair-booking/scripts/run-sbcap-diff-gym.sh — one-command fixture runner


## 2026-01-25

Added user-facing sbcap docs (docs/sbcap.md) and linked from repo README; updated MO-016 validation playbook to demonstrate selector_original/selector_react and pixeldiff.

### Related Files

- /home/manuel/workspaces/2026-01-18/hair-booking-start/hair-booking/docs/sbcap.md — user guide for sbcap

