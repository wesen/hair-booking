#!/usr/bin/env python3
"""Lint promoted Admin DSL widgets for design-system drift.

This script intentionally focuses on promoted widget implementation files, not
all generated scaffolds. A generated scaffold is expected to contain placeholder
inline CSS until it is promoted. A promoted widget is identified by a
"Manual edits after generation" changelog in the file header or by living in one
of the already hand-written shell widget files.

Default mode is report-only so the check can be introduced before every legacy
violation is remediated. Use ``--strict`` to exit non-zero on findings.
"""
from __future__ import annotations

import argparse
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

REPO_ROOT = Path(__file__).resolve().parents[6]
WIDGET_ROOT = REPO_ROOT / "web/src/admin-dsl/widgets"
RENDERER = REPO_ROOT / "web/src/admin-dsl/render.tsx"

RAW_TOKEN_IMPORT = re.compile(r"from\s+[\"'][^\"']*fringe-ui/tokens[\"']")
HARDCODED_COLOR = re.compile(r"(?<![\w-])(?:#[0-9a-fA-F]{3,8}|rgba?\()")
LOCAL_HELPERS = re.compile(
    r"\b(?:buttonStyle|variantForSlot|sizeForSlot|densityPadding|sharedStyle|pillStyle)\b"
)
DATA_ATTR_LITERAL = re.compile(r"data-admin-dsl-[a-z0-9-]+")
AS_UNKNOWN_AS = re.compile(r"as\s+unknown\s+as")
BUTTON = re.compile(r"<button\b")

# Existing shell files still have local shell geometry/detail styles. They are
# intentionally surfaced as warnings but not as strict errors until their own
# shell-specific design helper pass runs.
SHELL_EXCEPTION_FILES = {
    "web/src/admin-dsl/widgets/organisms/WorkbenchShell/WorkbenchShell.tsx",
    "web/src/admin-dsl/widgets/organisms/DefaultAdminShell/DefaultAdminShell.tsx",
}

STRUCTURAL_BUTTON_ALLOW = {
    "web/src/admin-dsl/widgets/molecules/FilterBar/FilterBar.tsx": "selection control uses selectionPillStyle",
    "web/src/admin-dsl/widgets/molecules/Tabs/Tabs.tsx": "selection control uses selectionPillStyle",
    "web/src/admin-dsl/widgets/molecules/SearchBox/SearchBox.tsx": "plain form submit styled with actionButtonStyle",
    "web/src/admin-dsl/widgets/organisms/ResourceTable/parts/ResourceTableCell/ResourceTableCell.tsx": "row overflow structural control",
    "web/src/admin-dsl/widgets/organisms/WorkbenchShell/WorkbenchShell.tsx": "mobile shell navigation toggle uses shellMenuButtonStyle and does not dispatch backend actions",
    "web/src/admin-dsl/widgets/organisms/MonthCalendar/MonthCalendar.tsx": "calendar date/month navigation controls use shared Admin DSL tokens",
    "web/src/admin-dsl/widgets/molecules/CalendarEventBlock/CalendarEventBlock.tsx": "calendar event block is itself the interactive calendar control and uses shared Admin DSL tokens",
}


@dataclass(frozen=True)
class Finding:
    severity: str
    path: Path
    line: int
    rule: str
    message: str

    def rel(self) -> str:
        return str(self.path.relative_to(REPO_ROOT))


def iter_ts_files(root: Path) -> Iterable[Path]:
    for path in sorted(root.rglob("*.ts*")):
        rel = path.relative_to(REPO_ROOT)
        rel_s = str(rel)
        if "/shared/" in rel_s:
            continue
        if rel_s.endswith((".stories.tsx", ".stories.ts", ".metadata.ts", ".types.ts", ".test.tsx", ".test.ts")):
            continue
        yield path


def is_promoted_widget(path: Path, text: str) -> bool:
    rel_s = str(path.relative_to(REPO_ROOT))
    if rel_s in SHELL_EXCEPTION_FILES:
        return True
    return "Manual edits after generation" in text


def line_no(text: str, index: int) -> int:
    return text.count("\n", 0, index) + 1


def add_pattern_findings(findings: list[Finding], path: Path, text: str, pattern: re.Pattern[str], rule: str, message: str, severity: str = "error") -> None:
    for match in pattern.finditer(text):
        findings.append(Finding(severity, path, line_no(text, match.start()), rule, message))


