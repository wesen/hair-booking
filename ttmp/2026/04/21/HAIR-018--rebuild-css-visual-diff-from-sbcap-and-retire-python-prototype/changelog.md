# Changelog

## 2026-04-21

- Initial workspace created


## 2026-04-21

Created HAIR-018, wrote the short implementation plan, reset css-visual-diff around an sbcap-based Go baseline, archived the Python prototype under legacy/, pinned sbcap-compatible dependencies, and validated the rebuilt CLI (commits 774f01c, b667cfa).

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff/Makefile — Final build/lint defaults polished after validation
- /home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff/cmd/css-visual-diff/main.go — New primary CLI entrypoint imported from sbcap and renamed
- /home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff/go.mod — Dependency and module baseline for the rebuilt tool
- /home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff/internal/cssvisualdiff — New imported engine baseline
- /home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff/legacy/python-prototype — Legacy prototype preserved instead of deleted

