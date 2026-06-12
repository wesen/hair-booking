#!/usr/bin/env python3
"""Run the local validation bundle for Admin DSL widget promotion batches.

The target intentionally prints story-scaffold and design-system findings before
running TypeScript/tests/Storybook. Existing backlogs can be reviewed without
blocking the whole validation run; use --strict-triage or --strict-design when a
batch is expected to be clean.
"""
from __future__ import annotations

import argparse
import subprocess
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[6]
WEB_ROOT = REPO_ROOT / "web"
DESIGN_LINT = REPO_ROOT / "ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/scripts/07-lint-admin-dsl-design-system.py"


def run(cmd: list[str], cwd: Path = REPO_ROOT, check: bool = True) -> int:
    print(f"\n$ {' '.join(cmd)}")
    result = subprocess.run(cmd, cwd=cwd)
    if check and result.returncode != 0:
        raise SystemExit(result.returncode)
    return result.returncode


def story_triage(paths: list[str]) -> list[Path]:
    roots = [REPO_ROOT / p for p in paths] if paths else [REPO_ROOT / "web/src/admin-dsl/widgets"]
    findings: list[Path] = []
    for root in roots:
        files = [root] if root.is_file() else sorted(root.rglob("*.stories.tsx"))
        for path in files:
            if not path.exists() or path.suffix != ".tsx" or not path.name.endswith(".stories.tsx"):
                continue
            text = path.read_text()
            scaffoldish = "Story fixture and assertions" in text or (text.count("...defaultArgs") > 1 and "Manual edits after generation" not in text)
            if scaffoldish:
                findings.append(path)
    print("\nStorybook scaffold triage:")
    if findings:
        for path in findings:
            print(f"  SCAFFOLD-LIKE {path.relative_to(REPO_ROOT)}")
    else:
        print("  OK no scaffold-like stories in scope")
    return findings


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("paths", nargs="*", help="Optional files/directories to scope story triage to. Validation commands still run for the whole web package.")
    parser.add_argument("--strict-triage", action="store_true", help="Fail if scoped story triage finds scaffold-like stories.")
    parser.add_argument("--strict-design", action="store_true", help="Run design-system lint in strict mode.")
    parser.add_argument("--skip-storybook", action="store_true", help="Skip the Storybook production build for faster local checks.")
    args = parser.parse_args()

    findings = story_triage(args.paths)
    if args.strict_triage and findings:
        return 1

    design_cmd = ["python3", str(DESIGN_LINT)]
    if args.strict_design:
        design_cmd.append("--strict")
    run(design_cmd, check=args.strict_design)

    run(["npx", "tsc", "--noEmit"], cwd=WEB_ROOT)
    run(["pnpm", "test", "--", "--runInBand"], cwd=WEB_ROOT)
    if not args.skip_storybook:
        run(["npx", "storybook", "build", "--quiet"], cwd=WEB_ROOT)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