def has_any_import(text: str, names: tuple[str, ...]) -> bool:
    return any(name in text for name in names)


def lint_widget_file(path: Path) -> list[Finding]:
    text = path.read_text()
    if not is_promoted_widget(path, text):
        return []
    rel_s = str(path.relative_to(REPO_ROOT))
    findings: list[Finding] = []

    token_severity = "warn" if rel_s in SHELL_EXCEPTION_FILES else "error"
    add_pattern_findings(
        findings,
        path,
        text,
        RAW_TOKEN_IMPORT,
        "raw-token-import",
        "Promoted widgets should prefer generated shared helpers over direct fringe-ui/tokens imports.",
        token_severity,
    )

    color_severity = "warn" if rel_s in SHELL_EXCEPTION_FILES else "error"
    add_pattern_findings(
        findings,
        path,
        text,
        HARDCODED_COLOR,
        "hardcoded-color",
        "Hardcoded colors should usually move into 15-design-language.yaml and generated shared helpers.",
        color_severity,
    )

    for match in LOCAL_HELPERS.finditer(text):
        helper = match.group(0)
        if helper == "pillStyle" and "selectionPillStyle" in text:
            continue
        findings.append(Finding("error", path, line_no(text, match.start()), "local-style-helper", f"Local helper/name `{helper}` can indicate duplicated design-system styling."))

    for match in DATA_ATTR_LITERAL.finditer(text):
        # Header prose can mention these names; flag JSX/style body literals only.
        if line_no(text, match.start()) < 12:
            continue
        findings.append(Finding("error", path, line_no(text, match.start()), "manual-data-attribute", "Use widgetDataAttributes/dataAttrsFromRecord instead of manual data-admin-dsl-* literals."))

    if BUTTON.search(text):
        allowed = STRUCTURAL_BUTTON_ALLOW.get(rel_s)
        if allowed:
            if not has_any_import(text, ("ActionButton", "ActionGroup", "actionButtonStyle", "selectionPillStyle", "adminTokens", "adminTextStyle")):
                findings.append(Finding("error", path, line_no(text, BUTTON.search(text).start()), "button-without-shared-helper", f"Structural button exception requires a shared helper: {allowed}."))
        elif not has_any_import(text, ("ActionButton", "ActionGroup")):
            findings.append(Finding("error", path, line_no(text, BUTTON.search(text).start()), "button-without-action-widget", "Admin DSL action-like buttons should use ActionButton/ActionGroup or a documented structural exception."))

    return findings


def lint_renderer() -> list[Finding]:
    if not RENDERER.exists():
        return []
    text = RENDERER.read_text()
    findings: list[Finding] = []
    if "function renderTableCell" in text:
        findings.append(Finding("error", RENDERER, line_no(text, text.index("function renderTableCell")), "dead-render-table-cell", "renderTableCell should not remain after ResourceTableCell extraction."))
    for match in AS_UNKNOWN_AS.finditer(text):
        start = max(0, match.start() - 160)
        context = text[start:match.start()]
        if "lint-ok" in context or "intentional" in context or "transitional" in context:
            continue
        findings.append(Finding("error", RENDERER, line_no(text, match.start()), "undocumented-as-unknown-as", "Document or replace `as unknown as` casts in renderer adapters."))
    return findings


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--strict", action="store_true", help="Exit non-zero when errors are found.")
    parser.add_argument("--format", choices=["text", "github"], default="text")
    args = parser.parse_args()

    findings: list[Finding] = []
    for path in iter_ts_files(WIDGET_ROOT):
        findings.extend(lint_widget_file(path))
    findings.extend(lint_renderer())

    errors = [f for f in findings if f.severity == "error"]
    warnings = [f for f in findings if f.severity == "warn"]

    if args.format == "github":
      for f in findings:
          level = "warning" if f.severity == "warn" else "error"
          print(f"::{level} file={f.rel()},line={f.line},title={f.rule}::{f.message}")
    else:
      print(f"Admin DSL design-system lint: {len(errors)} error(s), {len(warnings)} warning(s)")
      for f in findings:
          print(f"{f.severity.upper()} {f.rel()}:{f.line} [{f.rule}] {f.message}")

    return 1 if args.strict and errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
